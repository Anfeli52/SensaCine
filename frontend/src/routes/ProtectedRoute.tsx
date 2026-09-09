import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";
import { Rol } from "../features/auth/types";

interface ProtectedRouteProps {
  rolesPermitidos?: Rol[];
  redirectTo?: string;
}

export function ProtectedRoute({
  rolesPermitidos,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, usuario } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (rolesPermitidos && usuario && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
