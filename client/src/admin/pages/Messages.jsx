import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAdminList } from "../hooks/useAdminList";
import { adminFetch } from "../lib/adminApi";
import AdminDataTable from "../components/AdminDataTable";
import { StatusSelect, DeleteButton } from "../components/AdminButtons";
import { fmtDate } from "../lib/format";

const STATUSES = ["unread", "read", "replied"];

export default function Messages() {
  const { setCount } = useOutletContext();
  const { rows, loading, error, refresh } = useAdminList("/contact", "messages");

  useEffect(() => {
    if (!loading) setCount("messages", rows.filter((m) => m.status === "unread").length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, loading]);

  function updateStatus(id, status) {
    adminFetch(`/contact/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }).then(refresh);
  }
  function remove(id) {
    adminFetch(`/contact/${id}`, { method: "DELETE" }).then(refresh);
  }

  if (error) return <p className="mf-admin-empty">{error.message}</p>;
  if (loading) return <p className="mf-admin-empty">Loading…</p>;

  return (
    <AdminDataTable
      rows={rows}
      columns={[
        { label: "From", render: (m) => <>{m.name}<br /><span className="text-xs text-[#4B5563]">{m.email}</span></> },
        { label: "Subject", render: (m) => m.subject },
        { label: "Message", render: (m) => m.message },
        { label: "Submitted", render: (m) => fmtDate(m.createdAt) },
        { label: "Status", render: (m) => <StatusSelect value={m.status} statuses={STATUSES} onChange={(v) => updateStatus(m.id, v)} /> },
        { label: "Actions", isActions: true, render: (m) => <DeleteButton onDelete={() => remove(m.id)} /> },
      ]}
    />
  );
}
