const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const { signAdminToken } = require("../lib/jwt");
const { requireAuth } = require("../middleware/auth");
const { requireFields } = require("../lib/validate");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    requireFields(req.body, ["email", "password"]);
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!admin) return res.status(401).json({ error: "Invalid email or password." });

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid email or password." });

    const token = signAdminToken(admin);
    res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;
