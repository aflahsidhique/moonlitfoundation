export const ADMIN_PERMISSION_OPTIONS = [
  { id: "website", label: "Website content", description: "Edit and publish page content." },
  { id: "gallery", label: "Gallery & images", description: "Upload, edit, publish and remove images." },
  { id: "volunteers", label: "Volunteers", description: "Review applications and manage volunteer records." },
  { id: "blood_requests", label: "Blood requests", description: "Review requests and coordinate donors." },
  { id: "partners", label: "Partner inquiries", description: "Review and update partnership inquiries." },
  { id: "messages", label: "Messages", description: "Read, update and remove contact messages." },
  { id: "newsletter", label: "Newsletter", description: "View and manage newsletter subscribers." },
  { id: "events", label: "Events", description: "Create, publish, share and remove events." },
  { id: "registrations", label: "Event registrations", description: "Review and update event registrations." },
  { id: "checkin", label: "Check-in scanner", description: "Check in volunteers and issue certificates." },
  { id: "feedback", label: "Event feedback", description: "Review and remove event feedback." },
  { id: "notifications", label: "Notifications", description: "Send and manage volunteer notifications." }
];
export function isSuperAdmin(admin) {
  return admin?.role === "super_admin";
}
export function canAdmin(admin, permission) {
  return isSuperAdmin(admin) || admin?.permissions?.includes(permission);
}
