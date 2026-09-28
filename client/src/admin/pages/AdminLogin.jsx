import AuthFrame from "../../components/workspace/AuthFrame";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../lib/api";
import { getAdminAuth, setAdminAuth } from "../lib/adminAuth";
import "../../styles/admin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getAdminAuth()) navigate("/admin", { replace: true });
  }, [navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    fetch(API_BASE + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json().catch(() => ({})).then((body) => {
        if (!res.ok) throw new Error(body.error || "Login failed.");
        setAdminAuth(body);
        navigate("/admin", { replace: true });
      }))
      .catch((err) => setError(err.message))
      .finally(() => setSubmitting(false));
  }

  return (
    <AuthFrame admin>
        <h1 className="text-xl mb-1">Admin Login</h1>
        <p className="text-[13px] text-[#4B5563] mb-6">Sign in to review volunteers, blood requests, messages and manage events.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mf-label" htmlFor="l-email">Email</label>
            <input className="mf-input" id="l-email" type="email" required placeholder="admin@moonlitfoundation.org" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
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
    </AuthFrame>
  );
}

