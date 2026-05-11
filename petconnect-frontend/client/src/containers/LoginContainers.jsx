import { useEffect,useState } from "react";
import {useNavigate, useLocation, Navigate } from "react-router-dom";

import LoginForm from "../components/LoginForm";
import useAuth from "../hooks/AuthContext";

const LoginContainer = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ← moved ABOVE any conditional returns
  const { login, isLoading, error, isAuthenticated, currentUser } = useAuth();
   const [oauthOnly, setOauthOnly] = useState(false);      
  const [authError, setAuthError] = useState(null); 

  const getDefaultRoute = (role) => { // ← moved above conditional returns too
    if (role === "shelter") return "/shelter/pets";
    if (role === "admin") return "/admin/dashboard";
    return "/browse";
  };
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get("error");
    if (oauthError) {
      // You can map these to friendly messages
      const messages = {
        google_failed: "Google sign-in failed. Please try again.",
        oauth_failed: "Social sign-in failed. Please try again.",
      };
      // Assuming your AuthContext has a way to set errors, or use local state:
      console.warn("OAuth error:", messages[oauthError] || oauthError);
    }
  }, [location.search]);
  // ✅ Now safe to conditionally return — all hooks are already called above
  if (isAuthenticated && currentUser?.role) {
    return <Navigate to={getDefaultRoute(currentUser.role)} replace />;
  }
  
  const handleLogin = async (email, password) => {
    setOauthOnly(false);   
    setAuthError(null);
    const result = await login({ email, password });
    if (result.success) {
      const role = result.user?.role;
      const from = location.state?.from;
      if (from && role === "adopter") {
        navigate(from, { replace: true });
      } else {
        navigate(getDefaultRoute(role), { replace: true });
      }
    }
    else {
      if (result.authType === "google") {
        setOauthOnly(true);
      }
      setAuthError(result.message);
    }

  };

  const handleForgotPassword = () => navigate("/forgot-password");
  const handleCreateAccount  = () => navigate("/register");

  return (
    <LoginForm
      onSubmit={handleLogin}
      isLoading={isLoading}
      error={ authError ||error}
      oauthOnly={oauthOnly}
      onForgotPassword={handleForgotPassword}
      onCreateAccount={handleCreateAccount}
    />
  );
};

export default LoginContainer;