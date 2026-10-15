function requireFields(body, fields) {
  const missing = fields.filter((f) => {
    const v = body[f];
    return v === void 0 || v === null || typeof v === "string" && v.trim() === "";
  });
  if (missing.length) {
    const err = new Error(`Missing required field(s): ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }
}
module.exports = { requireFields };
