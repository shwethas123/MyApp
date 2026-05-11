import useAuth from "../../hooks/AuthContext";

/**
 * Conditionally renders children based on role.
 * Use this to hide/show buttons, links, nav items etc.
 *
 * <RoleGuard roles={['shelter', 'admin']}>
 *   <button>Add Pet</button>
 * </RoleGuard>
 */
const RoleGuard = ({ roles, fallback = null, children }) => {
  const { hasRole } = useAuth();
  return hasRole(...roles) ? children : fallback;
};

export default RoleGuard;
