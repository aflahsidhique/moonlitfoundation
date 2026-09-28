import { useEffect, useState } from "react";
import AdminModal from "./AdminModal";
import StatusBadge from "./StatusBadge";
import { AdminBtn, StatusSelect } from "./AdminButtons";
import { VdSection, VdGrid, VdField, FileLink } from "./VdHelpers";
import { fmtDate } from "../lib/format";
import { adminFetch } from "../lib/adminApi";
import { useToast } from "../../hooks/useToast";

const RESPONSE_STATUSES = ["notified", "accepted", "declined", "unavailable", "reached_hospital", "completed"];

function BloodDocLinks({ csv }) {
  const urls = (csv || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!urls.length) return <span className="text-[#9CA3AF]">None uploaded</span>;
  return urls.map((u, i) => <span key={u}><FileLink url={u} label={`Document ${i + 1}`} /><br /></span>);
}

export default function BloodDetailModal({ bloodRequest: b, onClose, onUpdated }) {
  const showToast = useToast();
  const [note, setNote] = useState("");
  const [strategy, setStrategy] = useState("all");
  const [radius, setRadius] = useState("20");
  const [notifying, setNotifying] = useState(false);
  const [responses, setResponses] = useState(null);

  useEffect(() => {
    if (!b) { setResponses(null); return; }
    setNote(b.adminNote || "");
    setStrategy("all");
    loadResponses(b.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b?.id]);

  function loadResponses(id) {
    adminFetch(`/blood-requests/${id}/responses`)
      .then((body) => setResponses(body.responses))
      .catch((err) => setResponses([]) || showToast(err.message));
  }

  function setStatus(status) {
    adminFetch(`/blood-requests/${b.id}`, { method: "PATCH", body: JSON.stringify({ status, adminNote: note.trim() }) })
      .then((body) => {
        showToast(`Blood request ${body.bloodRequest.status.replace("_", " ")}.`);
        onUpdated(body.bloodRequest);
      })
      .catch((err) => showToast(err.message));
  }

  function notify() {
    const payload = { strategy };
    if (strategy === "nearby") payload.radiusKm = Number(radius);
    setNotifying(true);
    adminFetch(`/blood-requests/${b.id}/notify`, { method: "POST", body: JSON.stringify(payload) })
      .then((body) => {
        const s = body.summary;
        showToast(`Notified ${s.targeted} volunteer(s) — SMS ${s.sms.sent}/${s.sms.sent + s.sms.failed}, Email ${s.email.sent}/${s.email.sent + s.email.failed}.`);
        loadResponses(b.id);
      })
      .catch((err) => showToast(err.message))
      .finally(() => setNotifying(false));
  }

  function updateResponseStatus(id, status) {
    adminFetch(`/blood-requests/responses/${id}`, { method: "PATCH", body: JSON.stringify({ status }) })
      .then(() => { showToast("Response updated."); loadResponses(b.id); })
      .catch((err) => showToast(err.message));
  }

  const canNotify = b?.status === "approved";

  return (
    <AdminModal open={!!b} onClose={onClose} title="Blood Request" wide>
      {b && (
        <div>
          <div className="mf-vd-header"><div><p className="text-lg font-bold">{b.patientName}</p><p className="mt-1"><StatusBadge status={b.status} /></p></div></div>

          <VdSection>Request Details</VdSection>
          <VdGrid>
            <VdField label="Blood Group">{b.bloodGroup}</VdField>
            <VdField label="Units Needed">{b.units}</VdField>
            <VdField label="Emergency Level">{b.urgency}</VdField>
            <VdField label="Hospital">{b.hospital}</VdField>
            <VdField label="District">{b.district}</VdField>
            <VdField label="Location">{b.location}</VdField>
            <VdField label="Doctor">{b.doctorName}</VdField>
            <VdField label="Contact Number">{b.phone}</VdField>
            <VdField label="Submitted">{fmtDate(b.createdAt)}</VdField>
          </VdGrid>

          <VdSection>Documents</VdSection>
          <BloodDocLinks csv={b.documentUrls} />

          <VdSection>Admin Note</VdSection>
          <textarea className="mf-input" rows={2} placeholder="Optional note — e.g. what info is missing" value={note} onChange={(e) => setNote(e.target.value)} />

          <div className="flex flex-wrap gap-2 mt-3">
            <AdminBtn variant="approve" icon="check" onClick={() => setStatus("approved")}>Approve</AdminBtn>
            <AdminBtn variant="neutral" icon="circle-question" onClick={() => setStatus("needs_info")}>Need More Info</AdminBtn>
            <AdminBtn variant="reject" icon="xmark" onClick={() => setStatus("rejected")}>Reject</AdminBtn>
            {b.status === "approved" && <AdminBtn variant="neutral" icon="box-archive" onClick={() => setStatus("closed")}>Close</AdminBtn>}
          </div>

          <VdSection>Notify Volunteers</VdSection>
          {canNotify ? (
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="mf-label" htmlFor="notify-strategy">Target</label>
                <select className="mf-input" id="notify-strategy" value={strategy} onChange={(e) => setStrategy(e.target.value)}>
                  <option value="all">All blood-donor volunteers</option>
                  <option value="blood_group">Only {b.bloodGroup} donors</option>
                  <option value="nearby">Nearby (within radius)</option>
                </select>
              </div>
              {strategy === "nearby" && (
                <div>
                  <label className="mf-label" htmlFor="notify-radius">Radius</label>
                  <select className="mf-input" id="notify-radius" value={radius} onChange={(e) => setRadius(e.target.value)}>
                    <option value="20">20 km</option><option value="50">50 km</option><option value="100">100 km</option>
                  </select>
                </div>
              )}
              <button className="mf-btn mf-btn-primary" disabled={notifying} onClick={notify}><i className="fa-solid fa-paper-plane"></i> Notify</button>
            </div>
          ) : (
            <p className="text-[13px] text-[#9CA3AF]">Approve the request first to notify volunteers.</p>
          )}

          <VdSection>Response Pipeline</VdSection>
          {responses === null ? (
            <p className="text-[13px] text-[#9CA3AF]">Loading…</p>
          ) : !responses.length ? (
            <p className="text-[13px] text-[#9CA3AF]">No volunteers notified yet.</p>
          ) : (
            <div className="mf-admin-table-wrap">
              <table className="mf-admin-table">
                <thead><tr><th>Volunteer</th><th>Contact</th><th>Response</th><th>Status</th></tr></thead>
                <tbody>
                  {responses.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.volunteer.fullName}</strong><br /><span className="text-xs text-[#4B5563]">{r.volunteer.volunteerId} · {r.volunteer.bloodGroup || "—"}</span></td>
                      <td>{r.volunteer.mobile}</td>
                      <td>{r.response ? r.response.replace(/_/g, " ") : <span className="text-[#9CA3AF]">Awaiting</span>}</td>
                      <td><StatusSelect value={r.status} statuses={RESPONSE_STATUSES} onChange={(v) => updateResponseStatus(r.id, v)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AdminModal>
  );
}
