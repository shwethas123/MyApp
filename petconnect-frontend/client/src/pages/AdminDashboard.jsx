import { useEffect, useState } from "react";
import ApiService from "../services/Apiservices";
import {
  LayoutDashboard, Building2, Users, BarChart2,
  PawPrint, CheckCircle, UserPlus, ClipboardList,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Flag } from "lucide-react";
import AdminSidebar from "../components/common/Adminsidebar";
import useAuth from "../hooks/AuthContext";


const statusColors = {
  pending: { bg: "#FFF3CD", color: "#856404", label: "Pending" },
  approved: { bg: "#D4EDDA", color: "#155724", label: "Approved" },
  rejected: { bg: "#F8D7DA", color: "#721C24", label: "Rejected" },
  home_visit: { bg: "#D1ECF1", color: "#0C5460", label: "Home visit" },
  payment_pending: { bg: "#CCE5FF", color: "#004085", label: "Paid" },
  completed: { bg: "#D4EDDA", color: "#155724", label: "Completed" },
  dissolved: { bg: "#E2E3E5", color: "#383D41", label: "Dissolved" },
};

const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <div style={{
    background: "#fff", borderRadius: "16px", padding: "20px 24px",
    flex: 1, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    display: "flex", flexDirection: "column", gap: "12px", minWidth: "180px",
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>{title}</span>
      <div style={{ background: bgColor, borderRadius: "10px", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} color={color} />
      </div>
    </div>
    <span style={{ fontSize: "32px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>{value}</span>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const LIMIT = 5;
  const { currentUser } = useAuth();

  // const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    ApiService.get("/admin/dashboard")
      .then((res) => {
        setStats(res.data);
        setFilteredRequests(res.data.recentRequests || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  useEffect(() => {
    setFilterLoading(true);
    const status = statusFilter ? `&status=${statusFilter}` : "";
    ApiService.get(`/admin/applications?limit=${LIMIT}&page=${currentPage}${status}`)
      .then((res) => {
        setFilteredRequests(res.data.adoptions || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setFilterLoading(false));
  }, [statusFilter, currentPage]);

  return (
    <div style={{ display: "flex", minhHeight: "100vh", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#F3F4F6", overflow: "hidden" }}>

      <AdminSidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowX: "auto" }}>
        <div style={{ flex: 1, padding: "16px" }}>

          {/* Greeting */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px 28px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#111827" }}>
               Hello {currentUser.roleDetails?.name === "admin" ? "Admin" : currentUser?.name}!! 👋
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "14px" }}>
                Here's what's happening at PetConnect today.
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
            <StatCard title="Total pets" value={stats?.totalPets ?? "..."} icon={PawPrint} color="#4F46E5" bgColor="#EEF2FF" />
            <StatCard title="Pending adoptions" value={stats?.pendingAdoptions ?? "..."} icon={ClipboardList} color="#F59E0B" bgColor="#FFFBEB" />
            <StatCard title="Successful adoptions" value={stats?.successfulAdoptions ?? "..."} icon={CheckCircle} color="#10B981" bgColor="#ECFDF5" />
            <StatCard title="Weekly new users" value={stats?.newUsers ?? "..."} icon={UserPlus} color="#EF4444" bgColor="#FEF2F2" />
          </div>

          {/* Recent Requests Table */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

            {/* Table Header with Filter */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                Recent adoption requests
              </h3>

              <div style={{ position: "relative", display: "inline-block" }}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", color: "#374151", background: "#fff", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
                >
                  {statusFilter === "" ? "All status"
                    : statusFilter === "payment_pending" ? "PAID"
                      : statusFilter === "home_visit" ? "Home Visit"
                        : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  <span style={{ fontSize: "10px", color: "#9CA3AF" }}>▼</span>
                </button>

                {dropdownOpen && (
                  <>
                    <div onClick={() => setDropdownOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 998 }} />
                    <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 999, minWidth: "fit-content", width: "fit-content", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {[
                        { label: "All status", value: "" },
                        { label: "Pending", value: "pending" },
                        { label: "Approved", value: "approved" },
                        { label: "Home visit", value: "home_visit" },
                        { label: "Paid", value: "payment_pending" },
                        { label: "Completed", value: "completed" },
                        { label: "Rejected", value: "rejected" },
                        { label: "Dissolved", value: "dissolved" },
                      ].map((opt) => (
                        <div key={opt.value}
                          onClick={() => { setStatusFilter(opt.value); setDropdownOpen(false); }}
                          style={{ padding: "9px 16px", fontSize: "13px", cursor: "pointer", fontWeight: statusFilter === opt.value ? 700 : 500, color: statusFilter === opt.value ? "#4F46E5" : "#374151", background: statusFilter === opt.value ? "#EEF2FF" : "transparent" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = statusFilter === opt.value ? "#EEF2FF" : "#F3F4F6"}
                          onMouseLeave={(e) => e.currentTarget.style.background = statusFilter === opt.value ? "#EEF2FF" : "transparent"}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ overflowX: "auto", overflowY: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                    {["Applicant", "Pet", "Date", "Status", "Action"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: "11px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filterLoading ? (
                    <tr><td colSpan={5} style={{ padding: "30px", textAlign: "center", color: "#9CA3AF", fontSize: "14px" }}>Loading...</td></tr>
                  ) : filteredRequests.length > 0 ? filteredRequests.map((req) => {
                    const statusStyle = statusColors[req.status] || statusColors.Pending;
                    const date = new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    return (
                      <tr key={req.id} style={{ borderBottom: "1px solid #F9FAFB" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#FAFAFA"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "14px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", color: "#4F46E5", flexShrink: 0 }}>
                              {req.applicant?.first_name?.[0] || "?"}
                            </div>
                            <span style={{ fontSize: "14px", fontWeight: 500, color: "#111827", whiteSpace: "nowrap" }}>
{req.applicant?.first_name?.charAt(0).toUpperCase()}{req.applicant?.first_name?.slice(1).toLowerCase()} {req.applicant?.last_name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 12px", fontSize: "14px", color: "#374151", whiteSpace: "nowrap" }}>
                    {req.pet?.name?.charAt(0).toUpperCase()}{req.pet?.name?.slice(1).toLowerCase()} <span style={{ color: "#9CA3AF" }}>({req.pet?.breed?.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())})</span>
                        </td>
                        <td style={{ padding: "14px 12px", fontSize: "13px", color: "#6B7280", whiteSpace: "nowrap" }}>{date}</td>
                        <td style={{ padding: "14px 12px" }}>
                          <span style={{ background: statusStyle.bg, color: statusStyle.color, borderRadius: "20px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
                            {statusStyle.label}
                          </span>
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          <button
                            onClick={() => navigate(`/admin/applications/${req.id}`)}
                            style={{ background: "#4F46E5", color: "#fff", border: "none", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                            onMouseEnter={(e) => e.target.style.background = "#4338CA"}
                            onMouseLeave={(e) => e.target.style.background = "#4F46E5"}
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={5} style={{ padding: "30px", textAlign: "center", color: "#9CA3AF", fontSize: "14px" }}>
                        No adoption requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
           {totalPages > 1 && (
  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: "20px", gap: "8px" }}>
    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
      style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", fontSize: "13px", cursor: currentPage === 1 ? "not-allowed" : "pointer", color: currentPage === 1 ? "#D1D5DB" : "#374151" }}>
      ‹ Previous
    </button>
    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
      style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", fontSize: "13px", cursor: currentPage === totalPages ? "not-allowed" : "pointer", color: currentPage === totalPages ? "#D1D5DB" : "#374151" }}>
      Next ›
    </button>
  </div>
)}


          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
