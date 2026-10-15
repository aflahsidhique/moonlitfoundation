const { verifyToken } = require("../lib/jwt");
const prisma = require("../lib/prisma");
const { canAccess, publicAdmin, resourceForRequest } = require("../lib/adminPermissions");
const ADMIN_CACHE_MS = 1e3;
const adminAccessCache =  new Map();
async function findAdminForAccess(id) {
  const cached = adminAccessCache.get(id);
  const now = Date.now();
  if (cached?.admin && cached.expiresAt > now) return cached.admin;
  if (cached?.promise) return cached.promise;
  const promise = prisma.admin.findUnique({ where: { id } }).then((admin) => {
    adminAccessCache.set(id, { admin, expiresAt: Date.now() + ADMIN_CACHE_MS });
    return admin;
  }).catch((error) => {
    adminAccessCache.delete(id);
    throw error;
  });
  adminAccessCache.set(id, { promise });
  return promise;
}
function invalidateAdminAccess(id) {
  adminAccessCache.delete(id);
}
function bearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}
async function requireAuth(req, res, next) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: "Missing bearer token." });
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
  if (!["admin", "super_admin"].includes(decoded.role)) return res.status(403).json({ error: "Admin access required." });
  try {
    const admin = await findAdminForAccess(decoded.sub);
    if (!admin || !admin.isActive) return res.status(401).json({ error: "This admin account is inactive." });
    const permission = resourceForRequest(req);
    if (permission && !canAccess(admin, permission)) {
      return res.status(403).json({ error: "You do not have permission to access this area." });
    }
    req.admin = publicAdmin(admin);
    next();
  } catch (err) {
    next(err);
  }
}
function requireSuperAdmin(req, res, next) {
  if (req.admin?.role !== "super_admin") {
    return res.status(403).json({ error: "Super admin access required." });
  }
  next();
}
function requireVolunteerAuth(req, res, next) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: "Missing bearer token." });
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== "volunteer") return res.status(403).json({ error: "Volunteer access required." });
    req.volunteer = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
module.exports = { invalidateAdminAccess, requireAuth, requireSuperAdmin, requireVolunteerAuth };
