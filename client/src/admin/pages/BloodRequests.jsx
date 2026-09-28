import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAdminList } from "../hooks/useAdminList";
import { adminFetch } from "../lib/adminApi";
import { useToast } from "../../hooks/useToast";
import AdminDataTable from "../components/AdminDataTable";
import StatusBadge from "../components/StatusBadge";
import { AdminBtn, DeleteButton } from "../components/AdminButtons";
import BloodDetailModal from "../components/BloodDetailModal";
import { fmtDate } from "../lib/format";

export default function BloodRequests() {
  const { setCount } = useOutletContext();
  const showToast = useToast();
  const { rows, setRows, loading, error, refresh } = useAdminList("/blood-requests", "bloodRequests");
  const [detailId, setDetailId] = useState(null);

  useEffect(() => {
    if (!loading) setCount("blood", rows.filter((b) => b.status === "pending").length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, loading]);

  function remove(id) {
    if (!window.confirm("Delete this entry? This can't be undone.")) return;
    adminFetch(`/blood-requests/${id}`, { method: "DELETE" }).then(() => { showToast("Deleted."); refresh(); }).catch((err) => showToast(err.message));
  }

  if (error) return <p className="mf-admin-empty">{error.message}</p>;
  if (loading) return <p className="mf-admin-empty">Loading…</p>;

  const detail = rows.find((b) => b.id === detailId) || null;

  return (
    <>
      <AdminDataTable
        rows={rows}
        columns={[
          { label: "Patient", render: (b) => <><strong>{b.patientName}</strong><br /><span className="text-xs">{b.bloodGroup} · {b.units} unit(s) · {b.urgency}</span></> },
          { label: "Hospital / District", render: (b) => <>{b.hospital}<br /><span className="text-xs text-[#4B5563]">{b.district} · {b.location}</span></> },
          { label: "Contact", render: (b) => <>{b.phone}{b.doctorName && <><br /><span className="text-xs text-[#4B5563]">Dr. {b.doctorName}</span></>}</> },
          { label: "Notified", render: (b) => `${b._count.responses} volunteer(s)` },
          { label: "Submitted", render: (b) => fmtDate(b.createdAt) },
          { label: "Status", render: (b) => <StatusBadge status={b.status} /> },
          { label: "Actions", isActions: true, render: (b) => (
            <>
              <AdminBtn variant="neutral" icon="eye" onClick={() => setDetailId(b.id)}>View</AdminBtn>
              <DeleteButton onDelete={() => remove(b.id)} />
            </>
          ) },
        ]}
        cardConfig={(b) => ({
          photo: null,
          icon: "droplet",
          title: b.patientName,
          subtitle: `${b.bloodGroup} · ${b.units} unit(s)`,
          badge: <StatusBadge status={b.status} />,
          onClick: () => setDetailId(b.id),
        })}
      />
      <BloodDetailModal
        bloodRequest={detail}
        onClose={() => setDetailId(null)}
        onUpdated={(updated) => setRows((prev) => prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)))}
      />
    </>
  );
}
