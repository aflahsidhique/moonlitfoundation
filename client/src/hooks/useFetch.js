import { useCallback, useEffect, useState } from "react";
import { cachedFetch, publicKey, rawGet, PUBLIC_CACHE } from "../lib/api";
export function useFetch(path, { ttl = PUBLIC_CACHE.ttl, swr = PUBLIC_CACHE.swr, persist = PUBLIC_CACHE.persist } = {}) {
  const [state, setState] = useState({ data: null, loading: !!path, error: null });
  const load = useCallback(
    (force) => {
      if (!path) return () => {
      };
      let cancelled = false;
      const { data, promise } = cachedFetch(publicKey(path), () => rawGet(path), { ttl, swr, persist, force });
      setState(data === null ? { data: null, loading: true, error: null } : { data, loading: false, error: null });
      promise?.then((fresh) => {
        if (!cancelled) setState({ data: fresh, loading: false, error: null });
      }).catch((error) => {
        if (!cancelled && data === null) setState({ data: null, loading: false, error });
      });
      return () => {
        cancelled = true;
      };
    },
    [path, ttl, swr, persist]
  );
  useEffect(() => load(false), [load]);
  const refresh = useCallback(() => load(true), [load]);
  return { ...state, refresh };
}
