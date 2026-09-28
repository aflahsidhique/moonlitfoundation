import { Navigate, Outlet } from "react-router-dom";
import { getAdminAuth } from "../lib/adminAuth";

export default function RequireAdminAuth() {
  if (!getAdminAuth()) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
