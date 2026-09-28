import { useAdminList } from "../hooks/useAdminList";
import { adminFetch } from "../lib/adminApi";
import AdminDataTable from "../components/AdminDataTable";
import { DeleteButton } from "../components/AdminButtons";
import { fmtDate } from "../lib/format";

export default function Newsletter() {
  const { rows, loading, error, refresh } = useAdminList("/newsletter", "subscribers");

  function remove(id) {
    adminFetch(`/newsletter/${id}`, { method: "DELETE" }).then(refresh);
  }

  if (error) return <p className="mf-admin-empty">{error.message}</p>;
  if (loading) return <p className="mf-admin-empty">Loading…</p>;

  return (
    <AdminDataTable
      rows={rows}
      columns={[
        { label: "Email", render: (s) => s.email },
        { label: "Subscribed", render: (s) => fmtDate(s.createdAt) },
        { label: "Actions", isActions: true, render: (s) => <DeleteButton onDelete={() => remove(s.id)} /> },
      ]}
    />
  );
}
