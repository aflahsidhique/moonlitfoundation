import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAdminList } from "../hooks/useAdminList";
import { adminFetch } from "../lib/adminApi";
import { useToast } from "../../hooks/useToast";
import AdminDataTable from "../components/AdminDataTable";
import StatusBadge from "../components/StatusBadge";
import { AdminBtn, ApproveRejectButtons } from "../components/AdminButtons";
import VolunteerDetailModal from "../components/VolunteerDetailModal";
import { fmtDate, resolveFileUrl } from "../lib/format";

// Volunteer approve/resend responses include a volunteerId + notifications
// {email, sms} pair — surface delivery failures instead of a bare "Updated."
function approvalToastMessage(body) {
  if (!body?.volunteer || !body?.notifications) return "Updated.";
  const n = body.notifications;
  const failed = [];
  if (n.email && n.email !== "sent") failed.push(`email ${n.email}`);
  if (n.sms && n.sms !== "sent") failed.push(`SMS ${n.sms}`);
  const base = `Approved — ID ${body.volunteer.volunteerId}.`;
  return failed.length ? `${base} ${failed.join("; ")}` : `${base} Email + SMS sent.`;
}

export default function Volunteers() {
  const { setCount } = useOutletContext();
  const showToast = useToast();
  const { rows, loading, error, refresh } = useAdminList("/volunteers", "volunteers");
  const [detailId, setDetailId] = useState(null);

  useEffect(() => {
    if (!loading) setCount("volunteers", rows.filter((v) => v.status === "pending").length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, loading]);

  function updateStatus(id, status) {
    adminFetch(`/volunteers/${id}`, { method: "PATCH", body: JSON.stringify({ status }) })
      .then((body) => { showToast(approvalToastMessage(body)); refresh(); })
      .catch((err) => showToast(err.message));
  }
  function remove(id) {
    if (!window.confirm("Delete this entry? This can't be undone.")) return;
    adminFetch(`/volunteers/${id}`, { method: "DELETE" }).then(() => { showToast("Deleted."); refresh(); }).catch((err) => showToast(err.message));
  }
  function resendCredentials(id) {
    if (!window.confirm("Generate a new password and resend the volunteer's ID + password by email/SMS? Their old password will stop working.")) return;
    adminFetch(`/volunteers/${id}/resend-credentials`, { method: "POST" })
      .then((body) => showToast(approvalToastMessage(body)))
      .catch((err) => showToast(err.message));
  }

  if (error) return <p className="mf-admin-empty">{error.message}</p>;
  if (loading) return <p className="mf-admin-empty">Loading…</p>;

  const detail = rows.find((v) => v.id === detailId) || null;

  return (
    <>
      <AdminDataTable
        rows={rows}
        columns={[
          { label: "Volunteer", render: (v) => <>
            <strong>{v.fullName}</strong>{v.volunteerId && <span className="text-xs text-[#4B5563]"> ({v.volunteerId})</span>}
            <br /><span className="text-xs text-[#4B5563]">{v.district}</span>
          </> },
          { label: "Contact", render: (v) => <>{v.mobile}<br />{v.email}</> },
          { label: "Blood", render: (v) => v.bloodGroup ? <>{v.bloodGroup}{v.isBloodDonor ? " · Donor" : ""}</> : <span className="text-[#9CA3AF]">—</span> },
          { label: "Submitted", render: (v) => fmtDate(v.createdAt) },
          { label: "Status", render: (v) => <StatusBadge status={v.status} /> },
          { label: "Actions", isActions: true, render: (v) => (
            <>
              <AdminBtn variant="neutral" icon="eye" onClick={() => setDetailId(v.id)}>View</AdminBtn>
              {v.status === "approved" && <AdminBtn variant="neutral" icon="paper-plane" onClick={() => resendCredentials(v.id)}>Resend Credentials</AdminBtn>}
              <ApproveRejectButtons status={v.status} onApprove={() => updateStatus(v.id, "approved")} onReject={() => updateStatus(v.id, "rejected")} onDelete={() => remove(v.id)} />
            </>
          ) },
        ]}
        cardConfig={(v) => ({
          photo: v.photoUrl ? resolveFileUrl(v.photoUrl) : null,
          icon: "user",
          title: v.fullName,
          subtitle: v.volunteerId || "Pending",
          badge: <StatusBadge status={v.status} />,
          onClick: () => setDetailId(v.id),
        })}
      />
      <VolunteerDetailModal volunteer={detail} onClose={() => setDetailId(null)} />
    </>
  );
}
