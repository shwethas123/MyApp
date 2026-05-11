import { useState } from "react";

const LoginForm = ({
  onSubmit,
  isLoading,
  error,
  oauthOnly,
  onForgotPassword,
  onCreateAccount,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-100 to-blue-100 flex flex-col">
      {/* Main Content */}

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10">
          {/* Logo Icon */}

          <div className="flex justify-center mb-5">
            <div className="bg-blue-100 rounded-2xl w-16 h-16 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-9 h-9 text-blue-600"
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
          </div>
          {/* Heading */}

          <h1 className="text-center text-2xl font-bold text-gray-900 mb-1">
            Welcome back
          </h1>

          <p className="text-center text-gray-400 text-sm mb-7">
            Please enter your details to sign in
          </p>
          {/* Error Message */}

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          {/* Form */}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>

              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200 transition-all">
                <span className="text-gray-400 mr-2 text-base">@</span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  required
                  className="flex-1 text-sm text-gray-700 placeholder-gray-300 outline-none bg-transparent"
                />
              </div>
            </div>
            {/* Password */}
             {!oauthOnly && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>

              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200 transition-all">
                <span className="text-gray-400 mr-2">🔒</span>

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                  tabIndex={-1}
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
            </div>
)}
            {/* Forgot Password */}
            {!oauthOnly && (
            <div className="text-right -mt-1">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-blue-500 text-sm font-medium hover:text-blue-700 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            )}
            
            {/* Login Button */}
            {!oauthOnly && (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm shadow-sm shadow-blue-200 mt-2"
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
                  Signing in...
                </span>
              ) : (
                "Login"
              )}
            </button>
            )}

          </form>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* OAuth Buttons */}
          <div className="flex gap-3">
            
            <a href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </a>
          </div>
          {/* Create Account */}

          <p className="text-center text-sm text-gray-400 mt-5">
            Don't have an account?
            <button
              onClick={onCreateAccount}
              className=" ml-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
