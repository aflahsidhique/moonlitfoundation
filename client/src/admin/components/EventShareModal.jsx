import { useCallback, useEffect, useRef, useState } from "react";
import AdminModal from "./AdminModal";
import { adminFetch } from "../lib/adminApi";
import { fmtDate } from "../lib/format";

export default function EventShareModal({ event, autoSend = false, onClose }) {
  const [audience, setAudience] = useState("volunteers");
  const [subject, setSubject] = useState(`You're invited: ${event.title}`.slice(0, 180));
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [delivery, setDelivery] = useState(null);
  const requestId = useRef(crypto.randomUUID());
  const sentAutomatically = useRef(false);
  const inFlight = useRef(false);
  const [uncertain, setUncertain] = useState(false);

  useEffect(() => {
    let active = true;
    setPreview(null); setError("");
    adminFetch(`/events/${event.id}/email-preview?audience=${audience}`, { force: true })
      .then((body) => { if (active) setPreview({ ...body, audience }); })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [event.id, audience]);

  const send = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSending(true); setError("");
    try {
      const body = await adminFetch(`/events/${event.id}/share`, { method: "POST", body: JSON.stringify({ audience, subject, message, requestId: requestId.current }) });
      setDelivery(body.delivery);
    } catch (err) {
      setError(err.message);
      // The connection can fail after SMTP has accepted mail. Never auto-resend.
      if (err instanceof TypeError) setUncertain(true);
    } finally { inFlight.current = false; setSending(false); }
  }, [event.id, audience, subject, message]);

  useEffect(() => {
    if (autoSend && !sentAutomatically.current && preview?.configured && preview.count > 0) { sentAutomatically.current = true; send(); }
  }, [autoSend, preview, send]);

  const ready = preview?.audience === audience;
  return <AdminModal open title={delivery ? "Email delivery results" : "Share your event"} onClose={onClose} busy={sending} wide>
    {autoSend && <p className="ws-success">Your event has been created and published.</p>}
    {delivery ? <div role="status">
      <p className={delivery.failed ? "ws-error" : "ws-success"}>{delivery.status === "empty" ? "No eligible email addresses were found." : delivery.failed ? "Some invitations could not be sent. Review the totals below before sending another announcement." : "Your invitations have been accepted by the email provider."}</p>
      <div className="ws-delivery-stats"><div><strong>{delivery.sent}</strong>Sent</div><div><strong>{delivery.failed}</strong>Failed</div><div><strong>{delivery.skipped}</strong>Invalid addresses skipped</div></div>
      <p className="ws-note">Email delivery to an inbox depends on the recipient’s mail provider. Sending a new announcement will email the selected audience again.</p>
      <div className="ws-form-actions"><button className="mf-btn mf-btn-primary" onClick={onClose}>Done</button></div>
    </div> : <form onSubmit={(e) => { e.preventDefault(); send(); }}>
      <fieldset disabled={sending || uncertain}>
        <label className="mf-label" htmlFor="share-audience">Send to</label>
        <select className="mf-input" id="share-audience" value={audience} onChange={(e) => { setAudience(e.target.value); requestId.current = crypto.randomUUID(); }}>
          <option value="volunteers">All approved volunteers</option><option value="registrations">This event’s registered attendees</option>
        </select>
        <p className="ws-recipient-count" role="status">{ready ? `${preview.count} unique email address${preview.count === 1 ? "" : "es"}${preview.skipped ? ` · ${preview.skipped} invalid addresses excluded` : ""}. Each invitation is sent individually.` : "Checking recipients…"}</p>
        <div className="mt-5"><label className="mf-label" htmlFor="share-subject">Email subject</label><input className="mf-input" id="share-subject" value={subject} required maxLength={180} onChange={(e) => setSubject(e.target.value)} /></div>
        <div className="mt-4"><label className="mf-label" htmlFor="share-message">A personal message <span className="font-normal">(optional)</span></label><textarea className="mf-input" id="share-message" rows={3} maxLength={3000} placeholder="A few words to bring everyone together…" value={message} onChange={(e) => setMessage(e.target.value)} /></div>
      </fieldset>
      <div className="ws-email-preview" aria-label="Email content preview">
        {event.imageUrl && <img src={event.imageUrl} alt="Event cover" />}
        <div><p className="ws-eyebrow">Moonlit Foundation · {event.category}</p><h3>{event.title}</h3>{message && <p className="mb-3">{message}</p>}<p><strong>{fmtDate(event.eventDate)} · {event.startTime} – {event.endTime}</strong><br />{event.location}</p><p className="mt-3">{event.description}</p><p className="mt-4"><strong>Includes a link to view the event and register.</strong></p></div>
      </div>
      {ready && !preview.configured && <p className="ws-error" role="alert">Email sending is not configured yet. Add GMAIL_USER and GMAIL_APP_PASSWORD to the server environment to enable invitations.</p>}
      {ready && !preview.count && <p className="ws-note mt-4">There are no eligible recipients in this audience yet.</p>}
      {error && <p className="ws-error" role="alert">{error}{uncertain && " The connection was lost, so delivery could not be confirmed. Check the sender’s sent mail before starting a new announcement."}</p>}
      {sending && <p className="ws-note mt-4" role="status">Sending invitations… Keep this window open until the results appear.</p>}
      <div className="ws-form-actions"><button type="button" className="mf-btn mf-btn-outline" onClick={onClose} disabled={sending}>Close</button><button type="submit" className="mf-btn mf-btn-primary" disabled={sending || uncertain || !ready || !preview?.configured || !preview?.count || !subject.trim()}><i className="fa-regular fa-envelope" aria-hidden="true" />{sending ? "Sending…" : `Send to ${preview?.count || 0} ${audience === "volunteers" ? "volunteers" : "attendees"}`}</button></div>
    </form>}
  </AdminModal>;
}
