import { useCallback, useEffect, useRef, useState } from "react";
import { adminFetch } from "../lib/adminApi";

const EMPTY_PAGINATION = { page: 1, pageSize: 20, total: 0, totalPages: 1, hasPrevious: false, hasNext: false };

function paginatedPath(path, page, pageSize) {
  const [base, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("page", page);
  params.set("pageSize", pageSize);
  return `${base}?${params.toString()}`;
}

export function useAdminList(path, key, options = {}) {
  const enabled = options.enabled !== false;
  const [rows, setRows] = useState([]);
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(options.pageSize || 20);
  const [pagination, setPagination] = useState({ ...EMPTY_PAGINATION, pageSize: options.pageSize || 20 });
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const initialized = useRef(false);
  const previousPath = useRef(path);
  const requestSequence = useRef(0);

  const load = useCallback((force = false) => {
    if (!enabled) return Promise.resolve(null);
    const requestId = ++requestSequence.current;
    const requestPath = paginatedPath(path, page, pageSize);
    setError(null);
    setFetching(true);
    if (!initialized.current) setLoading(true);

    const apply = (body) => {
      if (requestId !== requestSequence.current) return;
      setRows(body[key] || []);
      setPagination(body.pagination || { ...EMPTY_PAGINATION, page, pageSize, total: (body[key] || []).length });
      setSummary(body.summary || {});
    };

    return adminFetch(requestPath, { force, onRevalidate: apply })
      .then((body) => {
        apply(body);
        if (requestId !== requestSequence.current) return body;
        initialized.current = true;
        setLoading(false);
        setFetching(false);
        if (body.pagination && page > body.pagination.totalPages) setPageState(body.pagination.totalPages);
        return body;
      })
      .catch((err) => {
        if (requestId !== requestSequence.current) throw err;
        setError(err);
        setLoading(false);
        setFetching(false);
        throw err;
      });
  }, [path, key, page, pageSize, enabled]);

  useEffect(() => {
    if (!enabled) {
      requestSequence.current += 1;
      setRows([]);
      setPagination({ ...EMPTY_PAGINATION, pageSize });
      setSummary({});
      setError(null);
      setLoading(false);
      setFetching(false);
      return;
    }
    if (previousPath.current !== path) {
      previousPath.current = path;
      if (page !== 1) {
        setPageState(1);
        return;
      }
    }
    load(false).catch(() => {});
  }, [path, page, pageSize, load, enabled]);

  const setPage = useCallback((nextPage) => {
    setPageState((current) => Math.max(1, typeof nextPage === "function" ? nextPage(current) : nextPage));
  }, []);

  const setPageSize = useCallback((nextSize) => {
    setPageSizeState(Number(nextSize));
    setPageState(1);
  }, []);

  const refresh = useCallback(() => load(true), [load]);

  return { rows, setRows, loading, fetching, error, refresh, pagination, summary, page, pageSize, setPage, setPageSize };
}
