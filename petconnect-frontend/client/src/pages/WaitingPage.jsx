import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/AuthContext";
import api from "../services/Apiservices";

export default function WaitingPage() {
  const navigate = useNavigate();
  const { currentUser, setUser } = useAuth();

  const [shelterData, setShelterData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Block browser back button — keep user on waiting area
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const fetchShelter = async () => {
      try {
        // ✅ Use owner_id instead of shelter.id — works even when shelter is null in currentUser
        const res = await api.get(`/shelters/my-profile`);
        setShelterData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch shelter:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchShelter();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
  if (!loading && !shelterData) {
    navigate("/shelter-register", { replace: true });
  }
}, [loading, shelterData]);



  // ── Derived values from DB ─────────────────────────────────────────────────
  const shelterName = shelterData?.name || shelterData?.organizationName || "—";
  const shelterType = shelterData?.type || "—";
  const shelterStatus = shelterData?.status || "Pending";
  const shelterId = shelterData?.id || null;

  const isVerified = shelterStatus === "Verified";
  const isRejected = shelterStatus === "Rejected";
  const isPending = !isVerified && !isRejected;

  const typeLabel =
    {
      government: "Government Shelter",
      ngo: "NGO",
      rescuer: "Independent Rescuer",
    }[shelterType?.toLowerCase()] || shelterType;

  // ── Status badge config ────────────────────────────────────────────────────
  const statusConfig = {
    Pending: {
      bg: "bg-yellow-50 border-yellow-200 text-yellow-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      label: "Status: Pending Admin Verification",
    },
    Verified: {
      bg: "bg-green-50 border-green-200 text-green-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
      label: "Status: Verified by Admin",
    },
    Rejected: {
      bg: "bg-red-50 border-red-200 text-red-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
      label: "Status: Registration Rejected",
    },
  };

  const currentStatus = statusConfig[shelterStatus] || statusConfig["Pending"];
  const handleReapply = async () => {
    try {
      // Delete the rejected shelter from DB
      await api.del(`/shelters/${shelterData.id}`);
      // Clear shelter from AuthContext and localStorage
      const updatedUser = { ...currentUser, shelter: null };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Go back to shelter registration
      navigate("/shelter-register", { replace: true });
    } catch (err) {
      console.error("Reapply failed:", err);
    }
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #f0f7f4 0%, #e8f4fd 50%, #f0f0fa 100%)",
        }}
      >
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            Loading your registration details...
          </p>
        </div>
      </div>
    );
  }
  const handleDashboard = () => {
  navigate("/shelter/pets", { replace: true });
};

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #f0f7f4 0%, #e8f4fd 50%, #f0f0fa 100%)",
      }}
    >
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        {/* Logo — always visible, even in minimal mode */}
        <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
              <ellipse cx="7" cy="6" rx="1.2" ry="1.6" />
              <ellipse cx="4.5" cy="7.5" rx="1" ry="1.4" />
              <ellipse cx="9.5" cy="7.5" rx="1" ry="1.4" />
              <path d="M7 10 C4 10 3 13 4.5 14.5 C5.5 15.5 8.5 15.5 9.5 14.5 C11 13 10 10 7 10Z" />
              <ellipse cx="17" cy="4" rx="1.2" ry="1.6" />
              <ellipse cx="14.5" cy="5.5" rx="1" ry="1.4" />
              <ellipse cx="19.5" cy="5.5" rx="1" ry="1.4" />
              <path d="M17 8 C14 8 13 11 14.5 12.5 C15.5 13.5 18.5 13.5 19.5 12.5 C21 11 20 8 17 8Z" />
            </svg>
            <span className="text-blue-600 font-bold text-xl">PetConnect</span>
          </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-lg border border-gray-100 text-center">
          {/* Top Icon */}
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isRejected ? "bg-red-100" : "bg-green-100"}`}
          >
            {isRejected ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            {isRejected ? "Registration Rejected" : "Registration Submitted!"}
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            {isRejected
              ? "Unfortunately your registration was not approved. Please contact support for more information."
              : "Your shelter registration has been successfully submitted for admin verification. You will be notified once your application is reviewed."}
          </p>

          {/* Shelter Info Card — fetched from DB */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 mb-6 text-left">
            <p className="text-xs font-bold text-gray-400 tracking-wider mb-3">
              Submission Details
            </p>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Organization name</span>
                <span className="text-xs font-semibold text-gray-800">
                  {shelterName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Registration type</span>
                <span className="text-xs font-semibold text-gray-800">
                  {typeLabel}
                </span>
              </div>
              {currentUser?.email && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    Registered email
                  </span>
                  <span className="text-xs font-semibold text-gray-800">
                    {currentUser.email}
                  </span>
                </div>
              )}
              {shelterId && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Application ID</span>
                  <span className="text-xs font-semibold text-blue-600">
                    #{shelterId}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  Estimated review time
                </span>
                <span className="text-xs font-semibold text-gray-800">
                  2–3 business days
                </span>
              </div>
            </div>
          </div>

          {/* What Happens Next — only when pending */}
          {isPending && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 mb-6 text-left">
              <p className="text-xs font-bold text-blue-600  tracking-wider mb-3">
                What happens next?
              </p>
              <div className="flex flex-col gap-3">
                {[
                  {
                    step: "1",
                    color: "bg-blue-100 text-blue-600",
                    text: "Our admin team will review your submitted documents",
                  },
                  {
                    step: "2",
                    color: "bg-purple-100 text-purple-600",
                    text: "You will receive an email notification once verified",
                  },
                  {
                    step: "3",
                    color: "bg-green-100 text-green-600",
                    text: "After approval, your account will be activated and you will be directed to your dashboard",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${item.color}`}
                    >
                      {item.step}
                    </div>
                    <p className="text-sm text-gray-600 pt-0.5">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-2 border text-xs font-semibold px-4 py-2 rounded-full mb-6 ${currentStatus.bg}`}
          >
            {currentStatus.icon}
            {currentStatus.label}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {isPending && (
              <div className="w-full">
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-400 font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed border border-gray-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                Awaiting Admin Approval
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Dashboard access will be enabled once admin verifies your
                  registration
                </p>
              </div>
            )}

            {isVerified && (
              <button
                onClick={handleDashboard}
                className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-semibold py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Go to Dashboard
              </button>
            )}

            {isRejected && (
              <div className="flex flex-col gap-3">
                {/* Rejection Reason Card */}
                <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-left">
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
                    Reason for Rejection
                  </p>
                  <p className="text-sm text-red-700 leading-relaxed">
                    {shelterData?.rejection_reason ||
                      "No reason provided. Please contact support."}
                  </p>
                </div>

                {/* Reapply Button */}
                <button
                  onClick={handleReapply}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reapply
                </button>

                {/* Contact Support — subtle
                <button
                  onClick={() => navigate("/contact-support")}
                  className="w-full text-gray-400 hover:text-gray-600 text-sm font-medium py-2 transition-colors"
                >
                  Contact Support
                </button> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
