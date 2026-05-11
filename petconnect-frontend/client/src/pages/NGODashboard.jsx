import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/AuthContext";
import {
  MoreHorizontal,
  MapPin,
  Clock,
  ChevronDown,
  FileText,
  Heart,
  PawPrint,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ShelterSidebar from "../components/shelter/ShelterSidebar";
import api from "../services/Apiservices";

const statusConfig = {
  Available: { label: "Available", className: "bg-green-100 text-green-700" },
  Reserved: { label: "Reserved", className: "bg-yellow-100 text-yellow-700" },
  Adopted: { label: "Adopted", className: "bg-blue-100 text-blue-700" },
};

// ── STAT CARD ──────────────────────────────────────────────────────────────
function StatCard({ label, value, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-3 sm:px-5 py-4 flex items-end justify-between flex-1 min-w-0 overflow-hidden">
      <div className="min-w-0 flex-1 pr-2">
        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5 leading-tight">
          {label}
        </p>
        <p className="text-xl sm:text-3xl font-bold text-[#1B3A4B]">
          {value ?? 0}
        </p>
      </div>
      <div className="shrink-0 flex-none">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── GENDER BADGE ───────────────────────────────────────────────────────────
function GenderBadge({ gender }) {
  const isMale = gender?.toLowerCase() === "male";
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded ${isMale ? "bg-[#3182CE] text-white" : "bg-[#E8727A] text-white"}`}
    >
      {gender?.toUpperCase()}
    </span>
  );
}

// ── PET CARD ───────────────────────────────────────────────────────────────
function PetCard({ pet, onEdit, onDelete, onMarkAdopted }) {
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isShelterOrAdmin =
    currentUser?.role === "shelter" || currentUser?.role === "admin";
  const statusStyle = statusConfig[pet.status] || statusConfig.Available;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        {pet.images?.[0]?.file_url ? (
          <img
            src={pet.images[0].file_url}
            alt={pet.name}
            className="w-full h-44 sm:h-48 object-cover object-top"
          />
        ) : (
          <div className="w-full h-44 sm:h-48 bg-gray-100 flex items-center justify-center">
            <PawPrint size={32} className="text-gray-300" />
          </div>
        )}

        {isShelterOrAdmin && (
          <span
            className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${statusStyle.className}`}
          >
            {statusStyle.label}
          </span>
        )}

        {/* Menu */}
        <div className="absolute top-2.5 right-2.5">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"
          >
            <MoreHorizontal size={14} className="text-gray-500" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-lg shadow-lg z-10 min-w-[130px] py-1">
              <button
                onClick={() => {
                  onEdit(pet);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
              >
                Edit details
              </button>
              <button
                onClick={() => {
                  onMarkAdopted(pet.id);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
              >
                Mark adopted
              </button>
              <button
                onClick={() => {
                  onDelete(pet.id);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-gray-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-semibold text-[#1B3A4B] truncate pr-2">
            {pet.name}
          </h3>
          <GenderBadge gender={pet.gender} />
        </div>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin size={11} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{pet.breed || pet.species || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={11} className="text-gray-400 flex-shrink-0" />
            {pet.age ? `${pet.age} Year${pet.age > 1 ? "s" : ""} Old` : "—"}
          </div>
        </div>
        <button
          onClick={() => onEdit(pet)}
          className="w-full border border-gray-200 rounded-lg py-2 text-xs text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          Edit details
        </button>
      </div>
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function NgoDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPets, setTotalPets] = useState(0);
  const [stats, setStats] = useState({
    activeListings: 0,
    pendingRequests: 0,
    totalAdoptions: 0,
  });
  const limit = 9;

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Effect 1 — Fetch pets
  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      try {
        const res = await api.get("/shelter/pets");
        const allPets = res.data.data || [];

        setStats((prev) => ({
          ...prev,
          activeListings: allPets.filter((p) => p.status === "Available")
            .length,
          totalAdoptions: allPets.filter((p) => p.status === "Adopted").length,
        }));

        const STATUS_ORDER = {
          Available: 1,
          Reserved: 2,
          Adopted: 3,
        };

        let filtered = allPets;
        if (speciesFilter)
          filtered = filtered.filter((p) => p.species === speciesFilter);
        if (statusFilter)
          filtered = filtered.filter((p) => p.status === statusFilter);

        //  Sort: Available → Reserved → Adopted and also by created_at desc for same status
        filtered = [...filtered].sort((a, b) => {
          const statusDiff =
            (STATUS_ORDER[a.status] || 5) - (STATUS_ORDER[b.status] || 5);
          if (statusDiff !== 0) return statusDiff;
          return new Date(b.created_at) - new Date(a.created_at);
        });

        setTotalPets(filtered.length);
        const start = (page - 1) * limit;
        setPets(filtered.slice(start, start + limit));
      } catch (err) {
        console.error("fetchPets error:", err);
        setPets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, [speciesFilter, statusFilter, page]);

  // Effect 2 — Fetch pending adoption count
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
        setStats((prev) => ({ ...prev, pendingRequests: pending }));
      } catch (err) {
        console.error("fetchPendingCount error:", err);
      }
    };
    fetchPendingCount();
  }, [currentUser]);

  const handleEdit = (pet) => navigate(`/shelter/pets/${pet.id}/edit`);
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await api.del(`/shelter/pets/${id}`);
      setPets((prev) => prev.filter((p) => p.id !== id));
      setTotalPets((prev) => prev - 1);
    } catch (err) {
      console.error("Failed to delete pet:", err);
      alert("Failed to delete pet. Please try again.");
    }
  };
  const handleMarkAdopted = async (id) => {
    try {
      await api.patch(`/shelter/pets/${id}/status`, { status: "Adopted" });
      setPets((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "Adopted" } : p)),
      );
    } catch (err) {
      console.error("Failed to update pet status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const totalPages = Math.ceil(totalPets / limit);
  const userName = currentUser?.name || "there";

  // ── Page numbers to show ───────────────────────────────────────────────
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      <ShelterSidebar />

      <div className="flex-1 p-4 lg:p-6 overflow-y-auto mt-[44px] lg:mt-0">
        {/* ── Page Header ── */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-5 sticky top-0 z-10">
          <h1 className="text-lg font-bold text-[#1B3A4B]">
            Manage your shelter with ease
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Welcome back, {userName}. Here's what's happening today.
          </p>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* ── KPI Cards ── */}
          {/* Mobile: stack | Tablet+: side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard label="Active Listings" value={stats.activeListings}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText size={14} className="text-blue-400" />
              </div>
            </StatCard>
            <StatCard label="Pending Requests" value={stats.pendingRequests}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                <div className="w-3.5 h-3.5 border-2 border-orange-400 rounded-sm" />
              </div>
            </StatCard>
            <StatCard label="Total Adoptions" value={stats.totalAdoptions}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-50 rounded-lg flex items-center justify-center">
                <Heart size={14} className="text-green-500 fill-green-500" />
              </div>
            </StatCard>
          </div>

          {/* ── Listings Header + Filters ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="text-sm font-semibold text-[#1B3A4B]">
              My pet listings
            </h2>
            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={speciesFilter}
                  onChange={(e) => {
                    setSpeciesFilter(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none w-full bg-white border border-gray-200 rounded-lg pl-3 pr-7 py-2 text-xs text-gray-600 focus:outline-none cursor-pointer"
                >
                  <option value="">All pets</option>
                  <option value="Dog">Dogs</option>
                  <option value="Cat">Cats</option>
                  <option value="Bird">Birds</option>
                  <option value="Rabbit">Rabbits</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none w-full bg-white border border-gray-200 rounded-lg pl-3 pr-7 py-2 text-xs text-gray-600 focus:outline-none cursor-pointer"
                >
                  <option value="">All status</option>
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Adopted">Adopted</option>
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* ── Loading Skeleton ── */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 h-64 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* ── Empty State ── */}
          {!loading && pets.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 sm:p-16 text-center mb-6">
              <PawPrint size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-400 mb-1">
                No pets listed yet
              </p>
              <p className="text-xs text-gray-300 mb-4">
                Start by adding your first pet listing
              </p>
            </div>
          )}

          {/* ── Pet Grid ── */}
          {/* Mobile: 1 col | Tablet: 2 cols | Desktop: 3 cols */}
          {!loading && pets.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {pets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMarkAdopted={handleMarkAdopted}
                />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && totalPets > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
              {/* Count */}
              <p className="text-xs text-gray-400 order-2 sm:order-1">
                Showing {Math.min((page - 1) * limit + 1, totalPets)}–
                {Math.min(page * limit, totalPets)} of {totalPets} listings
              </p>

              {/* Page buttons */}
              <div className="flex items-center gap-1.5 order-1 sm:order-2">
                {/* Prev */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors
                      ${
                        page === num
                          ? "bg-blue-600 text-white border border-blue-600"
                          : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {num}
                  </button>
                ))}

                {/* Next */}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
