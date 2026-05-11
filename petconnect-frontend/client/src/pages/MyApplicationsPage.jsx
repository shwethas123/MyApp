import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdoptionService from "../services/Adoptionservice";

const STATUS_CONFIG = {
  pending: {
    label: "Under review",
    color: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  approved: {
    label: "Approved",
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  home_visit: {
    label: "Home visit",
    color: "bg-purple-50 text-purple-700 border border-purple-200",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  completed: {
    label: "Adopted! 🎉",
    color: "bg-green-50 text-green-700 border border-green-200",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-50 text-red-700 border border-red-200",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  dissolved: {
    label: "Defunct",
    color: "bg-gray-50 text-gray-500 border border-gray-200",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
};

const TABS = [
  { key: "all",       label: "All" },
  { key: "pending",   label: "Under review" },
  { key: "approved",  label: "Approved" },
  { key: "home_visit",label: "Home visit" },
  { key: "completed", label: "Adopted" },
  { key: "rejected",  label: "Rejected" },
  { key: "dissolved", label: "Defunct" },
];

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [searchQuery, setSearchQuery]   = useState("");
  const [activeTab, setActiveTab]       = useState("all");

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await AdoptionService.getMyApplications();
      setApplications(response.data.data || response.data || []);
    } catch (err) {
      setError("Failed to load applications. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = useMemo(() => {
    let result = applications;

    // Filter by tab
    if (activeTab !== "all") {
      result = result.filter((app) => app.status === activeTab);
    }

    // Filter by search (name, species, breed only — not status, since tabs handle that)
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((app) => {
        const petName = app.pet?.name?.toLowerCase() || "";
        const species = app.pet?.species?.toLowerCase() || "";
        const breed   = app.pet?.breed?.toLowerCase() || "";
        return petName.includes(q) || species.includes(q) || breed.includes(q);
      });
    }

    return result;
  }, [applications, searchQuery, activeTab]);

  // Count per tab for badges
  const countByStatus = useMemo(() => {
    const counts = { all: applications.length };
    applications.forEach((app) => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  }, [applications]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Manage and track your journey to finding a new furry family member.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-5">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by pet name, species or breed…"
            className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {TABS.filter((tab) => tab.key === "all" || countByStatus[tab.key] > 0).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab.label}
                {countByStatus[tab.key] > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.key
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {countByStatus[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm">{error}</div>
        )}

        {/* Empty state — no applications at all */}
        {!loading && !error && applications.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
            </svg>
            <p className="text-lg font-medium">No applications yet</p>
            <p className="mt-1 text-sm">Browse pets and submit your first adoption application.</p>
            <button
              onClick={() => navigate("/browse")}
              className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Pets
            </button>
          </div>
        )}

        {/* No results after filtering */}
        {!loading && !error && applications.length > 0 && filteredApplications.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="text-base font-medium text-gray-500">No applications found</p>
            <p className="mt-1 text-sm">Try a different search term.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-sm text-blue-600 hover:underline font-medium"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Application cards */}
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
            return (
              <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-stretch h-26">
                  <div className="w-24 sm:w-28 flex-shrink-0">
                    {app.pet?.images?.[0] ? (
                      <img
                        src={app.pet.images[0].file_url}
                        alt={app.pet?.name}
                        className="w-full h-full object-cover"
                        style={{ minHeight: "96px" }}
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-50 flex items-center justify-center" style={{ minHeight: "96px" }}>
                        <svg className="w-8 h-8 text-blue-200" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 10c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6zm-4 9c0-2.21 3.582-4 8-4s8 1.79 8 4v1H3v-1z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 px-4 py-3 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-0.5">Pet Name</p>
                        <p className="text-base font-bold text-gray-900 truncate">{app.pet?.name || "Unknown Pet"}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${status.color}`}>
                        {status.icon}{status.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-0.5">Submitted</p>
                        <p className="text-sm text-gray-600 font-medium">{formatDate(app.createdAt)}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/my-applications/${app.id}`)}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all flex-shrink-0"
                      >
                        View details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}