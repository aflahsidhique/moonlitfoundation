import AdminPagination from "./AdminPagination";
export default function AdminDataTable({ rows, columns, cardConfig, pagination, onPageChange, pageSize, onPageSizeChange, busy }) {
  if (!rows.length) return <p className="mf-admin-empty">Nothing here yet.</p>;
  const actionsCol = columns.find((c) => c.isActions);
  return <>
      <div className={"mf-admin-table-wrap" + (cardConfig ? " mf-has-cards" : "")}>
        <table className="mf-admin-table">
          <thead>
            <tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row) => <tr key={row.id}>
                {columns.map((c) => <td key={c.label} className={c.isActions ? "mf-admin-actions" : ""}>{c.render(row)}</td>)}
              </tr>)}
          </tbody>
        </table>
      </div>

      {cardConfig && <div className="mf-admin-card-grid">
          {rows.map((row) => {
    const c = cardConfig(row);
    return <div key={row.id} className="mf-admin-card" onClick={c.onClick}>
                {c.photo ? <img className="mf-admin-card-photo" src={c.photo} alt="" loading="lazy" decoding="async" /> : <div className="mf-admin-card-photo mf-admin-card-photo-ph"><i className={`fa-solid fa-${c.icon || "user"}`} /></div>}
                <p className="mf-admin-card-title">{c.title}</p>
                {c.subtitle && <p className="mf-admin-card-subtitle">{c.subtitle}</p>}
                {c.badge}
                {actionsCol && <div className="mf-admin-card-actions" onClick={(e) => e.stopPropagation()}>
                    {actionsCol.render(row)}
                  </div>}
              </div>;
  })}
        </div>}
      <AdminPagination pagination={pagination} onPageChange={onPageChange} pageSize={pageSize} onPageSizeChange={onPageSizeChange} busy={busy} />
    </>;
}
