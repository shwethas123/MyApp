import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiService from "../services/Apiservices";
import { FileText, Download, Eye, ArrowLeft } from "lucide-react";
import AdminSidebar from "../components/common/Adminsidebar";
import PdfViewerModal from "../components/common/PdfViewerModal";

const statusColors = {
  Pending: { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
  Verified: { bg: "#D1FAE5", color: "#065F46", label: "Active" },
  Rejected: { bg: "#FEE2E2", color: "#991B1B", label: "Rejected" },
  Inactive: { bg: "#F3F4F6", color: "#374151", label: "Inactive" },
};

const ID_TYPE_LABELS = {
  drivers_license: "Driver's License",
  passport: "Passport",
  national_id: "National ID (Aadhaar)",
  voter_id: "Voter ID",
  pan_card: "PAN Card",
};


const toSentenceCase = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const Field = ({ label, value, raw }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <span
      style={{
        fontSize: "11px",
        fontWeight: 700,
        color: "#9CA3AF",
        letterSpacing: "0.07em",
        textTransform: "none",
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: "15px",
        color: "#111827",
        fontWeight: 400,
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
      
      }}
    >
    {raw ? (value || "—") : (value ? toSentenceCase(String(value)) : "—")}
    </span>
  </div>
);


const Section = ({ title, children }) => (
  <div style={{ marginBottom: "0" }}>
    <div style={{ padding: "20px 28px", borderBottom: "1px solid #F0F0F0" }}>
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "20px 32px",
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

const ShelterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shelter, setShelter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const rejectBoxRef = useRef(null);

  useEffect(() => {
    if (showRejectInput && rejectBoxRef.current) {
      setTimeout(() => {
        rejectBoxRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [showRejectInput]);

  useEffect(() => {
    const fetchShelter = async () => {
      setLoading(true);
      try {
        const res = await ApiService.get(`/admin/shelters/${id}`);
        setShelter(res.data.shelter);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShelter();
  }, [id]);

  const handleStatusUpdate = async (newStatus, reason = "") => {
    if (newStatus === "Rejected" && !reason.trim()) {
      setRejectError("Please enter a rejection reason.");
      return;
    }
    setUpdatingId(newStatus);
    try {
      await ApiService.patch(`/admin/shelters/${id}/verify`, {
        status: newStatus,
        ...(newStatus === "Rejected" && { rejection_reason: reason.trim() }),
      });
      setShelter((prev) => ({
        ...prev,
        status: newStatus,
        rejection_reason:
          newStatus === "Rejected" ? reason.trim() : prev.rejection_reason,
      }));
      setShowRejectInput(false);
      setRejectionReason("");
      setRejectError("");
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const isPending = shelter?.status === "Pending";

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
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
          <div>
            <div
              style={{
                width: "36px",
                height: "36px",
                border: "3px solid #E5E7EB",
                borderTop: "3px solid #4F46E5",
                borderRadius: "50%",
                margin: "0 auto 14px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading...
          </div>
        </div>
      </div>
    );

  if (!shelter)
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
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
          Shelter not found.
        </div>
      </div>
    );

  const statusStyle = statusColors[shelter.status] || statusColors.Pending;

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 767px) {
          .mobile-hidden { display: none !important; }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          height: "100vh",
          fontFamily: "'DM Sans', 'Inter', 'Segoe UI', sans-serif",
          background: "#F3F4F6",
          overflow: "hidden",
        }}
      >
        <AdminSidebar />

        <div
          style={{ flex: 1, overflowY: "auto", padding: "28px" }}
          className="hide-scrollbar"
        >
          {/* Back Button + Title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <button
              onClick={() => navigate("/admin/shelters")}
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
                Shelter Details
              </h2>
              <p
                style={{
                  margin: "2px 0 0 0",
                  fontSize: "13px",
                  color: "#9CA3AF",
               
                }}
              >
               {toSentenceCase(shelter.name)}
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
            <span
              style={{
                background: "#EEF2FF",
                color: "#4F46E5",
                borderRadius: "20px",
                padding: "6px 16px",
                fontSize: "12px",
                fontWeight: 700,
              
              }}
            >
            {shelter.type === "ngo" ? "NGO" : toSentenceCase(shelter.type)}
            </span>
          </div>

          {/* Main Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              overflow: "hidden",
              marginBottom: "16px",
            }}
          >
            {/* Basic Information */}
            <Section title="Basic Information">
              <Field label="Organization name" value={shelter.name} raw />
              <Field label="Type" value={shelter.type} />
            <Field label="Organization email" value={shelter.contact_email} raw />
              <Field label="Organization phone" value={shelter.contact_phone} />
              <Field label="City" value={shelter.city} raw/>
              <Field label="State" value={shelter.state} raw />
              <Field label="Country" value={shelter.country}  raw/>
              <Field label="Zipcode" value={shelter.zipcode} />
            </Section>
            {shelter.description && (
              <div
                style={{
                  padding: "20px 28px",
                  borderBottom: "1px solid #F0F0F0",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#9CA3AF",
                    letterSpacing: "0.07em",
                   
                  }}
                >
                  Description
                </span>
                <p
                  style={{
                    margin: "6px 0 0 0",
                    fontSize: "14px",
                    color: "#374151",
                    lineHeight: 1.6,
                  }}
                >
                  {shelter.description}
                </p>
              </div>
            )}

            {/* Owner Information */}
            {shelter.owner && (
              <Section title="Owner information">
                <Field
                  label="Owner name"
                value={`${toSentenceCase(shelter.owner.first_name)} ${toSentenceCase(shelter.owner.last_name)}`}
raw
                />
             <Field label="Official email" value={shelter.owner.email} raw />
                <Field label="Official phone" value={shelter.owner.phone} />
              </Section>
            )}

            {/* NGO Details */}
            {shelter.type === "ngo" && shelter.ngo_details && (
              <Section title="NGO details">
                <Field
                  label="Registration type"
                  value={shelter.ngo_details.registration_type}
                />
                <Field label="Registration number" value={shelter.ngo_details.registration_number} raw />
                
                <Field
                  label="Year of registration"
                  value={shelter.ngo_details.year_of_registration}
                />
              </Section>
            )}

            {/* Government Details */}
            {shelter.type === "government" && shelter.government_details && (
              <Section title="Government details">
                <Field
                  label="Department name"
                  value={shelter.government_details.department_name}
                />
                <Field
                  label="Municipality"
                  value={shelter.government_details.municipality}
                />
                <Field
                  label="Office"
                  value={shelter.government_details.office}
                />
                <Field
                  label="Government ID"
                  value={shelter.government_details.government_id_number}
                />
              </Section>
            )}

            {/* Rescuer Details */}
            {shelter.type === "rescuer" && shelter.rescuer_details && (
              <>
                <Section title="Rescuer details">
                  <Field
                    label="ID type"
                    value={
                      ID_TYPE_LABELS[shelter.rescuer_details.id_type] ||
                      shelter.rescuer_details.id_type
                    }
                    raw
                  />
                  <Field label="ID number" value={shelter.rescuer_details.id_number} raw />
                </Section>
                {shelter.rescuer_details.rescue_story && (
                  <div
                    style={{
                      padding: "20px 28px",
                      borderBottom: "1px solid #F0F0F0",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9CA3AF",
                        letterSpacing: "0.07em",
                       
                      }}
                    >
                      Rescue story
                    </span>
                    <p
                      style={{
                        margin: "6px 0 0 0",
                        fontSize: "14px",
                        color: "#374151",
                        lineHeight: 1.6,
                        wordBreak: "break-word",
                      }}
                    >
                      {shelter.rescuer_details.rescue_story}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Uploaded Documents */}
            {shelter.files?.length > 0 && (
              <div
                style={{
                  padding: "20px 28px",
                  borderBottom: "1px solid #F0F0F0",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#4F46E5",
                    letterSpacing: "0.08em",
                  
                  }}
                >
                  Uploaded documents
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {shelter.files.map((file) => (
                    <div
                      key={file.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#F9FAFB",
                        borderRadius: "10px",
                        padding: "12px 14px",
                        border: "1px solid #E5E7EB",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            background: "#EEF2FF",
                            borderRadius: "8px",
                            padding: "8px",
                            display: "flex",
                          }}
                        >
                          <FileText size={15} color="#4F46E5" />
                        </div>
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#374151",
                            fontWeight: 600,
                          }}
                        >
                          {file.file_type
                            ?.replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => {
                            const isPdf =
                              file.file_url?.includes("/raw/upload/") ||
                              file.file_url?.toLowerCase().endsWith(".pdf");
                            if (isPdf) setPdfUrl(file.file_url);
                            else window.open(file.file_url, "_blank");
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            background: "#EEF2FF",
                            color: "#4F46E5",
                            borderRadius: "8px",
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <Eye size={13} /> View
                        </button>
                        <a
                          href={file.file_url.replace(
                            "/upload/",
                            "/upload/fl_attachment/",
                          )}
                          download={file.file_type}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            background: "#D1FAE5",
                            color: "#065F46",
                            borderRadius: "8px",
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          <Download size={13} /> Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* End Main Card */}

          {/* Rejection Reason Display */}
          {shelter.status === "Rejected" && shelter.rejection_reason && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "14px",
                padding: "18px 22px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#991B1B",
                
                  letterSpacing: "0.06em",
                  marginBottom: "6px",
                }}
              >
                Rejection reason
              </div>
              <div
                style={{ fontSize: "14px", color: "#7F1D1D", lineHeight: 1.6 }}
              >
                {shelter.rejection_reason}
              </div>
            </div>
          )}

          {/* Reject Input Box */}
          {showRejectInput && (
            <div
              ref={rejectBoxRef}
              style={{
                background: "#fff",
                border: "2px solid #EF4444",
                borderRadius: "14px",
                padding: "24px",
                marginBottom: "16px",
                boxShadow: "0 4px 16px rgba(239,68,68,0.12)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    background: "#FEE2E2",
                    borderRadius: "8px",
                    padding: "6px 8px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>✏️</span>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#DC2626",
                    }}
                  >
                    Rejection Reason <span style={{ color: "#DC2626" }}>*</span>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#9CA3AF",
                      marginTop: "1px",
                    }}
                  >
                    This reason will be sent to the shelter owner via email and
                    shown on their waiting page.
                  </div>
                </div>
              </div>
              <textarea
                autoFocus
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  setRejectError("");
                }}
                placeholder="Clearly explain why this shelter application is being rejected. Be specific so the owner can reapply with correct information..."
                rows={5}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  border: rejectError
                    ? "2px solid #DC2626"
                    : "1.5px solid #FCA5A5",
                  fontSize: "13px",
                  color: "#374151",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  lineHeight: 1.6,
                  background: "#FFF5F5",
                }}
                onFocus={(e) => (e.target.style.border = "2px solid #EF4444")}
                onBlur={(e) =>
                  (e.target.style.border = rejectError
                    ? "2px solid #DC2626"
                    : "1.5px solid #FCA5A5")
                }
              />
              {rejectError && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#DC2626",
                    marginTop: "8px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  ⚠️ {rejectError}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "32px",
            }}
          >
            {isPending && !showRejectInput && (
              <>
                <button
                  onClick={() => handleStatusUpdate("Verified")}
                  disabled={updatingId === "Verified"}
                  style={{
                    background: "linear-gradient(135deg, #059669, #10B981)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "11px 24px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(5,150,105,0.3)",
                    opacity: updatingId === "Verified" ? 0.7 : 1,
                  }}
                >
                  ✓{" "}
                  {updatingId === "Verified"
                    ? "Verifying..."
                    : "Verify Shelter"}
                </button>
                <button
                  onClick={() => setShowRejectInput(true)}
                  style={{
                    background: "linear-gradient(135deg, #DC2626, #EF4444)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "11px 24px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(220,38,38,0.3)",
                  }}
                >
                  ✗ Reject Shelter
                </button>
              </>
            )}
            {showRejectInput && (
              <>
                <button
                  onClick={() => {
                    setShowRejectInput(false);
                    setRejectionReason("");
                    setRejectError("");
                  }}
                  style={{
                    background: "#F3F4F6",
                    color: "#374151",
                    border: "none",
                    borderRadius: "10px",
                    padding: "11px 18px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleStatusUpdate("Rejected", rejectionReason)
                  }
                  disabled={updatingId === "Rejected"}
                  style={{
                    background: "linear-gradient(135deg, #DC2626, #EF4444)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "11px 24px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(220,38,38,0.3)",
                    opacity: updatingId === "Rejected" ? 0.7 : 1,
                  }}
                >
                  {updatingId === "Rejected"
                    ? "Rejecting..."
                    : "Confirm Reject"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {pdfUrl && (
        <PdfViewerModal url={pdfUrl} onClose={() => setPdfUrl(null)} />
      )}
    </>
  );
};

export default ShelterDetail;
