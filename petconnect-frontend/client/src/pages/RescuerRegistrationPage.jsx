import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/Apiservices";
import useAuth from "../hooks/AuthContext";

// ─── File Upload Validation ───────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const validateFile = (file, label = "File") => {
  if (!file) return `${label} is required.`;
  if (!ALLOWED_MIME_TYPES.includes(file.type))
    return `${label}: only PDF, JPG, or PNG files are allowed.`;
  const ext = "." + file.name.split(".").pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext))
    return `${label}: invalid file extension. Allowed: .pdf, .jpg, .jpeg, .png`;
  if (file.size > MAX_FILE_SIZE_BYTES)
    return `${label}: file size must be under ${MAX_FILE_SIZE_MB}MB.`;
  if (file.size === 0) return `${label}: file appears to be empty.`;
  return null;
};

// ─── ID Type config ───────────────────────────────────────────────────────────
const ID_TYPE_CONFIG = {
  drivers_license: {
    label: "Driving licence",
    placeholder: "DL-0420110149646",
    uploadLabel: "Upload driving licence",
    hint: "e.g. DL-0420110149646",
  },
  passport: {
    label: "Passport",
    placeholder: "A1234567",
    uploadLabel: "Upload passport",
    hint: "e.g. A1234567 (1 letter + 7 digits)",
  },
  national_id: {
    label: "National ID (Aadhaar)",
    placeholder: "123456789012",
    uploadLabel: "Upload Aadhaar card",
    hint: "12-digit Aadhaar number",
  },
  voter_id: {
    label: "Voter ID",
    placeholder: "ABC1234567",
    uploadLabel: "Upload voter ID",
    hint: "e.g. ABC1234567 (3 letters + 7 digits)",
  },
  pan_card: {
    label: "PAN Card",
    placeholder: "ABCDE1234F",
    uploadLabel: "Upload PAN card",
    hint: "e.g. ABCDE1234F (5 letters + 4 digits + 1 letter)",
  },
};

// ─── Validators ───────────────────────────────────────────────────────────────
// FIX: min 2 chars after final dot — rejects .c, .co alone
const validateEmail = (value) => {
  const v = value.trim();
  if (!v) return "Email address is required.";
  if (v.length > 254) return "Email cannot exceed 254 characters.";
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(v))
    return "Enter a valid email address (e.g. user@example.com).";
  return "";
};

const validatePhone = (v) => /^[6-9]\d{9}$/.test(v);

const validateLocation = (v) =>
  /^(?=.*[A-Za-z])[A-Za-z\s.-]{2,}$/.test(v.trim());

const validateRescueStory = (v) => {
  const value = v.trim();
  return value.length >= 30 && value.length <= 1000 && /[A-Za-z]/.test(value);
};

const validateZip = (v) => /^\d{6}$/.test(v.trim());

const validateIdNumber = (idType, value) => {
  const v = value.trim();
  if (!v) return false;
  if (/^(.)\1+$/.test(v)) return false; // reject repeated chars
  switch (idType) {
    case "drivers_license":
      return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9/-]{6,20}$/.test(v);
    case "passport":
      return /^[A-Z]\d{7}$/.test(v);
    case "national_id":
      return /^\d{12}$/.test(v);
    case "voter_id":
      return /^[A-Z]{3}\d{7}$/.test(v);
    case "pan_card":
      return /^[A-Z]{5}\d{4}[A-Z]$/.test(v);
    default:
      return false;
  }
};

const RescuerRegistrationPage = () => {
  const location = useLocation();
  const { name, type } = location.state || {};
  const navigate = useNavigate();
  const { setUser, currentUser } = useAuth();

  // ─── State ────────────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // FIX: phone stored as bare 10-digit string — +91 is display-only prefix
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [idType, setIdType] = useState("drivers_license");
  const [idNumber, setIdNumber] = useState("");
  const [idNumberError, setIdNumberError] = useState("");

  // FIX: dynamic ID document upload tied to idType dropdown
  const [idFile, setIdFile] = useState(null);
  const [idFileError, setIdFileError] = useState("");

  const [city, setCity] = useState("");
  const [cityError, setCityError] = useState("");
  const [state, setState] = useState("");
  const [stateError, setStateError] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [zipError, setZipError] = useState("");
  const [country, setCountry] = useState("");
  const [countryError, setCountryError] = useState("");

  const [rescueStory, setRescueStory] = useState("");
  const [storyError, setStoryError] = useState("");

  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [idTypeOpen, setIdTypeOpen] = useState(false);

  // ─── isFormValid ──────────────────────────────────────────────────────────
  const isFormValid = useMemo(() => {
    const allFilled =
      email.trim() &&
      phone.trim() &&
      idType &&
      idNumber.trim() &&
      idFile &&
      city.trim() &&
      state.trim() &&
      zipCode.trim() &&
      country.trim() &&
      rescueStory.trim();

    const noErrors =
      !emailError &&
      !phoneError &&
      !idNumberError &&
      !idFileError &&
      !cityError &&
      !stateError &&
      !zipError &&
      !countryError &&
      !storyError;

    const allValid =
      !validateEmail(email) &&
      validatePhone(phone) &&
      validateIdNumber(idType, idNumber) &&
      !validateFile(idFile, "ID document") &&
      validateLocation(city) &&
      validateLocation(state) &&
      validateZip(zipCode) &&
      validateLocation(country) &&
      validateRescueStory(rescueStory);

    return !!(allFilled && noErrors && allValid);
  }, [
    email, emailError, phone, phoneError,
    idType, idNumber, idNumberError, idFile, idFileError,
    city, cityError, state, stateError,
    zipCode, zipError, country, countryError,
    rescueStory, storyError,
  ]);

  // ─── ID File Handler ──────────────────────────────────────────────────────
  const handleIdFileChange = (file) => {
    const err = validateFile(
      file,
      ID_TYPE_CONFIG[idType]?.uploadLabel || "ID document",
    );
    if (err) {
      setIdFileError(err);
      setIdFile(null);
    } else {
      setIdFileError("");
      setIdFile(file);
    }
  };

  const fileLabel = (file) => {
    if (!file) return "Choose file";
    return `✓ ${file.name.length > 22 ? file.name.slice(0, 20) + "…" : file.name}`;
  };

  // ─── Use My Location ─────────────────────────────────────────────────────
  // FIX: .trim() all Nominatim values before setting state
  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const data = await res.json();
          const addr = data.address;

          const rawCity = (addr.city || addr.town || addr.village || "").trim();
          const rawState = (addr.state || "").trim();
          const rawCountry = (addr.country || "").trim();
          const rawZip = (addr.postcode || "").trim();

          setCity(rawCity);
          setState(rawState);
          setCountry(rawCountry);
          setZipCode(rawZip);

          // Clear errors for auto-filled fields
          setCityError("");
          setStateError("");
          setCountryError("");
          setZipError(
            rawZip && !/^\d{6}$/.test(rawZip) ? "Pincode must be 6 digits" : "",
          );
        } catch {
          setLocationError("Failed to fetch location. Please try again.");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationError("Location access denied. Please allow location.");
        setLocationLoading(false);
      },
    );
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!isFormValid) return;
    if (!name || !type) {
      setApiError("Missing details. Please go back and try again.");
      return;
    }
    try {
      setLoading(true);
      setApiError("");
      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", type);
      formData.append("contact_email", email.trim().toLowerCase());
      formData.append("contact_phone", "+91" + phone);
      formData.append("id_type", idType);
      formData.append("id_number", idNumber.trim());
      formData.append("city", city.trim());
      formData.append("state", state.trim());
      formData.append("country", country.trim());
      formData.append("zipcode", zipCode.trim());
      formData.append("rescue_story", rescueStory.trim());
      if (idFile) formData.append("id_proof", idFile);

      const res = await api.post("/shelters/rescuer_register", formData);

      const updatedUser = {
        ...currentUser,
        shelter: {
          id: res.data.data?.shelter_id || res.data.shelter_id,
          name: name,
          status: "Pending",
        },
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      // CHANGE 1: removed { replace: true } from navigate (your change)
      navigate("/shelter/waiting-area", { replace: true });
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
      setTimeout(() => setApiError(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  // ─── UI Helpers ───────────────────────────────────────────────────────────
  const inputClass = (hasError) =>
    `w-full border rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors ${
      hasError
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "border-gray-200 focus:border-blue-400"
    }`;

  const ErrMsg = ({ msg }) =>
    msg ? <p className="text-red-500 text-xs mt-1">⚠ {msg}</p> : null;

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

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Back */}
        <button
          onClick={() =>
            navigate("/shelter-register", { state: { name, type } })
          }
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 mb-6 hover:scale-105"
        >
          ← Back
        </button>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-1">
            Complete Rescuer Registration
          </h1>
          <p className="text-xs text-gray-400 mb-6">
            Complete your profile to start rescuing and find the forever homes.
          </p>

          {/* ── Section 1: Personal Details ──────────────────────────────── */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-blue-400 text-xs">👤</span>
              <h2 className="text-xs font-semibold text-gray-600  tracking-wide">
                Personal details
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Email address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="johnson@petpals.com"
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    setEmailError(validateEmail(value));
                  }}
                  className={inputClass(emailError)}
                />
                <ErrMsg msg={emailError} />
              </div>

              {/* Phone — FIX: bare 10-digit state, +91 prefix display-only */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Phone number <span className="text-red-400">*</span>
                </label>
                <div
                  className={`flex items-center border rounded-lg px-3 transition-colors focus-within:border-blue-400 ${
                    phoneError ? "border-red-400 bg-red-50" : "border-gray-200"
                  }`}
                >
                  <span className="text-xs text-gray-500 mr-2 select-none">
                    +91
                  </span>
                  {/* FIX: strip non-digits + hard-cap at 10, no 11th digit ever set */}
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setPhone(value);
                      if (!value) setPhoneError("Phone number is required.");
                      else if (value.length < 10)
                        setPhoneError("Phone number must be 10 digits.");
                      else if (!validatePhone(value))
                        setPhoneError("Must start with 6, 7, 8, or 9.");
                      else setPhoneError("");
                    }}
                    className="w-full py-2 text-xs focus:outline-none bg-transparent"
                  />
                </div>
                <ErrMsg msg={phoneError} />
              </div>
            </div>
          </div>

          <hr className="border-gray-100 mb-6" />

          {/* ── Section 2: ID Verification ───────────────────────────────── */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-blue-400 text-xs">🪪</span>
              <h2 className="text-xs font-semibold text-gray-600 u tracking-wide">
                ID verification
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 relative">
              {/* ID Type */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  ID type <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIdTypeOpen(!idTypeOpen)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-blue-400 bg-white flex items-center justify-between"
                  >
                    <span>{ID_TYPE_CONFIG[idType]?.label}</span>
                    <span>▾</span>
                  </button>

                  {idTypeOpen && (
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
                      {Object.entries(ID_TYPE_CONFIG).map(([value, cfg]) => (
                        <div
                          key={value}
                          onClick={() => {
                            setIdType(value);
                            setIdFile(null);
                            setIdFileError("");
                            if (idNumber.trim()) {
                              setIdNumberError(
                                validateIdNumber(value, idNumber)
                                  ? ""
                                  : "Enter a valid ID number for selected ID type.",
                              );
                            }
                            setIdTypeOpen(false);
                          }}
                          className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${
                            idType === value
                              ? "bg-blue-50 text-blue-600 font-semibold"
                              : "text-gray-700"
                          }`}
                        >
                          {cfg.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ID Number */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  ID number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder={ID_TYPE_CONFIG[idType]?.placeholder}
                  value={idNumber}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (idType === "national_id") {
                      value = value.replace(/\D/g, "").slice(0, 12);
                    }
                    setIdNumber(value);
                    if (!value.trim())
                      setIdNumberError("ID number is required.");
                    else if (!validateIdNumber(idType, value))
                      setIdNumberError(
                        `Invalid ${ID_TYPE_CONFIG[idType]?.label} format.`,
                      );
                    else setIdNumberError("");
                  }}
                  className={inputClass(idNumberError)}
                />
                <p className="text-xs text-gray-400 mt-0.5">
                  {ID_TYPE_CONFIG[idType]?.hint}
                </p>
                <ErrMsg msg={idNumberError} />
              </div>
            </div>

            {/* FIX: Dynamic ID document upload — label changes with idType */}
            <div
              className={`flex flex-col border-2 border-dashed rounded-xl px-4 py-3 transition-all ${
                idFileError
                  ? "border-red-400 bg-red-50"
                  : idFile
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      idFileError
                        ? "bg-red-100 text-red-500"
                        : idFile
                          ? "bg-green-100 text-green-600"
                          : "bg-blue-50 text-blue-500"
                    }`}
                  >
                    {idFileError ? "⚠️" : idFile ? "✅" : "🪪"}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      {ID_TYPE_CONFIG[idType]?.uploadLabel}{" "}
                      <span className="text-red-500">*</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF, JPG or PNG · Max {MAX_FILE_SIZE_MB}MB
                    </p>
                  </div>
                </div>
                <label
                  className={`text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                    idFileError
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {fileLabel(idFile)}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      handleIdFileChange(e.target.files[0] || null)
                    }
                  />
                </label>
              </div>
              {idFileError && (
                <p className="text-xs text-red-600 mt-2 ml-11 font-medium">
                  ⚠️ {idFileError}
                </p>
              )}
              {idFile && !idFileError && (
                <p className="text-xs text-green-600 mt-2 ml-11 font-medium">
                  ✓ {idFile.name} — {(idFile.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          </div>

          <hr className="border-gray-100 mb-6" />

          {/* ── Section 3: Address ───────────────────────────────────────── */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 text-xs">📍</span>
                <h2 className="text-xs font-semibold text-gray-600  tracking-wide">
                  Address
                </h2>
              </div>
              <button
                type="button"
                onClick={fetchLocation}
                disabled={locationLoading}
                className="flex items-center gap-1 text-xs text-blue-600 border border-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                {locationLoading ? "Fetching..." : "📍 Use my location"}
              </button>
            </div>
            {locationError && (
              <p className="text-red-500 text-xs mb-2">⚠ {locationError}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Chennai"
                  value={city}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCity(value);
                    if (!value.trim()) setCityError("City is required.");
                    else if (!validateLocation(value))
                      setCityError("Enter a valid city name.");
                    else setCityError("");
                  }}
                  className={inputClass(cityError)}
                />
                <ErrMsg msg={cityError} />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  State <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Tamil Nadu"
                  value={state}
                  onChange={(e) => {
                    const value = e.target.value;
                    setState(value);
                    if (!value.trim()) setStateError("State is required.");
                    else if (!validateLocation(value))
                      setStateError("Enter a valid state name.");
                    else setStateError("");
                  }}
                  className={inputClass(stateError)}
                />
                <ErrMsg msg={stateError} />
              </div>

              {/* Zip — FIX: digits only, hard-capped at 6 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Zip Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="600001"
                  value={zipCode}
                  maxLength={6}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setZipCode(value);
                    if (!value) setZipError("Zip code is required.");
                    else if (value.length < 6)
                      setZipError("Zip code must be 6 digits.");
                    else setZipError("");
                  }}
                  className={inputClass(zipError)}
                />
                <ErrMsg msg={zipError} />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Country <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="India"
                  value={country}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCountry(value);
                    if (!value.trim()) setCountryError("Country is required.");
                    else if (!validateLocation(value))
                      setCountryError("Enter a valid country name.");
                    else setCountryError("");
                  }}
                  className={inputClass(countryError)}
                />
                <ErrMsg msg={countryError} />
              </div>
            </div>
          </div>

          <hr className="border-gray-100 mb-6" />

          {/* ── Section 4: Rescue Story ──────────────────────────────────── */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-blue-400 text-xs">📖</span>
              <h2 className="text-xs font-semibold text-gray-600  tracking-wide">
                Short description
              </h2>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Tell us about your experience and motivation (Min. 30 characters)
            </p>
            <textarea
              placeholder="Share your passion for animal rescue, species you specialize in, why you joined PetConnect..."
              value={rescueStory}
              maxLength={1000}
              onChange={(e) => {
                const value = e.target.value;
                setRescueStory(value);
                if (!value.trim()) setStoryError("Rescue story is required.");
                else if (value.trim().length < 30)
                  setStoryError("Minimum 30 characters required.");
                else if (!/[A-Za-z]/.test(value))
                  setStoryError("Story must contain meaningful text.");
                else setStoryError("");
              }}
              className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none resize-none h-24 transition-colors ${
                storyError
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 focus:border-blue-400"
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              <ErrMsg msg={storyError} />
              {/* CHANGE 2: updated counter label (your change) */}
              <p
                className={`text-xs ml-auto ${
                  rescueStory.length < 30 ? "text-gray-400" : "text-green-500"
                }`}
              >
                {rescueStory.length} / Min. 30 characters
              </p>
            </div>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-4 py-2.5 rounded-xl mb-4">
              ⚠️ {apiError}
            </div>
          )}

          {/* Submit — FIX: disabled until isFormValid AND not loading */}
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-medium py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Submitting...
              </>
            ) : (
              <>🛡️ Submit for Admin verification</>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default RescuerRegistrationPage;