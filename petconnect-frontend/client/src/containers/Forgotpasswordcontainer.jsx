import { useState } from "react";
import { useNavigate, Navigate} from "react-router-dom";
import ForgotPasswordForm from "../components/Forgotpasswordform";
import UserService from "../services/UserService";
import useAuth from "../hooks/AuthContext";

const ForgotPasswordContainer = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/browse" replace />;
  }
  const handleSubmit = async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      await UserService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ForgotPasswordForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      success={success}
      onBackToLogin={() => navigate("/login")}
    />
  );
};

export default ForgotPasswordContainer;
