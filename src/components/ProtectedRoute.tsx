import { Navigate } from "react-router-dom";
import { getSession } from "../services/apiClient";
import type { Role } from "../types/crm";

interface Props {
  role: Role | Role[];
  children: React.ReactNode;
}

function ProtectedRoute({ role, children }: Props) {
  const allowedRoles = Array.isArray(role) ? role : [role];
  const user = getSession()?.user;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
