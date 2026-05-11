import { useEffect, useState, useRef } from "react";
import ApiService from "../services/Apiservices";
import {
  Users, UserCheck, UserX, UserPlus,
  Search, ChevronLeft, ChevronRight,
  Trash2, Ban, CheckCircle, Loader2,
  ChevronDown, Menu, X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../components/common/Adminsidebar";


const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <div style={{ background: "#fff", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "12px" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>{title}</span>
      <div style={{ background: bgColor, borderRadius: "10px", padding: "8px", display: "flex" }}>
        <Icon size={18} color={color} />
      </div>
    </div>
    <span style={{ fontSize: "32px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>{value ?? "..."}</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Active:  { bg: "#D1FAE5", color: "#065F46" },
    Pending: { bg: "#FFF3CD", color: "#856404" },
    Banned:  { bg: "#FEE2E2", color: "#991B1B" },
  };
  const s = styles[status] || styles.Pending;
  return <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 700 }}>{status}</span>;
};

const RoleBadge = ({ role }) => {
  const styles = {
    admin:   { bg: "#EEF2FF", color: "#4F46E5" },
    shelter: { bg: "#FEF3C7", color: "#D97706" },
    adopter: { bg: "#F0FDF4", color: "#16A34A" },
  };
  const s = styles[role] || styles.adopter;
  return <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 700, textTransform: "capitalize" , display: "inline-flex", alignItems: "center" }}>{role}</span>;
};

const ConfirmModal = ({ message, onConfirm, onCancel, confirmLabel = "Confirm", confirmColor = "#EF4444" }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
    <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "90%", maxWidth: "380px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
      <p style={{ fontSize: "15px", color: "#111827", marginBottom: "20px", fontWeight: 500 }}>{message}</p>
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer", fontSize: "13px", color: "#374151" }}>Cancel</button>
        <button onClick={onConfirm} style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: confirmColor, cursor: "pointer", fontSize: "13px", color: "#fff", fontWeight: 600 }}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);

const UserManagement = () => {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRole]       = useState("");
  const [page, setPage]             = useState(1);
  const [confirm, setConfirm]       = useState(null);
  const [actionLoading, setAL]      = useState(null);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [toast, setToast]           = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const detailRef = useRef(null);
  const navigate  = useNavigate();
  const location  = useLocation();
  const LIMIT = 5;

  const showToast = (msg, color = "#22c55e") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async (p = page, s = search, r = roleFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: LIMIT });
      if (s) params.append("search", s);
      if (r) params.append("role", r);
      const res = await ApiService.get(`/admin/users?${params.toString()}`);
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchUsers(1, search, roleFilter); }, 400);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".role-dropdown")) setRoleDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePageChange = (newPage) => { setPage(newPage); fetchUsers(newPage, search, roleFilter); };

  const fetchUserDetail = async (userId) => {
    setDetailLoading(true);
    setSelectedUser(userId);
    try {
      const res = await ApiService.get(`/admin/users/${userId}`);
      setUserDetail(res.data.data);
    } catch (err) { console.error(err); }
    finally { setDetailLoading(false); }
  };

  const executeAction = async () => {
    if (!confirm) return;
    setAL(confirm.userId);
    try {
      if (confirm.type === "status") {
        await ApiService.patch(`/admin/users/${confirm.userId}/status`, { account_status: confirm.value });
        showToast(confirm.value === "Banned" ? "🚫 User banned!" : "✅ User activated!", confirm.value === "Banned" ? "#EF4444" : "#22c55e");
      }
      if (confirm.type === "delete") {
        await ApiService.del(`/admin/users/${confirm.userId}`);
        showToast("🗑️ User deleted!", "#6B7280");
      }
      await fetchUsers(page, search, roleFilter);
    } catch (err) {
      console.error(err);
      showToast("Something went wrong.", "#EF4444");
    } finally { setAL(null); setConfirm(null); }
  };

  const stats = data?.stats;

  return (
    <>
      <style>{`
        .um-page { display: flex; min-height: 100vh; font-family: 'DM Sans', 'Segoe UI', sans-serif; background: #F3F4F6; }
        .um-main { flex: 1; padding: 28px; background: #F3F4F6; overflow-y: auto; }
        .um-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .um-table-scroll { overflow-x: auto; }
        .role-dropdown-menu div:hover { background: #F9FAFB !important; }
        @media (max-width: 768px) {
          .um-main { padding: 16px; }
          .um-stat-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .um-table-scroll { overflow-x: scroll; }
          .um-table { font-size: 11px; min-width: 480px; }
          .um-table th, .um-table td { padding: 8px 6px !important; }
          .um-filters { flex-direction: column !important; }
        }
      `}</style>

      {toast && <div style={{ position: "fixed", top: "20px", right: "20px", background: toast.color, color: "#fff", padding: "12px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, zIndex: 999 }}>{toast.msg}</div>}
      {confirm && <ConfirmModal message={confirm.message} confirmLabel={confirm.confirmLabel} confirmColor={confirm.confirmColor} onConfirm={executeAction} onCancel={() => setConfirm(null)} />}

      <div className="um-page">
        <AdminSidebar />

        <div className="um-main">
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px 24px", marginBottom: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#111827" }}>User Management</h2>
              <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>Click on a user name to view full details.</p>
            </div>
          </div>

          <div className="um-stat-grid">
            <StatCard title="Total users"   value={stats?.totalUsers}   icon={Users}     color="#4F46E5" bgColor="#EEF2FF" />
            <StatCard title="Active users"  value={stats?.activeUsers}  icon={UserCheck} color="#10B981" bgColor="#ECFDF5" />
            <StatCard title="New this week" value={stats?.newThisWeek}  icon={UserPlus}  color="#F59E0B" bgColor="#FFFBEB" />
            <StatCard title="Banned users"  value={stats?.bannedUsers}  icon={UserX}     color="#EF4444" bgColor="#FEF2F2" />
          </div>

          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="um-filters" style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#F9FAFB", borderRadius: "10px", padding: "8px 14px", border: "1px solid #E5E7EB", flex: 1, minWidth: "180px" }}>
                <Search size={14} color="#9CA3AF" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", flex: 1, minWidth: 0 }} />
              </div>

              {/* Custom Dropdown */}
              <div className="role-dropdown" style={{ position: "relative" }}>
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  style={{ border: "1px solid #E5E7EB", borderRadius: "10px", padding: "8px 14px", fontSize: "13px", background: "#F9FAFB", color: "#374151", cursor: "pointer", outline: "none", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap", height: "100%" }}
                >
                  {roleFilter ? roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1) : "All Roles"}
                  <ChevronDown size={14} />
                </button>
                {roleDropdownOpen && (
                  <div className="role-dropdown-menu" style={{ position: "absolute", top: "100%", left: 0, marginTop: "4px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, minWidth: "140px", overflow: "hidden" }}>
                    {["", "adopter", "shelter", "admin"].map((r) => (
                      <div
                        key={r}
                        onClick={() => { setRole(r); setPage(1); setRoleDropdownOpen(false); fetchUsers(1, search, r); }}
                        style={{ padding: "10px 14px", fontSize: "13px", color: roleFilter === r ? "#4F46E5" : "#374151", background: roleFilter === r ? "#EEF2FF" : "#fff", cursor: "pointer", fontWeight: roleFilter === r ? 600 : 400 }}
                      >
                        {r === "" ? "All Roles" : r.charAt(0).toUpperCase() + r.slice(1)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="um-table-scroll">
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}><Loader2 size={24} color="#4F46E5" /></div>
              ) : (
                <table className="um-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                      {["Name", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: "11px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.05em", whiteSpace: "nowrap",...(h === "ROLE" && { paddingLeft: "24px" }) }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data?.users?.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "#9CA3AF", fontSize: "14px" }}>No users found</td></tr>
                    ) : data?.users?.map((user) => (
                      <tr key={user.id} style={{ borderBottom: "1px solid #F9FAFB" }}>
                        <td style={{ padding: "14px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate(`/admin/users/${user.id}`)}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", color: "#4F46E5", flexShrink: 0 }}>
                              {user.first_name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <span style={{ fontSize: "14px", fontWeight: 500, color: "#4F46E5", whiteSpace: "nowrap", textDecoration: "underline" }}>{user.first_name} {user.last_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 12px", fontSize: "13px", color: "#6B7280" }}>{user.email}</td>
                        <td style={{ padding: "14px 12px" , verticalAlign: "middle"}}><RoleBadge role={user?.roleDetails?.name} /></td>
                        <td style={{ padding: "14px 12px" }}><StatusBadge status={user.account_status} /></td>
                        <td style={{ padding: "14px 12px", fontSize: "13px", color: "#6B7280", whiteSpace: "nowrap" }}>
                          {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {user.account_status !== "Banned" ? (
                              <button disabled={actionLoading === user.id} onClick={() => setConfirm({ type: "status", userId: user.id, value: "Banned", message: `Ban ${user.first_name}? They won't be able to login.`, confirmLabel: "Ban", confirmColor: "#EF4444" })}
                                style={{ border: "none", borderRadius: "8px", padding: "6px 10px", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", whiteSpace: "nowrap" }}>
                                <Ban size={13} /> Ban
                              </button>
                            ) : (
                              <button disabled={actionLoading === user.id} onClick={() => setConfirm({ type: "status", userId: user.id, value: "Active", message: `Activate ${user.first_name}'s account?`, confirmLabel: "Activate", confirmColor: "#10B981" })}
                                style={{ border: "none", borderRadius: "8px", padding: "6px 10px", background: "#D1FAE5", color: "#065F46", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", whiteSpace: "nowrap" }}>
                                <CheckCircle size={13} /> Activate
                              </button>
                            )}
                            <button disabled={actionLoading === user.id} onClick={() => setConfirm({ type: "delete", userId: user.id, message: `Permanently delete ${user.first_name}? This cannot be undone.`, confirmLabel: "Delete", confirmColor: "#EF4444" })}
                              style={{ border: "none", borderRadius: "8px", padding: "6px 10px", background: "#F3F4F6", color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", whiteSpace: "nowrap" }}>
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {data?.pagination && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #F3F4F6", flexWrap: "wrap", gap: "10px" }}>
                <span style={{ fontSize: "13px", color: "#6B7280" }}>Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, data.pagination.total)} of {data.pagination.total} users</span>
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

export default UserManagement;