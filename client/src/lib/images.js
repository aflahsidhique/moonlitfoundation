// Image-side caching.
//
// The browser's HTTP cache already stores the bytes, but React unmounting a
// route throws away the decoded bitmap, so coming back to a page re-decodes
// (and, on a cold cache, re-downloads) every image — the flash of empty
// boxes on navigation. Two things fix that: remember which URLs have
// already been decoded so they render without a fade, and hold an Image
// object per URL so the decode survives the unmount.

const decoded = new Set();
const held = new Map(); // url -> HTMLImageElement, kept alive on purpose

export const isDecoded = (src) => decoded.has(src);

export function markDecoded(src) {
  if (!src) return;
  decoded.add(src);
}

// Warms an image before it is rendered — used for the next page's hero or
// for a gallery's full-size version while the thumbnail is on screen.
export function preload(src) {
  if (!src || held.has(src)) return;
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  img.addEventListener("load", () => markDecoded(src), { once: true });
  held.set(src, img);
}

export const preloadAll = (sources = []) => sources.forEach(preload);

// Cloudinary serves whatever was uploaded unless the URL asks otherwise, so
// a 3MB phone photo arrives as a 3MB phone photo. Slipping f_auto,q_auto
// (plus an optional width) into the delivery URL cuts that to a fraction —
// only for URLs that carry no transformation of their own already.
const CLOUDINARY_UPLOAD = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/;
const HAS_TRANSFORM = /^[a-z]{1,3}_[^/]+\//;

export function cdnUrl(src, { width } = {}) {
  if (typeof src !== "string") return src;
  // New uploads are already resized WebP. Reuse their immutable URL everywhere.
  if (!width && /\.webp(?:\?|$)/i.test(src)) return src;
  const m = src.match(CLOUDINARY_UPLOAD);
  if (!m || HAS_TRANSFORM.test(m[2])) return src;
  const transform = ["f_auto", "q_auto", width && `w_${width}`, width && "c_limit"].filter(Boolean).join(",");
  return `${m[1]}${transform}/${m[2]}`;
}
