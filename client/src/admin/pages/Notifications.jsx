import { useState } from "react";
import { useAdminList } from "../hooks/useAdminList";
import { adminFetch } from "../lib/adminApi";
import { useToast } from "../../hooks/useToast";
import AdminDataTable from "../components/AdminDataTable";
import { DeleteButton } from "../components/AdminButtons";
import NotificationFormModal from "../components/NotificationFormModal";
import { fmtDate } from "../lib/format";

export default function Notifications() {
  const showToast = useToast();
  const { rows, loading, error, refresh } = useAdminList("/notifications", "notifications");
  const [formOpen, setFormOpen] = useState(false);

  function remove(id) {
    adminFetch(`/notifications/${id}`, { method: "DELETE" }).then(refresh);
  }

  if (error) return <p className="mf-admin-empty">{error.message}</p>;
  if (loading) return <p className="mf-admin-empty">Loading…</p>;

  return (
    <>
      <div className="flex justify-end mb-4">
        <button className="mf-btn mf-btn-primary" onClick={() => setFormOpen(true)}><i className="fa-solid fa-plus"></i> New Notification</button>
      </div>
      <AdminDataTable
        rows={rows}
        columns={[
          { label: "Title / Message", render: (n) => <><strong>{n.title}</strong><br /><span className="text-xs text-[#4B5563]">{n.message}</span></> },
          { label: "Audience", render: (n) => n.audience === "all" ? "All volunteers" : `1 volunteer: ${n.volunteer ? `${n.volunteer.fullName} (${n.volunteer.volunteerId})` : "—"}` },
          { label: "Sent", render: (n) => fmtDate(n.createdAt) },
          { label: "Actions", isActions: true, render: (n) => <DeleteButton onDelete={() => remove(n.id)} /> },
        ]}
      />
      <NotificationFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSent={() => { setFormOpen(false); showToast("Notification sent."); refresh(); }}
      />
    </>
  );
}
