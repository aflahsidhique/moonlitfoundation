import { invalidate } from "../../lib/cache";

const AUTH_KEY = "mfAdminAuth";

export function getAdminAuth() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); } catch { return null; }
}
export function setAdminAuth(auth) { localStorage.setItem(AUTH_KEY, JSON.stringify(auth)); }
// Logging out must also drop every cached response for this scope —
// otherwise the next person to log in on this tab paints the previous
// session's data before the API answers.
export function clearAdminAuth() { localStorage.removeItem(AUTH_KEY); invalidate("admin:"); }
