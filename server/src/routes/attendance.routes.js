const express = require("express");
const { publicCache } = require("../middleware/cache");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireFields } = require("../lib/validate");

const router = express.Router();

// Admin — check a volunteer in for an event (the target of the QR-code
// scanner: scan their ID card, POST the eventId + scanned volunteerId).
// Idempotent — re-scanning an already-checked-in volunteer just confirms
// rather than erroring.
router.post("/check-in", requireAuth, async (req, res, next) => {
  try {
    requireFields(req.body, ["eventId", "volunteerId"]);
    const { eventId, volunteerId } = req.body;

    const [event, volunteer] = await Promise.all([
      prisma.event.findUnique({ where: { id: eventId } }),
      prisma.volunteer.findUnique({ where: { volunteerId: volunteerId.trim() } })
    ]);
    if (!event) return res.status(404).json({ error: "Event not found." });
    if (!volunteer) return res.status(404).json({ error: "No volunteer found with that ID." });
    if (volunteer.status !== "approved") {
      return res.status(400).json({ error: volunteer.fullName + " is not an approved volunteer." });
    }

    const existing = await prisma.attendance.findUnique({
      where: { volunteerId_eventId: { volunteerId: volunteer.id, eventId: event.id } }
    });
    if (existing) {
      return res.json({ attendance: existing, volunteer: { fullName: volunteer.fullName, volunteerId: volunteer.volunteerId }, alreadyCheckedIn: true });
    }

    const attendance = await prisma.attendance.create({
      data: { volunteerId: volunteer.id, eventId: event.id, hoursCredited: event.durationHours || 0 }
    });
    res.status(201).json({ attendance: attendance, volunteer: { fullName: volunteer.fullName, volunteerId: volunteer.volunteerId }, alreadyCheckedIn: false });
  } catch (err) {
    next(err);
  }
});

// Admin — who's checked in for a given event.
router.get("/event/:eventId", requireAuth, async (req, res, next) => {
  try {
    const attendances = await prisma.attendance.findMany({
      where: { eventId: req.params.eventId },
      include: { volunteer: { select: { fullName: true, volunteerId: true, mobile: true } } },
      orderBy: { checkedInAt: "desc" }
    });
    res.json({ attendances });
  } catch (err) {
    next(err);
  }
});

// Admin — issue or revoke a volunteer's certificate for one attendance
// record. Deliberately manual: attendance alone doesn't grant a certificate.
router.patch("/:id/certificate", requireAuth, async (req, res, next) => {
  try {
    requireFields(req.body, ["issued"]);
    const issued = Boolean(req.body.issued);
    const attendance = await prisma.attendance.update({
      where: { id: req.params.id },
      data: { certificateIssued: issued, certificateIssuedAt: issued ? new Date() : null }
    });
    res.json({ attendance });
  } catch (err) {
    next(err);
  }
});

// Public — certificate verification page reads this (no auth, since anyone
// holding a certificate's QR code / link should be able to confirm it's
// genuine). Only ever returns issued certificates.
router.get("/verify/:id", publicCache({ maxAge: 300, swr: 3600 }), async (req, res, next) => {
  try {
    const attendance = await prisma.attendance.findFirst({
      where: { id: req.params.id, certificateIssued: true },
      include: {
        volunteer: { select: { fullName: true, volunteerId: true } },
        event: { select: { title: true, eventDate: true, category: true } }
      }
    });
    if (!attendance) return res.status(404).json({ error: "No certificate found for that ID." });
    res.json({
      certificate: {
        volunteerName: attendance.volunteer.fullName,
        volunteerId: attendance.volunteer.volunteerId,
        eventTitle: attendance.event.title,
        eventDate: attendance.event.eventDate,
        category: attendance.event.category,
        hoursCredited: attendance.hoursCredited,
        issuedAt: attendance.certificateIssuedAt
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
