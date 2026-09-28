// Ports the legacy admin.js renderTable(): a real <table> always renders;
// when `cardConfig` is given, a parallel .mf-admin-card-grid also renders
// (CSS-swapped below the sidebar breakpoint — see styles/admin.css). Cards
// reuse whichever column is marked `isActions` for their own action row,
// so the two views can't drift out of sync.
export default function AdminDataTable({ rows, columns, cardConfig }) {
  if (!rows.length) return <p className="mf-admin-empty">Nothing here yet.</p>;

  const actionsCol = columns.find((c) => c.isActions);

  return (
    <>
      <div className={"mf-admin-table-wrap" + (cardConfig ? " mf-has-cards" : "")}>
        <table className="mf-admin-table">
          <thead>
            <tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((c) => <td key={c.label} className={c.isActions ? "mf-admin-actions" : ""}>{c.render(row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cardConfig && (
        <div className="mf-admin-card-grid">
          {rows.map((row) => {
            const c = cardConfig(row);
            return (
              <div key={row.id} className="mf-admin-card" onClick={c.onClick}>
                {c.photo
                  ? <img className="mf-admin-card-photo" src={c.photo} alt="" />
                  : <div className="mf-admin-card-photo mf-admin-card-photo-ph"><i className={`fa-solid fa-${c.icon || "user"}`}></i></div>}
                <p className="mf-admin-card-title">{c.title}</p>
                {c.subtitle && <p className="mf-admin-card-subtitle">{c.subtitle}</p>}
                {c.badge}
                {actionsCol && (
                  <div className="mf-admin-card-actions" onClick={(e) => e.stopPropagation()}>
                    {actionsCol.render(row)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
