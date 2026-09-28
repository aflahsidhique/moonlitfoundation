import { fmtDate, certQrUrl } from "../lib/format";

export default function CertificateCard({ volunteerName, cert }) {
  return (
    <div className="mf-cert-card">
      <span className="w-10 h-10 rounded-full border-2 mx-auto flex items-center justify-center mb-3" style={{ borderColor: "var(--mf-navy)" }}>
        <i className="fa-solid fa-fire-flame-curved" style={{ color: "var(--mf-navy)" }}></i>
      </span>
      <p className="text-xs tracking-[.3em] font-bold" style={{ color: "var(--mf-blue)" }}>MOONLIT FOUNDATION</p>
      <h2 className="text-2xl font-bold mt-3" style={{ color: "var(--mf-dark)" }}>Certificate of Participation</h2>
      <p className="text-[14px] mt-4">This certifies that</p>
      <p className="text-xl font-bold mt-1" style={{ color: "var(--mf-navy)" }}>{volunteerName}</p>
      <p className="text-[14px] mt-3">volunteered at</p>
      <p className="text-lg font-bold mt-1">{cert.event.title}</p>
      <p className="text-[13px] text-[#4B5563] mt-1">{fmtDate(cert.event.eventDate)} · {cert.event.category}</p>
      <p className="text-[13px] mt-3">contributing <strong>{cert.hoursCredited} hour(s)</strong> of service.</p>
      <img className="mx-auto mt-5" style={{ width: 120, height: 120, borderRadius: 10, border: "1px solid #E3E9F5" }} src={certQrUrl(cert.id)} alt="Certificate verification QR code" />
      <p className="text-[11px] text-[#9CA3AF] mt-2">Certificate ID: {cert.id}</p>
      <p className="text-[11px] text-[#9CA3AF]">Issued {fmtDate(cert.certificateIssuedAt)} · Scan to verify</p>
    </div>
  );
}
