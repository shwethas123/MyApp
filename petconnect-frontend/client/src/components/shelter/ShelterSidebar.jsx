import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Heart,
  List,
  MessageSquare,
  BarChart2,
  Plus,
  Menu,
  X,
} from "lucide-react";
import useAuth from "../../hooks/AuthContext";
import api from "../../services/Apiservices";

const navItems = [
  { label: "Adoption requests", icon: Heart, to: "/shelter/adoptions" },
  { label: "Your pet listings", icon: List, to: "/shelter/pets" },
  { label: "Messages", icon: MessageSquare, to: "/shelter/messages" },
  { label: "Analytics", icon: BarChart2, to: "/shelter/analytics" },
];

export default function ShelterSidebar() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false); // ✅ mobile drawer state

  // ✅ Existing fetch logic — unchanged
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const shelterId = currentUser?.shelter?.id;
        if (!shelterId) return;

        const res = await api.get(`/adoption/shelter/${shelterId}`);
        const applications = res.data.data || [];
        const pending = applications.filter(
          (app) => app.status === "pending",
        ).length;
        setPendingCount(pending);
      } catch (err) {
        console.error("Failed to fetch pending count:", err);
      }
    };

    fetchPendingCount();
  }, [currentUser]);

  // ✅ Shared nav content — used in both desktop sidebar and mobile drawer
  const NavContent = ({ onNavigate }) => (
    <div>
      {/* Add Pet Button */}
      <div className="px-4 mb-6">
        <button
          onClick={() => {
            navigate("/shelter/pets/add");
            onNavigate?.();
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
        >
          <Plus size={16} />
          Add pet
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-sm font-medium border-l-[3px] transition-all
              ${
                isActive
                  ? "bg-blue-50 text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`p-1 rounded-md ${isActive ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
                >
                  <Icon size={15} />
                </span>

                <span>{label}</span>

                {/* ✅ Badge — existing logic unchanged */}
                {label === "Adoption requests" && pendingCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar (lg and above) — identical to original ────────── */}
      <aside className="hidden lg:flex w-56 min-h-screen bg-white border-r border-gray-200 flex-col justify-between py-6 shrink-0">
        <NavContent />
      </aside>

      {/* ── Mobile: fixed top bar below navbar ──────────────────────────────── */}
      <div className="lg:hidden fixed top-[52px] left-0 right-0 bg-white border-b border-gray-100 z-40 flex items-center px-4 py-2.5 shadow-sm">
        <button
          onClick={() => setMenuOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          <Menu size={17} />
          <span>Menu</span>
          {pendingCount > 0 && (
            <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile overlay ───────────────────────────────────────────────────── */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/25 z-50"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ── Mobile drawer ────────────────────────────────────────────────────── */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-56 bg-white z-[60] shadow-2xl flex flex-col py-6 transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Drawer header with close button */}
        <div className="flex items-center justify-between px-4 mb-4">
          <span className="text-sm font-bold text-gray-800">Navigation</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <NavContent onNavigate={() => setMenuOpen(false)} />
      </div>
    </>
  );
}
