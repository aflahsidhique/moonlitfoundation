import { Navigate, Outlet } from "react-router-dom";
import { getPortalAuth } from "../lib/portalAuth";

export default function RequirePortalAuth() {
  if (!getPortalAuth()) return <Navigate to="/portal/login" replace />;
  return <Outlet />;
}
