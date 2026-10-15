import { invalidate } from "../../lib/cache";
const AUTH_KEY = "mfVolunteerAuth";
export function getPortalAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
  } catch {
    return null;
  }
}
export function setPortalAuth(auth) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}
export function clearPortalAuth() {
  localStorage.removeItem(AUTH_KEY);
  invalidate("portal:");
}
