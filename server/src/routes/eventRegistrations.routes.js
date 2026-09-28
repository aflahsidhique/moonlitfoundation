const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireFields } = require("../lib/validate");

const router = express.Router();

// Admin — every registration across every event, newest first.
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { status } = req.query;
    const registrations = await prisma.eventRegistration.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      include: { event: { select: { id: true, title: true, eventDate: true } } }
    });
    res.json({ registrations });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    requireFields(req.body, ["status"]);
    const { status } = req.body;
    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "status must be pending, confirmed or cancelled." });
    }
    const registration = await prisma.eventRegistration.update({ where: { id: req.params.id }, data: { status } });
    res.json({ registration });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    await prisma.eventRegistration.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
