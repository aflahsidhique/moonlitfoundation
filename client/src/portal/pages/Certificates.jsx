import { useEffect, useState } from "react";
import { portalFetch } from "../lib/portalApi";
import { fmtDate } from "../lib/format";
import CertificateCard from "../components/CertificateCard";

export default function Certificates() {
  const [state, setState] = useState({ status: "loading" });
  const [viewingId, setViewingId] = useState(null);

  useEffect(() => {
    Promise.all([portalFetch("/volunteer-auth/certificates"), portalFetch("/volunteer-auth/me")])
      .then(([certsBody, meBody]) => setState({ status: "ok", certs: certsBody.certificates, volunteerName: meBody.volunteer.fullName }))
      .catch((err) => setState({ status: "error", message: err.message }));
  }, []);

  if (state.status === "loading") return <p className="text-[14px] text-[#4B5563]">Loading…</p>;
  if (state.status === "error") return <p className="text-[14px] text-[#DC2626]">{state.message}</p>;
  if (!state.certs.length) return <p className="text-[14px] text-[#9CA3AF]">No certificates yet — an admin issues these after you've attended an event.</p>;

  const viewing = viewingId ? state.certs.find((c) => c.id === viewingId) : null;
  if (viewing) {
    return (
      <>
        <CertificateCard volunteerName={state.volunteerName} cert={viewing} />
        <div className="text-center mt-5 flex justify-center gap-3">
          <button id="mfCertBack" className="mf-btn mf-btn-outline" onClick={() => setViewingId(null)}><i className="fa-solid fa-arrow-left"></i> Back</button>
          <button id="mfCertPrint" className="mf-btn mf-btn-primary" onClick={() => window.print()}><i className="fa-solid fa-download"></i> Download / Print</button>
        </div>
      </>
    );
  }

  return state.certs.map((c) => (
    <div key={c.id} className="mf-portal-row">
      <div>
        <p className="title">{c.event.title}</p>
        <p className="meta">{fmtDate(c.event.eventDate)} · {c.hoursCredited} hour(s)</p>
      </div>
      <button className="mf-btn mf-btn-outline" onClick={() => setViewingId(c.id)}>View Certificate</button>
    </div>
  ));
}
