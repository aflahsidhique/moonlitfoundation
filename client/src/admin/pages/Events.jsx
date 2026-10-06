import { useEffect, useState } from "react";
import { useAdminList } from "../hooks/useAdminList";
import { adminFetch } from "../lib/adminApi";
import { useToast } from "../../hooks/useToast";
import StatusBadge from "../components/StatusBadge";
import EventFormModal from "../components/EventFormModal";
import EventShareModal from "../components/EventShareModal";
import { fmtDate } from "../lib/format";
import AdminPagination from "../components/AdminPagination";

export default function Events() {
  const showToast = useToast();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [query]);
  const params = new URLSearchParams();
  if (filter !== "all") params.set("status", filter);
  if (debouncedQuery) params.set("q", debouncedQuery);
  const eventsPath = `/events/admin${params.size ? `?${params}` : ""}`;
  const { rows, loading, fetching, error, refresh, pagination, pageSize, setPage, setPageSize } = useAdminList(eventsPath, "events");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [sharing, setSharing] = useState(null);
  const [busy, setBusy] = useState(null);

  async function mutate(event, method, body) {
    setBusy(event.id);
    try {
      await adminFetch(`/events/${event.id}${method === "PATCH" ? "/status" : ""}`, { method, ...(body && { body: JSON.stringify(body) }) });
      showToast(method === "DELETE" ? "Event deleted." : "Event updated."); refresh();
    } catch (err) { showToast(err.message); } finally { setBusy(null); }
  }
  function openNew() { setEditing(null); setFormOpen(true); }
  return <>
    <div className="ws-toolbar"><div className="ws-toolbar-filters"><div className="ws-search"><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /><input className="mf-input" aria-label="Search events" placeholder="Search events…" value={query} onChange={(e) => setQuery(e.target.value)} /></div><div className="ws-tabs" aria-label="Filter events">{["all", "published", "draft"].map((value) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "all" ? "All events" : value === "published" ? "Published" : "Drafts"}</button>)}</div></div><button className="mf-btn mf-btn-primary" onClick={openNew}><i className="fa-solid fa-plus" aria-hidden="true" /> Create event</button></div>
    {error ? <p className="ws-error" role="alert">{error.message}</p> : loading ? <p className="ws-empty" role="status">Loading events…</p> : !rows.length ? <div className="ws-empty"><i className="fa-regular fa-calendar" aria-hidden="true" /><p>{filter !== "all" || debouncedQuery ? "No events match your search." : "Your next moment of impact starts here. Create your first event."}</p></div> : <><div className="ws-event-grid">{rows.map((event) => <article className="ws-event-card" key={event.id}>
      <div className="ws-event-cover">{event.imageUrl ? <img src={event.imageUrl} alt={event.title} loading="lazy" /> : <div className="ws-event-placeholder"><i className="fa-regular fa-calendar" aria-hidden="true" /></div>}<StatusBadge status={event.status} /></div>
      <div className="ws-event-body"><p className="ws-event-category">{event.category}</p><h2>{event.title}</h2><div className="ws-event-details"><p><i className="fa-regular fa-calendar" aria-hidden="true" />{fmtDate(event.eventDate)}</p><p><i className="fa-regular fa-clock" aria-hidden="true" />{event.startTime} – {event.endTime}</p><p><i className="fa-solid fa-location-dot" aria-hidden="true" />{event.location}</p><p><i className="fa-solid fa-user-group" aria-hidden="true" />{event._count?.registrations || 0}{event.capacity ? ` / ${event.capacity}` : ""} registrations</p></div></div>
      <div className="ws-event-actions"><button className="mf-admin-btn mf-admin-btn-neutral" onClick={() => { setEditing(event); setFormOpen(true); }} disabled={busy === event.id}><i className="fa-solid fa-pen" aria-hidden="true" /> Edit</button><button className="mf-admin-btn ws-share" disabled={event.status !== "published" || busy === event.id} title={event.status !== "published" ? "Publish this event to share it" : "Email this event"} onClick={() => setSharing({ event, autoSend: false })}><i className="fa-regular fa-envelope" aria-hidden="true" /> Share</button><button className="mf-admin-btn mf-admin-btn-neutral" disabled={busy === event.id} onClick={() => mutate(event, "PATCH", { status: event.status === "published" ? "draft" : "published" })}>{event.status === "published" ? "Unpublish" : "Publish"}</button><button className="ws-icon-button ws-delete" disabled={busy === event.id} aria-label={`Delete ${event.title}`} onClick={() => { if (window.confirm(`Delete “${event.title}”? This cannot be undone.`)) mutate(event, "DELETE"); }}><i className="fa-regular fa-trash-can" aria-hidden="true" /></button></div>
    </article>)}</div><AdminPagination pagination={pagination} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={setPageSize} busy={fetching} /></>}
    <EventFormModal open={formOpen} event={editing} onClose={() => setFormOpen(false)} onSaved={(message, event, email) => { setFormOpen(false); showToast(message); refresh(); if (email) setSharing({ event, autoSend: true }); }} />
    {sharing && <EventShareModal event={sharing.event} autoSend={sharing.autoSend} onClose={() => setSharing(null)} />}
  </>;
}
