import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiService from "../services/Apiservices";
import AdminSidebar from "../components/common/Adminsidebar";
import { ArrowLeft, Download, ChevronLeft, ChevronRight } from "lucide-react";
import PdfViewerModal from "../components/common/PdfViewerModal";

const responsiveStyles = `
  @media (max-width: 768px) {
    .detail-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .detail-section { padding: 16px !important; }
    .pet-section { padding: 16px !important; min-height: unset !important; }
    .carousel-wrap { position: static !important; margin-bottom: 16px !important; width: 100% !important; }
    .carousel-wrap > div { width: 100% !important; }
    .main-content { padding: 16px !important; padding-bottom: 40px !important; }
    .download-btn { white-space: normal !important; word-break: break-word !important; }  
    
  }
  @media (max-width: 480px) {
    .doc-grid { grid-template-columns: repeat(1, 1fr) !important; }
  }
`;


const toSentenceCase = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const statusColors = {
  pending: { bg: "#FFF3CD", color: "#856404", label: "Pending" },
  approved: { bg: "#D4EDDA", color: "#155724", label: "Approved" },
  rejected: { bg: "#F8D7DA", color: "#721C24", label: "Rejected" },
  home_visit: { bg: "#D1ECF1", color: "#0C5460", label: "Home visit" },
  payment_pending: {
    bg: "#CCE5FF",
    color: "#004085",
    label: "Paid",
  },
  completed: { bg: "#D4EDDA", color: "#155724", label: "Completed" },
  dissolved: { bg: "#E2E3E5", color: "#383D41", label: "Dissolved" },
};

const GRID = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: "20px 32px",
};

const SECTION_PAD = "20px 28px";

const Field = ({ label, value, raw }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <span
      style={{
        fontSize: "11px",
        fontWeight: 700,
        color: "#9CA3AF",
        letterSpacing: "0.07em",
     
      }}
    >
      {label}
    </span>
    <span style={{ fontSize: "14px", color: "#111827", fontWeight: 400 }}>
 {raw ? (value ? value.toString() : "—") : (value ? toSentenceCase(value.toString()) : "—")}
    </span>
  </div>
);

const SectionTitle = ({ title }) => (
  <h3
    style={{
      margin: "0 0 18px 0",
      fontSize: "13px",
      fontWeight: 700,
      color: "#4F46E5",
      letterSpacing: "0.08em",
   
    }}
  >
    {title}
  </h3>
);

const Divider = () => (
  <div style={{ height: "1px", background: "#F3F4F6", margin: "20px 0" }} />
);

const DownloadButton = ({ url, label, onView }) => {
  const handleDownload = async () => {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = label || "document";
    link.click();
    window.URL.revokeObjectURL(blobUrl);
  };

  if (!url)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "#F9FAFB",
          borderRadius: "10px",
          border: "1px dashed #E5E7EB",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B7280" }}>
          {label}
        </span>
        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Not uploaded</span>
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        background: "#F9FAFB",
        borderRadius: "10px",
        border: "1px solid #E5E7EB",
      }}
    >
      {/* Label on left */}
      <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
        {label}
      </span>

      {/* Icon buttons on right */}
      <div style={{ display: "flex", gap: "6px" }}>
        {/* VIEW icon */}
        <button
          onClick={() => onView(url)}
          title="View"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            background: "#F0FDF4",
            borderRadius: "8px",
            border: "1px solid #BBF7D0",
            cursor: "pointer",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16A34A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        {/* DOWNLOAD icon */}
        <button
          onClick={handleDownload}
          title="Download"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            background: "#EEF2FF",
            borderRadius: "8px",
            border: "1px solid #C7D2FE",
            cursor: "pointer",
          }}
        >
          <Download size={15} color="#4F46E5" />
        </button>
      </div>
    </div>
  );
};

const ImageCarousel = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
    }, 3000);
  };

  useEffect(() => {
    if (images.length > 1) startTimer();
    return () => clearInterval(timerRef.current);
  }, [images.length]);

  if (!images || images.length === 0) return null;

  const prev = () => {
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
    startTimer();
  };
  const next = () => {
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
    startTimer();
  };

  return (
    <div
      style={{
        width: "200px",
        flexShrink: 0,
        borderRadius: "14px",
        overflow: "hidden",
        background: "#F9FAFB",
        border: "1px solid #F0F0F0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <style>{`@keyframes fadeIn { from { opacity:0.4; transform:scale(1.02); } to { opacity:1; transform:scale(1); } }`}</style>
      <div
        style={{
          width: "100%",
          height: "220px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          key={current}
          src={images[current].file_url}
          alt={`Pet ${current + 1}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            animation: "fadeIn 0.4s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            background: "rgba(0,0,0,0.55)",
            borderRadius: "20px",
            padding: "2px 8px",
            fontSize: "10px",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          {current + 1} / {images.length}
        </div>
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              style={{
                position: "absolute",
                left: "6px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.45)",
                border: "none",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ChevronLeft size={14} color="#fff" />
            </button>
            <button
              onClick={next}
              style={{
                position: "absolute",
                right: "6px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.45)",
                border: "none",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ChevronRight size={14} color="#fff" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "5px",
            padding: "8px",
          }}
        >
          {images.map((_, i) => (
            <div
              key={i}
              onClick={() => {
                setCurrent(i);
                startTimer();
              }}
              style={{
                width: "16px",
                height: "5px",
                borderRadius: "10px",
                background: i === current ? "#4F46E5" : "#D1D5DB",
                opacity: i === current ? 1 : 0.4,
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AdminAdoptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleView = (url) => {
    const isPdf =
      url?.includes("/raw/upload/") || url?.toLowerCase().endsWith(".pdf");
    if (isPdf) setPdfUrl(url);
    else window.open(url, "_blank");
  };

  useEffect(() => {
    ApiService.get(`/admin/applications/${id}`)
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          background: "#F3F4F6",
          overflow: "hidden",
        }}
      >
        <AdminSidebar />

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9CA3AF",
            fontSize: "14px",
          }}
        >
          Loading...
        </div>
      </div>
    );

  if (!data)
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          background: "#F3F4F6",
        }}
      >
        <AdminSidebar />

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9CA3AF",
            fontSize: "14px",
          }}
        >
          Adoption request not found.
        </div>
      </div>
    );

  const statusStyle = statusColors[data.status] || statusColors.Pending;
  const applicant = data.applicant;
  const pet = data.pet;
  const shelter = data.shelter;
  const images =
    pet?.images?.sort((a, b) => a.display_order - b.display_order) || [];

  return (
    // ✅ minHeight instead of height, NO overflow hidden
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: "#F3F4F6",
        alignItems: "stretch",
      }}
    >
      <style>{responsiveStyles}</style>
      {/* ✅ Sidebar sticky so it stays visible while scrolling */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          flexShrink: 0,
          alignSelf: "stretch",
        }}
      >
        <AdminSidebar />
      </div>

      {/* ✅ Content scrolls naturally, no overflow trap */}
      <div
        style={{ flex: 1, padding: "28px", paddingBottom: "60px" }}
        className="main-content"
      >
        {/* Back + Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              padding: "8px 10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <ArrowLeft size={18} color="#374151" />
          </button>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Adoption request details
            </h2>
            <p
              style={{
                margin: "2px 0 0 0",
                fontSize: "13px",
                color: "#9CA3AF",
             
              }}
            >
            {applicant?.first_name?.charAt(0).toUpperCase()}{applicant?.first_name?.slice(1).toLowerCase()} {applicant?.last_name?.charAt(0).toUpperCase()} → {pet?.name?.charAt(0).toUpperCase()}{pet?.name?.slice(1).toLowerCase()}
            </p>
          </div>
        </div>

        {/* Status Badges */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              background: statusStyle.bg,
              color: statusStyle.color,
              borderRadius: "20px",
              padding: "6px 16px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            {statusStyle.label}
          </span>
          {pet?.species && (
            <span
              style={{
                background: "#EEF2FF",
                color: "#4F46E5",
                borderRadius: "20px",
                padding: "6px 16px",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "capitalize",
              }}
            >
              {pet.species}
            </span>
          )}
        </div>

        {/* ── MAIN CARD ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          {/* APPLICANT INFORMATION */}
          <div
            style={{ padding: SECTION_PAD, borderBottom: "1px solid #F0F0F0" }}
            className="detail-section"
          >
            <SectionTitle title="Applicant Information" />
            <div
              style={{ ...GRID, marginBottom: "20px" }}
              className="detail-grid"
            >
              <Field
                label="Full name"
          value={`${applicant?.first_name?.charAt(0).toUpperCase()}${applicant?.first_name?.slice(1).toLowerCase() || ""} ${applicant?.last_name?.charAt(0).toUpperCase()}${applicant?.last_name?.slice(1).toLowerCase() || ""}`}
              raw />
              <Field label="Email" value={applicant?.email} raw />
              <Field label="Phone" value={applicant?.phone} />
              <Field
                label="City"
                value={applicant?.location || "Not provided"}
              />
              <Field
                label="Living situation"
                value={applicant?.living_situation}
              />
              <Field
                label="Pet experience"
                value={
                  applicant?.pet_experience_years
                    ? `${applicant.pet_experience_years} years`
                    : null
                }
              />
            </div>
            <div style={GRID}>
              <Field
                label="Preferred species"
                value={applicant?.preferred_species}
              />
              <Field
                label="Applied on"
                value={new Date(data.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              />
            </div>
          </div>

          {/* PET INFORMATION */}
          <div
            style={{
              position: "relative",
              padding: SECTION_PAD,
              paddingBottom: "28px",
              borderBottom: "1px solid #F0F0F0",
              minHeight: "360px",
              paddingRight: "230px",
            }}
            className="pet-section"
          >
            <div
              style={{
                position: "absolute",
                top: "25px",
                right: "28px",
                zIndex: 1,
              }}
              className="carousel-wrap"
            >
              <ImageCarousel images={images} />
            </div>
            <SectionTitle title="Pet Information" />
            <div
              style={{ ...GRID, marginBottom: "20px" }}
              className="detail-grid"
            >
              <Field label="Pet name" value={pet?.name} />
              <Field label="Species" value={pet?.species} />
              <Field label="Breed" value={pet?.breed} />
              <Field label="Age" value={pet?.age ? `${pet.age} years` : null} />
              <Field label="Gender" value={pet?.gender} />

              <div />
            </div>
            <Divider />
            <div
              style={{ ...GRID, marginBottom: "20px" }}
              className="detail-grid"
            >
              <Field
                label="Vaccinated"
                value={pet?.vaccinated ? "Yes" : "No"}
              />
              <Field
                label="Special needs"
                value={pet?.special_needs ? "Yes" : "No"}
              />
              <Field
                label="Sterilized"
                value={pet?.sterilized?.replace(/_/g, " ")}
              />
              <Field
                label="Adoption fee"
                value={pet?.adoption_fee ? `₹${pet.adoption_fee}` : "Free"}
              />
              <Field
                label="Social friendly "
                value={pet?.good_with_kids ? "Yes" : "No"}
              />
              <div />
            </div>
            <Divider />
            <div
              style={{ ...GRID, marginBottom: "20px" }}
              className="detail-grid"
            >
              <Field label="Temperament" value={pet?.temperament} />

              <div />
            </div>

            <Divider />
            <p
              style={{
                margin: "0 0 12px 0",
                fontSize: "12px",
                fontWeight: 700,
                color: "#6B7280",
                letterSpacing: "0.06em",
              }}
            >
              Health & vaccination documents
            </p>
            <div style={GRID} className="detail-grid doc-grid">
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <DownloadButton
                  url={pet?.health_record_url}
                  label="Health record"
                  onView={handleView}
                />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <DownloadButton
                  url={pet?.vaccination_record_url}
                  label="Vaccination proof"
                  onView={handleView}
                />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <DownloadButton
                  url={pet?.sterilization_certificate_url}
                  label="Sterilization certificate"
                  onView={handleView}
                />
              </div>
            </div>
          </div>

          {/* SHELTER INFORMATION */}
          {/* HOME VISIT INFORMATION */}
          {data.status === "home_visit" || data.home_visit_attempt > 0 ? (
            <div
              style={{
                padding: SECTION_PAD,
                borderBottom: "1px solid #F0F0F0",
              }}
              className="detail-section"
            >
              <SectionTitle title="Home Visit" />
              <div
                style={{ ...GRID, marginBottom: "20px" }}
                className="detail-grid"
              >
                <Field label="Attempts" value={data.home_visit_attempt || 0} />
                <Field
                  label="Outcome"
                  value={data.home_visit_status || "Pending"}
                />
                <Field
                  label="Warning sent"
                  value={data.home_visit_warning_sent ? "Yes" : "No"}
                />
                <Field
                  label="Visit date"
                  value={
                    data.home_visit_date
                      ? new Date(data.home_visit_date).toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" },
                        )
                      : "—"
                  }
                />
              </div>
              {data.home_visit_notes && (
                <div
                  style={{
                    background: "#F9FAFB",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#9CA3AF",
                      letterSpacing: "0.07em",
                    }}
                  >
                    Shelter notes
                  </p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#374151" }}>
                    {data.home_visit_notes}
                  </p>
                </div>
              )}
              {data.home_visit_photos?.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <p
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#9CA3AF",
                      letterSpacing: "0.07em",
                    }}
                  >
                    Home visit photos
                  </p>
                  <div
                    style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                  >
                    {data.home_visit_photos.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer">
                        <img
                          src={url}
                          alt={`Home visit ${i + 1}`}
                          style={{
                            width: "120px",
                            height: "90px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            border: "1px solid #E5E7EB",
                          }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* SHELTER INFORMATION */}
          <div style={{ padding: SECTION_PAD }}>
            <SectionTitle title="Shelter Information" />
            <div style={GRID} className="detail-grid">
              <Field label="Organization name" value={shelter?.name} />
              <Field
                label="Owner name"
               value={`${shelter?.owner?.first_name?.charAt(0).toUpperCase()}${shelter?.owner?.first_name?.slice(1).toLowerCase() || ""} ${shelter?.owner?.last_name?.charAt(0).toUpperCase()}${shelter?.owner?.last_name?.slice(1).toLowerCase() || ""}`}
             raw />
             <Field label="Personal email" value={shelter?.owner?.email} raw />
              <Field label="Personal phone" value={shelter?.owner?.phone} />
              <Field label="City" value={shelter?.city} />
            </div>
          </div>
        </div>
      </div>
      {pdfUrl && (
        <PdfViewerModal url={pdfUrl} onClose={() => setPdfUrl(null)} />
      )}
    </div>
  );
};

export default AdminAdoptionDetail;
