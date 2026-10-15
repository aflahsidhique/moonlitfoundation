const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const { invalidateAdminAccess, requireAuth, requireSuperAdmin } = require("../middleware/auth");
const { requireFields } = require("../lib/validate");
const { normalizePermissions, publicAdmin } = require("../lib/adminPermissions");
const router = express.Router();
router.use(requireAuth, requireSuperAdmin);
function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}
function validatePassword(password, required = true) {
  if (!password && !required) return;
  if (typeof password !== "string" || password.length < 10) {
    const error = new Error("Password must contain at least 10 characters.");
    error.status = 400;
    throw error;
  }
}
async function ensureEmailAvailable(email, exceptId) {
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing && existing.id !== exceptId) {
    const error = new Error("An admin with this email already exists.");
    error.status = 409;
    throw error;
  }
}
router.get("/", async (req, res, next) => {
  try {
    const admins = await prisma.admin.findMany({ orderBy: [{ role: "desc" }, { createdAt: "asc" }] });
    res.json({ admins: admins.map(publicAdmin) });
  } catch (error) {
    next(error);
  }
});
router.post("/", async (req, res, next) => {
  try {
    requireFields(req.body, ["name", "email", "password"]);
    validatePassword(req.body.password);
    const email = normalizeEmail(req.body.email);
    await ensureEmailAvailable(email);
    const admin = await prisma.admin.create({
      data: {
        name: String(req.body.name).trim(),
        email,
        passwordHash: await bcrypt.hash(req.body.password, 10),
        role: "admin",
        permissions: normalizePermissions(req.body.permissions),
        isActive: req.body.isActive !== false
      }
    });
    res.status(201).json({ admin: publicAdmin(admin) });
  } catch (error) {
    next(error);
  }
});
router.patch("/:id", async (req, res, next) => {
  try {
    const target = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: "Admin not found." });
    if (target.role === "super_admin") {
      return res.status(403).json({ error: "Super admin accounts cannot be changed here." });
    }
    const data = {};
    if (req.body.name !== void 0) {
      if (!String(req.body.name).trim()) return res.status(400).json({ error: "Name is required." });
      data.name = String(req.body.name).trim();
    }
    if (req.body.email !== void 0) {
      const email = normalizeEmail(req.body.email);
      if (!email) return res.status(400).json({ error: "Email is required." });
      await ensureEmailAvailable(email, target.id);
      data.email = email;
    }
    if (req.body.permissions !== void 0) data.permissions = normalizePermissions(req.body.permissions);
    if (req.body.isActive !== void 0) data.isActive = Boolean(req.body.isActive);
    if (req.body.password) {
      validatePassword(req.body.password, false);
      data.passwordHash = await bcrypt.hash(req.body.password, 10);
    }
    const admin = await prisma.admin.update({ where: { id: target.id }, data });
    invalidateAdminAccess(target.id);
    res.json({ admin: publicAdmin(admin) });
  } catch (error) {
    next(error);
  }
});
router.delete("/:id", async (req, res, next) => {
  try {
    const target = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: "Admin not found." });
    if (target.role === "super_admin") {
      return res.status(403).json({ error: "Super admin accounts cannot be deleted." });
    }
    await prisma.admin.delete({ where: { id: target.id } });
    invalidateAdminAccess(target.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
module.exports = router;
