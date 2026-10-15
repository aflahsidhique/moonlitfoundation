function publicCache({ maxAge = 60, swr = 300 } = {}) {
  return function publicCacheMiddleware(req, res, next) {
    res.set("Cache-Control", `public, max-age=${maxAge}, stale-while-revalidate=${swr}`);
    next();
  };
}
function noStore(req, res, next) {
  res.set("Cache-Control", "no-store");
  next();
}
module.exports = { publicCache, noStore };
