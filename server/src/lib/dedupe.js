const crypto = require("crypto");

const DEDUPE_WINDOW_MS = 60 * 60 * 1000;

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function makeSubmissionKey(parts, now = Date.now()) {
  const window = Math.floor(new Date(now).getTime() / DEDUPE_WINDOW_MS);
  const value = parts.map(normalizeText).concat(window).join("|");
  return crypto.createHash("md5").update(value).digest("hex");
}

function isUniqueConstraintError(err) {
  return err && err.code === "P2002";
}

module.exports = {
  normalizeEmail,
  normalizePhone,
  makeSubmissionKey,
  isUniqueConstraintError
};
