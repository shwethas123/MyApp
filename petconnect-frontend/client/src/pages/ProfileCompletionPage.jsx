import { useState } from "react";
import { useNavigate } from "react-router-dom";
//import axios from "axios";
//import UserService from "../services/UserService";
import useAuth from "../hooks/AuthContext";
import api from "../services/Apiservices";
import LocationPicker from "../components/common/LocationPicker";
// ✅ Import Navbar to show a minimal header (logo only) on this page
import Navbar from "../components/common/Navbar";

export default function ProfileCompletionPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    location: "",
    living_situation: "",
    preferred_species: "dog",
    pet_experience_years: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
    if (fieldErrors[name]) {
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }
  };

  const handleSpecies = (species) => {
    setFormData({ ...formData, preferred_species: species });
    if (fieldErrors.preferred_species) {
    setFieldErrors((prev) => ({ ...prev, preferred_species: "" }));
  }
  };

  const validate = () => {
  const errors = {};
  if (!formData.location.trim()) errors.location = "Location is required";
  if (!formData.living_situation.trim()) errors.living_situation = "Living situation is required";
  if (!formData.preferred_species) errors.preferred_species = "Please select a preference";
  if (formData.pet_experience_years === "" || formData.pet_experience_years === null)
    errors.pet_experience_years = "Experience years is required";
  if (Number(formData.pet_experience_years) < 0 || Number(formData.pet_experience_years) > 50)
    errors.pet_experience_years = "Experience must be between 0 and 50";
  return errors;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errors = validate();
    if (Object.keys(errors).length > 0) {
    setFieldErrors(errors);
    return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await api.put(`/users/${currentUser.id}/profile`, {
        ...formData,
        first_name: currentUser.first_name || currentUser.name?.split(" ")[0],
        last_name: currentUser.last_name || currentUser.name?.split(" ")[1] || "",
        profile_completed: true,
      });

      navigate("/browse");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/browse");
  };

  const isFormValid =
  formData.location.trim() &&
  formData.living_situation.trim() &&
  formData.preferred_species &&
  formData.pet_experience_years !== "" &&
  formData.pet_experience_years !== null &&
  Number(formData.pet_experience_years) >= 0 &&
  Number(formData.pet_experience_years) <= 50;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ✅ Minimal navbar — shows logo only, no auth buttons, no notification bell, no hamburger */}
      <Navbar minimal />

       <div className="flex-1 py-8 px-4">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch rounded-2xl overflow-hidden shadow-sm">
        {/* Left Panel — hidden on mobile */}
        <div className="hidden md:block w-[420px] flex-shrink-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-700/60 to-gray-900/80 z-10" />
          <img
            src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&auto=format&fit=crop"
            alt="Pets"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 p-8 flex flex-col justify-between">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 w-fit">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-white text-xs font-semibold  tracking-wide">
                Step 2: Profile Completion
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
                Help us find your perfect match.
              </h2>
              <p className="text-white/75 text-sm leading-relaxed mb-8">
                Refining your profile helps us connect you with your future
                companion faster.
              </p>
              <div className="space-y-3">
                {[
                  { num: 1, label: "Account created", done: true },
                  { num: 2, label: "Complete profile", active: true },
                  { num: 3, label: "Start adopting", done: false },
                ].map((s) => (
                  <div key={s.num} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    ${s.done || s.active ? "bg-cyan-500 text-white" : "bg-white/20 text-white/50"}`}
                    >
                      {s.num}
                    </div>
                    <span
                      className={`text-sm font-medium
                    ${s.active ? "text-white" : s.done ? "text-white/80" : "text-white/40"}`}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — full width on mobile */}
        <div className="flex-1 w-full bg-white rounded-2xl shadow-sm p-6 md:p-10">
          {/* Mobile step indicator */}
          <div className="flex items-center gap-2 mb-4 md:hidden">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-semibold text-cyan-600  tracking-wide">
              Step 2: Profile Completion
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Complete your profile
          </h1>
          <p className="text-gray-500 text-sm mb-7">
            Provide specific details to improve your matching results.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

        <form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {/* Location */}
    <div>
      <label className="block text-xs font-semibold text-gray-600  tracking-wide mb-1.5">
        Location 
      </label>
      <LocationPicker
        value={formData.location}
        onChange={(val) => {
          setFormData((prev) => ({ ...prev, location: val }));
          if (fieldErrors.location) setFieldErrors((prev) => ({ ...prev, location: "" }));
        }}
        onClear={() => setFormData((prev) => ({ ...prev, location: "" }))}
        
        placeholder="Bengaluru-560058"
         onLocationDetected={(coords) => setLocationCoords(coords)} 
      />
      {fieldErrors.location && (
        <p className="text-red-500 text-xs mt-1">⚠ {fieldErrors.location}</p>
      )}
    </div>

    {/* Living Situation */}
    <div>
      <label className="block text-xs font-semibold text-gray-600  tracking-wide mb-1.5">
        Living situation 
      </label>
      <input
        type="text"
        name="living_situation"
        value={formData.living_situation}
        onChange={handleChange}
        placeholder="e.g. Apartment with balcony"
        className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition
          ${fieldErrors.living_situation ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-cyan-400"}`}
      />
      {fieldErrors.living_situation && (
        <p className="text-red-500 text-xs mt-1">⚠ {fieldErrors.living_situation}</p>
      )}
    </div>
  </div>

  {/* Preferred Species */}
  <div>
    <label className="block text-xs font-semibold text-gray-600  tracking-wide mb-3">
      Preference 
    </label>
    <div className="flex flex-wrap gap-2">
      {[
        { value: "dog",    icon: "🐶", label: "Dog"    },
        { value: "cat",    icon: "🐱", label: "Cat"    },
        { value: "birds",  icon: "🐦", label: "Birds"  },
        { value: "rabbit", icon: "🐰", label: "Rabbit" },
        { value: "both",   icon: "🐾", label: "All"    },
        // { value: "others", icon: "✨", label: "Others" },
      ].map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => handleSpecies(opt.value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition
            ${formData.preferred_species === opt.value
              ? "border-cyan-500 bg-cyan-50 text-cyan-600"
              : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
        >
          <span>{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
    {fieldErrors.preferred_species && (
      <p className="text-red-500 text-xs mt-1">⚠ {fieldErrors.preferred_species}</p>
    )}
  </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600  tracking-wide mb-1.5">
                Experience with pets (years)
              </label>
              <input
                type="number"
                name="pet_experience_years"
                value={formData.pet_experience_years}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="50"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition
                ${fieldErrors.pet_experience_years ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-cyan-400"}`}
                />
                {fieldErrors.pet_experience_years && (
                  <p className="text-red-500 text-xs mt-1">⚠ {fieldErrors.pet_experience_years}</p>
                  )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSkip}
                className="px-6 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Saving..." : "Complete profile "}
              </button>
            </div>
          </form>
        </div>
      </div>

      
    </div>
    </div>
  );
}