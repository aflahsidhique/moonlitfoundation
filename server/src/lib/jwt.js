const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET is not set — copy .env.example to .env and fill it in.");
}

function signAdminToken(admin) {
  return jwt.sign({ sub: admin.id, email: admin.email, name: admin.name, role: "admin" }, SECRET, {
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
