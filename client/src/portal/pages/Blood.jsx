import { useEffect, useState } from "react";
import { portalFetch } from "../lib/portalApi";
import { fmtDate } from "../lib/format";
import { useToast } from "../../hooks/useToast";
import StatusBadge from "../components/StatusBadge";

const BLOOD_RESPONSE_LABELS = { accept: "Accept", decline: "Decline", already_donated: "Already Donated", unavailable: "Unavailable" };

function BloodRequestRow({ r, showActions, onRespond, busy }) {
  const b = r.bloodRequest;
  return (
    <div className="mf-portal-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <p className="title">{b.bloodGroup} needed at {b.hospital}</p>
          <p className="meta">{b.district} · {b.urgency} · {b.units} unit(s) · {fmtDate(r.createdAt)}</p>
        </div>
        <StatusBadge status={r.status} />
      </div>
      {showActions && (
        <div className="mf-blood-actions mt-3">
          {Object.keys(BLOOD_RESPONSE_LABELS).map((key) => (
            <button key={key} className="mf-btn mf-btn-outline" disabled={busy} onClick={() => onRespond(r.id, key)}>{BLOOD_RESPONSE_LABELS[key]}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Blood() {
  const showToast = useToast();
  const [state, setState] = useState({ status: "loading" });
  const [toggling, setToggling] = useState(false);
  const [respondingId, setRespondingId] = useState(null);

  function load() {
    Promise.all([portalFetch("/volunteer-auth/blood"), portalFetch("/volunteer-auth/blood-requests")])
      .then(([b, r]) => setState({ status: "ok", b, requests: r.responses }))
      .catch((err) => setState({ status: "error", message: err.message }));
  }
  useEffect(load, []);

  function toggleAvailability() {
    const next = !state.b.bloodDonationAvailable;
    setToggling(true);
    portalFetch("/volunteer-auth/blood-availability", { method: "POST", body: JSON.stringify({ available: next }) })
      .then(() => { showToast(next ? "Marked available." : "Marked unavailable."); load(); })
      .catch((err) => showToast(err.message))
      .finally(() => setToggling(false));
  }

  function respond(responseId, response) {
    setRespondingId(responseId);
    portalFetch(`/volunteer-auth/blood-requests/${responseId}/respond`, { method: "POST", body: JSON.stringify({ response }) })
      .then(() => { showToast("Response recorded — thank you."); load(); })
      .catch((err) => { showToast(err.message); load(); })
      .finally(() => setRespondingId(null));
  }

  if (state.status === "loading") return <p className="text-[14px] text-[#4B5563]">Loading…</p>;
  if (state.status === "error") return <p className="text-[14px] text-[#DC2626]">{state.message}</p>;

  const { b, requests } = state;
  const pending = requests.filter((x) => x.status === "notified");
  const history = requests.filter((x) => x.status !== "notified");

  return (
    <>
      <dl className="mf-pf-grid mf-form-card">
        <div><dt>Blood Group</dt><dd>{b.bloodGroup || "—"}</dd></div>
        <div><dt>Registered Donor?</dt><dd>{b.isBloodDonor ? "Yes" : "No"}</dd></div>
        <div><dt>Eligible Now?</dt><dd>{b.eligible ? "Yes" : "No"}</dd></div>
        <div><dt>Donations Logged</dt><dd>{b.donationCount}</dd></div>
        <div><dt>Last Donation</dt><dd>{b.lastDonationDate ? fmtDate(b.lastDonationDate) : "No record on file"}</dd></div>
        <div><dt>Next Eligible</dt><dd>{b.nextEligibleDate ? fmtDate(b.nextEligibleDate) : "—"}</dd></div>
      </dl>

      {b.isBloodDonor && (
        <div className="mf-form-card mt-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-bold text-[15px]">Availability for donation</p>
            <p className="text-[13px] text-[#4B5563] mt-1">
              {b.bloodDonationAvailable ? "You're marked available and may be contacted for urgent requests." : "You're marked unavailable — you won't be notified about new requests."}
            </p>
          </div>
          <button className={"mf-btn " + (b.bloodDonationAvailable ? "mf-btn-red" : "mf-btn-primary")} disabled={toggling} onClick={toggleAvailability}>
            {b.bloodDonationAvailable ? "Mark Unavailable" : "Mark Available"}
          </button>
        </div>
      )}

      <p className="mf-pf-section">Requests Needing Your Response</p>
      {pending.length ? pending.map((r) => <BloodRequestRow key={r.id} r={r} showActions busy={respondingId === r.id} onRespond={respond} />) : <p className="text-[14px] text-[#9CA3AF]">Nothing waiting on you right now.</p>}

      <p className="mf-pf-section">Donation History</p>
      {b.donations.length
        ? b.donations.map((d) => (
            <div key={d.id} className="mf-portal-row">
              <div><p className="title">{fmtDate(d.donationDate)}</p>{d.location && <p className="meta">{d.location}</p>}</div>
            </div>
          ))
        : <p className="text-[14px] text-[#9CA3AF]">No donations logged yet.</p>}

      {history.length > 0 && (
        <>
          <p className="mf-pf-section">Past Alerts</p>
          {history.map((r) => <BloodRequestRow key={r.id} r={r} showActions={false} />)}
        </>
      )}
    </>
  );
}
