import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { portalFetch } from "../lib/portalApi";
import { fmtDate } from "../lib/format";
import StatusBadge from "../components/StatusBadge";

export default function PortalEvents() {
  const [state, setState] = useState({ status: "loading" });
  const [filter, setFilter] = useState("upcoming");
  useEffect(() => {
    portalFetch("/volunteer-auth/events").then((body) => setState({ status: "ok", upcoming: body.upcoming, past: body.past })).catch((err) => setState({ status: "error", message: err.message }));
  }, []);
  if (state.status === "loading") return <p className="ws-empty" role="status">Loading your events…</p>;
  if (state.status === "error") return <p className="ws-error" role="alert">{state.message}</p>;
  return <>
    <div className="ws-toolbar"><div className="ws-tabs" aria-label="Event period"><button aria-pressed={filter === "upcoming"} onClick={() => setFilter("upcoming")}>Upcoming ({state.upcoming.length})</button><button aria-pressed={filter === "past"} onClick={() => setFilter("past")}>Past events ({state.past.length})</button></div><Link to="/events" className="mf-btn mf-btn-primary">Explore events <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></Link></div>
    {state[filter].length ? <div className="ws-event-grid">{state[filter].map(({ id, event, status }) => <article key={id} className="ws-event-card"><div className="ws-event-cover">{event.imageUrl ? <img src={event.imageUrl} alt={event.title} loading="lazy" /> : <div className="ws-event-placeholder"><i className="fa-regular fa-calendar" aria-hidden="true" /></div>}<StatusBadge status={status} /></div><div className="ws-event-body"><p className="ws-event-category">{event.category || "Community event"}</p><h2>{event.title}</h2><div className="ws-event-details"><p><i className="fa-regular fa-calendar" aria-hidden="true" />{fmtDate(event.eventDate)}</p><p><i className="fa-regular fa-clock" aria-hidden="true" />{event.startTime} – {event.endTime}</p><p><i className="fa-solid fa-location-dot" aria-hidden="true" />{event.location}</p></div></div><div className="ws-event-actions"><Link className="mf-btn mf-btn-outline" to={`/events#event-${event.id}`}>View event <i className="fa-solid fa-arrow-right" aria-hidden="true" /></Link>{event.photoAlbumUrl && <a className="mf-btn mf-btn-outline" href={event.photoAlbumUrl} target="_blank" rel="noreferrer">Photo album</a>}</div></article>)}</div> : <div className="ws-empty">{filter === "upcoming" ? "No upcoming event registrations yet." : "Your past events will appear here."}<p>Find a cause that’s close to your heart and join us.</p></div>}
  </>;
}
