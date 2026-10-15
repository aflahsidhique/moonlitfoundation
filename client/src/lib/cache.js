const memory =  new Map();
const inflight =  new Map();
const STORAGE_PREFIX = "mf:cache:";
function readStorage(key) {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeStorage(key, entry) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
  }
}
function entryFor(key, persist) {
  const hit = memory.get(key);
  if (hit) return hit;
  if (!persist) return null;
  const stored = readStorage(key);
  if (stored) memory.set(key, stored);
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
export function invalidate(prefix = "") {
  for (const key of [...memory.keys()]) {
    if (key.startsWith(prefix)) memory.delete(key);
  }
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith(STORAGE_PREFIX + prefix)) sessionStorage.removeItem(key);
    }
  } catch {
  }
}
export function cachedFetch(key, fetcher, { ttl = 6e4, swr = 6e5, persist = false, force = false } = {}) {
  const entry = force ? null : entryFor(key, persist);
  if (entry && isFresh(entry)) return { data: entry.data, promise: null };
  const pending = inflight.get(key) || (() => {
    const p = Promise.resolve().then(fetcher).then((data) => {
      cacheSet(key, data, { ttl, swr, persist });
      return data;
    }).finally(() => inflight.delete(key));
    inflight.set(key, p);
    return p;
  })();
  if (entry && isUsable(entry)) {
    pending.catch(() => {
    });
    return { data: entry.data, promise: pending };
  }
  return { data: null, promise: pending };
}
export function cachedGet(key, fetcher, options = {}, onRevalidate) {
  const { data, promise } = cachedFetch(key, fetcher, options);
  if (data === null) return promise;
  if (promise && onRevalidate) {
    promise.then((fresh) => onRevalidate(fresh)).catch(() => {
    });
  }
  return Promise.resolve(data);
}
