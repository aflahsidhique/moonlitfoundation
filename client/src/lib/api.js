import { cachedFetch, invalidate } from "./cache";

export { cachedFetch, invalidate } from "./cache";

// Auto-detects local dev vs the deployed Render backend so no manual env
// swapping is needed. Every base can be overridden from client/.env (see
// .env.example); the literals below are the fallbacks used when a build
// runs without a .env file — e.g. on Render.
const PROD_API_BASE =
  import.meta.env.VITE_API_BASE_PROD || "https://moonlit-website-api.onrender.com/api";
const LOCAL_API_BASE = import.meta.env.VITE_API_BASE_LOCAL || "http://localhost:4000/api";

const isLocal = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
// VITE_API_BASE, when set, wins over the hostname check entirely.
export const API_BASE = import.meta.env.VITE_API_BASE || (isLocal ? LOCAL_API_BASE : PROD_API_BASE);

// POSTs a plain object as JSON to `${API_BASE}${path}`, throwing an Error
// with the server's message (or a generic fallback) on non-2xx responses.
export async function apiPost(path, payload) {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Something went wrong. Please try again.");
  invalidate("public:"); // a registration/signup can change what a public list returns
  return body;
}

// Same as apiPost, but sends a FormData body (file uploads) — leaves
// Content-Type unset so the browser adds the correct multipart boundary.
export async function apiPostForm(path, formData) {
  const res = await fetch(API_BASE + path, { method: "POST", body: formData });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Something went wrong. Please try again.");
  invalidate("public:");
  return body;
}

export async function rawGet(path) {
  const res = await fetch(API_BASE + path);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Request failed.");
  return body;
}

// Public reads are cached under "public:" — kept in sessionStorage so a
// reload repaints without waiting on the API, and revalidated in the
// background once a minute of real time has passed. useFetch goes through
// cachedFetch directly so it can also render the stale value immediately.
export const publicKey = (path) => `public:${path}`;
export const PUBLIC_CACHE = { ttl: 60_000, swr: 10 * 60_000, persist: true };

export function apiGet(path, options = {}) {
  const { data, promise } = cachedFetch(publicKey(path), () => rawGet(path), { ...PUBLIC_CACHE, ...options });
  return data === null ? promise : Promise.resolve(data);
}
