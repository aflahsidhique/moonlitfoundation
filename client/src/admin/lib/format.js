import { API_BASE } from "../../lib/api";

export function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Cloudinary URLs are already absolute; anything else (legacy local
// uploads, pre-Cloudinary) is treated as relative to the API origin.
export function resolveFileUrl(url) {
  return /^https?:\/\//.test(url) ? url : API_BASE.replace(/\/api$/, "") + url;
}
