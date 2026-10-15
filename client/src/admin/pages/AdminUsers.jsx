import { useEffect, useState } from "react";
import { adminFetch } from "../lib/adminApi";
import { ADMIN_PERMISSION_OPTIONS } from "../lib/adminPermissions";
import { useToast } from "../../hooks/useToast";
import AdminDataTable from "../components/AdminDataTable";
import AdminModal from "../components/AdminModal";
import { AdminBtn, DeleteButton } from "../components/AdminButtons";
const EMPTY_FORM = { name: "", email: "", password: "", permissions: [], isActive: true };
function AdminForm({ admin, onClose, onSaved }) {
  const [form, setForm] = useState(admin ? { ...admin, password: "" } : EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function togglePermission(id) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(id) ? current.permissions.filter((permission) => permission !== id) : [...current.permissions, id]
    }));
  }
  function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      permissions: form.permissions,
      isActive: form.isActive,
      ...form.password ? { password: form.password } : {}
    };
    adminFetch(admin ? `/admin-users/${admin.id}` : "/admin-users", {
      method: admin ? "PATCH" : "POST",
      body: JSON.stringify(payload)
    }).then(onSaved).catch((err) => setError(err.message)).finally(() => setBusy(false));
  }
  return <AdminModal open onClose={onClose} title={admin ? "Edit admin user" : "Add admin user"} wide busy={busy}>
      <form onSubmit={submit}>
        <div className="admin-user-fields">
          <div><label className="mf-label" htmlFor="admin-name">Name</label><input id="admin-name" className="mf-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="mf-label" htmlFor="admin-email">Email</label><input id="admin-email" className="mf-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        </div>
        <div className="mt-4">
          <label className="mf-label" htmlFor="admin-password">{admin ? "New password (optional)" : "Temporary password"}</label>
          <input id="admin-password" className="mf-input" type="password" minLength={10} required={!admin} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <p className="admin-form-hint">Use at least 10 characters. Share it with the new admin securely.</p>
        </div>
        <fieldset className="admin-permission-fieldset">
          <legend>Allowed areas</legend>
          <p>Selecting an area allows this admin to view and manage everything in that section.</p>
          <div className="admin-permission-grid">
            {ADMIN_PERMISSION_OPTIONS.map((permission) => <label key={permission.id} className={`admin-permission-option${form.permissions.includes(permission.id) ? " is-selected" : ""}`}>
                <input type="checkbox" checked={form.permissions.includes(permission.id)} onChange={() => togglePermission(permission.id)} />
                <span><strong>{permission.label}</strong><small>{permission.description}</small></span>
              </label>)}
          </div>
        </fieldset>
        <label className="admin-active-toggle"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /><span><strong>Account active</strong><small>Inactive admins are signed out and cannot log in.</small></span></label>
        {error && <p className="ws-error" role="alert">{error}</p>}
        <div className="flex justify-end gap-2 mt-5"><button type="button" className="mf-btn" disabled={busy} onClick={onClose}>Cancel</button><button type="submit" className="mf-btn mf-btn-primary" disabled={busy}>{busy ? "Saving\u2026" : admin ? "Save changes" : "Create admin"}</button></div>
      </form>
    </AdminModal>;
}
export default function AdminUsers() {
  const toast = useToast();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(void 0);
  function load() {
    setError("");
    return adminFetch("/admin-users", { force: true }).then((body) => setAdmins(body.admins || [])).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }
  useEffect(() => {
    load();
  }, []);
  function remove(admin) {
    adminFetch(`/admin-users/${admin.id}`, { method: "DELETE" }).then(() => {
      toast(`${admin.name} was removed.`);
      load();
    }).catch((err) => toast(err.message));
  }
  const permissionLabel = (id) => ADMIN_PERMISSION_OPTIONS.find((option) => option.id === id)?.label || id;
  return <>
      <div className="admin-users-intro">
        <div><strong>Permission-based access</strong><p>Admins only see and use the areas selected for them. Only super admins can manage admin accounts.</p></div>
        <button className="mf-btn mf-btn-primary" onClick={() => setEditing(null)}><i className="fa-solid fa-plus" aria-hidden="true" /> Add admin</button>
      </div>
      {error ? <p className="ws-error" role="alert">{error}</p> : loading ? <p className="ws-empty" role="status">Loading admin users…</p> : <AdminDataTable
    rows={admins}
    columns={[
      { label: "Admin", render: (admin) => <><strong>{admin.name}</strong><br /><span className="text-xs text-[#4B5563]">{admin.email}</span></> },
      { label: "Role", render: (admin) => <span className={`admin-role-badge ${admin.role}`}>{admin.role === "super_admin" ? "Super admin" : "Admin"}</span> },
      { label: "Permissions", render: (admin) => admin.role === "super_admin" ? <span className="admin-all-access">All areas</span> : admin.permissions.length ? <div className="admin-permission-chips">{admin.permissions.map((id) => <span key={id}>{permissionLabel(id)}</span>)}</div> : <span className="text-xs text-[#6B7280]">No areas assigned</span> },
      { label: "Status", render: (admin) => <span className={`mf-status-badge ${admin.isActive ? "mf-status-approved" : "mf-status-rejected"}`}>{admin.isActive ? "Active" : "Inactive"}</span> },
      { label: "Actions", isActions: true, render: (admin) => admin.role === "super_admin" ? <span className="text-xs text-[#6B7280]">Protected</span> : <><AdminBtn variant="neutral" icon="pen" onClick={() => setEditing(admin)}>Edit</AdminBtn><DeleteButton confirmText={`Remove ${admin.name}'s admin account? This cannot be undone.`} onDelete={() => remove(admin)} /></> }
    ]}
    cardConfig={(admin) => ({ title: admin.name, subtitle: admin.email, icon: admin.role === "super_admin" ? "user-shield" : "user-gear", badge: <span className={`admin-role-badge ${admin.role}`}>{admin.role === "super_admin" ? "Super admin" : admin.isActive ? "Active admin" : "Inactive admin"}</span> })}
  />}
      {editing !== void 0 && <AdminForm admin={editing} onClose={() => setEditing(void 0)} onSaved={() => {
    setEditing(void 0);
    toast(editing ? "Admin updated." : "Admin created.");
    load();
  }} />}
    </>;
}
