import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { clearPortalAuth } from "../lib/portalAuth";
import { portalFetch } from "../lib/portalApi";
import WorkspaceShell from "../../components/workspace/WorkspaceShell";
import "../../styles/portal.css";

const NAV_ITEMS = [
  { path: "", end: true, label: "Overview", icon: "gauge-high", title: "Overview" },
  { path: "idcard", label: "Volunteer Card", icon: "id-card", title: "Volunteer Card" },
  { path: "events", label: "Upcoming Events", icon: "calendar-days", title: "Upcoming Events" },
  { path: "attendance", label: "Attendance & Hours", icon: "clipboard-check", title: "Attendance & Hours" },
  { path: "certificates", label: "Certificates", icon: "certificate", title: "Certificates" },
  { path: null, label: "Badges", icon: "award", soon: true },
  { path: "blood", label: "Blood Donor Status", icon: "droplet", title: "Blood Donor Status" },
  { path: "profile", label: "Profile", icon: "user", title: "Profile" },
  { path: "notifications", label: "Notifications", icon: "bell", title: "Notifications" },
  { path: "downloads", label: "Downloads", icon: "download", title: "Downloads" },
];

export default function PortalLayout() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  useEffect(() => { portalFetch("/volunteer-auth/me").then((body) => setName(body.volunteer.fullName)).catch(() => {}); }, []);
  function logout() { clearPortalAuth(); navigate("/portal/login", { replace: true }); }
  return <WorkspaceShell area="portal" items={NAV_ITEMS} name={name} onLogout={logout}><Outlet /></WorkspaceShell>;
}
