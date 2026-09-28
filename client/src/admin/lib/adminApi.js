import { API_BASE } from "../../lib/api";
import { cachedFetch, invalidate } from "../../lib/cache";
import { getAdminAuth, clearAdminAuth } from "./adminAuth";

// Admin reads are cached in memory for this long, so moving between panel
// pages (or back to one) does not re-hit the API for a list that was just
// loaded. Deliberately NOT persisted to sessionStorage: this is staff-only
// data and it should die with the tab. Any write clears the whole scope.
const ADMIN_CACHE = { ttl: 20_000, swr: 120_000, persist: false };
const SCOPE = "admin:";

export const invalidateAdminCache = () => invalidate(SCOPE);

// Attaches the admin's Bearer token to every call; a 401 means the token's
// dead (expired/invalid), so it clears auth and hard-redirects to login —
// same behavior as the legacy admin.js (a full reload is fine here, there's
// no in-flight state worth preserving through an expired session).
export function adminFetch(path, options = {}) {
  const auth = getAdminAuth();
  const headers = { ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...options.headers };
  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;

  const method = options.method || "GET";

  const request = () =>
    fetch(API_BASE + path, { method, headers, body: options.body }).then((res) => {
      if (res.status === 401) {
        clearAdminAuth();
        window.location.href = "/admin/login";
        throw new Error("Session expired — please log in again.");
      }
      return res.json().catch(() => ({})).then((body) => {
        if (!res.ok) throw new Error(body.error || `Request failed (${res.status}).`);
        if (method !== "GET") {
          invalidateAdminCache();
          if (path.startsWith("/events")) { invalidate("public:"); invalidate("portal:"); }
        }
        return body;
      });
    });

  if (method !== "GET") return request();

  // options.force = true skips the cache (what refresh() after a mutation
  // uses); options.onRevalidate fires when a stale-but-shown copy is refreshed.
  const { data, promise } = cachedFetch(SCOPE + path, request, { ...ADMIN_CACHE, force: options.force });
  if (data === null) return promise;
  if (promise && options.onRevalidate) promise.then(options.onRevalidate).catch(() => {});
  return Promise.resolve(data);
}
