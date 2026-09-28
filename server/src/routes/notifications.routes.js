const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireFields } = require("../lib/validate");

const router = express.Router();

// Admin — broadcast to every volunteer, or target one specific volunteer
// (identified by their human-readable Volunteer ID, e.g. "MLF202500001" —
// resolved here to the internal record id the Notification relation uses).
router.post("/", requireAuth, async (req, res, next) => {
  try {
    requireFields(req.body, ["title", "message"]);
    const { title, message, volunteerId } = req.body;

    let targetId = null;
    if (volunteerId) {
      const volunteer = await prisma.volunteer.findUnique({ where: { volunteerId: volunteerId.trim() } });
      if (!volunteer) return res.status(404).json({ error: "No volunteer found with that ID." });
      targetId = volunteer.id;
    }

    const notification = await prisma.notification.create({
      data: { title, message, audience: targetId ? "volunteer" : "all", volunteerId: targetId }
    });
    res.status(201).json({ notification });
  } catch (err) {
    next(err);
  }
});

// Admin — everything sent, newest first.
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      include: { volunteer: { select: { fullName: true, volunteerId: true } } }
    });
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    await prisma.notification.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
