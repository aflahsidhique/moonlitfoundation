function notFound(req, res) {
  res.status(404).json({ error: "Not found." });
}
function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === "P2002") {
    return res.status(409).json({ error: "This submission already exists." });
  }
  if (err.code === "P2037") {
    return res.status(503).json({ error: "The database is temporarily busy. Please try again in a moment." });
  }
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error." });
}
module.exports = { notFound, errorHandler };
