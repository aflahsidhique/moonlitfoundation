import { useEffect, useState } from "react";
import { portalFetch } from "../lib/portalApi";
import { fmtDate } from "../lib/format";
import { useToast } from "../../hooks/useToast";
import ChipList from "../components/ChipList";

export default function Profile() {
  const showToast = useToast();
  const [state, setState] = useState({ status: "loading" });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    portalFetch("/volunteer-auth/me")
      .then((body) => setState({ status: "ok", v: body.volunteer }))
      .catch((err) => setState({ status: "error", message: err.message }));
  }, []);

  function handlePwSubmit(e) {
    e.preventDefault();
    setPwError("");
    if (pw.next.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (pw.next !== pw.confirm) { setPwError("New passwords don't match."); return; }

    setUpdating(true);
    portalFetch("/volunteer-auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }) })
      .then(() => { showToast("Password updated."); setPw({ current: "", next: "", confirm: "" }); })
      .catch((err) => setPwError(err.message))
      .finally(() => setUpdating(false));
  }

  if (state.status === "loading") return <p className="text-[14px] text-[#4B5563]">Loading…</p>;
  if (state.status === "error") return <p className="text-[14px] text-[#DC2626]">{state.message}</p>;

  const v = state.v;

  return (
    <>
      <div className="mf-form-card">
        <div className="mf-pf-header">
          {v.photoUrl
            ? <img className="mf-pf-photo" src={v.photoUrl} alt="" />
            : <div className="mf-pf-photo flex items-center justify-center text-[#9CA3AF]"><i className="fa-solid fa-user text-2xl"></i></div>}
          <div>
            <p className="text-xl font-bold">{v.fullName}</p>
            <p className="text-sm text-[#4B5563] mt-1">{v.volunteerId}</p>
          </div>
        </div>

        <p className="mf-pf-section">Personal Details</p>
        <dl className="mf-pf-grid">
          <div><dt>Date of Birth</dt><dd>{fmtDate(v.dob)}</dd></div>
          <div><dt>Gender</dt><dd>{v.gender}</dd></div>
          <div><dt>Mobile</dt><dd>{v.mobile}</dd></div>
          <div><dt>WhatsApp</dt><dd>{v.whatsapp || "—"}</dd></div>
          <div><dt>Email</dt><dd>{v.email}</dd></div>
        </dl>

        <p className="mf-pf-section">Address</p>
        <dl className="mf-pf-grid">
          <div><dt>House / Street</dt><dd>{v.address}</dd></div>
          <div><dt>District</dt><dd>{v.district}</dd></div>
          <div><dt>Taluk</dt><dd>{v.taluk}</dd></div>
          <div><dt>Panchayat</dt><dd>{v.panchayat}</dd></div>
          <div><dt>Ward</dt><dd>{v.ward}</dd></div>
          <div><dt>PIN</dt><dd>{v.pin}</dd></div>
        </dl>

        <p className="mf-pf-section">Emergency Contact</p>
        <dl className="mf-pf-grid">
          <div><dt>Name</dt><dd>{v.emergencyName}</dd></div>
          <div><dt>Relationship</dt><dd>{v.emergencyRelationship}</dd></div>
          <div><dt>Phone</dt><dd>{v.emergencyPhone}</dd></div>
        </dl>

        <p className="mf-pf-section">Skills</p>
        <ChipList csv={v.skills} />
        <p className="mf-pf-section">Available Time</p>
        <ChipList csv={v.availableTime} />
      </div>

      <div className="mf-form-card mt-4">
        <p className="font-bold text-[15px] mb-1">Change Password</p>
        <p className="text-[13px] text-[#4B5563] mb-4">Update the password you use to log into this portal.</p>
        <form onSubmit={handlePwSubmit}>
          <div className="mb-3">
            <label className="mf-label" htmlFor="cp-current">Current Password</label>
            <input className="mf-input" id="cp-current" type="password" required autoComplete="current-password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} />
          </div>
          <div className="mb-3">
            <label className="mf-label" htmlFor="cp-new">New Password</label>
            <input className="mf-input" id="cp-new" type="password" required minLength={8} placeholder="At least 8 characters" autoComplete="new-password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} />
          </div>
          <div className="mb-3">
            <label className="mf-label" htmlFor="cp-confirm">Confirm New Password</label>
            <input className="mf-input" id="cp-confirm" type="password" required minLength={8} autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} />
          </div>
          {pwError && <p className="mf-error-msg mb-2" style={{ display: "block" }}>{pwError}</p>}
          <button className="mf-btn mf-btn-primary" type="submit" disabled={updating}>{updating ? "Updating…" : "Update Password"}</button>
        </form>
      </div>
    </>
  );
}
