import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import UserService from "../services/UserService";
import { Loader } from "lucide-react";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  

  const bootstrap = useCallback(async () => {
    try {
      const result = await UserService.refreshToken();
      if (result?.success) {
        const user = result.data.user;

        // If shelter user, fetch live shelter status and attach it
        if (user?.role === "shelter") {
          try {
            const { default: api } = await import("../services/Apiservices");
            const shelterRes = await api.get("/shelters/my-profile");
            const shelterData = shelterRes.data?.data;
            user.shelter = {
              id: shelterData?.id,
              status: shelterData?.status || "Pending",
            };
          } catch {
            user.shelter = { status: "Pending" };
          }
        }

        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await UserService.login(payload);
      if (result.success) {
        setCurrentUser(result.data.user);
        setIsLoading(false);
        return { success: true, user: result.data.user };
      } else {
        setError(result.message || "Login failed");
        setIsLoading(false);
        return { success: false ,message,authType};
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Login failed.";
       const authType = err.response?.data?.authType || null;
      setError(message);
      setIsLoading(false);
      return { success: false,message, authType};
    }
  };

  const logout = async () => {
    await UserService.logout();
    setCurrentUser(null);
  };

  const setUser = (userData) => setCurrentUser(userData);
  const clearError = () => setError(null); 

  // ✅ Always render children — AppContent handles the spinner
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isBootstrapping,
        isLoading,
        error,
        clearError,
        login,
        logout,
        setUser,
      }}
    >
    {
      isBootstrapping ? null : children
    }
    </AuthContext.Provider>
  );
};