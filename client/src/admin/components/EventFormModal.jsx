import { useEffect, useRef, useState } from "react";
import AdminModal from "./AdminModal";
import { adminFetch } from "../lib/adminApi";

const CATEGORIES = ["Blood Donation", "Community Welfare", "Disaster Relief", "Environment", "Youth Development"];

const BLANK = { title: "", category: CATEGORIES[0], status: "draft", description: "", location: "", eventDate: "", capacity: "", startTime: "", endTime: "", durationHours: "", imageUrl: "", photoAlbumUrl: "" };

export default function EventFormModal({ open, event, onClose, onSaved }) {
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [emailOnCreate, setEmailOnCreate] = useState(false);
  const [stage, setStage] = useState("");
  const fileInput = useRef(null);
  const submitting = useRef(false);

  useEffect(() => {
    if (!imageFile) { setPreview(""); return; }
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (!open) return;
    if (event) {
      setForm({
        title: event.title, category: event.category, status: event.status, description: event.description,
        location: event.location, eventDate: new Date(event.eventDate).toISOString().slice(0, 10),
        capacity: event.capacity || "", startTime: event.startTime, endTime: event.endTime,
        durationHours: event.durationHours || "", imageUrl: event.imageUrl || "", photoAlbumUrl: event.photoAlbumUrl || "",
      });
    } else {
      setForm(BLANK);
    }
    setError("");
    setImageFile(null);
    setEmailOnCreate(false);
    if (fileInput.current) fileInput.current.value = "";
  }, [open, event]);

  function set(key, value) { setForm((f) => ({ ...f, [key]: value })); }

  function chooseImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Choose a JPG, PNG or WebP image smaller than 5 MB.");
      e.target.value = "";
      return;
    }
    setError("");
    setImageFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setError("");
    const payload = {
      title: form.title.trim(), category: form.category, status: form.status, description: form.description.trim(),
      location: form.location.trim(), eventDate: form.eventDate, capacity: form.capacity || null,
      startTime: form.startTime.trim(), endTime: form.endTime.trim(), durationHours: form.durationHours || null,
      imageUrl: form.imageUrl.trim() || null, photoAlbumUrl: form.photoAlbumUrl.trim() || null,
    };
    setSaving(true);
    try {
      if (imageFile) {
        setStage("Uploading image…");
        const data = new FormData(); data.append("image", imageFile);
        const uploaded = await adminFetch("/events/image", { method: "POST", body: data });
        payload.imageUrl = uploaded.imageUrl;
        set("imageUrl", uploaded.imageUrl);
        setImageFile(null);
      }
      setStage("Saving event…");
      const body = await adminFetch(event ? `/events/${event.id}` : "/events", { method: event ? "PUT" : "POST", body: JSON.stringify(payload) });
      onSaved(event ? "Event updated." : "Event created.", body.event, !event && emailOnCreate && form.status === "published");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); setStage(""); submitting.current = false; }
  }

  return (
    <AdminModal open={open} onClose={onClose} title={event ? "Edit event" : "Create an event"} wide busy={saving}>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={saving}>
        <p className="ws-form-section">01 / The first impression</p>
        <label className="ws-upload" htmlFor="ef-upload">
          {preview || form.imageUrl ? <img src={preview || form.imageUrl} alt="Event cover preview" /> : <i className="fa-regular fa-image" aria-hidden="true" />}
          <div><strong>Event cover image</strong><p>JPG, PNG or WebP · Up to 5 MB · Landscape works best</p><input ref={fileInput} id="ef-upload" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} /></div>
        </label>
        {(imageFile || form.imageUrl) && <button type="button" className="ws-image-remove" onClick={() => { setImageFile(null); set("imageUrl", ""); if (fileInput.current) fileInput.current.value = ""; }}>Remove image</button>}
        <details className="ws-image-link"><summary>Use an image link instead</summary><label className="mf-label" htmlFor="ef-image">Image URL</label><input className="mf-input" id="ef-image" type="url" placeholder="https://…" value={form.imageUrl} onChange={(e) => { setImageFile(null); set("imageUrl", e.target.value); if (fileInput.current) fileInput.current.value = ""; }} /></details>
        <p className="ws-form-section">02 / Event details</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="mf-label" htmlFor="ef-title">Title *</label><input className="mf-input" id="ef-title" required placeholder="Mega Blood Donation Camp" value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div>
            <label className="mf-label" htmlFor="ef-category">Category *</label>
            <select className="mf-input" id="ef-category" required value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mf-label" htmlFor="ef-status">Status</label>
            <select className="mf-input" id="ef-status" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="draft">Draft</option><option value="published">Published</option>
            </select>
          </div>
          <div className="sm:col-span-2"><label className="mf-label" htmlFor="ef-description">Description *</label><textarea className="mf-input" id="ef-description" rows={3} required placeholder="What is this event about?" value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="mf-label" htmlFor="ef-location">Location *</label><input className="mf-input" id="ef-location" required placeholder="Govt. Medical College, Kozhikode" value={form.location} onChange={(e) => set("location", e.target.value)} /></div>
          <div><label className="mf-label" htmlFor="ef-date">Date *</label><input className="mf-input" id="ef-date" type="date" required value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} /></div>
          <div><label className="mf-label" htmlFor="ef-capacity">Capacity</label><input className="mf-input" id="ef-capacity" type="number" min="1" placeholder="Optional" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} /></div>
          <div><label className="mf-label" htmlFor="ef-start">Start Time *</label><input className="mf-input" id="ef-start" required placeholder="9:00 AM" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} /></div>
          <div><label className="mf-label" htmlFor="ef-end">End Time *</label><input className="mf-input" id="ef-end" required placeholder="4:00 PM" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} /></div>
          <div><label className="mf-label" htmlFor="ef-duration">Hours Credited <span className="text-[#9CA3AF] font-normal">(for attendance)</span></label><input className="mf-input" id="ef-duration" type="number" min="0" step="0.5" placeholder="e.g. 4" value={form.durationHours} onChange={(e) => set("durationHours", e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="mf-label" htmlFor="ef-album">Photo Album Link <span className="text-[#9CA3AF] font-normal">(optional — e.g. a Google Drive folder)</span></label><input className="mf-input" id="ef-album" type="url" placeholder="https://drive.google.com/drive/folders/..." value={form.photoAlbumUrl} onChange={(e) => set("photoAlbumUrl", e.target.value)} /></div>
        </div>
        {!event && <label className="ws-send-option"><input type="checkbox" checked={emailOnCreate && form.status === "published"} disabled={form.status !== "published"} onChange={(e) => setEmailOnCreate(e.target.checked)} /><span><strong>Email volunteers when I create this event</strong><small>{form.status === "published" ? "Send the event image, details and website link to all approved volunteers. Delivery results appear after saving." : "Choose Published to send an invitation. Drafts stay private."}</small></span></label>}
        </fieldset>
        {error && <p className="ws-error" role="alert">{error}</p>}
        <div className="ws-form-actions">
          <button type="submit" className="mf-btn mf-btn-primary" disabled={saving}>{saving ? stage : event ? "Save changes" : emailOnCreate && form.status === "published" ? "Create & email volunteers" : "Create event"}</button>
          <button type="button" className="mf-btn mf-btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
        </div>
      </form>
    </AdminModal>
  );
}
