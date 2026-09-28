import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { API_BASE } from "../../lib/api";
import { fmtDate } from "../lib/format";
import "../../styles/portal.css";

export default function VerifyCertificate() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    if (!id) { setState({ status: "error", message: "No certificate ID given." }); return; }
    fetch(API_BASE + "/attendance/verify/" + encodeURIComponent(id))
      .then((res) => res.json().catch(() => ({})).then((body) => {
        if (!res.ok) throw new Error(body.error || "Not found.");
        return body.certificate;
      }))
      .then((certificate) => setState({ status: "ok", certificate }))
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
            <p className="text-lg font-bold mb-1">Verified Certificate</p>
            <p className="text-xl font-bold mt-3">{state.certificate.volunteerName}</p>
            <p className="text-sm text-[#14338C] font-semibold mt-1">{state.certificate.volunteerId}</p>
            <p className="text-[14px] mt-4">volunteered at</p>
            <p className="text-lg font-bold mt-1">{state.certificate.eventTitle}</p>
            <p className="text-sm text-[#4B5563] mt-1">{fmtDate(state.certificate.eventDate)} · {state.certificate.category}</p>
            <p className="text-[13px] mt-3">{state.certificate.hoursCredited} hour(s) of service credited</p>
            <p className="text-[12px] text-[#9CA3AF] mt-5">Issued {fmtDate(state.certificate.issuedAt)} by Moonlit Foundation.</p>
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
