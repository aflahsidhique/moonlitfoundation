// HTTP caching policy.
//
// Express already sends an ETag for every JSON response, but without a
// Cache-Control header browsers treat these as uncacheable and re-request
// them on every page view. So: public reads get a short max-age plus a
// stale-while-revalidate window (the browser paints the cached copy and
// refreshes behind it), and everything else is explicitly no-store.
//
// Nothing behind requireAuth/requireVolunteerAuth may use publicCache —
// those responses are one volunteer's or one admin's data and must never
// land in a shared or on-disk cache.

// `maxAge` seconds served straight from cache, then `swr` seconds where the
// stale copy is still shown while a revalidation runs.
function publicCache({ maxAge = 60, swr = 300 } = {}) {
  return function publicCacheMiddleware(req, res, next) {
    res.set("Cache-Control", `public, max-age=${maxAge}, stale-while-revalidate=${swr}`);
    next();
  };
}

// The default for this API: authenticated data, form submissions, anything
// that isn't explicitly marked public.
function noStore(req, res, next) {
  res.set("Cache-Control", "no-store");
  next();
}

module.exports = { publicCache, noStore };
