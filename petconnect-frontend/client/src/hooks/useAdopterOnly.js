// hooks/useAdopterOnly.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./AuthContext";

const useAdopterOnly = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAllowed(true); // unauthenticated — public access, allow render
      return;
    }
    if (currentUser?.role === "shelter" || currentUser?.role === "admin") {
      navigate("/unauthorized", { replace: true }); // redirect, don't allow render
    } else {
      setIsAllowed(true); // adopter — allow render
    }
  }, [isAuthenticated, currentUser, navigate]);

  return isAllowed;
};

export default useAdopterOnly;