import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart2,
  Flag,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard",          icon: LayoutDashboard, path: "/admin/dashboard" },
  { id: "shelters",  label: "Shelter Management", icon: Building2,       path: "/admin/shelters"  },
  { id: "users",     label: "User Management",    icon: Users,           path: "/admin/users"     },
  { id: "reports",   label: "Reports & Abuse",    icon: Flag,            path: "/admin/reports"   },
  { id: "analytics", label: "Analytics",          icon: BarChart2,       path: "/admin/analytics" },
];

const AdminSidebar = ({ onNavigate } = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleClick = (path) => {
    navigate(path);
    setMobileOpen(false);
    if (onNavigate) onNavigate();
  };

  const SidebarContent = () => (
    <div
      style={{
        width: "220px",
        minWidth: "220px",
        height: "100%",
        minHeight: "100vh",
        background: "#fff",
        borderRight: "1px solid #F0F0F0",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        gap: "4px",
      }}
    >
      {/* Logo */}
    
      {navItems.map(({ id, label, icon: Icon, path }) => (
        <div
          key={id}
          onClick={() => handleClick(path)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 20px",
            margin: "0 10px",
            borderRadius: "10px",
            cursor: "pointer",
            background: location.pathname === path ? "#EEF2FF" : "transparent",
            color: location.pathname === path ? "#4F46E5" : "#6B7280",
            fontWeight: location.pathname === path ? 600 : 400,
            fontSize: "14px",
            transition: "all 0.15s",
          }}
        >
          <Icon size={17} />
          {label}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* ── DESKTOP: always visible ── */}
      <div style={{ display: "none" }} className="sidebar-desktop">
        <SidebarContent />
      </div>

      {/* ── MOBILE: hamburger button ── */}
      <button
        className="sidebar-hamburger"
        onClick={() => setMobileOpen(true)}
        style={{
          display: "none",
          position: "fixed",
          top: "14px",
          left: "14px",
          zIndex: 1000,
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: "10px",
          padding: "8px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <Menu size={20} color="#374151" />
      </button>

      {/* ── MOBILE: overlay backdrop ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 998,
          }}
        />
      )}

      {/* ── MOBILE: slide-in drawer ── */}
      <div
        className="sidebar-drawer"
        style={{
          position: "fixed",
          top: 0,
          left: mobileOpen ? "0" : "-240px",
          zIndex: 999,
          transition: "left 0.25s ease",
          height: "100vh",
          boxShadow: mobileOpen ? "4px 0 20px rgba(0,0,0,0.12)" : "none",
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            zIndex: 1,
          }}
        >
          <X size={18} color="#6B7280" />
        </button>
        <SidebarContent />
      </div>

      {/* ── CSS via style tag ── */}
      <style>{`
        @media (min-width: 769px) {
          .sidebar-desktop { display: block !important; }
          .sidebar-hamburger { display: none !important; }
          .sidebar-drawer { display: none !important; }
        }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;