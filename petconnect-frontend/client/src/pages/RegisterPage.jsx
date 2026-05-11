import { useState } from "react";
import { useNavigate, Link,Navigate } from "react-router-dom";
import useAuth from "../hooks/AuthContext";
import UserService from "../services/UserService";
import { useEffect } from "react";


// ─── Validators ──────────────────────────────────────────────────────────────

const VALIDATORS = {
  firstName: (v) => {
    if (!v.trim()) return "First name is required";
    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(v.trim()))
      return "First name must contain only letters and spaces";
    return "";
  },
  lastName: (v) => {
    if (!v.trim()) return "Last name is required";
    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(v.trim()))
      return "Last name must contain only letters and spaces";
    return "";
  },
  phoneNumber: (v) => {
    if (!v.trim()) return "Phone number is required";
    if (!/^\d+$/.test(v.trim())) return "Phone number must contain only digits";
    if (v.trim().length !== 10) return "Phone number must be exactly 10 digits";
     if (!["6","7","8","9"].includes(v.trim()[0])) return "Please enter a valid mobile number ";
    return "";
  },
  email: (v) => {
    if (!v.trim()) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
      return "Please enter a valid email address";
    return "";
  },
  password: (v) => {
    if (!v) return "Password is required";
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(v))
      return "Password must be at least 8 characters and include one uppercase letter, one number, and one special character (!@#$%^&*)";
    return "";
  },
  confirmPassword: (v, password) => {
    if (!v) return "Please confirm your password";
    if (v !== password) return "Passwords do not match";
    return "";
  },
};

// ─── Eye Icon SVGs ────────────────────────────────────────────────────────────

const EyeOff = () => (
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
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"
    />
  </svg>
);

const EyeOn = () => (
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
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const { setUser,isAuthenticated,login,currentUser} = useAuth();
  const navigate = useNavigate();


    if (isAuthenticated && currentUser.role === "adopter") {
    return <Navigate to="/browse" replace />;
  }else if(isAuthenticated && currentUser.role === "shelter") {
    return <Navigate to="/shelter/pets" replace />;
  }
 

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
    role: "adopter",
  });

  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fixed typo: was "showPaseword"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    setError("");

    if (name === "email") {
      if (otpVerified && value !== verifiedEmail) {
        setOtpVerified(false);
        setOtpSent(false);
        setVerifiedEmail("");
        setSuccess("");
        setFormData((prev) => ({ ...prev, email: value, otp: "" }));
      } else if (otpSent && value !== verifiedEmail) {
        setFormData((prev) => ({ ...prev, email: value, otp: "" }));
        setOtpSent(false);
        setVerifiedEmail("");
      }
    }

    if (touched[name]) {
      const err =
        name === "confirmPassword"
          ? VALIDATORS.confirmPassword(value, updated.password)
          : (VALIDATORS[name]?.(value) ?? "");
      setFieldErrors((prev) => ({ ...prev, [name]: err }));
    }

    if (name === "password" && touched.confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: VALIDATORS.confirmPassword(
          updated.confirmPassword,
          value
        ),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err =
      name === "confirmPassword"
        ? VALIDATORS.confirmPassword(value, formData.password)
        : (VALIDATORS[name]?.(value) ?? "");
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  // ── OTP ────────────────────────────────────────────────────────────────────

  // Fixed: validates email with VALIDATORS before sending, not just empty check
  const handleSendOtp = async () => {
    const emailErr = VALIDATORS.email(formData.email);
    if (emailErr) {
      setTouched((prev) => ({ ...prev, email: true }));
      setFieldErrors((prev) => ({ ...prev, email: emailErr }));
      return;
    }

    setOtpLoading(true);
    setError("");
    try {
      await UserService.sendOtp(formData.email);
      setOtpSent(true);
      setResendTimer(60);
      const interval = setInterval(() => {  
      setResendTimer((prev) => {
      if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
      }, 1000);
      setOtpVerified(false);
      setVerifiedEmail("");
      setSuccess("OTP sent to your email!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // Fixed: now correctly sets verifiedEmail after successful verify
  const handleVerifyOtp = async () => {
    if (!formData.otp) return setError("Please enter the OTP");
    setVerifyLoading(true);
    setError("");
    try {
      await UserService.verifyOtp(formData.email, formData.otp);
      setOtpVerified(true);
      setVerifiedEmail(formData.email); // Fixed: was missing in original
      setSuccess("Email verified successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifyLoading(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  const fields = ["firstName", "lastName", "phoneNumber", "email", "password", "confirmPassword"];
  const newTouched = {};
  const newErrors = {};
  fields.forEach((f) => {
    newTouched[f] = true;
    newErrors[f] =
      f === "confirmPassword"
        ? VALIDATORS.confirmPassword(formData[f], formData.password)
        : (VALIDATORS[f]?.(formData[f]) ?? "");
  });
  setTouched(newTouched);
  setFieldErrors(newErrors);

  const hasErrors = Object.values(newErrors).some(Boolean);
  if (hasErrors) return;

  if (!otpVerified)
    return setError("Please verify your email address with OTP before submitting");

  setLoading(true);
  try {
  await UserService.register({
    firstName: formData.firstName,
    lastName: formData.lastName,
    phoneNumber: formData.phoneNumber,
    email: formData.email,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
    role: formData.role,
  });

  await login({           // ✅ logs in and sets currentUser in context properly
    email: formData.email,
    password: formData.password,
  });

  if (formData.role === "shelter") {
    navigate("/shelter-register");
  } else {
    navigate("/complete-profile"); // ✅ isAuthenticated is now true, guard passes
  }
}catch (err) {
    const msg = (err.response?.data?.message || "Registration failed");
    if (msg.toLowerCase().includes("phone number already")) {
      setFieldErrors((prev) => ({ ...prev, phoneNumber: "Phone number already registered" }));
      setTouched((prev) => ({ ...prev, phoneNumber: true }));
    } else {
      setError(msg);
    }
  } finally {
    setLoading(false);
  }
};

  // ── Helpers ────────────────────────────────────────────────────────────────

  const FieldError = ({ name }) =>
    touched[name] && fieldErrors[name] ? (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <span>⚠</span> {fieldErrors[name]}
      </p>
    ) : null;

  const inputClass = (name) =>
    `w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${
      touched[name] && fieldErrors[name]
        ? "border-red-400 focus:ring-red-300"
        : "border-gray-200 focus:ring-cyan-400"
    }`;

  // ── Render ─────────────────────────────────────────────────────────────────
    const isFormValid =
  formData.firstName.trim() &&
  formData.lastName.trim() &&
  formData.phoneNumber.trim().length === 10 &&
  otpVerified &&
  formData.password &&
  formData.confirmPassword &&
  formData.password === formData.confirmPassword &&
  !Object.values(fieldErrors).some(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-8">
  <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-sm "style={{ minHeight: "calc(100vh - 64px)" }}>
        {/* Left Panel — hidden on mobile */}
       <div className="hidden md:block w-[480px] flex-shrink-0 overflow-hidden relative" style={{ minHeight: "100vh" }}>
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-400 to-teal-600 opacity-80 z-10" />
          <img
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop"
            alt="Pets"
            className="w-full object-cover"
            style={{
              position: "sticky",
              top: 0,
              width: "100%",
              height: "100vh",
              objectFit: "cover",
              objectPosition: "center top",
              zIndex: 0
            }}
          />
          <div style={{ position: "sticky", bottom: 0, left: 0, right: 0, padding: "32px", zIndex: 20, color: "white", marginTop: "-180px" }}>
            <h2 className="text-3xl font-bold mb-3">
              Find your new best friend
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Join thousands of pet lovers who have found their perfect
              companions through PetConnect. Start your journey today.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <div className="flex -space-x-2">
                {["👤", "👥", "🧑"].map((e, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-xs border-2 border-white"
                  >
                    {e}
                  </div>
                ))}
              </div>
              <span className="text-sm text-white/90">
                Joined by 10k+ pet parents
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="flex-1 w-full bg-white">
          <div className="p-6 md:p-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Create your account
          </h1>
          <p className="text-gray-500 text-sm mb-7">
            Start your journey with a new furry friend
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg mb-5">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

  {/* Role Selector */}
  <div>
    <label className="block text-xs font-semibold text-gray-600  tracking-wide mb-3">
      I am registering as
    </label>
    <div className="grid grid-cols-2 gap-3">
      {[
        { value: "adopter", icon: "🏠", label: "Adopter", desc: "Looking to adopt a pet" },
        { value: "shelter", icon: "🏥", label: "Shelter", desc: "Managing a shelter" },
      ].map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setFormData({ ...formData, role: opt.value })}
          className={`border-2 rounded-xl p-4 flex flex-col items-start gap-1 transition
            ${formData.role === opt.value
              ? "border-cyan-500 bg-cyan-50"
              : "border-gray-200 hover:border-gray-300"
            }`}
        >
          <span className="text-2xl">{opt.icon}</span>
          <span className={`text-sm font-semibold ${formData.role === opt.value ? "text-cyan-600" : "text-gray-700"}`}>
            {opt.label}
          </span>
          <span className="text-xs text-gray-400">{opt.desc}</span>
        </button>
      ))}
    </div>
  </div>

  {/* First Name + Last Name */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600  tracking-wide mb-1.5">
                  First name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="John"
                  className={inputClass("firstName")}
                />
                <FieldError name="firstName" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600  tracking-wide mb-1.5">
                  Last name <span className="text-red-400">*</span>
                </label>
                {/* Fixed: added onBlur and inputClass (was missing in original) */}
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Doe"
                  className={inputClass("lastName")}
                />
                <FieldError name="lastName" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-600  tracking-wide mb-1.5">
                Phone number <span className="text-red-400">*</span>
              </label>
              {/* Fixed: added onBlur, inputClass, maxLength, and FieldError (all missing in original) */}
              <div className={`flex items-center border rounded-lg overflow-hidden transition ${
                  touched.phoneNumber && fieldErrors.phoneNumber
                  ? "border-red-400 focus-within:ring-2 focus-within:ring-red-300"
                  : "border-gray-200 focus-within:ring-2 focus-within:ring-cyan-400"
                  }`}>
                  <span className="px-3 py-2.5 bg-gray-50 text-gray-500 text-sm border-r border-gray-200 select-none">
                     +91
                  </span>
              
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="10-digit number"
                maxLength={10}
                className="flex-1 px-4 py-2.5 text-sm focus:outline-none"
              />
              </div>
              <FieldError name="phoneNumber" />
            </div>

            {/* Email + Send OTP */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 tracking-wide mb-1.5">
                Email address <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <div
                  className={`flex-1 flex items-center border rounded-lg px-4 py-2.5 gap-2 focus-within:ring-2 transition ${
                    touched.email && fieldErrors.email
                      ? "border-red-400 focus-within:ring-red-300"
                      : "border-gray-200 focus-within:ring-cyan-400"
                  }`}
                >
                  <span className="text-gray-400 text-sm">✉️</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@example.com"
                    className="flex-1 text-sm focus:outline-none min-w-0"
                  />
                  {otpVerified && (
                    <span className="text-green-500 text-xs font-semibold whitespace-nowrap">
                      ✓ Verified
                    </span>
                  )}
                </div>
                {/* Fixed: shows "Resend" when OTP sent but not yet verified */}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || otpVerified ||resendTimer>0}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition disabled:opacity-50 whitespace-nowrap"
                >
                  {otpLoading
                    ? "Sending..."
                    : otpVerified
                      ? "Verified"
                      : resendTimer > 0 ? `Resend (${resendTimer}s)`
                      : otpSent
                        ? "Resend"
                        : "Send OTP"}
                </button>
              </div>
              {/* Fixed: added FieldError for email (was missing in original) */}
              <FieldError name="email" />
              {/* Added: amber hint when email is valid but OTP not yet sent */}
              {!otpVerified &&
                !otpSent &&
                formData.email &&
                touched.email &&
                !fieldErrors.email && (
                  <p className="text-amber-500 text-xs mt-1 flex items-center gap-1">
                    <span>ℹ</span> Please send and verify OTP for this email
                  </p>
                )}
            </div>

            {/* OTP Field */}
            {otpSent && !otpVerified && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Enter OTP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="6-digit code"
                    maxLength={6}
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyLoading}
                    className="bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-50"
                  >
                    {verifyLoading ? "Verifying..." : "Verify"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resendTimer > 0}
                  className="text-xs text-cyan-500 hover:underline mt-1.5"
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>
            )}

            {/* Password + Confirm — with eye toggles, live hints, and blur errors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600  tracking-wide mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className={`${inputClass("password")} pr-10`}
                  />
                  {/* Eye toggle button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff /> : <EyeOn />}
                  </button>
                </div>
                {/* Live strength hints while typing; FieldError after blur */}
                {formData.password && !touched.password ? (
                  <ul className="mt-2 space-y-1">
                    {[
                      { rule: /.{8,}/, label: "At least 8 characters" },
                      { rule: /[A-Z]/, label: "One uppercase letter" },
                      { rule: /[0-9]/, label: "One number" },
                      {
                        rule: /[!@#$%^&*]/,
                        label: "One special character (!@#$%^&*)",
                      },
                    ].map(({ rule, label }) => (
                      <li
                        key={label}
                        className={`text-xs flex items-center gap-1.5 ${
                          rule.test(formData.password)
                            ? "text-green-500"
                            : "text-gray-400"
                        }`}
                      >
                        <span>{rule.test(formData.password) ? "✓" : "○"}</span>
                        {label}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <FieldError name="password" />
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600  tracking-wide mb-1.5">
                  Confirm password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className={`${inputClass("confirmPassword")} pr-10`}
                  />
                  {/* Eye toggle button */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff /> : <EyeOn />}
                  </button>
                </div>
                {/* Live match hint while typing; FieldError after blur */}
                {formData.confirmPassword && !touched.confirmPassword ? (
                  <p
                    className={`text-xs mt-2 flex items-center gap-1.5 ${
                      formData.password === formData.confirmPassword
                        ? "text-green-500"
                        : "text-red-400"
                    }`}
                  >
                    <span>
                      {formData.password === formData.confirmPassword
                        ? "✓"
                        : "✗"}
                    </span>
                    {formData.password === formData.confirmPassword
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </p>
                ) : (
                  <FieldError name="confirmPassword" />
                )}
              </div>
            </div>

            
            {/* Submit — Fixed: only disabled while loading, not permanently on !otpVerified */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google OAuth Button */}

             <a  href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 hover:bg-gray-50 transition text-sm font-semibold text-gray-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>

            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-cyan-500 font-semibold hover:underline">
                Log in
              </Link>
            </p>
        </div>
      </div>
      </div>
    </div>
  );
}
