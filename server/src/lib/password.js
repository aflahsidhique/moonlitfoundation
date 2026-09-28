const crypto = require("crypto");

// Excludes visually-ambiguous characters (0/O, 1/l/I) since this gets typed
// in by hand off an SMS/email.
const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function generatePassword(length) {
  length = length || 10;
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CHARSET[crypto.randomInt(CHARSET.length)];
  }
  return out;
}

module.exports = { generatePassword };
