import AuthFrame from "../../components/workspace/AuthFrame";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../../lib/api";
import { getPortalAuth, setPortalAuth } from "../lib/portalAuth";
import "../../styles/portal.css";

export default function PortalLogin() {
  const navigate = useNavigate();
  const [volunteerId, setVolunteerId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getPortalAuth()) navigate("/portal", { replace: true });
  }, [navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    fetch(API_BASE + "/volunteer-auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ volunteerId: volunteerId.trim(), password }),
    })
      .then((res) => res.json().catch(() => ({})).then((body) => {
        if (!res.ok) throw new Error(body.error || "Login failed.");
        setPortalAuth(body);
        navigate("/portal", { replace: true });
      }))
      .catch((err) => setError(err.message))
      .finally(() => setSubmitting(false));
  }

  return (
    <AuthFrame>
        <h1 className="text-xl mb-1">Volunteer Login</h1>
        <p className="text-[13px] text-[#4B5563] mb-6">Sign in with the Volunteer ID and password from your approval email/SMS.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mf-label" htmlFor="l-vid">Volunteer ID</label>
            <input className="mf-input" id="l-vid" required placeholder="MLF202500001" autoComplete="username" value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)} />
          </div>
          <div className="mb-2">
            <label className="mf-label" htmlFor="l-password">Password</label>
            <input className="mf-input" id="l-password" type="password" required placeholder="••••••••" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="mf-error-msg mb-2" style={{ display: "block" }}>{error}</p>}
          <button className="mf-btn mf-btn-primary w-full justify-center mt-4" type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : <>Log In <i className="fa-solid fa-arrow-right"></i></>}
          </button>
        </form>
        <p className="text-[13px] mt-4"><Link to="/portal/forgot-password" className="text-[#14338C] underline">Forgot your password?</Link></p>
        <p className="text-[12px] text-[#9CA3AF] mt-5">Not approved yet? Credentials are issued automatically once your <a href="/get-involved#volunteer" className="text-[#14338C] underline">volunteer registration</a> is reviewed.</p>
    </AuthFrame>
  );
}

