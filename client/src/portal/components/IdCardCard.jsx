import { qrUrl } from "../lib/format";

export default function IdCardCard({ v }) {
  return (
    <div className="mf-id-card">
      <div className="mf-id-card-header">
        <span className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0">
          <i className="fa-solid fa-fire-flame-curved text-white text-xs"></i>
        </span>
        <span className="name">MOONLIT FOUNDATION</span>
      </div>
      <div className="mf-id-card-body">
        {v.photoUrl
          ? <img className="mf-id-card-photo" src={v.photoUrl} alt="" />
          : <div className="mf-id-card-photo flex items-center justify-center text-[#9CA3AF]"><i className="fa-solid fa-user text-3xl"></i></div>}
        <p className="mf-id-card-vname">{v.fullName}</p>
        <p className="mf-id-card-vid">{v.volunteerId}</p>
        <div className="mf-id-card-row">
          <div><dt>Blood Group</dt><dd>{v.bloodGroup || "—"}</dd></div>
        </div>
        <img className="mf-id-card-qr" src={qrUrl(v.volunteerId)} alt="QR code linking to this volunteer's verification page" />
        <div><span className="mf-id-card-status">ACTIVE</span></div>
      </div>
      <div className="mf-id-card-footer">QR code verifies the volunteer.</div>
    </div>
  );
}
