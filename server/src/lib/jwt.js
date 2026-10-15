const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET is not set \u2014 copy .env.example to .env and fill it in.");
}
function signAdminToken(admin) {
  return jwt.sign({ sub: admin.id, role: admin.role }, SECRET, {
    expiresIn: "12h"
  });
}
function signVolunteerToken(volunteer) {
  return jwt.sign({ sub: volunteer.id, volunteerId: volunteer.volunteerId, role: "volunteer" }, SECRET, {
    expiresIn: "12h"
  });
}
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
module.exports = { signAdminToken, signVolunteerToken, verifyToken };
