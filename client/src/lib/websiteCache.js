import { API_BASE } from "./api";

export const WEBSITE_TTL = 5 * 60_000;
const MAX_STALE = 24 * 60 * 60_000;
const key = `mf:website:v2:${API_BASE}`;
const signalKey = `${key}:published`;
let memory, pending, generation = 0, retryAfter = 0;
const listeners = new Set();
const valid = value => value?.version === 2 && value.content && typeof value.content === "object" && Array.isArray(value.gallery);
function read() {
  if (memory === undefined) {
    try { memory = JSON.parse(localStorage.getItem(key)); } catch { memory = null; }
  }
  return memory && valid(memory.data) && Number.isFinite(memory.at) && Date.now() - memory.at < MAX_STALE ? memory : null;
}
export const peekWebsite = () => read()?.data || null;
export const subscribeWebsite = listener => { listeners.add(listener); return () => listeners.delete(listener); };
function notify() { listeners.forEach(listener=>listener()); }
function clear() {
  generation++; pending = null; memory = null; retryAfter = 0;
  try { localStorage.removeItem(key); } catch { /* Storage can be disabled. */ }
  notify();
}
export function invalidateWebsite() {
  clear();
  try { localStorage.setItem(signalKey, `${Date.now()}:${Math.random()}`); } catch { /* Same-tab refresh still works. */ }
}
window.addEventListener("storage", event => { if(event.key === signalKey) clear(); });

export function loadWebsite({ force = false } = {}) {
  const cached = read();
  if (!force && cached && Date.now() - cached.at < WEBSITE_TTL) return Promise.resolve(cached.data);
  if (pending) return pending.promise;
  if (!force && retryAfter > Date.now()) return cached ? Promise.resolve(cached.data) : Promise.reject(new Error("Website content is temporarily unavailable."));
  const entry = { generation };
  entry.promise = fetch(`${API_BASE}/website`, { cache:"no-cache", headers: cached?.etag ? { "If-None-Match": cached.etag } : {} })
    .then(async response => {
      let data;
      if(response.status === 304 && cached) data = cached.data;
      else {
        if(!response.ok) throw new Error("Website content is temporarily unavailable.");
        data = await response.json();
        if(!valid(data)) throw new Error("The website content response was invalid.");
      }
      if(entry.generation !== generation) return loadWebsite();
      memory = { data, at:Date.now(), etag:response.headers.get("ETag") || cached?.etag || null };
      try { localStorage.setItem(key, JSON.stringify(memory)); } catch { /* Memory cache still works. */ }
      retryAfter = 0;
      return data;
    }).catch(error => {
      if(entry.generation !== generation) return loadWebsite();
      retryAfter = Date.now() + 30_000;
      if(cached) return cached.data;
      throw error;
    }).finally(()=>{ if(pending === entry) pending = null; });
  pending = entry;
  return entry.promise;
}

export function registerImageCache() {
  if ("serviceWorker" in navigator && window.isSecureContext) {
    // The existing /portal/ worker retains its own scope and push handlers.
    navigator.serviceWorker.register("/image-cache-sw.js", {scope:"/",updateViaCache:"none"}).catch(()=>{});
  }
}
