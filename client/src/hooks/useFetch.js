import { useCallback, useEffect, useState } from "react";
import { cachedFetch, publicKey, rawGet, PUBLIC_CACHE } from "../lib/api";

// { data, loading, error, refresh } fetch hook backed by the shared request
// cache: a path already read this session paints from cache with no spinner
// and no network call, then quietly updates if the cached copy went stale.
// Set `path` to null/undefined to skip fetching.
export function useFetch(path, { ttl = PUBLIC_CACHE.ttl, swr = PUBLIC_CACHE.swr, persist = PUBLIC_CACHE.persist } = {}) {
  const [state, setState] = useState({ data: null, loading: !!path, error: null });

  const load = useCallback(
    (force) => {
      if (!path) return () => {};
      let cancelled = false;

      const { data, promise } = cachedFetch(publicKey(path), () => rawGet(path), { ttl, swr, persist, force });

      // Cached copy first — this is what removes the spinner on revisits.
      setState(data === null ? { data: null, loading: true, error: null } : { data, loading: false, error: null });

      promise
        ?.then((fresh) => { if (!cancelled) setState({ data: fresh, loading: false, error: null }); })
        .catch((error) => { if (!cancelled && data === null) setState({ data: null, loading: false, error }); });

      return () => { cancelled = true; };
    },
    [path, ttl, swr, persist],
  );

  useEffect(() => load(false), [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { ...state, refresh };
}
