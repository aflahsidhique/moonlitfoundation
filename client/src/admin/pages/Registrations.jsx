import { useAdminList } from "../hooks/useAdminList";
import { adminFetch } from "../lib/adminApi";
import AdminDataTable from "../components/AdminDataTable";
import { StatusSelect, DeleteButton } from "../components/AdminButtons";
import { fmtDate } from "../lib/format";

const STATUSES = ["pending", "confirmed", "cancelled"];

export default function Registrations() {
  const { rows, loading, error, refresh } = useAdminList("/event-registrations", "registrations");

  function updateStatus(id, status) {
    adminFetch(`/event-registrations/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }).then(refresh);
  }
  function remove(id) {
    adminFetch(`/event-registrations/${id}`, { method: "DELETE" }).then(refresh);
  }

  if (error) return <p className="mf-admin-empty">{error.message}</p>;
  if (loading) return <p className="mf-admin-empty">Loading…</p>;

  return (
    <AdminDataTable
      rows={rows}
      columns={[
        { label: "Event", render: (r) => <>{r.event.title}<br /><span className="text-xs text-[#4B5563]">{fmtDate(r.event.eventDate)}</span></> },
        { label: "Registrant", render: (r) => <><strong>{r.name}</strong><br /><span className="text-xs">{r.email}</span></> },
        { label: "Phone", render: (r) => r.phone },
        { label: "Submitted", render: (r) => fmtDate(r.createdAt) },
        { label: "Status", render: (r) => <StatusSelect value={r.status} statuses={STATUSES} onChange={(v) => updateStatus(r.id, v)} /> },
        { label: "Actions", isActions: true, render: (r) => <DeleteButton onDelete={() => remove(r.id)} /> },
      ]}
    />
  );
}
