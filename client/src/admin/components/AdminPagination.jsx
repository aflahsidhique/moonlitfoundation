export default function AdminPagination({ pagination, onPageChange, pageSize, onPageSizeChange, busy = false }) {
  if (!pagination || pagination.total === 0) return null;
  const start = (pagination.page - 1) * pagination.pageSize + 1;
  const end = Math.min(pagination.total, start + pagination.pageSize - 1);

  return (
    <nav className="ws-pagination" aria-label="Pagination" aria-busy={busy}>
      <p>Showing <strong>{start}-{end}</strong> of <strong>{pagination.total}</strong></p>
      <label>
        Rows
        <select value={pageSize} onChange={(event) => onPageSizeChange(event.target.value)} disabled={busy}>
          {[10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
      </label>
      <div>
        <button type="button" onClick={() => onPageChange(pagination.page - 1)} disabled={!pagination.hasPrevious || busy} aria-label="Previous page"><i className="fa-solid fa-chevron-left" aria-hidden="true" /></button>
        <span>Page {pagination.page} of {pagination.totalPages}</span>
        <button type="button" onClick={() => onPageChange(pagination.page + 1)} disabled={!pagination.hasNext || busy} aria-label="Next page"><i className="fa-solid fa-chevron-right" aria-hidden="true" /></button>
      </div>
    </nav>
  );
}
