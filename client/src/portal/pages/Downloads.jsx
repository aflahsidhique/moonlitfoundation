import { useNavigate } from "react-router-dom";

export default function Downloads() {
  const navigate = useNavigate();

  function downloadIdCard() {
    navigate("/portal/idcard");
    setTimeout(() => window.print(), 300);
  }

  return (
    <div className="mf-form-card text-center">
      <p className="text-[14px] mb-4">Your digital Volunteer ID card, ready to save or print.</p>
      <button className="mf-btn mf-btn-primary" onClick={downloadIdCard}><i className="fa-solid fa-download"></i> Download / Print ID Card</button>
      <p className="text-[12px] text-[#9CA3AF] mt-4">Certificates will appear here once that feature ships.</p>
    </div>
  );
}
