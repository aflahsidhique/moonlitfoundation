const VARIANT_CLASS = { approve: "mf-admin-btn-approve", reject: "mf-admin-btn-reject", neutral: "mf-admin-btn-neutral", danger: "mf-admin-btn-danger" };

export function AdminBtn({ variant, icon, onClick, disabled, children }) {
  return (
    <button type="button" className={`mf-admin-btn ${VARIANT_CLASS[variant] || ""}`} onClick={onClick} disabled={disabled}>
      {icon && <i className={`fa-solid fa-${icon}`}></i>}{children}
    </button>
  );
}

export function DeleteButton({ onDelete, confirmText = "Delete this entry? This can't be undone." }) {
  return (
    <AdminBtn variant="danger" icon="trash" onClick={() => { if (window.confirm(confirmText)) onDelete(); }} />
  );
}

export function ApproveRejectButtons({ status, onApprove, onReject, onDelete }) {
  return (
    <>
      {status === "pending" && (
        <>
          <AdminBtn variant="approve" icon="check" onClick={onApprove}>Approve</AdminBtn>
          <AdminBtn variant="reject" icon="xmark" onClick={onReject}>Reject</AdminBtn>
        </>
      )}
      <DeleteButton onDelete={onDelete} />
    </>
  );
}

export function StatusSelect({ value, statuses, onChange }) {
  return (
    <select className="mf-admin-select-status" value={value} onChange={(e) => onChange(e.target.value)}>
      {statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
    </select>
  );
}
