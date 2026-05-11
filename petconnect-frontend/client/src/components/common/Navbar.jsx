// src/components/common/Navbar.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../../hooks/AuthContext";
import NotificationBell from "./NotificationBell";
import useNotifications from "../../hooks/useNotifications";

// ✅ Added `minimal` prop — when true, only the logo is shown (used on profile completion page)
const Navbar = ({ minimal = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { notifications, unreadCount, isOpen, toggleOpen, markAsRead,  hasMore, loadMore } = useNotifications(currentUser);
  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";
  const isProfileCompletionPage = location.pathname === "/complete-profile";

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  // ✅ Route to correct profile page based on role
  const profileRoute =
    currentUser?.role === "shelter" ? "/shelter/profile" : "/my-profile";

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md shadow-sm px-6 md:px-8 py-3 flex items-center justify-between sticky top-0 z-50">
        {/* Logo */}
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
            <Link to="/" className="text-blue-600 font-bold text-xl">PetConnect</Link>
          </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {!isProfileCompletionPage &&
            isAuthenticated &&
            currentUser?.role === "adopter" && (
              <>
                <Link
                  to="/browse"
                  className="text-gray-600 hover:text-blue-600 text-sm font-medium"
                >
                  Browse Pets
                </Link>
                <Link
                  to="/my-applications"
                  className="text-gray-600 hover:text-blue-600 text-sm font-medium"
                >
                  My Applications
                </Link>
                <Link
                  to="/my-wishlist"
                  className="text-gray-600 hover:text-blue-600 text-sm font-medium"
                >
                  My Wishlist
                </Link>
              </>
            )}
          {isAuthenticated && currentUser?.role === "shelter" && (
            <Link
              to="/shelter/pets"
              className="text-gray-600 hover:text-blue-600 text-sm font-medium"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              {!isLoginPage && (
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Login
                </button>
              )}
              {!isRegisterPage && (
                <button
                  onClick={() => navigate("/register")}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Register
                </button>
              )}
            </>
          ) : (
           <div className="flex items-center gap-4">
<NotificationBell
    notifications={notifications}
    unreadCount={unreadCount}
    isOpen={isOpen}
    toggleOpen={toggleOpen}
    markAsRead={markAsRead}
    // markAllAsRead={markAllAsRead}
    role={currentUser?.role}
  />
              {/* ✅ Clicking Hi navigates to role-based profile */}
              {/* <Link to={profileRoute} className="text-sm text-gray-600 hover:text-blue-600 font-medium">
                Hi, {currentUser?.name?.split(" ")[0] || currentUser?.first_name}
              </Link> */}
              {currentUser?.role === "admin" ? (
                <span className="text-sm text-gray-600 font-medium">
                  Hi,{" "}
                  {currentUser?.name?.split(" ")[0] || currentUser?.first_name}
                </span>
              ) : (
                <Link
                  to={profileRoute}
                  className="text-sm text-gray-600 hover:text-blue-600 font-medium"
                >
                  Hi,{" "}
                  {currentUser?.name?.split(" ")[0] || currentUser?.first_name}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden flex flex-col justify-center gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-0.5 bg-gray-600 rounded transition-all duration-200 ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-gray-600 rounded transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-gray-600 rounded transition-all duration-200 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 top-[52px] bg-black/20 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed left-0 right-0 top-[52px] bg-white border-b border-gray-100 shadow-lg z-50 transition-all duration-200 ${menuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
      >
        <div className="flex flex-col px-4 py-3 gap-1">
          {!isProfileCompletionPage &&
            isAuthenticated &&
            currentUser?.role === "adopter" && (
              <>
                <Link
                  to="/browse"
                  onClick={closeMenu}
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium px-3 py-3 rounded-xl transition-colors"
                >
                  Browse Pets
                </Link>
                <Link
                  to="/my-applications"
                  onClick={closeMenu}
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium px-3 py-3 rounded-xl transition-colors"
                >
                  My Applications
                </Link>
                <Link
                  to="/my-wishlist"
                  onClick={closeMenu}
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium px-3 py-3 rounded-xl transition-colors"
                >
                  My Wishlist
                </Link>
              </>
            )}
          {isAuthenticated && currentUser?.role === "shelter" && (
            <Link
              to="/shelter/pets"
              onClick={closeMenu}
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium px-3 py-3 rounded-xl transition-colors"
            >
              Dashboard
            </Link>
          )}

          {isAuthenticated && <div className="border-t border-gray-100 my-1" />}
          {isAuthenticated && (
            <div className="flex items-center justify-between px-3 py-2">
              <button
                onClick={toggleOpen}
                className="text-sm text-gray-500 font-medium hover:text-blue-600 transition-colors"
              >
                Notifications
              </button>
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                isOpen={isOpen}
                toggleOpen={toggleOpen}
                markAsRead={markAsRead}
                // markAllAsRead={markAllAsRead}
                role={currentUser?.role}
                hasMore={hasMore}    // ✅ ADD
                loadMore={loadMore} 
              />
            </div>
          )}

          {!isAuthenticated ? (
            <div className="flex flex-col gap-2 pt-1 pb-1">
              {!isLoginPage && (
                <button
                  onClick={() => {
                    navigate("/login");
                    closeMenu();
                  }}
                  className="w-full text-sm bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 font-medium"
                >
                  Login
                </button>
              )}
              {!isRegisterPage && (
                <button
                  onClick={() => {
                    navigate("/register");
                    closeMenu();
                  }}
                  className="w-full text-sm bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 font-medium"
                >
                  Register
                </button>
              )}
            </div>
          ) : (
            <>
              {/* ✅ Role-based profile link in mobile drawer too */}
              {/* <Link
                to={profileRoute}
                onClick={closeMenu}
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium px-3 py-3 rounded-xl transition-colors"
              >
                My Profile
              </Link> */}
              {currentUser?.role === "admin" ? (
                <span className="text-sm text-gray-600 font-medium">
                  Hi,{" "}
                  {currentUser?.name?.split(" ")[0] || currentUser?.first_name}
                </span>
              ) : (
                <Link
                  to={profileRoute}
                  className="text-sm text-gray-600 hover:text-blue-600 font-medium"
                >
                  Hi,{" "}
                  {currentUser?.name?.split(" ")[0] || currentUser?.first_name}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left text-sm bg-red-50 text-red-500 hover:bg-red-100 px-3 py-3 rounded-xl font-medium transition-colors mt-1"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
