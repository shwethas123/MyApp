import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
const organizationTypes = [
  {
    id: "ngo",
    label: "NGO",
    description: "Registered non-profit organization",
    icon: "🏛️",
  },
  {
    id: "government",
    label: "Government Shelter",
    description: "State-run facility",
    icon: "🏢",
  },
  {
    id: "rescuer",
    label: "Rescuers",
    description: "Individual independent rescuers",
    icon: "🤝",
  },
];

export default function ShelterBasePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState(location.state?.name || "");
  const [selectedType, setSelectedType] = useState(location.state?.type || "");
  const [error, setError] = useState("");


 const handleContinue = async () => {
    if (!name.trim() || !selectedType) {
      setError("Please enter organization name and select a type.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    if (name.trim().length < 3) {
      setError("Organization name must be at least 3 characters.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    if (name.trim().length > 100) {
      setError("Organization name cannot exceed 100 characters.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    if (!/^[A-Za-z\s.&'()-]+$/.test(name.trim())) {
      setError("Organization name may only contain letters, spaces, and .  &  '  ( )  -");
      setTimeout(() => setError(""), 4000);
      return;
    }

    if (!/[A-Za-z]{2,}/.test(name.trim())) {
      setError("Organization name must contain meaningful letters.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    if (/^(.)\1+$/.test(name.trim())) {
      setError("Please enter a valid organization name.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    if (selectedType === "ngo" || selectedType === "government") {
      try {
     const res = await fetch(`http://localhost:5000/api/shelters/check-name?name=${encodeURIComponent(name.trim())}&type=${selectedType}`);
        if (res.status === 409) {
          const data = await res.json();
          setError(data.message);
          setTimeout(() => setError(""), 4000);
          return;
        }
      } catch (e) {
        setError("Could not verify name. Please try again.");
        setTimeout(() => setError(""), 4000);
        return;
      }
    }

    if (selectedType === "ngo") {
      navigate("/shelter/ngo-register", {
        state: { name, type: selectedType },
      });
    } else if (selectedType === "government") {
      navigate("/shelter/government-register", {
        state: { name, type: selectedType },
      });
    } else if (selectedType === "rescuer") {
      navigate("/shelter/rescuer-register", {
        state: { name, type: selectedType },
      });
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #f0f7f4 0%, #e8f4fd 50%, #f0f0fa 100%)",
      }}
    >
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        {/* Logo — always visible, even in minimal mode */}
        <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
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
            
          </div>
          <span className="text-blue-600 font-bold text-xl">PetConnect</span>
        </div>
      </nav>
      {/* Hero Section */}
      <div className="flex justify-center px-4 pt-12 pb-6">
        <div className="text-center max-w-lg">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            🐾 Join Our Network
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-3">
            Complete Shelter
            <span className="text-blue-600"> Registration</span>
          </h1>
          <p className="text-gray-500 text-base">
            Help more animals find loving homes by joining our network of
            trusted shelters.
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="flex justify-center px-4 pb-16">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg border border-gray-100">
          {/* Organization Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              placeholder="Enter your organization's legal name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400"
            />
          </div>

          {/* Organization Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Organization Type
            </label>
            <div className="flex flex-col gap-3">
              {organizationTypes.map((org) => (
                <div
                  key={org.id}
                  onClick={() => setSelectedType(org.id)}
                  className={`flex items-center gap-4 border-2 rounded-2xl px-4 py-3.5 cursor-pointer transition-all duration-200 ${
                    selectedType === org.id
                      ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                      selectedType === org.id ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    {org.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {org.label}
                    </p>
                    <p className="text-xs text-gray-500">{org.description}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedType === org.id
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedType === org.id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-4 py-2.5 rounded-xl mb-4">
              ⚠️ {error}
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            Continue 
          </button>
        </div>
      </div>
    </div>
  );
}
