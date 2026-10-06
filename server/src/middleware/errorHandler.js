function notFound(req, res) {
  res.status(404).json({ error: "Not found." });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === "P2002") {
    return res.status(409).json({ error: "This submission already exists." });
  }
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error." });
}

module.exports = { notFound, errorHandler };
