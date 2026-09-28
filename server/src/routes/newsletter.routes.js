const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireFields } = require("../lib/validate");

const router = express.Router();

// Public — footer newsletter form submits here.
router.post("/", async (req, res, next) => {
  try {
    requireFields(req.body, ["email"]);
    const email = req.body.email.toLowerCase().trim();

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) return res.status(200).json({ subscriber: existing, alreadySubscribed: true });

    // email is unique at the DB level regardless of soft-delete status, so
    // someone who previously unsubscribed (soft-deleted) needs their old
    // row reactivated rather than a new one created — a plain .create()
    // would hit the unique constraint since their row still exists.
    const deleted = await prisma.newsletterSubscriber.findFirst({ where: { email, deletedAt: { not: null } } });
    if (deleted) {
      const subscriber = await prisma.newsletterSubscriber.update({ where: { id: deleted.id }, data: { deletedAt: null } });
      return res.status(201).json({ subscriber, resubscribed: true });
    }

    const subscriber = await prisma.newsletterSubscriber.create({ data: { email } });
    res.status(201).json({ subscriber });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ subscribers });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    await prisma.newsletterSubscriber.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
