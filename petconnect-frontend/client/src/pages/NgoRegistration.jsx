import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/Apiservices";
import useAuth from "../hooks/AuthContext";

const registrationTypes = ["Society", "Trust", "Section 8"];

const validateRegistrationNumber = (type, value) => {
  const societyRegex = /^[A-Z]{2,5}\/[A-Z]{2,5}\/\d{1,6}\/\d{4}(-\d{2})?$/;
  const trustSerialRegex = /^\d+\s*\/\s*\d{4}\s*\/\s*Book\s*No\.?\s*\d+$/i;
  const trustStateRegex =
    /^[A-Z]\/?\d{1,6}(?:\/[A-Za-z\s]+|\s*\([A-Z]\)\s*[A-Za-z\s]+)?$/;
  const darpanRegex = /^[A-Z]{2}\/\d{4}\/\d{6,8}$/;
  const cinRegex = /^[A-Z]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;

  if (type === "society") return societyRegex.test(value);
  if (type === "trust")
    return (
      trustSerialRegex.test(value) ||
      trustStateRegex.test(value) ||
      darpanRegex.test(value)
    );
  if (type === "section8") return cinRegex.test(value);
  return false;
};

// ─── File Upload Validation ───────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const validateFile = (file, label = "File") => {
  if (!file) return `${label} is required.`;

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `${label}: only PDF, JPG, or PNG files are allowed.`;
  }

  const ext = "." + file.name.split(".").pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `${label}: invalid file extension. Allowed: .pdf, .jpg, .jpeg, .png`;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `${label}: file size must be under ${MAX_FILE_SIZE_MB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
  }

  if (file.size === 0) {
    return `${label}: file appears to be empty.`;
  }

  return null;
};

export default function NgoRegistration() {
  const location = useLocation();
  const { name, type } = location.state || {};
  const navigate = useNavigate();
  const { setUser, currentUser } = useAuth();

  const [regType, setRegType] = useState("Society");
  const [regCertificate, setRegCertificate] = useState(null);
  const [regCertError, setRegCertError] = useState("");
  const [additionalDocs, setAdditionalDocs] = useState([]);
  const [additionalDocErrors, setAdditionalDocErrors] = useState([]);
  const [regNumber, setRegNumber] = useState("");
  const [regNumberError, setRegNumberError] = useState("");
  const [yearOfReg, setYearOfReg] = useState("");
  const [yearError, setYearError] = useState("");
  const [state, setState] = useState("");
  const [stateError, setStateError] = useState("");
  const [city, setCity] = useState("");
  const [cityError, setCityError] = useState("");
  const [pincode, setPincode] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [country, setCountry] = useState("");
  const [countryError, setCountryError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // ─── isFormValid: submit button disabled until all fields valid ─────────────
  const isFormValid = useMemo(() => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(yearOfReg, 10);

    const allFieldsFilled =
      regType &&
      regNumber.trim() &&
      yearOfReg.trim() &&
      state.trim() &&
      city.trim() &&
      pincode.trim() &&
      country.trim() &&
      email.trim() &&
      phone.trim() &&
      regCertificate;

    const noErrors =
      !regNumberError &&
      !yearError &&
      !stateError &&
      !cityError &&
      !pincodeError &&
      !countryError &&
      !emailError &&
      !phoneError &&
      !regCertError;

    const regNumValid = validateRegistrationNumber(
      regType.toLowerCase().replace(/\s+/g, ""),
      regNumber,
    );
    const yearValid =
      /^\d{4}$/.test(yearOfReg) && yearNum >= 1900 && yearNum <= currentYear;
    const emailValid = emailRegex.test(email) && email.length <= 254;
    const phoneValid = phoneRegex.test(phone);

    return !!(
      allFieldsFilled &&
      noErrors &&
      regNumValid &&
      yearValid &&
      emailValid &&
      phoneValid
    );
  }, [
    regType,
    regNumber,
    regNumberError,
    yearOfReg,
    yearError,
    state,
    stateError,
    city,
    cityError,
    pincode,
    pincodeError,
    country,
    countryError,
    email,
    emailError,
    phone,
    phoneError,
    regCertificate,
    regCertError,
  ]);

  // ─── Registration Certificate Handler ──────────────────────────────────────
  const handleRegCertChange = (file) => {
    const validationError = validateFile(file, "Registration certificate");
    if (validationError) {
      setRegCertError(validationError);
      setRegCertificate(null);
    } else {
      setRegCertError("");
      setRegCertificate(file);
    }
  };

  // ─── Additional Docs Handlers ───────────────────────────────────────────────
  const handleAddDoc = () => {
    setAdditionalDocs([...additionalDocs, null]);
    setAdditionalDocErrors([...additionalDocErrors, ""]);
  };

  const handleAdditionalDocChange = (index, file) => {
    const validationError = validateFile(
      file,
      `Additional document ${index + 1}`,
    );
    const updatedDocs = [...additionalDocs];
    const updatedErrors = [...additionalDocErrors];

    if (validationError) {
      updatedErrors[index] = validationError;
      updatedDocs[index] = null;
    } else {
      updatedErrors[index] = "";
      updatedDocs[index] = file;
    }

    setAdditionalDocs(updatedDocs);
    setAdditionalDocErrors(updatedErrors);
  };

  // ─── Use My Location ────────────────────────────────────────────────────────
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
          const rawPincode = (addr.postcode || "").trim();

          setCity(rawCity);
          setState(rawState);
          setCountry(rawCountry);
          setPincode(rawPincode);

          setCityError("");
          setStateError("");
          setCountryError("");
          setPincodeError(
            rawPincode && !/^\d{6}$/.test(rawPincode)
              ? "Pincode must be 6 digits"
              : "",
          );
        } catch {
          setLocationError("Failed to fetch location data. Please try again.");
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

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!isFormValid) {
      setError("Please fill all fields correctly before submitting.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const certError = validateFile(regCertificate, "Registration certificate");
    if (certError) {
      setRegCertError(certError);
      return;
    }

    const docErrors = additionalDocs.map((doc, i) =>
      doc ? validateFile(doc, `Additional document ${i + 1}`) : "",
    );
    const hasDocErrors = docErrors.some(Boolean);
    if (hasDocErrors) {
      setAdditionalDocErrors(docErrors);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", type);
      formData.append(
        "registration_type",
        regType.toLocaleLowerCase().replace(/\s+/g, ""),
      );
      formData.append("registration_number", regNumber);
      formData.append("year_of_registration", yearOfReg);
      formData.append("state", state);
      formData.append("city", city);
      formData.append("zipcode", pincode);
      formData.append("country", country);
      formData.append("contact_email", email);
      formData.append("contact_phone", "+91" + phone);
      formData.append("registration_certificate", regCertificate);
      additionalDocs.forEach((doc) => {
        if (doc) formData.append("additional_document", doc);
      });

      const res = await api.post("/shelters/ngo_register", formData);

      const updatedUser = {
        ...currentUser,
        shelter: {
          id: res.data.shelter_id || res.data.data?.id,
          name: name,
          status: "Pending",
        },
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      // { replace: true } — user cannot go back to registration form after submitting
      navigate("/shelter/waiting-area", { replace: true });
    } catch (err) {
      if (err.response?.status === 409) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ─── Helper: File status label ──────────────────────────────────────────────
  const fileLabel = (file) => {
    if (!file) return "Choose file";
    return `✓ ${file.name.length > 20 ? file.name.slice(0, 18) + "…" : file.name}`;
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
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 rounded-xl p-1.5 flex items-center">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-blue-500"
            >
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

      {/* Content */}
      <div className="flex justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          {/* Back */}
          <button
            onClick={() =>
              navigate("/shelter-register", { state: { name, type } })
            }
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 mb-6 hover:scale-105"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
            NGO Registration Form
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Help more animals find loving homes by providing your official
            details.
          </p>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            {/* Registration Type — radio buttons */}
            <p className="text-xs font-bold text-gray-500 tracking-wider mb-3">
            Registration type
            </p>
            <div className="flex gap-6 mb-6">
              {registrationTypes.map((regTypeName) => (
                <label
                  key={regTypeName}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="regType"
                    value={regTypeName}
                    checked={regType === regTypeName}
                    onChange={() => {
                      setRegType(regTypeName);
                      if (regNumber) {
                        const isValid = validateRegistrationNumber(
                          regTypeName.toLowerCase().replace(/\s+/g, ""),
                          regNumber,
                        );
                        setRegNumberError(
                          isValid ? "" : "Invalid registration number format",
                        );
                      }
                    }}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    {regTypeName}
                  </span>
                </label>
              ))}
            </div>

            {/* ── Registration Certificate Upload ─────────────────────────── */}
            <div
              className={`flex flex-col border-2 border-dashed rounded-2xl px-5 py-4 mb-1 transition-all ${regCertError
                  ? "border-red-400 bg-red-50"
                  : regCertificate
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${regCertError
                        ? "bg-red-100 text-red-500"
                        : regCertificate
                          ? "bg-green-100 text-green-600"
                          : "bg-blue-50 text-blue-500"
                      }`}
                  >
                    {regCertError ? "⚠️" : regCertificate ? "✅" : "📄"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Registration certificate{" "}
                      <span className="text-red-500">*</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF, JPG or PNG · Max {MAX_FILE_SIZE_MB}MB
                    </p>
                  </div>
                </div>
                <label
                  className={`text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all ${regCertError
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                  {fileLabel(regCertificate)}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      handleRegCertChange(e.target.files[0] || null)
                    }
                  />
                </label>
              </div>
              {regCertError && (
                <p className="text-xs text-red-600 mt-2 ml-12 font-medium">
                  ⚠️ {regCertError}
                </p>
              )}
              {regCertificate && !regCertError && (
                <p className="text-xs text-green-600 mt-2 ml-12 font-medium">
                  ✓ {regCertificate.name} —{" "}
                  {(regCertificate.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-5 ml-1">
              Allowed formats: PDF, JPG, JPEG, PNG · Max size:{" "}
              {MAX_FILE_SIZE_MB}MB
            </p>

            {/* ── Additional Documents ────────────────────────────────────── */}
            {additionalDocs.map((doc, index) => (
              <div key={index} className="mb-3">
                <div
                  className={`flex flex-col border-2 border-dashed rounded-2xl px-5 py-4 transition-all ${additionalDocErrors[index]
                      ? "border-red-400 bg-red-50"
                      : doc
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${additionalDocErrors[index]
                            ? "bg-red-100 text-red-500"
                            : doc
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-50 text-gray-400"
                          }`}
                      >
                        {additionalDocErrors[index] ? "⚠️" : doc ? "✅" : "📎"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Additional Document {index + 1}
                        </p>
                        <p className="text-xs text-gray-400">
                          PDF, JPG or PNG · Max {MAX_FILE_SIZE_MB}MB
                        </p>
                      </div>
                    </div>
                    <label
                      className={`text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all text-white ${additionalDocErrors[index]
                          ? "bg-red-100 hover:bg-red-200"
                          : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                      {fileLabel(doc)}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleAdditionalDocChange(
                            index,
                            e.target.files[0] || null,
                          )
                        }
                      />
                    </label>
                  </div>
                  {additionalDocErrors[index] && (
                    <p className="text-xs text-red-600 mt-2 ml-12 font-medium">
                      ⚠️ {additionalDocErrors[index]}
                    </p>
                  )}
                  {doc && !additionalDocErrors[index] && (
                    <p className="text-xs text-green-600 mt-2 ml-12 font-medium">
                      ✓ {doc.name} — {(doc.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={handleAddDoc}
              className="flex items-center gap-1.5 text-blue-600 text-sm font-semibold mb-6 hover:underline"
            >
              + Add another document
            </button>

            {/* Registration Number + Year */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Registration number
                </label>
                <input
                  type="text"
                  placeholder={
                    regType === "Society"
                      ? "e.g. SOR/BLR/1023/2024"
                      : regType === "Trust"
                        ? "e.g. 868/2019/Book No. 4"
                        : "e.g. U85300DL2023NPL412345"
                  }
                  value={regNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRegNumber(value);
                    const isValid = validateRegistrationNumber(
                      regType.toLowerCase().replace(/\s+/g, ""),
                      value,
                    );
                    if (!value) setRegNumberError("");
                    else if (!isValid)
                      setRegNumberError("Invalid registration number format");
                    else setRegNumberError("");
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400"
                />
                {regNumberError && (
                  <p className="text-xs text-red-600 mt-1">{regNumberError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Year of registration
                </label>
                <input
                  type="text"
                  placeholder="YYYY"
                  maxLength={4}
                  value={yearOfReg}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setYearOfReg(value);
                    const currentYear = new Date().getFullYear();
                    const yearNum = parseInt(value, 10);
                    if (!value) setYearError("");
                    else if (!/^\d{4}$/.test(value))
                      setYearError("Enter valid 4-digit year");
                    else if (yearNum < 1900 || yearNum > currentYear)
                      setYearError(
                        `Year must be between 1900 and ${currentYear}`,
                      );
                    else setYearError("");
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400"
                />
                {yearError && (
                  <p className="text-xs text-red-600 mt-1">{yearError}</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-6" />

            {/* Address */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">📍</span>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                  Address
                </p>
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
              <p style={{ color: "red", fontSize: "12px" }}>
                ⚠ {locationError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  placeholder="Select State"
                  value={state}
                  onChange={(e) => {
                    const value = e.target.value;
                    setState(value);
                    if (!value) setStateError("");
                    else if (!/^(?=.*[A-Za-z])[A-Za-z\s.-]{3,}$/.test(value))
                      setStateError("Enter valid state name");
                    else setStateError("");
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400"
                />
                {stateError && (
                  <p className="text-xs text-red-600 mt-1">{stateError}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCity(value);
                    if (!value) setCityError("");
                    else if (!/^(?=.*[A-Za-z])[A-Za-z\s.-]{2,}$/.test(value))
                      setCityError("Enter valid city name");
                    else setCityError("");
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400"
                />
                {cityError && (
                  <p className="text-xs text-red-600 mt-1">{cityError}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="Pincode"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setPincode(value);
                    if (!value) setPincodeError("");
                    else if (!/^\d{6}$/.test(value))
                      setPincodeError("Pincode must be 6 digits");
                    else setPincodeError("");
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400"
                />
                {pincodeError && (
                  <p className="text-xs text-red-600 mt-1">{pincodeError}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCountry(value);
                    if (!value) setCountryError("");
                    else if (!/^(?=.*[A-Za-z])[A-Za-z\s.-]{3,}$/.test(value))
                      setCountryError("Enter valid country name");
                    else setCountryError("");
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400"
                />
                {countryError && (
                  <p className="text-xs text-red-600 mt-1">{countryError}</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-6" />

            {/* Contact Details */}
            {/* Contact Details */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-blue-500 text-xs">📞</span>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                Official Contact
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Organization Email
                </label>
                <input
                  type="email"
                  placeholder="contact@ngo.org"
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    const emailRegex =
                      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
                    if (!value) setEmailError("");
                    else if (!emailRegex.test(value))
                      setEmailError("Invalid email format");
                    else if (value.length > 254)
                      setEmailError("Email too long");
                    else setEmailError("");
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400"
                />
                {emailError && (
                  <p className="text-xs text-red-600 mt-1">{emailError}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Organization Phone
                </label>
                <div className="flex items-center border-2 border-gray-200 rounded-xl px-3 focus-within:border-blue-500 transition-all">
                  <span className="text-sm text-gray-600 mr-2">+91</span>
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
                      const phoneRegex = /^[6-9]\d{9}$/;
                      if (!value) setPhoneError("");
                      else if (value.length < 10)
                        setPhoneError("Phone number must be 10 digits");
                      else if (!phoneRegex.test(value))
                        setPhoneError("Must start with 6, 7, 8, or 9");
                      else setPhoneError("");
                    }}
                    className="w-full py-2.5 text-sm focus:outline-none"
                  />
                </div>
                {phoneError && (
                  <p className="text-xs text-red-600 mt-1">{phoneError}</p>
                )}
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-400 text-center mb-5">
              By submitting, you agree to our Terms of Service for NGO partners.
            </p>

            {/* Global Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-4 py-2.5 rounded-xl mb-4">
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
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
        </div>
      </div>
    </div>
  );
}