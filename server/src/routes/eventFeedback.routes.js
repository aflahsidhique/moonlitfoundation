const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { paginated } = require("../lib/pagination");

const router = express.Router();

// Admin — every feedback entry across every event, newest first. Optional
// ?eventId= to scope to one event.
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { eventId } = req.query;
    const { rows: feedback, pagination } = await paginated(prisma.eventFeedback, req.query, {
      where: eventId ? { eventId } : undefined,
      orderBy: { createdAt: "desc" },
      include: { event: { select: { id: true, title: true, eventDate: true } } }
    });
    res.json({ feedback, pagination });
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
