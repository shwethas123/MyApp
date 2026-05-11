import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/AuthContext";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-6">
      <h1 className="text-5xl font-bold text-red-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-3">
        Page Not Found
      </h2>
      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 border border-gray-400 rounded hover:bg-gray-100"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;