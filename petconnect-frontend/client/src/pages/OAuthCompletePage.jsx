import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/AuthContext";
import api from "../services/Apiservices";
import { useEffect } from "react";

export default function OAuthCompletePage() {
  const navigate = useNavigate();
  const { currentUser, setUser } = useAuth();

  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("adopter");
  const [phoneError, setPhoneError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePhone = (v) => {
    if (!v.trim()) return "Phone number is required";
    if (!/^\d+$/.test(v.trim())) return "Only digits allowed";
    if (v.trim().length !== 10) return "Must be exactly 10 digits";
    if (!["6","7","8","9"].includes(v.trim()[0])) 
      return "Enter a valid mobile number";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const phoneErr = validatePhone(phone);
    if (phoneErr) return setPhoneError(phoneErr);

    setLoading(true);
    try {
      const res = await api.post("/users/oauth-complete", { phone, role });

      if (res.data.success) {
        // Update context with new role
        setUser({ ...currentUser, role });

        if (role === "shelter") {
          navigate("/shelter-register");
        } else {
          navigate("/complete-profile"); // collect location, species etc.
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      if (msg.toLowerCase().includes("phone")) {
        setPhoneError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full w-14 h-14 flex items-center justify-center text-2xl">
            🐾
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
          Almost there!
        </h1>
        <p className="text-gray-400 text-sm text-center mb-7">
          Just a couple more details to set up your account
        </p>

        {/* Google account info */}
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">
            G
          </div>
          <div>
            <p className="text-xs text-gray-500">Signed in with Google</p>
            <p className="text-sm font-medium text-gray-700">
              {currentUser?.email}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 tracking-wide mb-2">
              I want to join as
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "adopter", icon: "🏠", label: "Adopter", 
                  desc: "Looking to adopt" },
                { value: "shelter", icon: "🏥", label: "Shelter", 
                  desc: "Managing a shelter" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`border-2 rounded-xl p-3 flex flex-col items-start gap-1 transition
                    ${role === opt.value
                      ? "border-cyan-500 bg-cyan-50"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <span className={`text-sm font-semibold 
                    ${role === opt.value ? "text-cyan-600" : "text-gray-700"}`}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-gray-400">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 tracking-wide mb-1.5">
              Phone number <span className="text-red-400">*</span>
            </label>
            <div className={`flex items-center border rounded-lg overflow-hidden transition
              ${phoneError 
                ? "border-red-400 focus-within:ring-2 focus-within:ring-red-300" 
                : "border-gray-200 focus-within:ring-2 focus-within:ring-cyan-400"
              }`}
            >
              <span className="px-3 py-2.5 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">
                +91
              </span>
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneError("");
                }}
                placeholder="10-digit number"
                maxLength={10}
                className="flex-1 px-4 py-2.5 text-sm focus:outline-none"
              />
            </div>
            {phoneError && (
              <p className="text-red-500 text-xs mt-1">⚠ {phoneError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-300 
              text-white font-semibold py-3 rounded-xl transition text-sm mt-2"
          >
            {loading ? "Setting up..." : "Continue →"}
          </button>
        </form>
      </div>
    </div>
  );
}