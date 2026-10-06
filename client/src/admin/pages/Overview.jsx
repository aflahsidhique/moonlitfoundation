import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { adminFetch } from "../lib/adminApi";
import { getAdminAuth } from "../lib/adminAuth";
import { fmtDate } from "../lib/format";

export default function Overview() {
  const { setManyCounts } = useOutletContext();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      adminFetch("/volunteers?status=pending&pageSize=1"), adminFetch("/blood-requests?status=pending&pageSize=1"),
      adminFetch("/partners?status=pending&pageSize=1"), adminFetch("/contact?status=unread&pageSize=1"),
      adminFetch("/newsletter?pageSize=1"), adminFetch(`/events/admin?status=published&from=${today}&order=asc&pageSize=3`), adminFetch("/event-registrations?status=pending&pageSize=1"),
    ]).then(([volunteers, blood, partners, messages, newsletter, events, registrations]) => {
      const counts = { volunteers: volunteers.pagination.total, blood: blood.pagination.total, partners: partners.pagination.total, messages: messages.pagination.total };
      setManyCounts(counts);
      setData({ counts, subscribers: newsletter.pagination.total, publishedEvents: events.summary.published, events: events.events, registrations: registrations.pagination.total });
    }).catch(setError);
    // This snapshot is loaded once; the list pages own their live refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (error) return <p className="ws-error" role="alert">{error.message}</p>;
  if (!data) return <p className="ws-empty" role="status">Getting your community snapshot…</p>;
  const name = getAdminAuth()?.admin?.name?.split(" ")[0] || "team";
  const stats = [
    { n: data.counts.volunteers, label: "Volunteers awaiting approval", icon: "user-group", to: "volunteers" },
    { n: data.publishedEvents, label: "Published events", icon: "calendar-days", to: "events" },
    { n: data.subscribers, label: "Newsletter subscribers", icon: "paper-plane", to: "newsletter" },
    { n: data.counts.blood, label: "Pending blood requests", icon: "droplet", to: "blood-requests" },
  ];
  const queue = [
    { n: data.counts.volunteers, label: "Volunteer applications", description: "Welcome the next helping hands", icon: "user-plus", to: "volunteers" },
    { n: data.registrations, label: "Event registrations", description: "Confirm their place in the community", icon: "ticket", to: "registrations" },
    { n: data.counts.messages, label: "Unread messages", description: "Keep the conversation going", icon: "envelope", to: "messages" },
    { n: data.counts.partners, label: "Partner inquiries", description: "Build something bigger together", icon: "handshake", to: "partners" },
  ];
  const upcoming = data.events;
  return <>
    <section className="ws-welcome"><div><p className="ws-eyebrow">Good to have you here, {name}</p><h2>A little coordination.<br /><em>A lot of good.</em></h2><p>Bring your community together. Here’s what’s happening and where a little attention can make a difference.</p><Link to="/admin/events" className="mf-btn">Manage events <i className="fa-solid fa-arrow-right" aria-hidden="true" /></Link></div><div className="ws-orbit" aria-hidden="true"><span /></div></section>
    <div className="ws-stats">{stats.map((stat) => <Link key={stat.to} to={`/admin/${stat.to}`} className="ws-stat"><div className="ws-stat-top"><span className="ws-stat-icon"><i className={`fa-solid fa-${stat.icon}`} aria-hidden="true" /></span><i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></div><strong>{stat.n}</strong><p>{stat.label}</p></Link>)}</div>
    <div className="ws-columns"><section className="ws-panel"><div className="ws-panel-heading"><h2>Coming up next</h2><Link to="/admin/events">All events ↗</Link></div>{upcoming.length ? upcoming.map((event) => <Link className="ws-list-item" key={event.id} to="/admin/events">{event.imageUrl ? <img src={event.imageUrl} alt="" /> : <span className="ws-list-icon"><i className="fa-regular fa-calendar" aria-hidden="true" /></span>}<div><h3>{event.title}</h3><p>{fmtDate(event.eventDate)} · {event.location}</p><p>{event._count?.registrations || 0} people registered</p></div><i className="fa-solid fa-arrow-right" aria-hidden="true" /></Link>) : <div className="ws-empty">The calendar is ready for your next event.<p>Create and publish an event to see it here.</p></div>}</section>
    <section className="ws-panel"><div className="ws-panel-heading"><h2>A little attention</h2><span className="ws-eyebrow" style={{ margin: 0 }}>Your inbox</span></div>{queue.map((item) => <Link key={item.to} to={`/admin/${item.to}`} className="ws-list-item"><span className="ws-list-icon"><i className={`fa-solid fa-${item.icon}`} aria-hidden="true" /></span><div><h3>{item.label}</h3><p>{item.description}</p></div><span className="ws-list-number">{item.n}</span></Link>)}</section></div>
  </>;
}
