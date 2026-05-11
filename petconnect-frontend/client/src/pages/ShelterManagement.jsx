import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../services/Apiservices";
import { Building2, Search, CheckCircle, Clock } from "lucide-react";
import AdminSidebar from "../components/common/Adminsidebar";


const toSentenceCase = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const toTitleCase = (str) => {
  if (!str) return str;
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
};
const statusColors = {
  Verified: { bg: "#D1FAE5", color: "#065F46", label: "Active" },
  Pending: { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
  Rejected: { bg: "#FEE2E2", color: "#991B1B", label: "Rejected" },
  Inactive: { bg: "#F3F4F6", color: "#374151", label: "Inactive" },
};

const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <div style={{ background: "#fff", borderRadius: "14px", padding: "18px 20px", flex: 1, minWidth: "140px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", boxSizing: "border-box" }}>
    <div>
      <div style={{ fontSize: "13px", color: "#6B7280", fontWeight: 500, marginBottom: "8px" }}>{title}</div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>{value}</div>
    </div>
    <div style={{ background: bgColor, borderRadius: "10px", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={20} color={color} />
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const s = statusColors[status] || statusColors.Inactive;
  return <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap" }}>{s.label}</span>;
};

const TypeBadge = ({ type }) => {
  const typeColors = {
    ngo: { bg: "#EEF2FF", color: "#4F46E5" },
    government: { bg: "#FEF3C7", color: "#92400E" },
    rescuer: { bg: "#D1FAE5", color: "#065F46" },
  };
  const t = typeColors[type?.toLowerCase()] || { bg: "#F3F4F6", color: "#374151" };
  const label = type?.toLowerCase() === "ngo"
    ? "NGO"
    : type
      ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
      : "—";
  return (
    <span style={{ background: t.bg, color: t.color, borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
};
const ShelterManagement = () => {
  const [stats, setStats] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchShelters = useCallback(async (searchVal, pageVal, statusVal, typeVal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageVal, limit: 10 });
      if (searchVal) params.append("search", searchVal);
      if (statusVal) params.append("status", statusVal);
      if (typeVal) params.append("type", typeVal);
      const res = await ApiService.get(`/admin/shelters?${params.toString()}`);
      setStats(res.data.stats);
      setShelters(res.data.shelters);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchShelters(search, page, statusFilter, typeFilter); }, [page, statusFilter, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchShelters(search, 1, statusFilter, typeFilter); }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <>
      <style>{`
  @media (max-width: 767px) {
    .mobile-hidden { display: none !important; }

  }

  @media (max-width: 767px) {
  .stat-cards > div { width: calc(50% - 7px) !important; flex: none !important; }
}
.shelter-table-wrap { overflow-x: hidden; }
  .custom-dropdown { position: relative; display: inline-block; }
  .custom-dropdown-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: #fff;
    border: 1.5px solid #E5E7EB;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 999;
    min-width: 130px;
    overflow: hidden;
  }
  .custom-dropdown-item {
    padding: 9px 16px;
    font-size: 13px;
    color: #374151;
    cursor: pointer;
    font-weight: 500;
  }
  .custom-dropdown-item:hover { background: #F3F4F6; }
  .custom-dropdown-item.active { background: #EEF2FF; color: #4F46E5; font-weight: 700; }
`}</style>

      <div style={{ display: "flex", minheight: "100vh", fontFamily: "'DM Sans', 'Inter', 'Segoe UI', sans-serif", background: "#F5F6FA", overflow: "hidden" }}>
        <AdminSidebar />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Header */}
          {/* <div style={{ background: "#fff", borderBottom: "1px solid #EBEBEB", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
              <Search size={15} color="#9CA3AF" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email"
                style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", color: "#374151", outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => e.target.style.border = "1.5px solid #4F46E5"}
                onBlur={(e) => e.target.style.border = "1.5px solid #E5E7EB"}
              />
            </div>
          </div> */}

          {/* Body */}
          <div style={{ flex: 1, padding: "20px" }}>
            <div style={{ background: "#fff", borderRadius: "16px", padding: "20px 24px", marginBottom: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
  <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#111827" }}>Shelter Management</h2>
  <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "14px" }}>Review, verify, and manage shelter partners across the network.</p>
</div>

            {/* Stat Cards */}
            <div className="stat-cards" style={{ display: "flex", gap: "14px", marginBottom: "20px", flexWrap: "wrap" }}>
              <StatCard title="Total shelters" value={stats?.totalShelters ?? "—"} icon={Building2} color="#4F46E5" bgColor="#EEF2FF" />
              <StatCard title="Pending verification" value={stats?.pendingVerification ?? "—"} icon={Clock} color="#D97706" bgColor="#FEF3C7" />
              <StatCard title="Active listings" value={stats?.activeListings ?? "—"} icon={CheckCircle} color="#059669" bgColor="#D1FAE5" />
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#111827" }}>All shelters</h3>
                  {loading && <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Updating...</span>}
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#F9FAFB", borderRadius: "10px", padding: "8px 14px", border: "1px solid #E5E7EB" }}>
    <Search size={14} color="#9CA3AF" />
    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or owner..."
      style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", minWidth: "200px" }} />
  </div>
                  {/* Type Filter */}
                  {/* <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                    style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", color: "#374151", outline: "none", cursor: "pointer", fontWeight: 500 }}>
                    <option value="">All Types</option>
                    <option value="ngo">NGO</option>
                    <option value="government">Government</option>
                    <option value="rescuer">Rescuer</option>
                  </select> */}
                  {/* Status Filter */}
                  <div className="custom-dropdown">
                    <button
                      onClick={() => setDropdownOpen((o) => !o)}
                      style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", color: "#374151", background: "#fff", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      {statusFilter === "" ? "All status" : statusFilter === "Verified" ? "Active" : statusFilter}
                      <span style={{ fontSize: "10px", color: "#9CA3AF" }}>▼</span>
                    </button>
                    {dropdownOpen && (
                      <>
                        {/* Backdrop to close on outside click */}
                        <div onClick={() => setDropdownOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 998 }} />
                        <div className="custom-dropdown-menu">
                          {[{ label: "All status", value: "" }, { label: "Active", value: "Verified" }, { label: "Pending", value: "Pending" }, { label: "Rejected", value: "Rejected" }].map((opt) => (
                            <div key={opt.value}
                              className={`custom-dropdown-item${statusFilter === opt.value ? " active" : ""}`}
                              onClick={() => { setStatusFilter(opt.value); setPage(1); setDropdownOpen(false); }}>
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>
              <div className="shelter-table-wrap" style={{ opacity: loading ? 0.4 : 1, transition: "opacity 0.2s ease", overflowX: "auto", overflowY: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB" }}>
                      {["Organization name", "Email", "Owner name", "Type", "Status", "Action"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontSize: "11px", fontWeight: 700, color: "#374151", letterSpacing: "0.07em", borderBottom: "1px solid #F0F0F0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shelters.length > 0 ? shelters.map((shelter) => (
                      <tr key={shelter.id} style={{ borderBottom: "1px solid #F3F4F6", transition: "background 0.15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#FAFAFA"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "14px", fontSize: "14px", fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>{toTitleCase(shelter.name)}</td>
                        <td style={{ padding: "14px", fontSize: "13px", color: "#4B5563" }}>{shelter.contact_email?.toLowerCase()}</td>
                        <td style={{ padding: "14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: shelter.owner ? "#EEF2FF" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", color: shelter.owner ? "#4F46E5" : "#9CA3AF", flexShrink: 0 }}>
                              {shelter.owner?.first_name?.[0] || "?"}
                            </div>
                            <span style={{ fontSize: "13px", color: shelter.owner ? "#374151" : "#9CA3AF", whiteSpace: "nowrap" }}>
                              {shelter.owner ? `${toSentenceCase(shelter.owner.first_name)} ${toSentenceCase(shelter.owner.last_name)}` : "—"}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "14px" }}><TypeBadge type={shelter.type} /></td>
                        <td style={{ padding: "14px" }}><StatusBadge status={shelter.status} /></td>
                        <td style={{ padding: "14px" }}>
                          <button onClick={() => navigate(`/admin/shelters/${shelter.id}`)}
                            style={{ background: "#4F46E5", color: "#fff", border: "none", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                            onMouseEnter={(e) => e.target.style.background = "#4338CA"}
                            onMouseLeave={(e) => e.target.style.background = "#4F46E5"}>
                            View details
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#9CA3AF", fontSize: "14px" }}>
                        No shelters found
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", flexWrap: "wrap", gap: "10px" }}>
                  <span style={{ fontSize: "13px", color: "#6B7280" }}>
                    Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", fontSize: "13px", cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#D1D5DB" : "#374151" }}>
                      ‹ Previous
                    </button>
                    <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                      style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", fontSize: "13px", cursor: page === pagination.totalPages ? "not-allowed" : "pointer", color: page === pagination.totalPages ? "#D1D5DB" : "#374151" }}>
                      Next ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShelterManagement;