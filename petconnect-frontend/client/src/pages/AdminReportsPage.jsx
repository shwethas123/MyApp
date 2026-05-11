// src/pages/AdminReportsPage.jsx
import { useEffect, useState, useRef } from "react";
import ApiService from "../services/Apiservices";
import {
  Search, ChevronLeft, ChevronRight, Loader2,
  ShieldCheck, ShieldX, Clock, Flag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/common/Adminsidebar";

// ── Custom Dropdown ────────────────────────────────────────────────────────
function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative", minWidth: "140px" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "8px", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "8px 14px",
          fontSize: "13px", background: "#F9FAFB", color: "#374151", cursor: "pointer", outline: "none",
        }}
      >
        {selected?.label || "All Status"}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)", zIndex: 50, overflow: "hidden",
        }}>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: "10px 14px", fontSize: "13px", cursor: "pointer",
                background: value === opt.value ? "#EEF2FF" : "#fff",
                color: value === opt.value ? "#4F46E5" : "#374151",
                fontWeight: value === opt.value ? 600 : 400,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = value === opt.value ? "#EEF2FF" : "#F9FAFB"}
              onMouseLeave={(e) => e.currentTarget.style.background = value === opt.value ? "#EEF2FF" : "#fff"}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <div style={{ background: "#fff", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "12px" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>{title}</span>
      <div style={{ background: bgColor, borderRadius: "10px", padding: "8px", display: "flex" }}>
        <Icon size={18} color={color} />
      </div>
    </div>
    <span style={{ fontSize: "24px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>
      {value ?? "..."}
    </span>
  </div>
);

// ── Status Badge ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    pending:   { bg: "#FFF3CD", color: "#856404" },
    reviewed:  { bg: "#CCE5FF", color: "#004085" },
    resolved:  { bg: "#D4EDDA", color: "#155724" },
    dismissed: { bg: "#E2E3E5", color: "#383D41" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
      {status}
    </span>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const AdminReportsPage = () => {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatus] = useState("");
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const navigate = useNavigate();

  const fetchReports = async (p = page, s = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 10 });
      if (s) params.append("status", s);
      const res = await ApiService.get("/admin/reports?" + params.toString());
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchReports(1, statusFilter); }, 300);
    return () => clearTimeout(timer);
  }, [statusFilter]);

  const handlePageChange = (newPage) => { setPage(newPage); fetchReports(newPage, statusFilter); };

  const filteredReports = data?.reports?.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.reporter?.first_name?.toLowerCase().includes(q) ||
      r.reporter?.last_name?.toLowerCase().includes(q)  ||
      r.reporter?.email?.toLowerCase().includes(q)      ||
      r.reportedUser?.first_name?.toLowerCase().includes(q) ||
      r.reportedUser?.last_name?.toLowerCase().includes(q)  ||
      r.reportedUser?.email?.toLowerCase().includes(q)  ||
      r.reason?.toLowerCase().includes(q)
    );
  });

  const stats = data?.stats;

  return (
    <>
      <style>{`
        .reports-page     { display: flex; min-height: 100vh; font-family: 'DM Sans', 'Segoe UI', sans-serif; background: #F3F4F6; }
        .main-content     { flex: 1; padding: 28px; background: #F3F4F6; overflow-y: auto; }
        .stat-grid        { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .filter-bar       { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
        .table-scroll     { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .report-row       { cursor: pointer; transition: background 0.12s; }
        .report-row:hover { background: #F5F7FF !important; }
        @keyframes spin   { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .main-content  { padding: 16px; }
          .stat-grid     { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .filter-bar    { flex-direction: column; align-items: stretch; }
          .reports-table { font-size: 11px; min-width: 560px; }
          .reports-table th, .reports-table td { padding: 8px 6px !important; }
        }
      `}</style>

      <div className="reports-page">
        <AdminSidebar />

        <div className="main-content">

          {/* Header */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px 24px", marginBottom: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#111827" }}>Report & Abuse</h2>
            <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>Click on a report row to view full details and take action.</p>
          </div>

          {/* Stat Cards */}
          <div className="stat-grid">
            <StatCard title="Total reports"  value={stats?.totalReports}   icon={Flag}        color="#4F46E5" bgColor="#EEF2FF" />
            <StatCard title="Pending review" value={stats?.pendingCount}   icon={Clock}       color="#F59E0B" bgColor="#FFFBEB" />
            <StatCard title="Resolved"       value={stats?.resolvedCount}  icon={ShieldCheck} color="#10B981" bgColor="#ECFDF5" />
            <StatCard title="Dismissed"      value={stats?.dismissedCount} icon={ShieldX}     color="#6B7280" bgColor="#F3F4F6" />
          </div>

          {/* Table Card */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

            {/* Filters */}
            <div className="filter-bar">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#F9FAFB", borderRadius: "10px", padding: "8px 14px", border: "1px solid #E5E7EB", flex: 1, minWidth: "180px" }}>
                <Search size={14} color="#9CA3AF" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email or reason..."
                  style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", flex: 1, minWidth: 0 }}
                />
              </div>

              <CustomSelect
                value={statusFilter}
                onChange={(val) => { setStatus(val); setPage(1); }}
                options={[
                  { value: "",          label: "All Status" },
                  { value: "pending",   label: "Pending"    },
                  { value: "reviewed",  label: "Reviewed"   },
                  { value: "resolved",  label: "Resolved"   },
                  { value: "dismissed", label: "Dismissed"  },
                ]}
              />
            </div>

            {/* Table */}
            <div className="table-scroll">
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                  <Loader2 size={24} color="#4F46E5" style={{ animation: "spin 0.7s linear infinite" }} />
                </div>
              ) : (
                <table className="reports-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                      {["ID", "Reported by", "Reported user", "Reason", "Date", "Status"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: "11px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {!filteredReports?.length ? (
                      <tr><td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "#9CA3AF", fontSize: "14px" }}>No reports found</td></tr>
                    ) : filteredReports.map((report) => (
                      <tr
                        key={report.id}
                        className="report-row"
                        onClick={() => navigate(`/admin/reports/${report.id}`)}
                        style={{ borderBottom: "1px solid #F9FAFB" }}
                      >
                        <td style={{ padding: "14px 12px", fontSize: "13px", color: "#4F46E5", fontWeight: 600 }}>#{report.id}</td>
                        <td style={{ padding: "14px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "11px", color: "#4F46E5", flexShrink: 0 }}>
                              {report.reporter?.first_name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: 500, color: "#111827", whiteSpace: "nowrap" }}>{report.reporter?.first_name} {report.reporter?.last_name}</div>
                              <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{report.reporter?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "11px", color: "#EF4444", flexShrink: 0 }}>
                              {report.reportedUser?.first_name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: 500, color: "#111827", whiteSpace: "nowrap" }}>{report.reportedUser?.first_name} {report.reportedUser?.last_name}</div>
                              <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{report.reportedUser?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 12px", maxWidth: "180px" }}>
                          <div style={{ fontSize: "13px", color: "#374151", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{report.reason}</div>
                          {report.details && <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{report.details}</div>}
                        </td>
                        <td style={{ padding: "14px 12px", fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>
                          {new Date(report.createdAt ?? report.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td style={{ padding: "14px 12px" }}><StatusBadge status={report.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {data?.pagination && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #F3F4F6", flexWrap: "wrap", gap: "10px" }}>
                <span style={{ fontSize: "13px", color: "#6B7280" }}>
                  Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, data.pagination.total)} of {data.pagination.total} reports
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}
                    style={{ border: "1px solid #E5E7EB", borderRadius: "8px", padding: "6px 12px", background: page === 1 ? "#F9FAFB" : "#fff", cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#9CA3AF" : "#374151", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px" }}>
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button onClick={() => handlePageChange(page + 1)} disabled={page >= data.pagination.totalPages}
                    style={{ border: "1px solid #E5E7EB", borderRadius: "8px", padding: "6px 12px", background: page >= data.pagination.totalPages ? "#F9FAFB" : "#fff", cursor: page >= data.pagination.totalPages ? "not-allowed" : "pointer", color: page >= data.pagination.totalPages ? "#9CA3AF" : "#374151", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px" }}>
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminReportsPage;