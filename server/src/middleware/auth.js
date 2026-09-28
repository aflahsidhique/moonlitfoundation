const { verifyToken } = require("../lib/jwt");

function bearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

function requireAuth(req, res, next) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: "Missing bearer token." });
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== "admin") return res.status(403).json({ error: "Admin access required." });
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
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

module.exports = { requireAuth, requireVolunteerAuth };
