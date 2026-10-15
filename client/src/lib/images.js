const decoded =  new Set();
const held =  new Map();
export const isDecoded = (src) => decoded.has(src);
export function markDecoded(src) {
  if (!src) return;
  decoded.add(src);
}
export function preload(src) {
  if (!src || held.has(src)) return;
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  img.addEventListener("load", () => markDecoded(src), { once: true });
  held.set(src, img);
}
export const preloadAll = (sources = []) => sources.forEach(preload);
const CLOUDINARY_UPLOAD = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/;
const HAS_TRANSFORM = /^[a-z]{1,3}_[^/]+\//;
export function cdnUrl(src, { width } = {}) {
  if (typeof src !== "string") return src;
  if (!width && /\.webp(?:\?|$)/i.test(src)) return src;
  const m = src.match(CLOUDINARY_UPLOAD);
  if (!m || HAS_TRANSFORM.test(m[2])) return src;
  const transform = ["f_auto", "q_auto", width && `w_${width}`, width && "c_limit"].filter(Boolean).join(",");
  return `${m[1]}${transform}/${m[2]}`;
}
