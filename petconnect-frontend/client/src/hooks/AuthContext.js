import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

// ✅ Add this — the hook that reads from shared context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
};

export default useAuth;
