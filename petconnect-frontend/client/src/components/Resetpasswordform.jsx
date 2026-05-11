import { useState } from "react";

const ResetPasswordForm = ({ onSubmit, isLoading, error, success }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    if (!passwordRegex.test(newPassword)) {
      setValidationError(
        "Password must be at least 8 characters and include one uppercase letter, one number, and one special character (!@#$%^&*)",
      );
      return;
    }

    onSubmit(newPassword, confirmPassword);
  };

  const displayError = validationError || error;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-100 to-blue-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10 text-center">
          <div className="flex justify-center mb-5">
            <div className="bg-green-100 rounded-2xl w-16 h-16 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
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
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Password Reset Successful!
          </h2>
          <p className="text-gray-400 text-sm">
            You are now logged in. This tab will close automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-100 to-blue-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10">
          <div className="flex justify-center mb-5">
            <div className="bg-blue-100 rounded-2xl w-16 h-16 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600"
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
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold text-gray-900 mb-1">
            Set New Password
          </h1>
          <p className="text-center text-gray-400 text-sm mb-7">
            Your new password must be at least 8 characters
          </p>

          {displayError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200 transition-all">
                <span className="text-gray-400 mr-2">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  {showPassword ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
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
                  )}
                </button>
              </div>
              {newPassword && (
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
                        rule.test(newPassword)
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      <span>{rule.test(newPassword) ? "✓" : "○"}</span>
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200 transition-all">
                <span className="text-gray-400 mr-2">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  {showPassword ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
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
                  )}
                </button>
              </div>
              {confirmPassword && (
                <p
                  className={`text-xs mt-2 flex items-center gap-1.5 ${
                    newPassword === confirmPassword
                      ? "text-green-500"
                      : "text-red-400"
                  }`}
                >
                  <span>{newPassword === confirmPassword ? "✓" : "✗"}</span>
                  {newPassword === confirmPassword
                    ? "Passwords match"
                    : "Passwords do not match"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;