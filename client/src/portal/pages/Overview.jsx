import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { portalFetch } from "../lib/portalApi";
import { fmtDate } from "../lib/format";

export default function Overview() {
  const [state, setState] = useState({ status: "loading" });
  useEffect(() => {
    Promise.all([portalFetch("/volunteer-auth/me"), portalFetch("/volunteer-auth/attendance"), portalFetch("/volunteer-auth/events"), portalFetch("/volunteer-auth/notifications")])
      .then(([me, attendance, events, notifs]) => setState({ status: "ok", v: me.volunteer, attendance, events, latest: notifs.notifications[0] }))
      .catch((err) => setState({ status: "error", message: err.message }));
  }, []);
  if (state.status === "loading") return <p className="ws-empty" role="status">Getting your impact snapshot…</p>;
  if (state.status === "error") return <p className="ws-error" role="alert">{state.message}</p>;
  const { v, attendance, events, latest } = state;
  const stats = [
    { n: attendance.totalHours, label: "Hours of kindness", icon: "clock", to: "attendance" },
    { n: events.upcoming.length, label: "Upcoming events", icon: "calendar-days", to: "events" },
    { n: attendance.attendances.length, label: "Events attended", icon: "hands-holding-circle", to: "attendance" },
    { n: v.isBloodDonor ? (v.bloodGroup || "Yes") : "Join", label: v.isBloodDonor ? "Your blood group" : "Become a blood donor", icon: "droplet", to: "blood" },
  ];
  return <>
    <section className="ws-welcome"><div><p className="ws-eyebrow">Welcome back, {v.fullName.split(" ")[0]}</p><h2>Your small acts.<br /><em>Your lasting impact.</em></h2><p>Every hour you give brings us closer to a kinder world. Thank you for being part of the Moonlit community.</p><Link to="/events" className="mf-btn">Find your next event <i className="fa-solid fa-arrow-right" aria-hidden="true" /></Link></div><div className="ws-orbit" aria-hidden="true"><span /></div></section>
    <div className="ws-stats">{stats.map((stat) => <Link key={stat.label} className="ws-stat" to={`/portal/${stat.to}`}><div className="ws-stat-top"><span className="ws-stat-icon"><i className={`fa-solid fa-${stat.icon}`} aria-hidden="true" /></span><i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></div><strong>{stat.n}</strong><p>{stat.label}</p></Link>)}</div>
    <div className="ws-columns"><section className="ws-panel"><div className="ws-panel-heading"><h2>Your next moments</h2><Link to="/portal/events">My events ↗</Link></div>{events.upcoming.length ? events.upcoming.slice(0, 3).map(({ id, event }) => <Link key={id} to="/portal/events" className="ws-list-item">{event.imageUrl ? <img src={event.imageUrl} alt="" /> : <span className="ws-list-icon"><i className="fa-regular fa-calendar" aria-hidden="true" /></span>}<div><h3>{event.title}</h3><p>{fmtDate(event.eventDate)} · {event.startTime}</p><p>{event.location}</p></div><i className="fa-solid fa-arrow-right" aria-hidden="true" /></Link>) : <div className="ws-empty">Your next act of kindness is waiting.<p><Link to="/events" className="underline">Explore community events</Link> and find one for you.</p></div>}</section>
    <div className="ws-stack"><section className="ws-panel"><div className="ws-panel-heading"><h2>You belong here</h2><i className="fa-regular fa-id-card" aria-hidden="true" /></div><div className="ws-member">{v.photoUrl ? <img src={v.photoUrl} alt="" /> : <span className="ws-avatar">{v.fullName[0]}</span>}<div><h3>{v.fullName}</h3><p>{v.volunteerId}</p></div></div><Link to="/portal/idcard" className="mf-btn mf-btn-outline">View volunteer card <i className="fa-solid fa-arrow-right" aria-hidden="true" /></Link></section>
    <section className="ws-panel"><div className="ws-panel-heading"><h2>From the community</h2><Link to="/portal/notifications">All updates ↗</Link></div>{latest ? <div className="ws-note"><strong>{latest.title}</strong><p>{latest.message}</p><time>{fmtDate(latest.createdAt)}</time></div> : <p className="ws-note">You’re all caught up. New community updates will appear here.</p>}</section></div></div>
  </>;
}
