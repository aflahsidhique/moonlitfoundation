const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireFields } = require("../lib/validate");
const { makeSubmissionKey, normalizeEmail, isUniqueConstraintError } = require("../lib/dedupe");
const { paginated } = require("../lib/pagination");

const router = express.Router();

// Public — partnership inquiry form submits here.
router.post("/", async (req, res, next) => {
  try {
    requireFields(req.body, ["organization", "contactPerson", "email", "message"]);
    const { organization, contactPerson, email, message } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const submissionKey = makeSubmissionKey([normalizedEmail, organization, contactPerson, message]);

    const duplicate = await prisma.partnerInquiry.findFirst({ where: { submissionKey }, select: { id: true } });
    if (duplicate) {
      return res.status(409).json({ error: "This partnership inquiry was already submitted. Please wait before submitting it again." });
    }

    const partner = await prisma.partnerInquiry.create({
      data: { submissionKey, organization, contactPerson, email: normalizedEmail, message }
    });
    res.status(201).json({ partner });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return res.status(409).json({ error: "This partnership inquiry was already submitted. Please wait before submitting it again." });
    }
    next(err);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { status } = req.query;
    const [{ rows: partners, pagination }, pending] = await Promise.all([
      paginated(prisma.partnerInquiry, req.query, { where: status ? { status } : undefined, orderBy: { createdAt: "desc" } }),
      prisma.partnerInquiry.count({ where: { status: "pending", deletedAt: null } })
    ]);
    res.json({ partners, pagination, summary: { pending } });
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
