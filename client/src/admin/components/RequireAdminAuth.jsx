import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAdminAuth, setAdminAuth } from "../lib/adminAuth";
import { adminFetch } from "../lib/adminApi";
import LoadingScreen from "../../components/ui/LoadingScreen";
export default function RequireAdminAuth() {
  const auth = getAdminAuth();
  const [checking, setChecking] = useState(Boolean(auth));
  useEffect(() => {
    if (!auth) return;
    adminFetch("/auth/me", { force: true }).then(({ admin }) => setAdminAuth({ ...getAdminAuth(), admin })).finally(() => setChecking(false));
  }, []);
  if (!auth) return <Navigate to="/admin/login" replace />;
  if (checking) return <LoadingScreen label="Preparing your workspace…" />;
  return <Outlet />;
}
