import { adminFetch } from "./adminApi";
export function checkImage(file) {
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choose a JPG, PNG or WebP image.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Choose an image smaller than 5 MB.");
}
export function checkImageUrl(value) {
  if (typeof value !== "string" || !value || value.length > 2048 || /[\s\\\u0000-\u001f]/.test(value)) throw new Error("Enter a complete HTTPS image URL.");
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error();
    return url.href;
  } catch {
    throw new Error("Enter a complete HTTPS image URL.");
  }
}
export async function uploadWebsiteImage(file, details = {}) {
  checkImage(file);
  const title = file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ").slice(0, 150) || "Website photo";
  const body = new FormData();
  body.append("image", file);
  for (const [key, value] of Object.entries({ title, alt: title, caption: "", category: "welfare", inGallery: false, ...details })) body.append(key, String(value));
  return adminFetch("/website/images", { method: "POST", body });
}
export function uploadWebsiteImageUrl(value, details = {}) {
  const imageUrl = checkImageUrl(value);
  return adminFetch("/website/images", {
    method: "POST",
    body: JSON.stringify({ title: "Website photo", alt: "Website photo", caption: "", category: "welfare", inGallery: false, ...details, imageUrl })
  });
}
