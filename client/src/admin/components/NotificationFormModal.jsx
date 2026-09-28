import { useEffect, useState } from "react";
import AdminModal from "./AdminModal";
import { adminFetch } from "../lib/adminApi";

const BLANK = { audience: "all", volunteerId: "", title: "", message: "" };

export default function NotificationFormModal({ open, onClose, onSent }) {
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) { setForm(BLANK); setError(""); }
  }, [open]);

  function set(key, value) { setForm((f) => ({ ...f, [key]: value })); }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = { title: form.title.trim(), message: form.message.trim() };
    if (form.audience === "volunteer") payload.volunteerId = form.volunteerId.trim();
    setSending(true);
    adminFetch("/notifications", { method: "POST", body: JSON.stringify(payload) })
      .then(() => onSent())
      .catch((err) => setError(err.message))
      .finally(() => setSending(false));
  }

  return (
    <AdminModal open={open} onClose={onClose} title="New Notification">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div>
            <label className="mf-label" htmlFor="nf-audience">Send To</label>
            <select className="mf-input" id="nf-audience" value={form.audience} onChange={(e) => set("audience", e.target.value)}>
              <option value="all">All volunteers (broadcast)</option>
              <option value="volunteer">One volunteer (by Volunteer ID)</option>
            </select>
          </div>
          {form.audience === "volunteer" && (
            <div><label className="mf-label" htmlFor="nf-vid">Volunteer ID</label><input className="mf-input" id="nf-vid" placeholder="MLF202500001" value={form.volunteerId} onChange={(e) => set("volunteerId", e.target.value)} /></div>
          )}
          <div><label className="mf-label" htmlFor="nf-title">Title *</label><input className="mf-input" id="nf-title" required placeholder="Monthly Meetup" value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div><label className="mf-label" htmlFor="nf-message">Message *</label><textarea className="mf-input" id="nf-message" rows={3} required placeholder="Join us this Saturday at 10 AM." value={form.message} onChange={(e) => set("message", e.target.value)} /></div>
        </div>
        {error && <p className="mf-error-msg mt-3" style={{ display: "block" }}>{error}</p>}
        <div className="flex gap-3 mt-6">
          <button type="submit" className="mf-btn mf-btn-primary flex-1 justify-center" disabled={sending}>Send</button>
          <button type="button" className="mf-btn mf-btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </AdminModal>
  );
}
