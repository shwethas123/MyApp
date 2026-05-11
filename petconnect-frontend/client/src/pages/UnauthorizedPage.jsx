import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/AuthContext";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  console.log("UnauthorizedPage render:", { currentUser });

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-6">
      <h1 className="text-5xl font-bold text-red-500 mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-3">
        Access Denied
      </h2>
      <p className="text-gray-500 mb-8">
        {/* ✅ FIX — show a generic message when not logged in (incognito / no session) */}
        {currentUser?.role
          ? <>Your <strong>{currentUser.role}</strong> account does not have permission to view this page.</>
          : <div className="text-red-500 font-semibold mb-8">You do not have permission to view this page because your account is banned .</div>
        }
      </p>
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

export default UnauthorizedPage;