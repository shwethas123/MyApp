import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import {
  LayoutDashboard, PawPrint, TrendingUp, TrendingDown,
  IndianRupee, Flag,
} from "lucide-react";
import ApiService from "../services/Apiservices";
import AdminSidebar from "../components/common/Adminsidebar";

// ── KPI CARD ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, change, positive, icon: Icon, iconBg, iconColor }) {
  return (
    <div style={{
      background: "#fff", borderRadius: "12px", border: "1px solid #F3F4F6",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div>
        <p style={{
          fontSize: "10px", fontWeight: 600, color: "#9CA3AF",
          textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px 0",
        }}>{label}</p>
        <p style={{ fontSize: "26px", fontWeight: 700, color: "#1B3A4B", margin: "0 0 4px 0", lineHeight: 1 }}>
          {value}
        </p>
        {change && (
          <p style={{
            fontSize: "11px", margin: 0, display: "flex", alignItems: "center",
            gap: "3px", color: positive ? "#48BB78" : "#F87171",
          }}>
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {change}
          </p>
        )}
      </div>
      <div style={{
        width: "36px", height: "36px", borderRadius: "10px",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }} className={iconBg}>
        <Icon size={16} className={iconColor} />
      </div>
    </div>
  );
}

const BREED_COLORS   = ["#3182CE", "#90CDF4", "#1A365D", "#CBD5E0", "#63B3ED"];
const REPORTS_COLORS = ["#F87171", "#60A5FA"];

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const reportRef             = useRef(null);
  const [petPage, setPetPage] = useState(1);
  const petsPerPage = 10;
  const [petSortOrder, setPetSortOrder]         = useState("desc");
  const [shelterSortOrder, setShelterSortOrder] = useState("desc");
  const [shelterPage, setShelterPage] = useState(1);
  const sheltersPerPage = 5;

  useEffect(() => {
    ApiService.get("/admin/analytics")
      .then((res) => setData(res.data.data))
      .catch((err) => { console.error(err); setError("Failed to load analytics data."); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{`
        .analytics-page { display: flex; min-height: 100vh; background: #F5F7FA; }
        .analytics-main { flex: 1; padding: 24px; overflow-y: auto; }

        .kpi-grid-all {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .chart-grid-2  { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .analytics-card { background: #fff; border-radius: 12px; border: 1px solid #F3F4F6; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 20px; margin-bottom: 16px; }
        .shelters-table { width: 100%; border-collapse: collapse; }
        .pets-table     { width: 100%; border-collapse: collapse; }
        .table-scroll   { overflow-x: auto; -webkit-overflow-scrolling: touch; }

        @media (max-width: 768px) {
          .analytics-main { padding: 12px; }
          .chart-grid-2   { grid-template-columns: 1fr; gap: 12px; }
          .analytics-card { padding: 14px; }
          .shelters-table { min-width: 520px; font-size: 11px; }
          .pets-table     { min-width: 480px; font-size: 11px; }
          .shelters-table th, .shelters-table td { padding: 8px 6px !important; }
          .pets-table th,     .pets-table td     { padding: 8px 6px !important; }
          .pie-flex    { flex-direction: column; align-items: center; gap: 12px !important; }
          .pie-legend  { width: 100% !important; }
          .header-row  { flex-direction: column; align-items: flex-start !important; gap: 10px; }
          .export-btn  { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="analytics-page">
        <AdminSidebar />
        <div className="analytics-main" ref={reportRef}>

          {/* Header */}
          <div className="header-row" style={{
            background: "#fff", borderRadius: "16px", padding: "20px 24px",
            marginBottom: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0 }}>
                Reports & Analytics
              </h1>
              <p style={{ fontSize: "14px", color: "#6B7280", margin: "4px 0 0 0" }}>
                Monitor adoption metrics and organizational trends across all active regions.
              </p>
            </div>
          </div>

          {loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
              <p style={{ fontSize: "13px", color: "#9CA3AF" }}>Loading analytics...</p>
            </div>
          )}
          {error && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA", color: "#F87171",
              fontSize: "13px", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px",
            }}>{error}</div>
          )}

          {!loading && data && (
            <>
              {/* ── KPIs ── */}
              <div className="kpi-grid-all">
                <KpiCard label="Total Adoptions"        value={data.kpis.totalAdoptions.toLocaleString()}        icon={PawPrint}        iconBg="bg-blue-50"   iconColor="text-blue-400"   />
                <KpiCard label="Active Listings"        value={data.kpis.activeListings.toLocaleString()}        icon={LayoutDashboard} iconBg="bg-purple-50" iconColor="text-purple-400" />
                <KpiCard label="Platform Conversion Rate" value={`${data.kpis.successRate}%`}                   icon={TrendingUp}      iconBg="bg-orange-50" iconColor="text-orange-400" />
                <KpiCard label="Rejection Rate"       value={`${data.kpis.abandonmentRate}%`}                 icon={TrendingDown}    iconBg="bg-green-50"  iconColor="text-green-500"  />
                <KpiCard label="Avg Adoption Fee"       value={`₹${data.kpis.avgAdoptionFee.toLocaleString()}`} icon={IndianRupee}     iconBg="bg-teal-50"   iconColor="text-teal-500"   />
              </div>

              {/* Adoption Rate by City */}
              <div className="analytics-card">
                <div style={{
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                  marginBottom: "16px", flexWrap: "wrap", gap: "8px",
                }}>
                  <div>
                    <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#1B3A4B", margin: 0 }}>
                      Adoption rate by city
                    </h2>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "18px", fontWeight: 700, color: "#1B3A4B", margin: 0 }}>
                      {data.kpis.totalAdoptions.toLocaleString()}
                    </p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.adoptionRateByCity} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="city" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} cursor={{ fill: "#EBF8FF" }} />
                    <Bar dataKey="adoptions" fill="#3182CE" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Performing Shelters */}
              {/* Top Performing Shelters */}
<div className="analytics-card">
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
    <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#1B3A4B", margin: 0 }}>
      Top performing shelters
    </h2>
    <button
      onClick={() => {
        setShelterSortOrder(o => o === "desc" ? "asc" : "desc");
        setShelterPage(1);
      }}
      style={{
        fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px",
        border: "1px solid #E5E7EB", background: "#fff", color: "#1B3A4B",
        cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
      }}
    >
      {shelterSortOrder === "desc" ? "↓ Descending" : "↑ Ascending"}
    </button>
  </div>
  <div className="table-scroll">
    <table className="shelters-table">
      <thead>
        <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
          {["SHELTER NAME", "LOCATION", "TYPE", "PETS LISTED", "SUCCESS RATE"].map((h) => (
            <th key={h} style={{
              textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#9CA3AF",
              paddingBottom: "10px", paddingRight: "12px", whiteSpace: "nowrap",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(() => {
          const sorted = [...data.topShelters].sort((a, b) =>
            shelterSortOrder === "desc" ? b.successRate - a.successRate : a.successRate - b.successRate
          );
          const totalPages = Math.ceil(sorted.length / sheltersPerPage);
          const paginated = sorted.slice((shelterPage - 1) * sheltersPerPage, shelterPage * sheltersPerPage);

          return (
            <>
              {paginated.map((shelter) => (
                <tr key={shelter.id} style={{ borderBottom: "1px solid #F9FAFB" }}>
                  <td style={{ padding: "12px 12px 12px 0" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#1B3A4B" }}>{shelter.name}</span>
                  </td>
                  <td style={{ padding: "12px 12px 12px 0" }}>
                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{shelter.location}</span>
                  </td>
                  <td style={{ padding: "12px 12px 12px 0" }}>
                    <span style={{
                      fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px",
                      textTransform: "capitalize",
                      ...(shelter.type === "ngo"
                        ? { background: "#EFF6FF", color: "#3182CE" }
                        : shelter.type === "government"
                        ? { background: "#F0FFF4", color: "#48BB78" }
                        : { background: "#FFF7ED", color: "#F6AD55" })
                    }}>
                      {shelter.type}
                    </span>
                  </td>
                  <td style={{ padding: "12px 12px 12px 0" }}>
                    <span style={{ fontSize: "12px", color: "#6B7280" }}>{shelter.totalListed}</span>
                  </td>
                  <td style={{ padding: "12px 12px 12px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ flex: 1, background: "#F3F4F6", borderRadius: "99px", height: "6px", maxWidth: "100px" }}>
                        <div style={{
                          height: "6px", borderRadius: "99px", width: `${shelter.successRate}%`,
                          background: shelter.successRate >= 50 ? "#48BB78" : "#F6AD55",
                        }} />
                      </div>
                      <span style={{ fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>{shelter.successRate}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 0" }} />
                </tr>
              ))}
            </>
          );
        })()}
      </tbody>
    </table>
  </div>

  {/* Pagination */}
  {(() => {
    const sorted = [...data.topShelters].sort((a, b) =>
      shelterSortOrder === "desc" ? b.successRate - a.successRate : a.successRate - b.successRate
    );
    const totalPages = Math.ceil(sorted.length / sheltersPerPage);
    if (totalPages <= 1) return null;
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #F3F4F6",
      }}>
        <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
          Showing {(shelterPage - 1) * sheltersPerPage + 1}–{Math.min(shelterPage * sheltersPerPage, sorted.length)} of {sorted.length} shelters
        </p>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => setShelterPage(p => Math.max(1, p - 1))}
            disabled={shelterPage === 1}
            style={{
              fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px",
              border: "1px solid #E5E7EB", background: shelterPage === 1 ? "#F9FAFB" : "#fff",
              color: shelterPage === 1 ? "#D1D5DB" : "#1B3A4B", cursor: shelterPage === 1 ? "not-allowed" : "pointer",
            }}
          >← Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setShelterPage(page)}
              style={{
                fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px",
                border: "1px solid #E5E7EB",
                background: shelterPage === page ? "#1B3A4B" : "#fff",
                color: shelterPage === page ? "#fff" : "#1B3A4B",
                cursor: "pointer",
              }}
            >{page}</button>
          ))}
          <button
            onClick={() => setShelterPage(p => Math.min(totalPages, p + 1))}
            disabled={shelterPage === totalPages}
            style={{
              fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px",
              border: "1px solid #E5E7EB", background: shelterPage === totalPages ? "#F9FAFB" : "#fff",
              color: shelterPage === totalPages ? "#D1D5DB" : "#1B3A4B", cursor: shelterPage === totalPages ? "not-allowed" : "pointer",
            }}
          >Next →</button>
        </div>
      </div>
    );
  })()}
</div>

              {/* Most Adopted Breeds + Abandonment Trends */}
              <div className="chart-grid-2">
                <div className="analytics-card" style={{ marginBottom: 0 }}>
                  <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#1B3A4B", margin: "0 0 14px 0" }}>
                    Most adopted breeds
                  </h2>
                  <div className="pie-flex" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <PieChart width={150} height={150}>
                        <Pie data={data.topBreeds} cx={75} cy={75} innerRadius={48} outerRadius={70}
                          paddingAngle={2} dataKey="count" startAngle={90} endAngle={-270}>
                          {data.topBreeds.map((_, i) => (
                            <Cell key={i} fill={BREED_COLORS[i % BREED_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                      <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)", textAlign: "center",
                      }}>
                        <p style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A4B", margin: 0 }}>
                          {data.topBreeds.reduce((s, b) => s + b.count, 0)}
                        </p>
                        <p style={{ fontSize: "10px", color: "#9CA3AF", margin: 0 }}>Pets</p>
                      </div>
                    </div>
                    <div className="pie-legend" style={{ flex: 1 }}>
                      {data.topBreeds.map((breed, i) => (
                        <div key={breed.breed} style={{
                          display: "flex", alignItems: "center",
                          justifyContent: "space-between", marginBottom: "8px",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{
                              width: "8px", height: "8px", borderRadius: "50%",
                              background: BREED_COLORS[i % BREED_COLORS.length], flexShrink: 0,
                            }} />
                            <span style={{ fontSize: "11px", color: "#6B7280", textTransform: "capitalize" }}>
                              {breed.breed}
                            </span>
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280" }}>
                            {breed.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="analytics-card" style={{ marginBottom: 0 }}>
                  <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#1B3A4B", margin: "0 0 2px 0" }}>
                    Rejection trends
                  </h2>
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={data.abandonmentTrend} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} unit="%" />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                        formatter={(value) => [`${value}%`, "Abandonment Rate"]} />
                      <Line type="monotone" dataKey="rate" stroke="#3182CE" strokeWidth={2.5}
                        dot={{ fill: "#3182CE", r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  {data.abandonmentTrend.some((m) => m.rate > 0) && (
                    <div style={{
                      display: "flex", alignItems: "flex-start", gap: "6px", marginTop: "10px",
                      background: "#FFF7ED", borderRadius: "8px", padding: "8px 10px",
                    }}>
                      <span style={{ color: "#F6AD55", fontSize: "11px", marginTop: "1px" }}>ⓘ</span>
                      <p style={{ fontSize: "11px", color: "#6B7280", margin: 0 }}>
                        Rejection rate this month:{" "}
                        <span style={{ fontWeight: 600, color: "#F6AD55" }}>
                          {data.abandonmentTrend[data.abandonmentTrend.length - 1].rate}%
                        </span>{" "}
                        of applications rejected.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Listings vs Adoptions + Reports Donut */}
              <div className="chart-grid-2">
                <div className="analytics-card" style={{ marginBottom: 0 }}>
                  <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#1B3A4B", margin: "0 0 2px 0" }}>
                    Monthly listings vs Adoptions
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#3182CE" }} />
                      <span style={{ fontSize: "11px", color: "#6B7280" }}>Listed</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#48BB78" }} />
                      <span style={{ fontSize: "11px", color: "#6B7280" }}>Adopted</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={data.monthlyListingsVsAdoptions}
                      margin={{ top: 5, right: 10, left: -25, bottom: 5 }} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} cursor={{ fill: "#f9fafb" }} />
                      <Bar dataKey="listed"  name="Listed"  fill="#3182CE" radius={[4, 4, 0, 0]} maxBarSize={24} />
                      <Bar dataKey="adopted" name="Adopted" fill="#48BB78" radius={[4, 4, 0, 0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="analytics-card" style={{ marginBottom: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                    <Flag size={13} style={{ color: "#F87171" }} />
                    <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#1B3A4B", margin: 0 }}>
                      Reported accounts
                    </h2>
                  </div>
                  <div className="pie-flex" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <PieChart width={150} height={150}>
                        <Pie
                          data={[
                            { name: "Reported Users",    value: data.reports.reportedUsersCount    || 0 },
                            { name: "Reported Shelters", value: data.reports.reportedSheltersCount || 0 },
                          ]}
                          cx={75} cy={75} innerRadius={48} outerRadius={70}
                          paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}
                        >
                          <Cell fill={REPORTS_COLORS[0]} />
                          <Cell fill={REPORTS_COLORS[1]} />
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                      </PieChart>
                      <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none",
                      }}>
                        <p style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A4B", margin: 0 }}>
                          {(data.reports.reportedUsersCount || 0) + (data.reports.reportedSheltersCount || 0)}
                        </p>
                        <p style={{ fontSize: "10px", color: "#9CA3AF", margin: 0 }}>Total</p>
                      </div>
                    </div>
                    <div className="pie-legend" style={{ flex: 1 }}>
                      <div style={{ marginBottom: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: REPORTS_COLORS[0] }} />
                          <span style={{ fontSize: "11px", color: "#6B7280" }}>Reported Users</span>
                        </div>
                        <p style={{ fontSize: "20px", fontWeight: 700, color: "#1B3A4B", margin: "0 0 0 14px" }}>
                          {data.reports.reportedUsersCount}
                        </p>
                      </div>
                      <div style={{ marginBottom: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: REPORTS_COLORS[1] }} />
                          <span style={{ fontSize: "11px", color: "#6B7280" }}>Reported Shelters</span>
                        </div>
                        <p style={{ fontSize: "20px", fontWeight: 700, color: "#1B3A4B", margin: "0 0 0 14px" }}>
                          {data.reports.reportedSheltersCount}
                        </p>
                      </div>
                      <div style={{ paddingTop: "10px", borderTop: "1px solid #F3F4F6", display: "flex", gap: "16px" }}>
                        <div>
                          <p style={{ fontSize: "10px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px 0" }}>Pending</p>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#F6AD55", margin: 0 }}>{data.reports.pendingReports}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: "10px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px 0" }}>Resolved</p>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#48BB78", margin: 0 }}>{data.reports.resolvedReports}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pets Never Applied For */}
              {data.neverAppliedPets.length > 0 && (() => {
                const sorted = [...data.neverAppliedPets].sort((a, b) =>
                  petSortOrder === "desc" ? b.daysListed - a.daysListed : a.daysListed - b.daysListed
                );
                const totalPages = Math.ceil(sorted.length / petsPerPage);
                const paginated = sorted.slice((petPage - 1) * petsPerPage, petPage * petsPerPage);

                return (
                  <div className="analytics-card" style={{ marginTop: "16px" }}>
                    <div style={{
                      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                      marginBottom: "14px", flexWrap: "wrap", gap: "8px",
                    }}>
                      <div>
                        <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#1B3A4B", margin: 0 }}>
                          Pets with no applications
                        </h2>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={() => { setPetSortOrder(o => o === "desc" ? "asc" : "desc"); setPetPage(1); }}
                          style={{
                            fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px",
                            border: "1px solid #E5E7EB", background: "#fff", color: "#1B3A4B",
                            cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                          }}
                        >
                          {petSortOrder === "desc" ? "↓ Descending" : "↑ Ascending"}
                        </button>
                      </div>
                    </div>
                    <div className="table-scroll">
                      <table className="pets-table">
                        <thead>
                          <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                            {["PET NAME", "SPECIES / BREED", "SHELTER", "ADOPTION FEE"].map((h) => (
                              <th key={h} style={{
                                textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#9CA3AF",
                                paddingBottom: "10px", paddingRight: "12px", whiteSpace: "nowrap",
                              }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {paginated.map((pet) => (
                            <tr key={pet.id} style={{ borderBottom: "1px solid #F9FAFB" }}>
                              <td style={{ padding: "10px 12px 10px 0" }}>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: "#1B3A4B" }}>{pet.name}</span>
                              </td>
                              <td style={{ padding: "10px 12px 10px 0" }}>
                                <span style={{ fontSize: "12px", color: "#6B7280", textTransform: "capitalize" }}>{pet.species}</span>
                                {pet.breed && pet.breed !== "Unknown" && (
                                  <span style={{ fontSize: "11px", color: "#9CA3AF", marginLeft: "4px", textTransform: "capitalize" }}>
                                    · {pet.breed}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: "10px 12px 10px 0" }}>
                                <span style={{ fontSize: "12px", color: "#6B7280" }}>{pet.shelterName}</span>
                                {pet.shelterCity && (
                                  <span style={{ fontSize: "11px", color: "#9CA3AF", marginLeft: "4px" }}>· {pet.shelterCity}</span>
                                )}
                              </td>
                              <td style={{ padding: "10px 12px 10px 0" }}>
                                <span style={{ fontSize: "12px", color: "#6B7280" }}>{pet.adoptionFee}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #F3F4F6",
                      }}>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
                          Showing {(petPage - 1) * petsPerPage + 1}–{Math.min(petPage * petsPerPage, sorted.length)} of {sorted.length} pets
                        </p>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => setPetPage(p => Math.max(1, p - 1))}
                            disabled={petPage === 1}
                            style={{
                              fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px",
                              border: "1px solid #E5E7EB", background: petPage === 1 ? "#F9FAFB" : "#fff",
                              color: petPage === 1 ? "#D1D5DB" : "#1B3A4B", cursor: petPage === 1 ? "not-allowed" : "pointer",
                            }}
                          >← Prev</button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setPetPage(page)}
                              style={{
                                fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px",
                                border: "1px solid #E5E7EB",
                                background: petPage === page ? "#1B3A4B" : "#fff",
                                color: petPage === page ? "#fff" : "#1B3A4B",
                                cursor: "pointer",
                              }}
                            >{page}</button>
                          ))}
                          <button
                            onClick={() => setPetPage(p => Math.min(totalPages, p + 1))}
                            disabled={petPage === totalPages}
                            style={{
                              fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px",
                              border: "1px solid #E5E7EB", background: petPage === totalPages ? "#F9FAFB" : "#fff",
                              color: petPage === totalPages ? "#D1D5DB" : "#1B3A4B", cursor: petPage === totalPages ? "not-allowed" : "pointer",
                            }}
                          >Next →</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </>
  );
}