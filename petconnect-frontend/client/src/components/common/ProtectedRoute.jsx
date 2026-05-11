import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../hooks/AuthContext";

const ProtectedRoute = ({ roles = [] }) => {
  const { isAuthenticated, currentUser, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) return null;

  // Not logged in → send to login, preserve the page they tried to visit
  console.log("ProtectedRoute check:", { isAuthenticated, currentUser, roles });
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but role not allowed → send to unauthorized
  if (roles.length > 0 && !roles.includes(currentUser?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  const SHELTER_REGISTRATION_PATHS = [
    "/shelter-register",
    "/shelter/ngo-register",
    "/shelter/government-register",
    "/shelter/rescuer-register",
    "/shelter/waiting-area",
  ];

  if (
    currentUser?.role === "shelter" &&
    currentUser?.shelter?.status?.toLowerCase() !== "verified" &&
    !SHELTER_REGISTRATION_PATHS.includes(location.pathname)
  ) {
    return <Navigate to="/shelter/waiting-area" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
