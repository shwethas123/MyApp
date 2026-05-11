import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, Filter } from "lucide-react";
import ShelterSidebar from "../components/shelter/ShelterSidebar";
import AdoptionService from "../services/Adoptionservice.js";
import useAuth from "../hooks/AuthContext";

// ── STATUS CONFIG ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: { badge: "bg-amber-50 text-amber-500", dot: "bg-amber-500" },
  approved: { badge: "bg-green-50 text-green-700", dot: "bg-green-600" },
  rejected: { badge: "bg-red-50 text-red-600", dot: "bg-red-500" },
  home_visit: { badge: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
  completed: { badge: "bg-purple-50 text-purple-600", dot: "bg-purple-500" },
  dissolved: { badge: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
};

// ✅ Added "Completed" tab
const TABS = [
  "All",
  "Pending",
  "Approved",
  "Home visit",
  "Completed",
  "Rejected",
  "Dissolved",
];

const TAB_TO_STATUS = {
  All: null,
  Pending: "pending",
  Approved: "approved",
  "Home visit": "home_visit",
  Completed: "completed",
  Rejected: "rejected",
  Dissolved: "dissolved",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function ShelterAdoptionRequests() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const shelterId = currentUser?.shelter?.id;
        if (!shelterId) {
          setError("Shelter ID not found. Please log in again.");
          return;
        }
        const res = await AdoptionService.getApplicationsForShelter(shelterId);
        setApplications(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        setError("Failed to load applications. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [currentUser]);

  const filtered = applications.filter((app) => {
    const statusFilter = TAB_TO_STATUS[activeTab];
    if (!statusFilter) return true;
    return app.status === statusFilter;
  });
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const pendingCount = applications.filter(
    (app) => app.status === "pending",
  ).length;

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <ShelterSidebar />
        <div className="flex-1 flex items-center justify-center p-4 lg:p-6 overflow-y-auto mt-[44px] lg:mt-0">
          <div className="text-center">
            <div className="text-5xl animate-spin mb-4">🐾</div>
            <p className="text-sm text-gray-400 font-semibold">
              Loading applications...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <ShelterSidebar />
        <div className="flex-1 flex items-center justify-center p-4 lg:p-6 overflow-y-auto mt-[44px] lg:mt-0">
          <p className="text-red-500 text-sm font-semibold bg-red-50 px-4 py-3 rounded-xl text-center">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="flex min-h-screen">
        <ShelterSidebar />

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 mt-[44px] lg:mt-0">
          {/* ── Page Header ── */}
          <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-5">
            <h1 className="text-lg font-bold text-gray-900">
              Adoption requests
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Welcome back, {currentUser?.name?.split(" ")[0]}! Here's what
              needs your attention.
            </p>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {[
                {
                  label: "Total",
                  count: applications.length,
                  color: "bg-blue-50 text-blue-700",
                  dot: "bg-blue-400",
                },
                {
                  label: "Pending",
                  count: applications.filter((a) => a.status === "pending")
                    .length,
                  color: "bg-amber-50 text-amber-700",
                  dot: "bg-amber-500",
                },
                {
                  label: "Approved",
                  count: applications.filter((a) => a.status === "approved")
                    .length,
                  color: "bg-green-50 text-green-700",
                  dot: "bg-green-500",
                },
                {
                  label: "Completed",
                  count: applications.filter((a) => a.status === "completed")
                    .length,
                  color: "bg-purple-50 text-purple-700",
                  dot: "bg-purple-500",
                },
                {
                  label: "Rejected",
                  count: applications.filter((a) => a.status === "rejected")
                    .length,
                  color: "bg-red-50 text-red-700",
                  dot: "bg-red-500",
                },
                {
                  label: "Dissolved",
                  count: applications.filter((a) => a.status === "dissolved")
                    .length,
                  color: "bg-amber-50 text-amber-700",
                  dot: "bg-amber-500",
                },
              ].map(({ label, count, color, dot }) => (
                <div
                  key={label}
                  className={`${color} rounded-xl px-4 py-3 flex items-center justify-between`}
                >
                  <div>
                    <p className="text-xs font-medium opacity-70">{label}</p>
                    <p className="text-2xl font-bold mt-0.5">{count}</p>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                </div>
              ))}
            </div>

            {/* ── Main Card ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              {/* Card Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-0">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-gray-900">
                    All requests
                  </h2>
                </div>
              </div>

              {/* ── Tabs — scrollable on mobile ── */}
              <div className="overflow-x-auto">
                <div className="flex gap-0 border-b border-gray-100 px-4 sm:px-6 mt-4 min-w-max sm:min-w-0">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setPage(1);
                      }}
                      className={`px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                        ${
                          activeTab === tab
                            ? "text-blue-600 border-blue-600"
                            : "text-gray-400 border-transparent hover:text-gray-600"
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Empty State ── */}
              {filtered.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <PawPrint size={36} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-sm font-medium text-gray-400">
                    No {activeTab.toLowerCase()} requests found.
                  </p>
                </div>
              ) : (
                <>
                  {/* ── Desktop Table ── */}
                  <div className="hidden md:block">
                    {/* Table Header */}
                    <div
                      className="grid gap-4 px-6 py-3 text-xs font-semibold text-gray-400  tracking-wide bg-gray-50/50 mx-6 rounded-lg mt-4"
                      style={{
                        gridTemplateColumns:
                          "minmax(0,2.5fr) minmax(0,2fr) minmax(0,2fr) minmax(0,2fr) 110px",
                      }}
                    >
                      <span className="pl-14">Pet name</span>
                      <span>Applicant</span>
                      <span>Submitted</span>
                      <span>Status</span>
                      <span></span>
                    </div>

                    {/* Table Rows */}
                    {paginated.map((app) => {
                      const s =
                        STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                      return (
                        <div
                          key={app.id}
                          className="grid gap-4 px-6 py-4 mx-6 border-t border-gray-50 hover:bg-blue-50/30 transition-all items-center"
                          style={{
                            gridTemplateColumns:
                              "minmax(0,2.5fr) minmax(0,2fr) minmax(0,2fr) minmax(0,2fr) 110px",
                          }}
                        >
                          {/* Pet */}
                          <div className="flex items-center gap-3">
                            {app.pet?.images?.[0]?.file_url ? (
                              <img
                                src={app.pet.images[0].file_url}
                                alt={app.pet?.name}
                                className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <PawPrint size={18} className="text-gray-300" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 text-sm truncate">
                                {app.pet?.name || "—"}
                              </div>
                              <div className="text-gray-400 text-xs truncate">
                                {app.pet?.breed || app.pet?.species || "—"}
                              </div>
                            </div>
                          </div>

                          {/* Applicant */}
                          <div className="text-sm text-gray-700 truncate">
                            {app.applicant?.first_name}{" "}
                            {app.applicant?.last_name}
                          </div>

                          {/* Date */}
                          <div className="text-sm text-gray-500">
                            {formatDate(app.createdAt)}
                          </div>

                          {/* Status */}
                          <div>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.badge}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                              />
                              {app.status
                                .replace("_", " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                          </div>

                          {/* Action */}
                          <button
                            onClick={() =>
                              navigate(`/shelter/adoptions/${app.id}`)
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all whitespace-nowrap"
                          >
                            View details
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Mobile Cards ── */}
                  <div className="md:hidden px-4 py-4 space-y-3">
                    {paginated.map((app) => {
                      const s =
                        STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                      return (
                        <div
                          key={app.id}
                          className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-all bg-white shadow-sm"
                        >
                          {/* Top row — pet + status */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              {app.pet?.images?.[0]?.file_url ? (
                                <img
                                  src={app.pet.images[0].file_url}
                                  alt={app.pet?.name}
                                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <PawPrint
                                    size={20}
                                    className="text-gray-300"
                                  />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {app.pet?.name || "—"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {app.pet?.breed || app.pet?.species || "—"}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${s.badge}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                              />
                              {app.status
                                .replace("_", " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                          </div>

                          {/* Details row */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span className="font-medium text-gray-700">
                              {app.applicant?.first_name}{" "}
                              {app.applicant?.last_name}
                            </span>
                            <span>{formatDateShort(app.createdAt)}</span>
                          </div>

                          {/* Action */}
                          <button
                            onClick={() =>
                              navigate(`/shelter/adoptions/${app.id}`)
                            }
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition-all"
                          >
                            View Details
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Footer count */}
              {filtered.length > 0 && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-gray-400">
                    Showing{" "}
                    {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}
                    –{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of{" "}
                    {filtered.length} requests
                  </p>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        ‹
                      </button>

                      <span className="text-xs text-gray-400 font-medium px-1">
                        {page} / {totalPages}
                      </span>

                      <button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
