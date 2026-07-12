import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import { getRoleDashboardPath, useAuth } from "@/features/auth/context/AuthContext";
import type { RoleSlug } from "@/types/auth";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: RoleSlug[];
  guestOnly?: boolean;
}

export default function ProtectedRoute({
  allowedRoles,
  guestOnly = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isBootstrapping, roleSlug } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner label="Memeriksa sesi pengguna..." />
      </div>
    );
  }

  if (guestOnly && isAuthenticated) {
    return <Navigate to={getRoleDashboardPath(roleSlug)} replace />;
  }

  if (!guestOnly && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!guestOnly && allowedRoles && (!roleSlug || !allowedRoles.includes(roleSlug))) {
    return <Navigate to={getRoleDashboardPath(roleSlug)} replace />;
  }

  return <Outlet />;
}
