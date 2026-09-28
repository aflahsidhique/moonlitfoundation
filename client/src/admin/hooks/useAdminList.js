import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "../lib/adminApi";

// Fetches `path`, unwraps the `key` field of the response ({volunteers:[]},
// {bloodRequests:[]}, ...), and exposes a `refresh()` for after mutations.
export function useAdminList(path, key) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // force=false on mount so revisiting a panel page paints from the cache;
  // refresh() (after a mutation, or a manual reload) always goes to the API.
  const load = useCallback(
    (force) => {
      setError(null);
      setLoading(true);
      adminFetch(path, { force, onRevalidate: (fresh) => setRows(fresh[key] || []) })
        .then((body) => { setRows(body[key] || []); setLoading(false); })
        .catch((err) => { setError(err); setLoading(false); });
    },
    [path, key],
  );

  const refresh = useCallback(() => load(true), [load]);

  useEffect(() => { load(false); }, [load]);

  return { rows, setRows, loading, error, refresh };
}
