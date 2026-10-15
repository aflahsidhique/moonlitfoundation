import { API_BASE } from "../../lib/api";
import { cachedFetch, invalidate } from "../../lib/cache";
import { getAdminAuth, clearAdminAuth } from "./adminAuth";
const ADMIN_CACHE = { ttl: 2e4, swr: 12e4, persist: false };
const SCOPE = "admin:";
export const invalidateAdminCache = () => invalidate(SCOPE);
export function adminFetch(path, options = {}) {
  const auth = getAdminAuth();
  const headers = { ...options.body instanceof FormData ? {} : { "Content-Type": "application/json" }, ...options.headers };
  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;
  const method = options.method || "GET";
  const request = () => fetch(API_BASE + path, { method, headers, body: options.body }).then((res) => {
    if (res.status === 401) {
      clearAdminAuth();
      window.location.href = "/admin/login";
      throw new Error("Session expired \u2014 please log in again.");
    }
    return res.json().catch(() => ({})).then((body) => {
      if (!res.ok) throw new Error(body.error || `Request failed (${res.status}).`);
      if (method !== "GET") {
        invalidateAdminCache();
        if (path.startsWith("/events")) {
          invalidate("public:");
          invalidate("portal:");
        }
      }
      return body;
    });
  });
  if (method !== "GET") return request();
  const { data, promise } = cachedFetch(SCOPE + path, request, { ...ADMIN_CACHE, force: options.force });
  if (data === null) return promise;
  if (promise && options.onRevalidate) promise.then(options.onRevalidate).catch(() => {
  });
  return Promise.resolve(data);
}
