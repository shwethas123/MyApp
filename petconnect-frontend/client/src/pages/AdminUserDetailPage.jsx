import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../services/Apiservices";
import AdminSidebar from "../components/common/Adminsidebar";
import { Loader2, ChevronLeft } from "lucide-react";

const RoleBadge = ({ role }) => {
  const styles = {
    admin:   { bg: "#EEF2FF", color: "#4F46E5" },
    shelter: { bg: "#FEF3C7", color: "#D97706" },
    adopter: { bg: "#F0FDF4", color: "#16A34A" },
  };
  const s = styles[role] || styles.adopter;
  return <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 700, textTransform: "none" }}>{role}</span>;
};

const InfoGrid = ({ items, cols = 3 }) => (
  <div className={`info-grid-${cols}`} style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px" }}>
    {items.map(([label, value]) => (
      <div key={label}>
        <div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600, textTransform: "none", marginBottom: "4px" }}>{label}</div>
        <div style={{ fontSize: "14px", color: "#111827", fontWeight: 500, wordBreak: "break-word" }}>{value}</div>
      </div>
    ))}
  </div>
);

const Section = ({ children, style = {} }) => (
  <div style={{ background: "#F9FAFB", borderRadius: "12px", padding: "20px", marginBottom: "20px", ...style }}>
    {children}
  </div>
);

const AdminUserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await ApiService.get(`/admin/users/${id}`);
        setUserDetail(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <>
      <style>{`
        .detail-main { padding: 28px; }
        .info-grid-3 { grid-template-columns: repeat(3, 1fr) !important; }
        .info-grid-2 { grid-template-columns: repeat(2, 1fr) !important; }
        @media (max-width: 768px) {
          .detail-main { padding: 12px !important; }
          .info-grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
          .info-grid-2 { grid-template-columns: 1fr !important; }
          .detail-card { padding: 14px !important; }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#F3F4F6", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <AdminSidebar />

        <div className="detail-main" style={{ flex: 1, overflowY: "auto" }}>

          {/* Header */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "16px 20px", marginBottom: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => navigate(-1)} style={{ border: "1px solid #E5E7EB", borderRadius: "8px", padding: "7px 14px", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#374151", flexShrink: 0 }}>
              <ChevronLeft size={15} /> Back
            </button>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#111827" }}>User Details</h2>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
              <Loader2 size={28} color="#4F46E5" />
            </div>
          ) : userDetail ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Basic Info */}
              <Section style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div className="detail-card" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 700, color: "#4F46E5", flexShrink: 0 }}>
                      {userDetail.user?.first_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>{userDetail.user?.first_name} {userDetail.user?.last_name}</div>
                      <RoleBadge role={userDetail.user?.role} />
                    </div>
                  </div>
                  <InfoGrid cols={3} items={[
                    ["Email", userDetail.user?.email],
                    ["Phone", userDetail.user?.phone || "—"],
                    ["Status", userDetail.user?.account_status],
                    ["Joined", new Date(userDetail.user?.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })],
                    ["Email verified", userDetail.user?.email_verified ? "✅ Yes" : "❌ No"],
                    ["Profile completed", userDetail.user?.profile_completed ? "✅ Yes" : "❌ No"],
                  ]} />
                </div>
              </Section>

              {/* Adopter sections */}
              {userDetail.user?.role === "adopter" && (
                <>
                  <Section>
                    <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#111827" }}>🏠 Profile details</h4>
                    <InfoGrid cols={2} items={[
                      ["Location", userDetail.user?.location || "—"],
                      ["Living Situation", userDetail.user?.living_situation || "—"],
                      ["Pet Experience", userDetail.user?.pet_experience_years != null ? `${userDetail.user.pet_experience_years} years` : "—"],
                      ["Preferred Species", userDetail.user?.preferred_species || "—"],
                    ]} />
                  </Section>

                  <Section>
                    <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#111827" }}>📋 Adoption applications ({userDetail.applications?.length || 0})</h4>
                    {!userDetail.applications?.length ? (
                      <p style={{ color: "#9CA3AF", fontSize: "13px", margin: 0 }}>No applications yet</p>
                    ) : userDetail.applications.map((app) => (
                      <div key={app.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #E5E7EB" }}>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{app.pet?.name} <span style={{ color: "#9CA3AF", fontWeight: 400 }}>({app.pet?.breed})</span></div>
                          <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{app.pet?.species}</div>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: app.status === "Approved" ? "#D1FAE5" : app.status === "Rejected" ? "#FEE2E2" : "#FFF3CD", color: app.status === "Approved" ? "#065F46" : app.status === "Rejected" ? "#991B1B" : "#856404" }}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </Section>

                  <Section style={{ marginBottom: 0 }}>
                    <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#111827" }}>❤️ Wishlist ({userDetail.wishlist?.length || 0})</h4>
                    {!userDetail.wishlist?.length ? (
                      <p style={{ color: "#9CA3AF", fontSize: "13px", margin: 0 }}>No wishlist items</p>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {userDetail.wishlist.map((w) => (
                          <span key={w.id} style={{ background: "#EEF2FF", color: "#4F46E5", borderRadius: "8px", padding: "4px 12px", fontSize: "12px", fontWeight: 500 }}>
                            🐾 {w.pet?.name} ({w.pet?.breed})
                          </span>
                        ))}
                      </div>
                    )}
                  </Section>
                </>
              )}

              {/* Shelter sections */}
              {userDetail.user?.role === "shelter" && userDetail.shelter && (
                <>
                  <Section>
                    <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#111827" }}>🏢 Shelter Details</h4>
                    <InfoGrid cols={3} items={[
                      ["Shelter Name", userDetail.shelter?.name || "—"],
                      ["Type", userDetail.shelter?.type || "—"],
                      ["Status", userDetail.shelter?.status || "—"],
                      ["City", userDetail.shelter?.city || "—"],
                      ["State", userDetail.shelter?.state || "—"],
                      ["Contact Email", userDetail.shelter?.contact_email || "—"],
                      ["Contact Phone", userDetail.shelter?.contact_phone || "—"],
                      ["Zipcode", userDetail.shelter?.zipcode || "—"],
                    ]} />
                  </Section>

                  <Section style={{ marginBottom: 0 }}>
                    <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#111827" }}>🐾 Pets listed ({userDetail.shelter?.pets?.length || 0})</h4>
                    {!userDetail.shelter?.pets?.length ? (
                      <p style={{ color: "#9CA3AF", fontSize: "13px", margin: 0 }}>No pets listed yet</p>
                    ) : userDetail.shelter.pets.map((pet) => (
                      <div key={pet.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #E5E7EB" }}>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{pet.name} <span style={{ color: "#9CA3AF", fontWeight: 400 }}>({pet.breed})</span></div>
                          <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{pet.species}</div>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: pet.status === "Available" ? "#D1FAE5" : "#FEE2E2", color: pet.status === "Available" ? "#065F46" : "#991B1B" }}>
                          {pet.status}
                        </span>
                      </div>
                    ))}
                  </Section>
                </>
              )}

              {userDetail.user?.role === "admin" && (
                <div style={{ background: "#EEF2FF", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
                  <p style={{ color: "#4F46E5", fontWeight: 600, margin: 0 }}>👑 Administrator account</p>
                </div>
              )}

            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#9CA3AF", padding: "60px" }}>User not found.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminUserDetailPage;