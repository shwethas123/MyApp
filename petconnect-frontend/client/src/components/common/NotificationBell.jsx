import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const getNotificationRoute = (notification, role) => {
  const { reference_type, reference_id } = notification;
  if (reference_type === "message") {
    return role === "shelter" ? "/shelter/messages" : `/pets/${reference_id}?chat=true`;
  }
if (reference_type === "adoption") {
    if (role === "shelter") return `/shelter/adoptions/${reference_id}`;
    if (role === "adopter") return `/my-applications/${reference_id}`;
    if (role === "admin") return `/admin/applications/${reference_id}`;
  }
  if (reference_type === "shelter") {
    if (role === "admin") return `/admin/shelters/${reference_id}`;
    return `/shelter/profile`;
  }
  if (reference_type === "report") return `/admin/reports/${reference_id}`;
  if (reference_type === "user") return `/admin/users/${reference_id}`;
  return "/browse";
};

const NotificationBell = ({ notifications, unreadCount, isOpen, toggleOpen, markAsRead,  role, hasMore, loadMore }) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return; // only attach listener when dropdown is open
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        toggleOpen();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = async (notification) => {
    const route = getNotificationRoute(notification, role);
    toggleOpen();
    await markAsRead(notification.id);
    navigate(route);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleOpen();
        }}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${!n.is_read ? "bg-blue-50/60" : ""}`}
                >
                  <div className="mt-1.5 flex-shrink-0">
                    {!n.is_read
                      ? <span className="w-2 h-2 rounded-full bg-blue-500 block" />
                      : <span className="w-2 h-2 rounded-full bg-transparent block" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.is_read ? "text-gray-800 font-medium" : "text-gray-600"}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full py-3 text-xs text-blue-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;