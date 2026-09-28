import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAdminList } from "../hooks/useAdminList";
import { adminFetch } from "../lib/adminApi";
import AdminDataTable from "../components/AdminDataTable";
import StatusBadge from "../components/StatusBadge";
import { ApproveRejectButtons } from "../components/AdminButtons";
import { fmtDate } from "../lib/format";

export default function Partners() {
  const { setCount } = useOutletContext();
  const { rows, loading, error, refresh } = useAdminList("/partners", "partners");

  useEffect(() => {
    if (!loading) setCount("partners", rows.filter((p) => p.status === "pending").length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, loading]);

  function updateStatus(id, status) {
    adminFetch(`/partners/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }).then(refresh);
  }
  function remove(id) {
    adminFetch(`/partners/${id}`, { method: "DELETE" }).then(refresh);
  }

  if (error) return <p className="mf-admin-empty">{error.message}</p>;
  if (loading) return <p className="mf-admin-empty">Loading…</p>;

  return (
    <AdminDataTable
      rows={rows}
      columns={[
        { label: "Organization", render: (p) => <strong>{p.organization}</strong> },
        { label: "Contact", render: (p) => <>{p.contactPerson}<br /><span className="text-xs">{p.email}</span></> },
        { label: "Message", render: (p) => p.message },
        { label: "Submitted", render: (p) => fmtDate(p.createdAt) },
        { label: "Status", render: (p) => <StatusBadge status={p.status} /> },
        { label: "Actions", isActions: true, render: (p) => <ApproveRejectButtons status={p.status} onApprove={() => updateStatus(p.id, "approved")} onReject={() => updateStatus(p.id, "rejected")} onDelete={() => remove(p.id)} /> },
      ]}
    />
  );
}
