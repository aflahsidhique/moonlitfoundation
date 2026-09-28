import { useAdminList } from "../hooks/useAdminList";
import { adminFetch } from "../lib/adminApi";
import AdminDataTable from "../components/AdminDataTable";
import { DeleteButton } from "../components/AdminButtons";
import StarRating from "../components/StarRating";
import { fmtDate } from "../lib/format";

export default function Feedback() {
  const { rows, loading, error, refresh } = useAdminList("/event-feedback", "feedback");

  function remove(id) {
    adminFetch(`/event-feedback/${id}`, { method: "DELETE" }).then(refresh);
  }

  if (error) return <p className="mf-admin-empty">{error.message}</p>;
  if (loading) return <p className="mf-admin-empty">Loading…</p>;

  return (
    <AdminDataTable
      rows={rows}
      columns={[
        { label: "Event", render: (f) => <><strong>{f.event.title}</strong><br /><span className="text-xs text-[#4B5563]">{fmtDate(f.event.eventDate)}</span></> },
        { label: "From", render: (f) => <>{f.name}<br /><span className="text-xs text-[#4B5563]">{f.email}</span></> },
        { label: "Rating", render: (f) => <StarRating value={f.rating} /> },
        { label: "Comment", render: (f) => f.comment || <span className="text-[#9CA3AF]">—</span> },
        { label: "Submitted", render: (f) => fmtDate(f.createdAt) },
        { label: "Actions", isActions: true, render: (f) => <DeleteButton onDelete={() => remove(f.id)} /> },
      ]}
    />
  );
}
