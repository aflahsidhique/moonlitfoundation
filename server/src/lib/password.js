const crypto = require("crypto");
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
