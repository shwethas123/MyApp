import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/Apiservices";
import useAuth from "../hooks/AuthContext";

const GovernmentRegistrationPage = () => {
  const location = useLocation();
  const { name, type } = location.state || {};
  const navigate = useNavigate();
  const { setUser, currentUser } = useAuth();

  const [departmentName, setDepartmentName] = useState("");
  const [stateMunicipality, setStateMunicipality] = useState("");
  const [office, setOffice] = useState("");
  const [governmentShelterId, setGovernmentShelterId] = useState("");
  const [verificationDoc, setVerificationDoc] = useState(null);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  // ── Validators ──────────────────────────────────────────
  const validateDepartmentName = (v) => {
    const value = v.trim();
    if (/^\d+$/.test(value)) return false;
    if (/^(.)\1+$/.test(value)) return false;
    return /^(?=.*[A-Za-z])[A-Za-z\s.&-]{3,50}$/.test(value);
  };

  const validateStateMunicipality = (v) => {
    const value = v.trim().toUpperCase();
    if (/^\d+$/.test(value)) return false;
    const pattern1 = /^[A-Z]{2,10}\/[A-Z0-9]+\/\d{4}\/\d+$/;
    const pattern2 = /^(?=.*[A-Za-z])[A-Za-z0-9\s-]{3,50}$/;
    return pattern1.test(value) || pattern2.test(value);
  };

  const validateOffice = (v) => {
    const value = v.trim();
    if (/^\d+$/.test(value)) return false;
    if (/^(.)\1+$/.test(value)) return false;
    return /^(?=.*[A-Za-z])[A-Za-z0-9\s,./&()-]{3,100}$/.test(value);
  };

  const validateGovernmentId = (v) => {
    const value = v.trim().toUpperCase();
    if (/^\d+$/.test(value)) return false;
    const patterns = [
      /^GO\/[A-Z]{2,5}\/\d+\/\d{4}$/,
      /^[A-Z]{2}-[A-Z]{2,10}-\d{4}-\d+$/,
      /^[A-Z]{3,10}\/[A-Z0-9]+\/\d{4}\/\d+$/,
    ];
    return patterns.some((regex) => regex.test(value));
  };

  const validateLocationName = (v) =>
    /^(?=.*[A-Za-z])[A-Za-z\s.-]{2,}$/.test(v.trim());

  const validatePincode = (v) => /^\d{6}$/.test(v.trim());
  const validateEmail = (v) =>
    /^[a-zA-Z0-9._%+-]+@(gov\.in|nic\.in|india\.gov\.in|mea\.gov\.in|mohfw\.gov\.in)$/.test(v);
  const validatePhone = (v) => /^[6-9]\d{9}$/.test(v.trim());

  const validateFile = (file) => {
    if (!file) return "Document is required.";
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type))
      return "Upload PDF, JPG, or PNG only (max 10MB)";
    if (file.size > 10 * 1024 * 1024) return "File size must be under 10MB.";
    return null;
  };

  // ── Check overall form validity for submit button ──────
  useEffect(() => {
    const allFilled =
      departmentName.trim() &&
      stateMunicipality.trim() &&
      office.trim() &&
      governmentShelterId.trim() &&
      city.trim() &&
      state.trim() &&
      pincode.trim() &&
      country.trim() &&
      email.trim() &&
      phone.trim() &&
      verificationDoc;

    const allValid =
      validateDepartmentName(departmentName) &&
      validateStateMunicipality(stateMunicipality) &&
      validateOffice(office) &&
      validateGovernmentId(governmentShelterId) &&
      validateLocationName(city) &&
      validateLocationName(state) &&
      validateLocationName(country) &&
      validatePincode(pincode) &&
      validateEmail(email) &&
      validatePhone(phone) &&
      !validateFile(verificationDoc);

    setIsFormValid(!!(allFilled && allValid));
  }, [
    departmentName, stateMunicipality, office, governmentShelterId,
    city, state, pincode, country, email, phone, verificationDoc,
  ]);

  // Real-time field validation
  const validateField = (field, value) => {
    let error = "";

    if (field === "departmentName") {
      if (!value.trim()) error = "Department name is required.";
      else if (!validateDepartmentName(value))
        error = "Enter valid department name";
    }
    if (field === "stateMunicipality") {
      if (!value.trim()) error = "Municipality is required";
      else if (!validateStateMunicipality(value))
        error = "Enter valid format (e.g. BBMP/ZONES/YEAR/REG. NO.)";
    }
    if (field === "office") {
      if (!value.trim()) error = "Office is required.";
      else if (!validateOffice(value)) error = "Enter valid office name";
    }
    if (field === "governmentShelterId") {
      if (!value.trim()) error = "Government ID is required.";
      else if (!validateGovernmentId(value))
        error = "Enter valid ID (e.g. GO/MS/123/2021 or TN-AHD-2023-0012)";
    }
    if (field === "city") {
      if (!value.trim()) error = "City is required.";
      else if (!validateLocationName(value)) error = "Enter valid city";
    }
    if (field === "state") {
      if (!value.trim()) error = "State is required.";
      else if (!validateLocationName(value)) error = "Enter valid state";
    }
    if (field === "country") {
      if (!value.trim()) error = "Country is required.";
      else if (!validateLocationName(value)) error = "Enter valid country";
    }
    if (field === "pincode") {
      if (!value.trim()) error = "Pincode is required.";
      else if (!validatePincode(value)) error = "Enter valid 6-digit pincode";
    }
    if (field === "email") {
      if (!value.trim()) error = "Email is required.";
      else if (!validateEmail(value))
        error = "Use official email (e.g. @gov.in, @nic.in)";
    }
    if (field === "phone") {
      if (!value.trim()) error = "Phone is required.";
      else if (value.length < 10) error = "Phone number must be 10 digits";
      else if (!validatePhone(value))
        error = "Enter valid 10-digit mobile number starting with 6-9";
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) newErrors[field] = error;
      else delete newErrors[field];
      return newErrors;
    });
  };

  // Full validation on submit
  const validate = () => {
    const e = {};
    if (!departmentName.trim()) {
      e.departmentName = "Department name is required.";
    } else if (!validateDepartmentName(departmentName)) {
      e.departmentName =
        "Enter valid department name (min 3 letters, no numbers).";
    }
    if (!stateMunicipality.trim()) {
      e.stateMunicipality =
        "Enter a valid state or municipality (must include letters)";
    } else if (!validateStateMunicipality(stateMunicipality)) {
      e.stateMunicipality =
        "Enter a valid state or municipality (must include letters)";
    }
    if (!office.trim()) {
      e.office = "Office is required.";
    } else if (!validateOffice(office)) {
      e.office = "Enter a valid office name";
    }
    if (!governmentShelterId.trim()) {
      e.governmentShelterId = "Government ID is required.";
    } else if (!validateGovernmentId(governmentShelterId)) {
      e.governmentShelterId =
        "Enter valid ID (e.g. GO/MS/123/2021 or TN-AHD-2023-0012)";
    }
    const docErr = validateFile(verificationDoc);
    if (docErr) e.verificationDoc = docErr;
    if (!city.trim()) {
      e.city = "City is required.";
    } else if (!validateLocationName(city)) {
      e.city = "Enter a valid city name";
    }
    if (!state.trim()) {
      e.state = "State is required.";
    } else if (!validateLocationName(state)) {
      e.state = "Enter a valid state name";
    }
    if (!country.trim()) {
      e.country = "Country is required.";
    } else if (!validateLocationName(country)) {
      e.country = "Enter a valid country name";
    }
    if (!pincode.trim()) {
      e.pincode = "Pincode is required.";
    } else if (!validatePincode(pincode)) {
      e.pincode = "Enter a valid 6-digit pincode";
    }
    if (!email.trim()) {
      e.email = "Official email is required.";
    } else if (!validateEmail(email)) {
      e.email = "Enter a valid email address";
    }
    if (!phone.trim()) {
      e.phone = "Phone number is required.";
    } else if (phone.length < 10) {
      e.phone = "Phone number must be 10 digits";
    } else if (!validatePhone(phone)) {
      e.phone = "Enter a valid 10-digit mobile number starting with 6-9";
    }
    return e;
  };

  // Use My Location
  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        );
        const data = await res.json();
        const addr = data.address;
        setCity(addr.city || addr.town || addr.village || "");
        setState(addr.state || "");
        setCountry(addr.country || "");
        setPincode(addr.postcode || "");
        setLocationLoading(false);
      },
      () => {
        setLocationError("Location access denied. Please allow location.");
        setLocationLoading(false);
      },
    );
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    try {
      setLoading(true);
      setErrors({});
      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", type);
      formData.append("department_name", departmentName);
      formData.append("municipality", stateMunicipality);
      formData.append("office", office);
      formData.append("government_id_number", governmentShelterId);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("zipcode", pincode);
      formData.append("country", country);
      formData.append("contact_email", email);
      formData.append("contact_phone", "+91" + phone.replace(/\D/g, ""));
      formData.append("government_authorization", verificationDoc);
      const res = await api.post("/shelters/government_register", formData);
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
      // YOUR CHANGE: removed { replace: true }
      navigate("/shelter/waiting-area", { replace: true });
    } catch (err) {
      // YOUR CHANGE: shows actual server error message
      setErrors({ api: err.response?.data?.message || "Something went wrong. Please try again." });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────
  const getInputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-xs transition-colors duration-150 ${
      focusedField === field
        ? "border-blue-400 outline-none"
        : "border-gray-200"
    }`;

  const getWrapperClass = (field) =>
    `flex items-center border rounded-lg px-3 py-2 gap-2 transition-colors duration-150 ${
      focusedField === field ? "border-blue-400" : "border-gray-200"
    }`;

  const ErrMsg = ({ field }) =>
    errors[field] ? (
      <p style={{ color: "red", fontSize: "12px" }}>⚠ {errors[field]}</p>
    ) : null;

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

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Back */}
        <button
          onClick={() =>
            navigate("/shelter-register", { state: { name, type } })
          }
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 mb-6 hover:scale-105"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Complete Shelter Registration
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Help more animals find loving homes by verifying your
          government-shelter facility.
        </p>

        {/* Single Continuous Form Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          {/* ── Government Details ── */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
              <span className="text-blue-500 text-xs">🏛</span>
            </div>
            <h2 className="text-sm font-semibold text-gray-700">
              Government Details
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Department name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Animal Welfare Department"
                value={departmentName}
                onFocus={() => setFocusedField("departmentName")}
                onBlur={() => setFocusedField("")}
                onChange={(e) => {
                  const value = e.target.value;
                  setDepartmentName(value);
                  validateField("departmentName", value);
                }}
                className={getInputClass("departmentName")}
              />
              <ErrMsg field="departmentName" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Municipality <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. BBMP/ZONE5/2022/078 or BBMP Zone 5"
                value={stateMunicipality}
                onFocus={() => setFocusedField("stateMunicipality")}
                onBlur={() => setFocusedField("")}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setStateMunicipality(value);
                  validateField("stateMunicipality", value);
                }}
                className={getInputClass("stateMunicipality")}
              />
              <ErrMsg field="stateMunicipality" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Office <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. District Office or Head Office 5"
                value={office}
                onFocus={() => setFocusedField("office")}
                onBlur={() => setFocusedField("")}
                onChange={(e) => {
                  const value = e.target.value;
                  setOffice(value);
                  validateField("office", value);
                }}
                className={getInputClass("office")}
              />
              <ErrMsg field="office" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Government shelter ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. GO/AHD/123/2021 or TN-AHD-2023-0012"
                value={governmentShelterId}
                onFocus={() => setFocusedField("governmentShelterId")}
                onBlur={() => setFocusedField("")}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setGovernmentShelterId(value);
                  validateField("governmentShelterId", value);
                }}
                className={getInputClass("governmentShelterId")}
              />
              <ErrMsg field="governmentShelterId" />
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-xs text-gray-500 mb-2">
              Verification document <span className="text-red-400">*</span>
              <span className="text-gray-400 ml-1">
                (PDF, JPG, PNG — max 10MB)
              </span>
            </label>
            <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 border-gray-200">
              <input
                type="file"
                id="fileInput"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setVerificationDoc(file);
                  const fileError = validateFile(file);
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    if (fileError) newErrors.verificationDoc = fileError;
                    else delete newErrors.verificationDoc;
                    return newErrors;
                  });
                }}
              />
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-xs text-gray-400 mb-1">
                {verificationDoc ? (
                  <span className="text-green-600 font-medium">
                    ✓ {verificationDoc.name}
                  </span>
                ) : (
                  "Upload authorization letter or ID card"
                )}
              </p>
              <button
                type="button"
                onClick={() => document.getElementById("fileInput").click()}
                className="mt-2 border border-gray-300 rounded-lg px-4 py-1.5 text-xs text-gray-500 bg-white hover:bg-gray-50"
              >
                {verificationDoc ? "Change File" : "Choose file"}
              </button>
            </div>
            <ErrMsg field="verificationDoc" />
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-gray-100 mb-6" />

          {/* ── Address ── */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-500 text-xs">📍</span>
              </div>
              <h2 className="text-sm font-semibold text-gray-700">Address</h2>
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
            <p style={{ color: "red", fontSize: "12px" }} className="mb-3">
              ⚠ {locationError}
            </p>
          )}

          <div className="grid grid-cols-4 gap-3 mb-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                City <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Chennai"
                value={city}
                onFocus={() => setFocusedField("city")}
                onBlur={() => setFocusedField("")}
                onChange={(e) => {
                  const value = e.target.value;
                  setCity(value);
                  validateField("city", value);
                }}
                className={getInputClass("city")}
              />
              <ErrMsg field="city" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                State <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="eg. Tamil Nadu"
                value={state}
                onFocus={() => setFocusedField("state")}
                onBlur={() => setFocusedField("")}
                onChange={(e) => {
                  const value = e.target.value;
                  setState(value);
                  validateField("state", value);
                }}
                className={getInputClass("state")}
              />
              <ErrMsg field="state" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Pincode <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 600001"
                value={pincode}
                onFocus={() => setFocusedField("pincode")}
                onBlur={() => setFocusedField("")}
                onChange={(e) => {
                  const value = e.target.value;
                  setPincode(value);
                  validateField("pincode", value);
                }}
                className={getInputClass("pincode")}
              />
              <ErrMsg field="pincode" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Country <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. India"
                value={country}
                onFocus={() => setFocusedField("country")}
                onBlur={() => setFocusedField("")}
                onChange={(e) => {
                  const value = e.target.value;
                  setCountry(value);
                  validateField("country", value);
                }}
                className={getInputClass("country")}
              />
              <ErrMsg field="country" />
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-gray-100 mb-6" />

          {/* ── Official Contact ── */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
              <span className="text-blue-500 text-xs">📞</span>
            </div>
            <h2 className="text-sm font-semibold text-gray-700">
              Official Contact
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Organization email <span className="text-red-400">*</span>
              </label>
              <div className={getWrapperClass("email")}>
                <span className="text-gray-400 text-xs">✉</span>
                <input
                  type="email"
                  placeholder="office@dept.gov.in"
                  value={email}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    validateField("email", value);
                  }}
                  className="flex-1 text-xs text-gray-700 bg-transparent focus:outline-none focus:ring-0"
                />
              </div>
              <ErrMsg field="email" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Organization phone <span className="text-red-400">*</span>
              </label>
              <div className={getWrapperClass("phone")}>
                <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                  +91
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => {
                    setFocusedField("");
                    validateField("phone", phone);
                  }}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    setPhone(value);
                    validateField("phone", value);
                  }}
                  className="flex-1 text-xs text-gray-700 bg-transparent focus:outline-none focus:ring-0"
                />
                <span className="text-xs text-gray-400">{phone.length}/10</span>
              </div>
              <ErrMsg field="phone" />
            </div>
          </div>
        </div>

        {/* API Error */}
        {errors.api && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-4 py-2.5 rounded-xl mb-4">
            ⚠️ {errors.api}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !isFormValid}
          className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-medium py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 disabled:active:scale-100"
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
        <p className="text-center text-xs text-gray-400">
          Verification usually takes 2-3 business days
        </p>
      </main>
    </div>
  );
};

export default GovernmentRegistrationPage;