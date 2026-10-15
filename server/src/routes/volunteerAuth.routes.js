const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../lib/prisma");
const { signVolunteerToken } = require("../lib/jwt");
const { requireVolunteerAuth } = require("../middleware/auth");
const { requireFields } = require("../lib/validate");
const { computeEligibility } = require("../lib/eligibility");
const { sendPasswordResetEmail } = require("../lib/notify");
const router = express.Router();
const BLOOD_RESPONSES = ["accept", "decline", "already_donated", "unavailable"];
const RESET_TOKEN_TTL_MS = 60 * 60 * 1e3;
function portalResetUrl() {
  const base = process.env.PORTAL_URL || "http://localhost:5173/portal";
  return base.replace(/\/$/, "") + "/reset-password";
}
router.post("/login", async (req, res, next) => {
  try {
    requireFields(req.body, ["volunteerId", "password"]);
    const { volunteerId, password } = req.body;
    const volunteer = await prisma.volunteer.findUnique({ where: { volunteerId: volunteerId.trim() } });
    if (!volunteer || !volunteer.passwordHash) {
      return res.status(401).json({ error: "Invalid volunteer ID or password." });
    }
    const ok = await bcrypt.compare(password, volunteer.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid volunteer ID or password." });
    const token = signVolunteerToken(volunteer);
    res.json({ token, volunteer: { id: volunteer.id, volunteerId: volunteer.volunteerId, fullName: volunteer.fullName } });
  } catch (err) {
    next(err);
  }
});
router.post("/forgot-password", async (req, res, next) => {
  try {
    requireFields(req.body, ["volunteerId"]);
    const genericMessage = "If that Volunteer ID has an account, we've emailed a password reset link to the address on file.";
    const volunteer = await prisma.volunteer.findUnique({ where: { volunteerId: req.body.volunteerId.trim() } });
    if (!volunteer || !volunteer.passwordHash) {
      return res.json({ message: genericMessage });
    }
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.volunteer.update({
      where: { id: volunteer.id },
      data: { passwordResetToken: token, passwordResetExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS) }
    });
    try {
      await sendPasswordResetEmail(volunteer, portalResetUrl() + "?token=" + token);
    } catch (e) {
      console.error("password reset email failed:", e.message);
    }
    res.json({ message: genericMessage });
  } catch (err) {
    next(err);
  }
});
router.post("/reset-password", async (req, res, next) => {
  try {
    requireFields(req.body, ["token", "newPassword"]);
    const { token, newPassword } = req.body;
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }
    const volunteer = await prisma.volunteer.findUnique({ where: { passwordResetToken: token } });
    if (!volunteer || !volunteer.passwordResetExpires || volunteer.passwordResetExpires <  new Date()) {
      if (volunteer) {
        await prisma.volunteer.update({ where: { id: volunteer.id }, data: { passwordResetToken: null, passwordResetExpires: null } });
      }
      return res.status(400).json({ error: "This reset link is invalid or has expired. Request a new one." });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.volunteer.update({
      where: { id: volunteer.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExpires: null }
    });
    res.json({ message: "Password reset \u2014 you can now log in with your new password." });
  } catch (err) {
    next(err);
  }
});
router.post("/change-password", requireVolunteerAuth, async (req, res, next) => {
  try {
    requireFields(req.body, ["currentPassword", "newPassword"]);
    const { currentPassword, newPassword } = req.body;
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters." });
    }
    const volunteer = await prisma.volunteer.findUnique({ where: { id: req.volunteer.sub } });
    if (!volunteer || !volunteer.passwordHash) return res.status(404).json({ error: "Volunteer not found." });
    const ok = await bcrypt.compare(currentPassword, volunteer.passwordHash);
    if (!ok) return res.status(401).json({ error: "Current password is incorrect." });
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.volunteer.update({ where: { id: volunteer.id }, data: { passwordHash } });
    res.json({ message: "Password updated." });
  } catch (err) {
    next(err);
  }
});
router.get("/me", requireVolunteerAuth, async (req, res, next) => {
  try {
    const volunteer = await prisma.volunteer.findUnique({ where: { id: req.volunteer.sub } });
    if (!volunteer) return res.status(404).json({ error: "Volunteer not found." });
    const { passwordHash, ...safeVolunteer } = volunteer;
    res.json({ volunteer: safeVolunteer });
  } catch (err) {
    next(err);
  }
});
router.get("/events", requireVolunteerAuth, async (req, res, next) => {
  try {
    const volunteer = await prisma.volunteer.findUnique({ where: { id: req.volunteer.sub } });
    if (!volunteer) return res.status(404).json({ error: "Volunteer not found." });
    const registrations = await prisma.eventRegistration.findMany({
      where: { email: volunteer.email },
      include: { event: true },
      orderBy: { createdAt: "desc" }
    });
    const now =  new Date();
    const upcoming = registrations.filter((r) => new Date(r.event.eventDate) >= now);
    const past = registrations.filter((r) => new Date(r.event.eventDate) < now);
    res.json({ upcoming, past });
  } catch (err) {
    next(err);
  }
});
router.get("/certificates", requireVolunteerAuth, async (req, res, next) => {
  try {
    const certificates = await prisma.attendance.findMany({
      where: { volunteerId: req.volunteer.sub, certificateIssued: true },
      include: { event: { select: { title: true, eventDate: true, category: true } } },
      orderBy: { certificateIssuedAt: "desc" }
    });
    res.json({ certificates });
  } catch (err) {
    next(err);
  }
});
router.get("/attendance", requireVolunteerAuth, async (req, res, next) => {
  try {
    const attendances = await prisma.attendance.findMany({
      where: { volunteerId: req.volunteer.sub },
      include: { event: { select: { title: true, eventDate: true, category: true } } },
      orderBy: { checkedInAt: "desc" }
    });
    const totalHours = attendances.reduce((sum, a) => sum + a.hoursCredited, 0);
    res.json({ attendances, totalHours });
  } catch (err) {
    next(err);
  }
});
router.get("/notifications", requireVolunteerAuth, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { OR: [{ audience: "all" }, { volunteerId: req.volunteer.sub }] },
      orderBy: { createdAt: "desc" }
    });
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
});
router.get("/blood", requireVolunteerAuth, async (req, res, next) => {
  try {
    const volunteer = await prisma.volunteer.findUnique({ where: { id: req.volunteer.sub } });
    if (!volunteer) return res.status(404).json({ error: "Volunteer not found." });
    const donations = await prisma.bloodDonationRecord.findMany({
      where: { volunteerId: volunteer.id },
      orderBy: { donationDate: "desc" }
    });
    const eligibility = computeEligibility(volunteer, donations);
    res.json({
      bloodGroup: volunteer.bloodGroup,
      isBloodDonor: volunteer.isBloodDonor,
      bloodDonationAvailable: volunteer.bloodDonationAvailable,
      donations,
      ...eligibility
    });
  } catch (err) {
    next(err);
  }
});
router.post("/blood-availability", requireVolunteerAuth, async (req, res, next) => {
  try {
    requireFields(req.body, ["available"]);
    const volunteer = await prisma.volunteer.update({
      where: { id: req.volunteer.sub },
      data: { bloodDonationAvailable: Boolean(req.body.available) }
    });
    res.json({ bloodDonationAvailable: volunteer.bloodDonationAvailable });
  } catch (err) {
    next(err);
  }
});
router.get("/blood-requests", requireVolunteerAuth, async (req, res, next) => {
  try {
    const responses = await prisma.bloodRequestResponse.findMany({
      where: { volunteerId: req.volunteer.sub },
      include: { bloodRequest: true },
      orderBy: { createdAt: "desc" }
    });
    res.json({ responses });
  } catch (err) {
    next(err);
  }
});
router.post("/blood-requests/:responseId/respond", requireVolunteerAuth, async (req, res, next) => {
  try {
    requireFields(req.body, ["response"]);
    const { response } = req.body;
    if (!BLOOD_RESPONSES.includes(response)) {
      return res.status(400).json({ error: `response must be one of: ${BLOOD_RESPONSES.join(", ")}` });
    }
    const existing = await prisma.bloodRequestResponse.findUnique({ where: { id: req.params.responseId } });
    if (!existing || existing.volunteerId !== req.volunteer.sub) {
      return res.status(404).json({ error: "Not found." });
    }
    const statusMap = { accept: "accepted", decline: "declined", already_donated: "declined", unavailable: "unavailable" };
    const updated = await prisma.bloodRequestResponse.update({
      where: { id: req.params.responseId },
      data: { response, status: statusMap[response], respondedAt:  new Date() }
    });
    res.json({ response: updated });
  } catch (err) {
    next(err);
  }
});
router.post("/push-subscribe", requireVolunteerAuth, async (req, res, next) => {
  try {
    requireFields(req.body, ["endpoint", "p256dh", "auth"]);
    const { endpoint, p256dh, auth } = req.body;
    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { volunteerId: req.volunteer.sub, p256dh, auth },
      create: { volunteerId: req.volunteer.sub, endpoint, p256dh, auth }
    });
    res.status(201).json({ subscription });
  } catch (err) {
    next(err);
  }
});
router.post("/push-unsubscribe", requireVolunteerAuth, async (req, res, next) => {
  try {
    requireFields(req.body, ["endpoint"]);
    await prisma.pushSubscription.deleteMany({ where: { endpoint: req.body.endpoint, volunteerId: req.volunteer.sub } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
module.exports = router;
