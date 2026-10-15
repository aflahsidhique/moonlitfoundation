import { API_BASE } from "../../lib/api";
import { cachedFetch, invalidate } from "../../lib/cache";
import { getPortalAuth, clearPortalAuth } from "./portalAuth";
const PORTAL_CACHE = { ttl: 2e4, swr: 12e4, persist: false };
const SCOPE = "portal:";
export const invalidatePortalCache = () => invalidate(SCOPE);
export function portalFetch(path, options = {}) {
  const auth = getPortalAuth();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;
  const method = options.method || "GET";
  const request = () => fetch(API_BASE + path, { method, headers, body: options.body }).then((res) => {
    if (res.status === 401 || res.status === 403) {
      clearPortalAuth();
      window.location.href = "/portal/login";
      throw new Error("Session expired \u2014 please log in again.");
    }
    return res.json().catch(() => ({})).then((body) => {
      if (!res.ok) throw new Error(body.error || `Request failed (${res.status}).`);
      if (method !== "GET") invalidatePortalCache();
      return body;
    });
  });
  if (method !== "GET") return request();
  const { data, promise } = cachedFetch(SCOPE + path, request, { ...PORTAL_CACHE, force: options.force });
  if (data === null) return promise;
  if (promise && options.onRevalidate) promise.then(options.onRevalidate).catch(() => {
  });
  return Promise.resolve(data);
}
