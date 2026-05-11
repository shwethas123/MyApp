import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Heart, List, BarChart2, TrendingUp, IndianRupee, ArrowUpDown } from "lucide-react";
import api from "../services/Apiservices";
import ShelterSidebar from "../components/shelter/ShelterSidebar";

function DonutChart({ data, total, label, size = 160 }) {
  const hasData = data.some((d) => d.value > 0);
  const displayData = hasData ? data : [{ name: "Empty", value: 1, color: "#E2E8F0" }];
  const cx = size / 2;
  return (
    <div className="relative flex flex-col items-center">
      <PieChart width={size} height={size}>
        <Pie data={displayData} cx={cx} cy={cx} innerRadius={size * 0.35} outerRadius={size * 0.48}
          paddingAngle={hasData ? 2 : 0} dataKey="value" startAngle={90} endAngle={-270}>
          {displayData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
        </Pie>
      </PieChart>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-xl font-bold text-[#1B3A4B]">{total}</p>
        <p className="text-[10px] text-gray-400">{label}</p>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4 flex items-center justify-between">
      <div>
        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
        <p className="text-2xl font-bold text-[#1B3A4B]">{value}</p>
        {sub && (
          <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
            <TrendingUp size={11} />{sub}
          </p>
        )}
      </div>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={16} className={iconColor} />
      </div>
    </div>
  );
}

function MonthFilter({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="text-[11px] text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-2 py-1 transition-colors cursor-pointer outline-none"
    >
      <option value={3}>Last 3 months</option>
      <option value={6}>Last 6 months</option>
      <option value={12}>Last 12 months</option>
    </select>
  );
}

function getRateColor(rate) {
  if (rate >= 75) return "#48BB78";
  if (rate >= 50) return "#3182CE";
  if (rate >= 25) return "#F6AD55";
  return "#FC8181";
}

export default function AnalyticsPage() {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [speciesDesc, setSpeciesDesc] = useState(true);
  const [listingMonths, setListingMonths] = useState(6);
  const [trendMonths, setTrendMonths]     = useState(6);

  const fetchAnalytics = async (months) => {
    setLoading(true);
    try {
      const res = await api.get(`/shelter/pets/analytics?months=${months}`);
      setData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(Math.max(listingMonths, trendMonths)); }, []);
  useEffect(() => { fetchAnalytics(Math.max(listingMonths, trendMonths)); }, [listingMonths, trendMonths]);

  const adoptionRequestData = data ? [
    { name: "Pending",    value: data.requests.pending   || 0, color: "#3182CE" },
    { name: "Approved",   value: data.requests.approved  || 0, color: "#48BB78" },
    { name: "Rejected",   value: data.requests.rejected  || 0, color: "#FC8181" },
    { name: "Home Visit", value: data.requests.homeVisit || 0, color: "#F6AD55" },
  ] : [];

  const petStatusData = data ? [
    { name: "Available", value: data.available || 0, color: "#3182CE" },
    { name: "Adopted",   value: data.adopted   || 0, color: "#1A365D" },
    { name: "Reserved",  value: data.reserved  || 0, color: "#90CDF4" },
  ] : [];

  const sortedSpecies = data
    ? [...data.speciesAdoptionRate].sort((a, b) => speciesDesc ? b.rate - a.rate : a.rate - b.rate)
    : [];

  const listingData = data?.listingActivity?.slice(-listingMonths) ?? [];
  const trendData   = data?.adoptionTrend?.slice(-trendMonths)    ?? [];

  return (
    <>
      <style>{`
        /* ── KPI: 2 cols × 2 rows on mobile, 4 cols on desktop ── */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 768px) {
          .kpi-grid { grid-template-columns: repeat(4, 1fr); }
        }

        /* ── Three-chart row: stack on mobile, 3 cols on desktop ── */
        .three-chart-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .three-chart-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* ── Two-chart row: stack on mobile, 2 cols on desktop ── */
        .two-chart-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .two-chart-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="min-h-screen bg-[#f5f7fa] flex">
        <ShelterSidebar />

        <div className="flex-1 overflow-y-auto mt-[44px] lg:mt-0">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
            <h1 className="text-lg font-bold text-gray-900">Analytics</h1>
            <p className="text-xs text-gray-400 mt-0.5">Track your shelter's performance</p>
          </div>

          <div className="px-4 py-5 space-y-4">
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-4xl animate-spin mb-3">🐾</div>
                  <p className="text-sm text-gray-400">Loading analytics...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            {!loading && data && (
              <>
                {/* ── 1. KPI Cards — 2×2 mobile / 4×1 desktop ── */}
                <div className="kpi-grid">
                  <KpiCard label="Total Pets Listed" value={data.totalPets}                              icon={List}       iconBg="bg-blue-50"   iconColor="text-blue-400"   />
                  <KpiCard label="Pending Requests"  value={data.requests.pending}                       icon={Heart}      iconBg="bg-orange-50" iconColor="text-orange-400" />
                  <KpiCard label="Adoption Rate"     value={`${data.adoptionRate}%`}                     icon={BarChart2}  iconBg="bg-green-50"  iconColor="text-green-500"  />
                  <KpiCard label="Avg Adoption Fee"  value={`₹${data.avgAdoptionFee.toLocaleString()}`} icon={IndianRupee} iconBg="bg-purple-50" iconColor="text-purple-400" />
                </div>

                {/* ── 2. Pet Listing Activity ── */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-[#1B3A4B]">Pet listing activity</h2>
                    <MonthFilter value={listingMonths} onChange={setListingMonths} />
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={listingData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                      <Bar dataKey="listed" fill="#3182CE" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* ── 3. Three Charts Row ── */}
                <div className="three-chart-grid">

                  {/* Species Adoption Rate */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold text-[#1B3A4B]">Species adoption rate</h2>
                      <button
                        onClick={() => setSpeciesDesc((p) => !p)}
                        className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-2 py-1 transition-colors"
                      >
                        <ArrowUpDown size={10} />
                        {speciesDesc ? "Desc" : "Asc"}
                      </button>
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                      {sortedSpecies.map(({ species, total, adopted, rate }) => (
                        <div key={species} className="flex-1 flex flex-col justify-center py-2 border-b border-gray-50 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600 font-medium">{species}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400">{adopted}/{total}</span>
                              <span className="text-xs font-bold w-9 text-right" style={{ color: getRateColor(rate) }}>
                                {rate}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full transition-all duration-700"
                              style={{ width: `${rate}%`, background: getRateColor(rate) }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pet Status Distribution */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <h2 className="text-sm font-semibold text-[#1B3A4B] mb-4">Pet status distribution</h2>
                    <div className="flex flex-col items-center gap-4">
                      <DonutChart data={petStatusData} total={data.available} label="Active" />
                      <div className="w-full space-y-2">
                        {petStatusData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                              <span className="text-xs text-gray-500">{item.name}</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-700">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <h2 className="text-sm font-semibold text-[#1B3A4B] mb-4">Performance metrics</h2>
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-2xl font-bold text-[#1B3A4B] mt-15">{data.avgDays}</p>
                        <p className="text-[10px] text-gray-400">Days avg</p>
                          <div className="text-center">
                            <p className="text-xs font-semibold text-gray-700">Average adoption time</p>
                            <p className="text-xs text-gray-400 mt-1">Target: 12.0 days</p>
                            <div className="mt-3 w-40 mx-auto">
                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                              <span>0 days</span><span>30 days</span>
                            </div>
                          <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, ((data.avgDays || 0) / 30) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                </div>
                </div>

                {/* ── 4. Adoption Trend Over Time ── */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-[#1B3A4B]">Adoption trend over time</h2>
                    <MonthFilter value={trendMonths} onChange={setTrendMonths} />
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                      <Line type="monotone" dataKey="adoptions" stroke="#3182CE" strokeWidth={2.5}
                        dot={{ fill: "#3182CE", r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* ── 5. Adoption Request Status + Repeat Applicants ── */}
                <div className="two-chart-grid">

                  {/* Adoption Request Status */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <h2 className="text-sm font-semibold text-[#1B3A4B] mb-4">Adoption request status</h2>
                    <div className="flex flex-col items-center gap-4">
                      <DonutChart data={adoptionRequestData} total={data.requests.total} label="Total" />
                      <div className="w-full space-y-2">
                        {adoptionRequestData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                              <span className="text-xs text-gray-500">{item.name}</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-700">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Repeat Applicants */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col">
                    <h2 className="text-sm font-semibold text-[#1B3A4B] mb-4">Repeat applicants</h2>
                    {data.repeatApplicants && data.repeatApplicants.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[280px]">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left text-[10px] font-semibold text-gray-400 pb-3 pr-4">NAME</th>
                              <th className="text-left text-[10px] font-semibold text-gray-400 pb-3 pr-4">EMAIL</th>
                              <th className="text-right text-[10px] font-semibold text-gray-400 pb-3">APPS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.repeatApplicants.map((applicant, i) => (
                              <tr key={i} className="border-b border-gray-50 last:border-0">
                                <td className="py-3 pr-4">
                                  <span className="text-sm font-semibold text-[#1B3A4B]">{applicant.name}</span>
                                </td>
                                <td className="py-3 pr-4">
                                  <span className="text-xs text-gray-400 break-all">{applicant.email}</span>
                                </td>
                                <td className="py-3 text-right">
                                  <span className="text-sm font-bold text-[#3182CE]">{applicant.count}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-sm text-gray-400">No repeat applicants yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}