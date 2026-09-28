// Shared request cache for every API read in the app.
//
// Three layers, in order: an in-flight map so two components mounting at the
// same time share one network request; an in-memory store; and (opt-in)
// sessionStorage, so a full page reload or a back-navigation still paints
// instantly. Authenticated scopes stay memory-only — admin and volunteer
// data has no business sitting in the browser's storage after a reload.
//
// Entries are stale-while-revalidate: past `ttl` the cached value is still
// handed over immediately, and a background request refreshes it.

const memory = new Map(); // key -> { data, storedAt, ttl, swr }
const inflight = new Map(); // key -> Promise
const STORAGE_PREFIX = "mf:cache:";

function readStorage(key) {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // private mode, blocked storage, or a half-written entry
  }
}

function writeStorage(key, entry) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Quota or blocked storage — the memory layer still does its job.
  }
}

function entryFor(key, persist) {
  const hit = memory.get(key);
  if (hit) return hit;
  if (!persist) return null;
  const stored = readStorage(key);
  if (stored) memory.set(key, stored); // promote back into memory
  return stored;
}

const age = (entry) => Date.now() - entry.storedAt;
const isFresh = (entry) => age(entry) < entry.ttl;
const isUsable = (entry) => age(entry) < entry.ttl + entry.swr;

export function cacheSet(key, data, { ttl, swr, persist }) {
  const entry = { data, storedAt: Date.now(), ttl, swr };
  memory.set(key, entry);
  if (persist) writeStorage(key, entry);
}

// Drops every entry whose key starts with `prefix` — call it after a write
// so the next read goes to the server. No prefix clears everything.
export function invalidate(prefix = "") {
  for (const key of [...memory.keys()]) {
    if (key.startsWith(prefix)) memory.delete(key);
  }
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith(STORAGE_PREFIX + prefix)) sessionStorage.removeItem(key);
    }
  } catch {
    // Nothing persisted to clear.
  }
}

// The one entry point. Returns { data, promise }:
//   data    — a cached value to render right now, or null
//   promise — the request in flight, or null when `data` is fresh
// so a caller can paint cached data and still update when the server answers.
export function cachedFetch(key, fetcher, { ttl = 60_000, swr = 600_000, persist = false, force = false } = {}) {
  const entry = force ? null : entryFor(key, persist);

  if (entry && isFresh(entry)) return { data: entry.data, promise: null };

  const pending =
    inflight.get(key) ||
    (() => {
      const p = Promise.resolve()
        .then(fetcher)
        .then((data) => {
          cacheSet(key, data, { ttl, swr, persist });
          return data;
        })
        .finally(() => inflight.delete(key));
      inflight.set(key, p);
      return p;
    })();

  // Stale but still usable: hand back the old value, refresh behind it. The
  // caller decides whether to wait on `promise`; a rejected background
  // revalidation must not surface as an unhandled rejection.
  if (entry && isUsable(entry)) {
    pending.catch(() => {});
    return { data: entry.data, promise: pending };
  }

  return { data: null, promise: pending };
}

// Promise-shaped wrapper: resolves with cached data when there is any, and
// calls `onRevalidate` later if a background refresh changed it.
export function cachedGet(key, fetcher, options = {}, onRevalidate) {
  const { data, promise } = cachedFetch(key, fetcher, options);
  if (data === null) return promise;
  if (promise && onRevalidate) {
    promise.then((fresh) => onRevalidate(fresh)).catch(() => {});
  }
  return Promise.resolve(data);
}
