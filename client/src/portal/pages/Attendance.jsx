import { useEffect, useState } from "react";
import { portalFetch } from "../lib/portalApi";
import { fmtDate } from "../lib/format";

export default function Attendance() {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    portalFetch("/volunteer-auth/attendance")
      .then((body) => setState({ status: "ok", ...body }))
      .catch((err) => setState({ status: "error", message: err.message }));
  }, []);

  if (state.status === "loading") return <p className="text-[14px] text-[#4B5563]">Loading…</p>;
  if (state.status === "error") return <p className="text-[14px] text-[#DC2626]">{state.message}</p>;

  return (
    <>
      <div className="mf-portal-stats-row" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
        <div className="mf-portal-stat-card"><p className="mf-portal-stat-num">{state.totalHours}</p><p className="mf-portal-stat-label">Total Hours Served</p></div>
        <div className="mf-portal-stat-card"><p className="mf-portal-stat-num">{state.attendances.length}</p><p className="mf-portal-stat-label">Events Attended</p></div>
      </div>
      {state.attendances.length ? state.attendances.map((a) => (
        <div key={a.id} className="mf-portal-row">
          <div>
            <p className="title">{a.event.title}</p>
            <p className="meta">{fmtDate(a.event.eventDate)} · Checked in {fmtDate(a.checkedInAt)}</p>
          </div>
          <span className="font-bold text-[#14338C]">{a.hoursCredited}h</span>
        </div>
      )) : <p className="text-[14px] text-[#9CA3AF]">No check-ins yet — attendance is marked by an admin scanning your Volunteer Card QR code at an event.</p>}
    </>
  );
}
