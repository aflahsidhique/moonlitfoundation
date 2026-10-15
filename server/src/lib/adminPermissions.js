const ADMIN_PERMISSIONS = [
  "website",
  "gallery",
  "volunteers",
  "blood_requests",
  "partners",
  "messages",
  "newsletter",
  "events",
  "registrations",
  "checkin",
  "feedback",
  "notifications"
];
const RESOURCE_BY_BASE_URL = {
  "/api/volunteers": "volunteers",
  "/api/blood-requests": "blood_requests",
  "/api/partners": "partners",
  "/api/contact": "messages",
  "/api/newsletter": "newsletter",
  "/api/events": "events",
  "/api/event-registrations": "registrations",
  "/api/event-feedback": "feedback",
  "/api/attendance": "checkin",
  "/api/notifications": "notifications"
};
function normalizePermissions(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((permission) => ADMIN_PERMISSIONS.includes(permission)))];
}
function resourceForRequest(req) {
  if (req.baseUrl === "/api/website") {
    return req.path.startsWith("/images") ? "gallery" : "website";
  }
  return RESOURCE_BY_BASE_URL[req.baseUrl] || null;
}
function canAccess(admin, permission) {
  return admin.role === "super_admin" || normalizePermissions(admin.permissions).includes(permission);
}
function publicAdmin(admin) {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    permissions: normalizePermissions(admin.permissions),
    isActive: admin.isActive
  };
}
module.exports = { ADMIN_PERMISSIONS, normalizePermissions, resourceForRequest, canAccess, publicAdmin };
