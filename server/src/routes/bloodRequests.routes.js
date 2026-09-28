const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireFields } = require("../lib/validate");
const { upload, uploadToCloudinary } = require("../lib/upload");
const { geocodeAddress } = require("../lib/geocode");
const { haversineKm } = require("../lib/distance");
const { computeEligibility } = require("../lib/eligibility");
const { sendBloodAlertSms, sendBloodAlertEmail } = require("../lib/notify");
const { sendPush } = require("../lib/push");

const router = express.Router();

const STATUSES = ["pending", "needs_info", "approved", "rejected", "closed"];
const RESPONSE_STATUSES = ["notified", "accepted", "declined", "unavailable", "reached_hospital", "completed"];

function toList(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

// Public — blood request form submits here (multipart/form-data, since it
// may include supporting documents).
router.post("/", upload.fields([{ name: "documents", maxCount: 3 }]), async (req, res, next) => {
  try {
    requireFields(req.body, ["patientName", "bloodGroup", "units", "urgency", "hospital", "district", "location", "phone"]);
    const { patientName, bloodGroup, units, urgency, hospital, district, location, doctorName, phone } = req.body;
    const files = req.files && req.files.documents ? req.files.documents : [];

    const documentUrls = await Promise.all(
      files.map((f) => uploadToCloudinary(f, "moonlit/blood-request-documents"))
    );

    const geo = await geocodeAddress(hospital + ", " + district + ", Kerala, India");

    const bloodRequest = await prisma.bloodRequest.create({
      data: {
        patientName,
        bloodGroup,
        units: Number(units),
        urgency,
        hospital,
        district,
        location,
        doctorName: doctorName || null,
        phone,
        documentUrls: documentUrls.length ? documentUrls.join(",") : null,
        lat: geo ? geo.lat : null,
        lng: geo ? geo.lng : null
      }
    });
    res.status(201).json({ bloodRequest });
  } catch (err) {
    next(err);
  }
});

// Admin — list, optionally filtered by status.
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { status } = req.query;
    const bloodRequests = await prisma.bloodRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { responses: true, donations: true } } }
    });
    res.json({ bloodRequests });
  } catch (err) {
    next(err);
  }
});

// Admin — move through the review pipeline: pending -> approved / rejected
// / needs_info (with an optional note), or closed once no longer active.
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    requireFields(req.body, ["status"]);
    const { status, adminNote } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${STATUSES.join(", ")}` });
    }
    const bloodRequest = await prisma.bloodRequest.update({
      where: { id: req.params.id },
      data: { status, ...(adminNote !== undefined && { adminNote }) }
    });
    res.json({ bloodRequest });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    await prisma.bloodRequest.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Admin — notify volunteers about an approved request. Three targeting
// strategies:
//   all         -> every eligible blood-donor volunteer
//   blood_group -> only volunteers whose blood group matches the request
//   nearby      -> only volunteers within radiusKm of the hospital
//                  (requires both the request and the volunteer to have
//                  been successfully geocoded)
router.post("/:id/notify", requireAuth, async (req, res, next) => {
  try {
    requireFields(req.body, ["strategy"]);
    const { strategy, radiusKm } = req.body;
    if (!["all", "blood_group", "nearby"].includes(strategy)) {
      return res.status(400).json({ error: "strategy must be all, blood_group or nearby." });
    }

    const bloodRequest = await prisma.bloodRequest.findUnique({ where: { id: req.params.id } });
    if (!bloodRequest) return res.status(404).json({ error: "Blood request not found." });
    if (strategy === "nearby" && (bloodRequest.lat == null || bloodRequest.lng == null)) {
      return res.status(400).json({ error: "This request's location couldn't be geocoded, so nearby-volunteer targeting isn't available for it. Try \"all\" or \"blood group\" instead." });
    }

    const baseWhere = { status: "approved", isBloodDonor: true, bloodDonationAvailable: true };
    if (strategy === "blood_group") baseWhere.bloodGroup = bloodRequest.bloodGroup;

    let candidates = await prisma.volunteer.findMany({ where: baseWhere });

    if (strategy === "nearby") {
      const radius = Number(radiusKm) || 20;
      candidates = candidates.filter(
        (v) => v.lat != null && v.lng != null && haversineKm(bloodRequest.lat, bloodRequest.lng, v.lat, v.lng) <= radius
      );
    }

    // Eligibility depends on time-since-last-donation, computed live rather
    // than relying solely on the stored bloodDonationAvailable flag (there's
    // no scheduled job flipping it back on automatically after the wait).
    const donations = await prisma.bloodDonationRecord.findMany({
      where: { volunteerId: { in: candidates.map((v) => v.id) } }
    });
    const donationsByVolunteer = {};
    donations.forEach((d) => {
      (donationsByVolunteer[d.volunteerId] = donationsByVolunteer[d.volunteerId] || []).push(d);
    });
    const eligible = candidates.filter((v) => computeEligibility(v, donationsByVolunteer[v.id]).eligible);

    const summary = { targeted: eligible.length, alreadyNotified: 0, sms: { sent: 0, failed: 0 }, email: { sent: 0, failed: 0 }, push: { sent: 0, failed: 0 } };

    for (const volunteer of eligible) {
      const existing = await prisma.bloodRequestResponse.findUnique({
        where: { bloodRequestId_volunteerId: { bloodRequestId: bloodRequest.id, volunteerId: volunteer.id } }
      });
      if (existing) { summary.alreadyNotified++; continue; }

      await prisma.bloodRequestResponse.create({ data: { bloodRequestId: bloodRequest.id, volunteerId: volunteer.id } });

      try { await sendBloodAlertSms(volunteer, bloodRequest); summary.sms.sent++; } catch (e) { summary.sms.failed++; }
      try { await sendBloodAlertEmail(volunteer, bloodRequest); summary.email.sent++; } catch (e) { summary.email.failed++; }

      const subs = await prisma.pushSubscription.findMany({ where: { volunteerId: volunteer.id } });
      for (const sub of subs) {
        try {
          await sendPush(sub, { title: "Urgent Blood Request", body: bloodRequest.bloodGroup + " needed at " + bloodRequest.hospital, url: "/portal" });
          summary.push.sent++;
        } catch (e) { summary.push.failed++; }
      }
    }

    res.json({ summary });
  } catch (err) {
    next(err);
  }
});

// Admin — everyone notified about a request and where they're at.
router.get("/:id/responses", requireAuth, async (req, res, next) => {
  try {
    const responses = await prisma.bloodRequestResponse.findMany({
      where: { bloodRequestId: req.params.id },
      include: { volunteer: { select: { fullName: true, volunteerId: true, mobile: true, bloodGroup: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json({ responses });
  } catch (err) {
    next(err);
  }
});

// Admin — progress a response toward completion. Marking "completed" logs
// a BloodDonationRecord and takes the volunteer off the available pool
// until their next eligible date.
router.patch("/responses/:id", requireAuth, async (req, res, next) => {
  try {
    requireFields(req.body, ["status"]);
    const { status } = req.body;
    if (!RESPONSE_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${RESPONSE_STATUSES.join(", ")}` });
    }

    const response = await prisma.bloodRequestResponse.update({ where: { id: req.params.id }, data: { status } });

    if (status === "completed") {
      await prisma.bloodDonationRecord.create({
        data: { volunteerId: response.volunteerId, donationDate: new Date(), bloodRequestId: response.bloodRequestId }
      });
      await prisma.volunteer.update({ where: { id: response.volunteerId }, data: { bloodDonationAvailable: false } });
    }

    res.json({ response });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
