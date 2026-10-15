import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { adminFetch } from "../lib/adminApi";
import { getAdminAuth } from "../lib/adminAuth";
import { fmtDate } from "../lib/format";
import { canAdmin } from "../lib/adminPermissions";
export default function Overview() {
  const { setManyCounts } = useOutletContext();
  const admin = getAdminAuth()?.admin;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const today = ( new Date()).toISOString().slice(0, 10);
    const requests = [
      ["volunteers", "volunteers", "/volunteers?status=pending&pageSize=1"],
      ["blood", "blood_requests", "/blood-requests?status=pending&pageSize=1"],
      ["partners", "partners", "/partners?status=pending&pageSize=1"],
      ["messages", "messages", "/contact?status=unread&pageSize=1"],
      ["newsletter", "newsletter", "/newsletter?pageSize=1"],
      ["events", "events", `/events/admin?status=published&from=${today}&order=asc&pageSize=3`],
      ["registrations", "registrations", "/event-registrations?status=pending&pageSize=1"]
    ].filter(([, permission]) => canAdmin(admin, permission));
    Promise.all(requests.map(([, , path]) => adminFetch(path))).then((responses) => {
      const result = Object.fromEntries(requests.map(([key], index) => [key, responses[index]]));
      const counts = { volunteers: result.volunteers?.pagination.total || 0, blood: result.blood?.pagination.total || 0, partners: result.partners?.pagination.total || 0, messages: result.messages?.pagination.total || 0 };
      setManyCounts(counts);
      setData({ counts, subscribers: result.newsletter?.pagination.total || 0, publishedEvents: result.events?.summary.published || 0, events: result.events?.events || [], registrations: result.registrations?.pagination.total || 0 });
    }).catch(setError);
  }, []);
  if (error) return <p className="ws-error" role="alert">{error.message}</p>;
  if (!data) return <p className="ws-empty" role="status">Getting your community snapshot…</p>;
  const name = admin?.name?.split(" ")[0] || "team";
  const stats = [
    { permission: "volunteers", n: data.counts.volunteers, label: "Volunteers awaiting approval", icon: "user-group", to: "volunteers" },
    { permission: "events", n: data.publishedEvents, label: "Published events", icon: "calendar-days", to: "events" },
    { permission: "newsletter", n: data.subscribers, label: "Newsletter subscribers", icon: "paper-plane", to: "newsletter" },
    { permission: "blood_requests", n: data.counts.blood, label: "Pending blood requests", icon: "droplet", to: "blood-requests" }
  ].filter((item) => canAdmin(admin, item.permission));
  const queue = [
    { permission: "volunteers", n: data.counts.volunteers, label: "Volunteer applications", description: "Welcome the next helping hands", icon: "user-plus", to: "volunteers" },
    { permission: "registrations", n: data.registrations, label: "Event registrations", description: "Confirm their place in the community", icon: "ticket", to: "registrations" },
    { permission: "messages", n: data.counts.messages, label: "Unread messages", description: "Keep the conversation going", icon: "envelope", to: "messages" },
    { permission: "partners", n: data.counts.partners, label: "Partner inquiries", description: "Build something bigger together", icon: "handshake", to: "partners" }
  ].filter((item) => canAdmin(admin, item.permission));
  const upcoming = data.events;
  return <>
    <section className="ws-welcome"><div><p className="ws-eyebrow">Good to have you here, {name}</p><h2>A little coordination.<br /><em>A lot of good.</em></h2><p>Bring your community together. Your workspace shows only the areas assigned to your account.</p>{canAdmin(admin, "events") && <Link to="/admin/events" className="mf-btn">Manage events <i className="fa-solid fa-arrow-right" aria-hidden="true" /></Link>}</div><div className="ws-orbit" aria-hidden="true"><span /></div></section>
    {stats.length ? <div className="ws-stats">{stats.map((stat) => <Link key={stat.to} to={`/admin/${stat.to}`} className="ws-stat"><div className="ws-stat-top"><span className="ws-stat-icon"><i className={`fa-solid fa-${stat.icon}`} aria-hidden="true" /></span><i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></div><strong>{stat.n}</strong><p>{stat.label}</p></Link>)}</div> : <div className="ws-empty"><p>No workspace areas have been assigned yet. Ask a super admin to update your permissions.</p></div>}
    {(canAdmin(admin, "events") || queue.length > 0) && <div className="ws-columns">{canAdmin(admin, "events") && <section className="ws-panel"><div className="ws-panel-heading"><h2>Coming up next</h2><Link to="/admin/events">All events ↗</Link></div>{upcoming.length ? upcoming.map((event) => <Link className="ws-list-item" key={event.id} to="/admin/events">{event.imageUrl ? <img src={event.imageUrl} alt="" /> : <span className="ws-list-icon"><i className="fa-regular fa-calendar" aria-hidden="true" /></span>}<div><h3>{event.title}</h3><p>{fmtDate(event.eventDate)} · {event.location}</p><p>{event._count?.registrations || 0} people registered</p></div><i className="fa-solid fa-arrow-right" aria-hidden="true" /></Link>) : <div className="ws-empty">The calendar is ready for your next event.<p>Create and publish an event to see it here.</p></div>}</section>}
    {queue.length > 0 && <section className="ws-panel"><div className="ws-panel-heading"><h2>A little attention</h2><span className="ws-eyebrow" style={{ margin: 0 }}>Your inbox</span></div>{queue.map((item) => <Link key={item.to} to={`/admin/${item.to}`} className="ws-list-item"><span className="ws-list-icon"><i className={`fa-solid fa-${item.icon}`} aria-hidden="true" /></span><div><h3>{item.label}</h3><p>{item.description}</p></div><span className="ws-list-number">{item.n}</span></Link>)}</section>}</div>}
  </>;
}
