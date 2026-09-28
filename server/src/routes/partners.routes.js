const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireFields } = require("../lib/validate");

const router = express.Router();

// Public — partnership inquiry form submits here.
router.post("/", async (req, res, next) => {
  try {
    requireFields(req.body, ["organization", "contactPerson", "email", "message"]);
    const { organization, contactPerson, email, message } = req.body;
    const partner = await prisma.partnerInquiry.create({
      data: { organization, contactPerson, email, message }
    });
    res.status(201).json({ partner });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { status } = req.query;
    const partners = await prisma.partnerInquiry.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" }
    });
    res.json({ partners });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    requireFields(req.body, ["status"]);
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "status must be pending, approved or rejected." });
    }
    const partner = await prisma.partnerInquiry.update({ where: { id: req.params.id }, data: { status } });
    res.json({ partner });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    await prisma.partnerInquiry.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
