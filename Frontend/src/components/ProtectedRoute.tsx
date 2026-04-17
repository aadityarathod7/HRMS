import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const roles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");

  // Not logged in → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check token expiry
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  // Role check — if allowedRoles specified, user must have at least one
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = roles.some(r => allowedRoles.includes(r));
    if (!hasRole) {
      return <Navigate to="/home" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
