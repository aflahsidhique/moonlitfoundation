const express = require("express");
const { publicCache } = require("../middleware/cache");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireFields } = require("../lib/validate");
const { upload, uploadToCloudinary } = require("../lib/upload");
const { generatePassword } = require("../lib/password");
const { sendApprovalEmail, sendApprovalSms } = require("../lib/notify");
const { geocodeAddress } = require("../lib/geocode");
const { computeEligibility } = require("../lib/eligibility");
const { normalizeEmail, normalizePhone, isUniqueConstraintError } = require("../lib/dedupe");
const { paginated } = require("../lib/pagination");

const router = express.Router();

const REQUIRED_FIELDS = [
  "fullName", "dob", "gender", "mobile", "email",
  "address", "state", "district", "taluk", "panchayat", "ward", "pin",
  "emergencyName", "emergencyRelationship", "emergencyPhone"
];

function toList(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function omitPassword(volunteer) {
  const { passwordHash, ...safe } = volunteer;
  return safe;
}

// Auto-assigned the first time a volunteer is approved, e.g. "MLF202500001".
// Resets each year — counts only volunteerIds already issued for the
// current year.
async function nextVolunteerId() {
  const year = new Date().getFullYear();
  const prefix = "MLF" + year;
  const count = await prisma.volunteer.count({ where: { volunteerId: { startsWith: prefix } } });
  return prefix + String(count + 1).padStart(5, "0");
}

// Generates a fresh portal password, hashes it, and emails/texts the
// volunteer their credentials. Returns { passwordHash, notifications }.
async function issueCredentialsAndNotify(volunteer) {
  const plainPassword = generatePassword();
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const notifications = { email: "not attempted", sms: "not attempted" };
  try {
    await sendApprovalEmail(volunteer, plainPassword);
    notifications.email = "sent";
  } catch (err) {
    notifications.email = "failed: " + err.message;
  }
  try {
    await sendApprovalSms(volunteer, plainPassword);
    notifications.sms = "sent";
  } catch (err) {
    notifications.sms = "failed: " + err.message;
  }

  return { passwordHash, notifications };
}

// Public — volunteer registration form submits here (multipart/form-data,
// since it may include a photo and an ID document).
router.post("/", upload.fields([{ name: "photo", maxCount: 1 }, { name: "idUpload", maxCount: 1 }]), async (req, res, next) => {
  try {
    requireFields(req.body, REQUIRED_FIELDS);
    const b = req.body;
    const files = req.files || {};
    const email = normalizeEmail(b.email);
    const mobile = normalizePhone(b.mobile);

    const duplicate = await prisma.volunteer.findFirst({
      where: { OR: [{ email }, { mobile }] },
      select: { id: true }
    });
    if (duplicate) {
      return res.status(409).json({ error: "A volunteer registration already exists with this email or mobile number." });
    }

    const [photoUrl, idUploadUrl] = await Promise.all([
      files.photo && files.photo[0] ? uploadToCloudinary(files.photo[0], "moonlit/volunteer-photos") : null,
      files.idUpload && files.idUpload[0] ? uploadToCloudinary(files.idUpload[0], "moonlit/volunteer-ids") : null
    ]);

    const volunteer = await prisma.volunteer.create({
      data: {
        fullName: b.fullName,
        dob: new Date(b.dob),
        gender: b.gender,
        aadhaar: b.aadhaar || null,
        photoUrl: photoUrl,
        mobile,
        whatsapp: b.whatsapp || null,
        email,
        address: b.address,
        state: b.state,
        district: b.district,
        taluk: b.taluk,
        panchayat: b.panchayat,
        ward: b.ward,
        pin: b.pin,
        emergencyName: b.emergencyName,
        emergencyRelationship: b.emergencyRelationship,
        emergencyPhone: b.emergencyPhone,
        skills: toList(b.skills).join(","),
        bloodGroup: b.bloodGroup || null,
        isBloodDonor: b.isBloodDonor === "yes",
        lastBloodDonationDate: b.lastBloodDonationDate ? new Date(b.lastBloodDonationDate) : null,
        weight: b.weight ? Number(b.weight) : null,
        medicalConditions: b.medicalConditions || null,
        availableTime: toList(b.availableTime).join(","),
        instagram: b.instagram || null,
        facebook: b.facebook || null,
        linkedin: b.linkedin || null,
        idType: b.idType || null,
        idUploadUrl: idUploadUrl,
        message: b.message || null
      }
    });
    res.status(201).json({ volunteer: omitPassword(volunteer) });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return res.status(409).json({ error: "A volunteer registration already exists with this email or mobile number." });
    }
    next(err);
  }
});

// Public — minimal safe info for the ID-card QR verification page. No
// auth, so deliberately excludes anything beyond what's already printed
// on the physical/digital card itself.
router.get("/verify/:volunteerId", publicCache({ maxAge: 300, swr: 3600 }), async (req, res, next) => {
  try {
    const volunteer = await prisma.volunteer.findUnique({ where: { volunteerId: req.params.volunteerId } });
    if (!volunteer || volunteer.status !== "approved") {
      return res.status(404).json({ error: "No active volunteer found with that ID." });
    }
    res.json({
      volunteer: {
        volunteerId: volunteer.volunteerId,
        fullName: volunteer.fullName,
        photoUrl: volunteer.photoUrl,
        bloodGroup: volunteer.bloodGroup,
        status: volunteer.status
      }
    });
  } catch (err) {
    next(err);
  }
});

// Admin — list, optionally filtered by status.
router.get("/export", requireAuth, async (req, res, next) => {
  try {
    const volunteers = await prisma.volunteer.findMany({
      orderBy: { createdAt: "desc" },
      include: { bloodDonations: { orderBy: { donationDate: "desc" } } }
    });
    res.json({ volunteers: volunteers.map((v) => Object.assign(omitPassword(v), computeEligibility(v, v.bloodDonations))) });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { status } = req.query;
    const [{ rows: volunteers, pagination }, pending] = await Promise.all([
      paginated(prisma.volunteer, req.query, {
        where: status ? { status } : undefined,
        orderBy: { createdAt: "desc" },
        include: { bloodDonations: { orderBy: { donationDate: "desc" } } }
      }),
      prisma.volunteer.count({ where: { status: "pending", deletedAt: null } })
    ]);
    const withEligibility = volunteers.map((v) => Object.assign(omitPassword(v), computeEligibility(v, v.bloodDonations)));
    res.json({ volunteers: withEligibility, pagination, summary: { pending } });
  } catch (err) {
    next(err);
  }
});

// Admin — approve / reject / reset status. First-time approval assigns a
// permanent volunteerId, generates a portal password, and emails/texts the
// volunteer their credentials + portal link.
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    requireFields(req.body, ["status"]);
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "status must be pending, approved or rejected." });
    }

    const existing = await prisma.volunteer.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Volunteer not found." });

    const isFirstApproval = status === "approved" && !existing.volunteerId;
    const data = { status };
    let notifications = null;

    if (isFirstApproval) {
      data.volunteerId = await nextVolunteerId();
      // Credentials/notifications are composed against the final volunteerId,
      // so build the would-be record for the email/SMS content rather than
      // re-fetching after update.
      const preview = Object.assign({}, existing, data);
      const issued = await issueCredentialsAndNotify(preview);
      data.passwordHash = issued.passwordHash;
      notifications = issued.notifications;

      // Geocoded once here so "nearby volunteers" blood-request targeting
      // has coordinates ready without geocoding on every request.
      const geo = await geocodeAddress(
        [existing.address, existing.panchayat, existing.taluk, existing.district, "Kerala", "India"].filter(Boolean).join(", ")
      );
      if (geo) { data.lat = geo.lat; data.lng = geo.lng; }
    }

    const volunteer = await prisma.volunteer.update({ where: { id: req.params.id }, data });

    if (isFirstApproval) {
      await prisma.notification.create({
        data: {
          title: "You're approved! 🎉",
          message: "Welcome to Moonlit Foundation — your Volunteer ID is " + volunteer.volunteerId + ". Check your email/SMS for portal login details.",
          audience: "volunteer",
          volunteerId: volunteer.id
        }
      });
    }

    res.json({ volunteer: omitPassword(volunteer), notifications });
  } catch (err) {
    next(err);
  }
});

// Admin — re-issues a fresh password and re-sends the email/SMS for an
// already-approved volunteer (e.g. the first send failed because Gmail/SMS
// Gate wasn't configured yet, or the volunteer lost their credentials).
router.post("/:id/resend-credentials", requireAuth, async (req, res, next) => {
  try {
    const existing = await prisma.volunteer.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Volunteer not found." });
    if (existing.status !== "approved" || !existing.volunteerId) {
      return res.status(400).json({ error: "Volunteer must be approved first." });
    }

    const issued = await issueCredentialsAndNotify(existing);
    const volunteer = await prisma.volunteer.update({
      where: { id: req.params.id },
      data: { passwordHash: issued.passwordHash }
    });
    res.json({ volunteer: omitPassword(volunteer), notifications: issued.notifications });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    await prisma.volunteer.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
