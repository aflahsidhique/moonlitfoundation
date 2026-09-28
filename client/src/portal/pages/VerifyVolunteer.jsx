import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { API_BASE } from "../../lib/api";
import "../../styles/portal.css";

export default function VerifyVolunteer() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    if (!id) { setState({ status: "error", message: "No volunteer ID given." }); return; }
    fetch(API_BASE + "/volunteers/verify/" + encodeURIComponent(id))
      .then((res) => res.json().catch(() => ({})).then((body) => {
        if (!res.ok) throw new Error(body.error || "Not found.");
        return body.volunteer;
      }))
      .then((volunteer) => setState({ status: "ok", volunteer }))
      .catch((err) => setState({ status: "error", message: err.message }));
  }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(115deg,var(--mf-navy) 0%,var(--mf-navy-2) 55%,#183a7e 100%)" }}>
      <div className="mf-form-card w-full max-w-sm text-center">
        {state.status === "loading" && <p className="text-[14px] text-[#4B5563]">Checking…</p>}
        {state.status === "ok" && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#D1FAE5" }}>
              <i className="fa-solid fa-check text-2xl" style={{ color: "#065F46" }}></i>
            </div>
            <p className="text-lg font-bold mb-1">Verified Volunteer</p>
            {state.volunteer.photoUrl && <img className="mf-pf-photo mx-auto my-3" src={state.volunteer.photoUrl} alt="" />}
            <p className="text-xl font-bold">{state.volunteer.fullName}</p>
            <p className="text-sm text-[#14338C] font-semibold mt-1">{state.volunteer.volunteerId}</p>
            {state.volunteer.bloodGroup && <p className="text-sm text-[#4B5563] mt-1">Blood Group: {state.volunteer.bloodGroup}</p>}
            <span className="mf-id-card-status mt-4" style={{ display: "inline-block" }}>ACTIVE</span>
            <p className="text-[12px] text-[#9CA3AF] mt-5">This confirms the person is an approved Moonlit Foundation volunteer.</p>
          </>
        )}
        {state.status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#FEE2E2" }}>
              <i className="fa-solid fa-xmark text-2xl" style={{ color: "#991B1B" }}></i>
            </div>
            <p className="text-lg font-bold mb-1">Not Verified</p>
            <p className="text-[13px] text-[#4B5563]">{state.message}</p>
          </>
        )}
      </div>
    </div>
  );
}
