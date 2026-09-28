import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getAdminAuth, clearAdminAuth } from "../lib/adminAuth";
import WorkspaceShell from "../../components/workspace/WorkspaceShell";
import "../../styles/admin.css";

const NAV_ITEMS = [
  { path: "", end: true, label: "Overview", icon: "gauge-high", title: "Overview", subtitle: "A snapshot of everything coming through the site." },
  { path: "website", label: "Website Content", icon: "pen-to-square", title: "Website Content", subtitle: "Edit your pages, save drafts and publish your story." },
  { path: "gallery", label: "Gallery & Images", icon: "images", title: "Gallery & Images", subtitle: "Manage the moments you share with the world." },
  { path: "volunteers", label: "Volunteers", icon: "users", countKey: "volunteers", title: "Volunteers", subtitle: "Review and approve volunteer registrations." },
  { path: "blood-requests", label: "Blood Requests", icon: "droplet", countKey: "blood", title: "Blood Requests", subtitle: "Track requests through to fulfilment." },
  { path: "partners", label: "Partners", icon: "handshake", countKey: "partners", title: "Partner Inquiries", subtitle: "CSR, campus and NGO partnership requests." },
  { path: "messages", label: "Messages", icon: "envelope", countKey: "messages", title: "Contact Messages", subtitle: "General enquiries from the contact form." },
  { path: "newsletter", label: "Newsletter", icon: "paper-plane", title: "Newsletter Subscribers", subtitle: "Everyone who's signed up from the footer form." },
  { path: "events", label: "Events", icon: "calendar-days", title: "Events", subtitle: "Create, publish and manage events shown on the public site." },
  { path: "registrations", label: "Event Registrations", icon: "ticket", title: "Event Registrations", subtitle: "Everyone registered across every event." },
  { path: "checkin", label: "Check-in Scanner", icon: "qrcode", title: "Check-in Scanner", subtitle: "Scan a volunteer's ID-card QR code to mark them present and credit hours." },
  { path: "feedback", label: "Event Feedback", icon: "star", title: "Event Feedback", subtitle: "Ratings and comments left on past events." },
  { path: "notifications", label: "Notifications", icon: "bullhorn", title: "Notifications", subtitle: "Broadcast to every volunteer, or message one directly." },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const setCount = (key, n) => setCounts((current) => ({ ...current, [key]: n }));
  const setManyCounts = (values) => setCounts((current) => ({ ...current, ...values }));
  function logout() { clearAdminAuth(); navigate("/admin/login", { replace: true }); }
  return <WorkspaceShell area="admin" items={NAV_ITEMS} name={getAdminAuth()?.admin?.name} counts={counts} onLogout={logout}><Outlet context={{ setCount, setManyCounts }} /></WorkspaceShell>;
}
