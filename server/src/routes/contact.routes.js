const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireFields } = require("../lib/validate");

const router = express.Router();

// Public — contact form submits here.
router.post("/", async (req, res, next) => {
  try {
    requireFields(req.body, ["name", "email", "subject", "message"]);
    const { name, phone, email, subject, message } = req.body;
    const contactMessage = await prisma.contactMessage.create({
      data: { name, phone: phone || null, email, subject, message }
    });
    res.status(201).json({ contactMessage });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { status } = req.query;
    const messages = await prisma.contactMessage.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" }
    });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    requireFields(req.body, ["status"]);
    const { status } = req.body;
    if (!["unread", "read", "replied"].includes(status)) {
      return res.status(400).json({ error: "status must be unread, read or replied." });
    }
    const contactMessage = await prisma.contactMessage.update({ where: { id: req.params.id }, data: { status } });
    res.json({ contactMessage });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
