import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import { getAdminAuth } from "../lib/adminAuth";
import { canAdmin, isSuperAdmin } from "../lib/adminPermissions";
export default function RequireAdminPermission({ permission, superAdmin = false }) {
  const outletContext = useOutletContext();
  const admin = getAdminAuth()?.admin;
  const allowed = superAdmin ? isSuperAdmin(admin) : canAdmin(admin, permission);
  return allowed ? <Outlet context={outletContext} /> : <Navigate to="/admin" replace />;
}
