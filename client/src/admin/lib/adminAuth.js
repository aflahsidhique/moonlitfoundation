import { invalidate } from "../../lib/cache";
const AUTH_KEY = "mfAdminAuth";
export function getAdminAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
  } catch {
    return null;
  }
}
export function setAdminAuth(auth) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}
export function clearAdminAuth() {
  localStorage.removeItem(AUTH_KEY);
  invalidate("admin:");
}
