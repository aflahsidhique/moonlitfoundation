import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getAdminAuth, clearAdminAuth } from "../lib/adminAuth";
import WorkspaceShell from "../../components/workspace/WorkspaceShell";
import "../../styles/admin.css";
import { canAdmin, isSuperAdmin } from "../lib/adminPermissions";
const NAV_ITEMS = [
  { path: "", end: true, label: "Overview", icon: "gauge-high", title: "Overview", subtitle: "A snapshot of everything coming through the site." },
  { path: "website", permission: "website", label: "Website Content", icon: "pen-to-square", title: "Website Content", subtitle: "Edit your pages, save drafts and publish your story." },
  { path: "gallery", permission: "gallery", label: "Gallery & Images", icon: "images", title: "Gallery & Images", subtitle: "Manage the moments you share with the world." },
  { path: "volunteers", permission: "volunteers", label: "Volunteers", icon: "users", countKey: "volunteers", title: "Volunteers", subtitle: "Review and approve volunteer registrations." },
  { path: "blood-requests", permission: "blood_requests", label: "Blood Requests", icon: "droplet", countKey: "blood", title: "Blood Requests", subtitle: "Track requests through to fulfilment." },
  { path: "partners", permission: "partners", label: "Partners", icon: "handshake", countKey: "partners", title: "Partner Inquiries", subtitle: "CSR, campus and NGO partnership requests." },
  { path: "messages", permission: "messages", label: "Messages", icon: "envelope", countKey: "messages", title: "Contact Messages", subtitle: "General enquiries from the contact form." },
  { path: "newsletter", permission: "newsletter", label: "Newsletter", icon: "paper-plane", title: "Newsletter Subscribers", subtitle: "Everyone who's signed up from the footer form." },
  { path: "events", permission: "events", label: "Events", icon: "calendar-days", title: "Events", subtitle: "Create, publish and manage events shown on the public site." },
  { path: "registrations", permission: "registrations", label: "Event Registrations", icon: "ticket", title: "Event Registrations", subtitle: "Everyone registered across every event." },
  { path: "checkin", permission: "checkin", label: "Check-in Scanner", icon: "qrcode", title: "Check-in Scanner", subtitle: "Scan a volunteer's ID-card QR code to mark them present and credit hours." },
  { path: "feedback", permission: "feedback", label: "Event Feedback", icon: "star", title: "Event Feedback", subtitle: "Ratings and comments left on past events." },
  { path: "notifications", permission: "notifications", label: "Notifications", icon: "bullhorn", title: "Notifications", subtitle: "Broadcast to every volunteer, or message one directly." },
  { path: "admin-users", superAdmin: true, label: "Admin Users", icon: "user-shield", title: "Admin Users", subtitle: "Create administrator accounts and control exactly which areas they can use." }
];
export default function AdminLayout() {
  const navigate = useNavigate();
  const admin = getAdminAuth()?.admin;
  const visibleItems = NAV_ITEMS.filter((item) => !item.permission || canAdmin(admin, item.permission)).filter((item) => !item.superAdmin || isSuperAdmin(admin));
  const [counts, setCounts] = useState({});
  const setCount = (key, n) => setCounts((current) => ({ ...current, [key]: n }));
  const setManyCounts = (values) => setCounts((current) => ({ ...current, ...values }));
  function logout() {
    clearAdminAuth();
    navigate("/admin/login", { replace: true });
  }
  return <WorkspaceShell area="admin" items={visibleItems} name={admin?.name} accountLabel={isSuperAdmin(admin) ? "Super administrator" : "Administrator"} counts={counts} onLogout={logout}><Outlet context={{ setCount, setManyCounts }} /></WorkspaceShell>;
}
