import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { useAdminList } from "../hooks/useAdminList";
import { adminFetch } from "../lib/adminApi";
import { useToast } from "../../hooks/useToast";
import { AdminBtn } from "../components/AdminButtons";
import { fmtDate } from "../lib/format";

// Prefers the native BarcodeDetector API (fast, hardware-backed where
// available — mainly Chrome/Edge on Android and desktop). Most other
// browsers, notably iOS/mobile Safari, don't implement it at all, so this
// falls back to jsQR (pure-JS, sampled off a downscaled canvas frame) —
// that combination gets live scanning working everywhere getUserMedia
// does, rather than just wherever BarcodeDetector happens to exist.
function useQrScanner(videoRef, active, onDecode) {
  const [status, setStatus] = useState("idle"); // idle | unsupported | denied | running

  useEffect(() => {
    if (!active) return;
    if (!navigator.mediaDevices?.getUserMedia) { setStatus("unsupported"); return; }
    if (!("BarcodeDetector" in window) && !jsQR) { setStatus("unsupported"); return; }

    let stream = null, raf = null, cancelled = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let lastAttempt = 0, lastMatchedAt = 0;

    function handleDecoded(text) {
      const match = text && text.match(/MLF\d+/);
      const now = Date.now();
      if (match && now - lastMatchedAt > 1500) {
        lastMatchedAt = now;
        onDecode(match[0]);
      }
    }

    function scanWithCanvas(video, detector) {
      if (detector) {
        detector.detect(video).then((codes) => { if (codes.length) handleDecoded(codes[0].rawValue); }).catch(() => {});
        return;
      }
      const maxDim = 640;
      const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      if (!canvas.width || !canvas.height) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
      if (code?.data) handleDecoded(code.data);
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        stream = s;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.play();
        setStatus("running");

        const detector = "BarcodeDetector" in window ? new window.BarcodeDetector({ formats: ["qr_code"] }) : null;
        const tick = () => {
          if (cancelled) return;
          const now = Date.now();
          if (video.readyState >= 2 && now - lastAttempt > 300) {
            lastAttempt = now;
            try { scanWithCanvas(video, detector); } catch { /* transient decode error, ignore */ }
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      })
      .catch(() => setStatus("denied"));

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return status;
}

export default function Checkin() {
  const showToast = useToast();
  const { rows: events, loading, error } = useAdminList("/events/admin", "events");
  const [eventId, setEventId] = useState("");
  const [attendances, setAttendances] = useState([]);
  const [manualVid, setManualVid] = useState("");
  const [result, setResult] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (events.length && !eventId) setEventId(events[0].id);
  }, [events, eventId]);

  const loadAttendances = (id) => {
    if (!id) return;
    adminFetch(`/attendance/event/${id}`).then((body) => setAttendances(body.attendances));
  };
  useEffect(() => { loadAttendances(eventId); }, [eventId]);

  function doCheckIn(volunteerId) {
    if (!eventId) return;
    adminFetch("/attendance/check-in", { method: "POST", body: JSON.stringify({ eventId, volunteerId }) })
      .then((body) => {
        const msg = `${body.alreadyCheckedIn ? "Already checked in: " : "Checked in: "}${body.volunteer.fullName} (${body.volunteer.volunteerId})`;
        showToast(msg);
        setResult({ ok: true, msg });
        loadAttendances(eventId);
      })
      .catch((err) => { showToast(err.message); setResult({ ok: false, msg: err.message }); });
  }

  const scannerStatus = useQrScanner(videoRef, !!eventId, doCheckIn);

  function toggleCertificate(a) {
    const issued = !a.certificateIssued;
    adminFetch(`/attendance/${a.id}/certificate`, { method: "PATCH", body: JSON.stringify({ issued }) })
      .then(() => { showToast(issued ? "Certificate issued." : "Certificate revoked."); loadAttendances(eventId); })
      .catch((err) => showToast(err.message));
  }

  if (error) return <p className="mf-admin-empty">{error.message}</p>;
  if (loading) return <p className="mf-admin-empty">Loading…</p>;
  if (!events.length) return <p className="mf-admin-empty">Create an event first.</p>;

  return (
    <div className="mf-form-card" style={{ maxWidth: 520 }}>
      <label className="mf-label" htmlFor="checkin-event">Event</label>
      <select className="mf-input mb-4" id="checkin-event" value={eventId} onChange={(e) => setEventId(e.target.value)}>
        {events.map((e) => <option key={e.id} value={e.id}>{e.title} — {fmtDate(e.eventDate)}</option>)}
      </select>

      <div>
        {scannerStatus === "running" && <video ref={videoRef} playsInline muted style={{ width: "100%", borderRadius: 12, background: "#000" }} />}
        {scannerStatus === "denied" && <p className="text-[13px] text-[#9CA3AF]">Camera permission denied — use manual check-in below.</p>}
        {scannerStatus === "unsupported" && <p className="text-[13px] text-[#9CA3AF]">Live camera scanning couldn't load in this browser — use manual check-in below.</p>}
        {scannerStatus === "idle" && <video ref={videoRef} playsInline muted style={{ width: "100%", borderRadius: 12, background: "#000", display: "none" }} />}
      </div>

      <div className="mt-5">
        <p className="mf-label">Manual check-in (fallback)</p>
        <div className="flex gap-2">
          <input className="mf-input" placeholder="MLF202500001" value={manualVid} onChange={(e) => setManualVid(e.target.value)} />
          <button className="mf-btn mf-btn-primary" onClick={() => { if (manualVid.trim()) { doCheckIn(manualVid.trim()); setManualVid(""); } }}>Check In</button>
        </div>
        {result && <p className="text-[13px] mt-2" style={{ color: result.ok ? "#065F46" : "#991B1B" }}>{result.msg}</p>}
      </div>

      <p className="mf-admin-subtitle mt-6" style={{ margin: "0 0 .5rem" }}>Checked in so far</p>
      <div>
        {attendances.length ? attendances.map((a) => (
          <div key={a.id} className="flex items-center justify-between py-2 border-b border-[#EEF2FA] text-[13px]">
            <span>{a.volunteer.fullName} ({a.volunteer.volunteerId})</span>
            <span className="flex items-center gap-3">
              <span className="text-[#4B5563]">{a.hoursCredited}h</span>
              <AdminBtn variant={a.certificateIssued ? "danger" : "approve"} onClick={() => toggleCertificate(a)}>
                {a.certificateIssued ? "Revoke Certificate" : "Issue Certificate"}
              </AdminBtn>
            </span>
          </div>
        )) : <p className="text-[13px] text-[#9CA3AF]">No one checked in yet.</p>}
      </div>
    </div>
  );
}
