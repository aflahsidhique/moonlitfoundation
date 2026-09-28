// Throws a 400 error listing every missing/blank required field.
function requireFields(body, fields) {
  const missing = fields.filter((f) => {
    const v = body[f];
    return v === undefined || v === null || (typeof v === "string" && v.trim() === "");
  });
  if (missing.length) {
    const err = new Error(`Missing required field(s): ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }
}

module.exports = { requireFields };
