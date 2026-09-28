const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Admin — every feedback entry across every event, newest first. Optional
// ?eventId= to scope to one event.
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { eventId } = req.query;
    const feedback = await prisma.eventFeedback.findMany({
      where: eventId ? { eventId } : undefined,
      orderBy: { createdAt: "desc" },
      include: { event: { select: { id: true, title: true, eventDate: true } } }
    });
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    await prisma.eventFeedback.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
