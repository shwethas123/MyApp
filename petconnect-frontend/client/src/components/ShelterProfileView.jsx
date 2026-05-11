// src/components/shelter/ShelterProfileView.jsx
import { useRef, useState } from "react";
import { Edit3, Save, X, CheckCircle, MapPin, Mail, Phone, Globe, FileText, Building2, User, Trash2, Upload, Plus, Camera } from "lucide-react";
import ShelterSidebar from "../components/shelter/ShelterSidebar";
import LocationPicker from "../components/common/LocationPicker";
import PdfViewerModal from "../components/common/PdfViewerModal";

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, children, error }) => (
  <div style={{ marginBottom: "16px" }}>
    <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>
      <Icon size={10} />{label}
    </label>
    {children}
    {error && <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#DC2626" }}>⚠ {error}</p>}
  </div>
);

const Value = ({ value, placeholder = "Not set" }) => (
  <div style={{ fontSize: "13px", color: value ? "#1B3A4B" : "#D1D5DB", fontWeight: value ? 500 : 400, padding: "9px 12px", background: "#F9FAFB", borderRadius: "8px", border: "1px solid #F3F4F6", wordBreak: "break-word" }}>
    {value || placeholder}
  </div>
);

const TextInput = ({ value, onChange, placeholder, type = "text", hasError }) => (
  <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: "100%", fontSize: "13px", color: "#1B3A4B", padding: "9px 12px", background: "#fff", borderRadius: "8px", border: hasError ? "1.5px solid #DC2626" : "1.5px solid #3182CE", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
  />
);

const StatusBadge = ({ status }) => {
  const config = {
    Verified: { bg: "#D1FAE5", color: "#065F46", label: "✓ Verified" },
    Pending:  { bg: "#FEF3C7", color: "#92400E", label: "⏳ Pending Review" },
    Rejected: { bg: "#FEE2E2", color: "#991B1B", label: "✗ Rejected" },
    Inactive: { bg: "#F3F4F6", color: "#6B7280", label: "Inactive" },
  };
  const c = config[status] || config.Pending;
  return <span style={{ background: c.bg, color: c.color, fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>{c.label}</span>;
};

const TypeBadge = ({ type }) => {
  const labels = { ngo: "NGO", government: "Government", rescuer: "Rescuer" };
  return <span style={{ background: "#EFF6FF", color: "#3182CE", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>{labels[type] || type}</span>;
};

const Card = ({ title, children }) => (
  <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #F3F4F6", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", padding: "20px", marginBottom: "16px" }}>
    {title && <p style={{ fontSize: "10px", fontWeight: 700, color: "#1B3A4B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "16px" }}>{title}</p>}
    {children}
  </div>
);

// ── Document row ──────────────────────────────────────────────────────────────
const DocRow = ({ file, onDelete, isDeleting, onView }) => {
  const handleView = () => {
    let url = file.file_url;
    
    // Fix Cloudinary image/upload → raw/upload so PDF.js can load it
    if (url?.includes("/image/upload/") && url?.toLowerCase().endsWith(".pdf")) {
      url = url.replace("/image/upload/", "/raw/upload/");
    }

    const isPdf = url?.includes("/raw/upload/") || url?.toLowerCase().endsWith(".pdf");
    if (isPdf) onView(url);
    else window.open(url, "_blank");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "#F9FAFB", borderRadius: "8px", border: "1px solid #F3F4F6" }}>
      <FileText size={14} style={{ color: "#3182CE", flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: "12px", fontWeight: 500, color: "#1B3A4B", textTransform: "capitalize" }}>
        {file.file_type.replace(/_/g, " ")}
      </span>
      <button
        onClick={handleView}
        style={{ fontSize: "11px", color: "#3182CE", background: "none", border: "none", cursor: "pointer", marginRight: "8px", fontWeight: 500 }}>
        View →
      </button>
      <button onClick={() => onDelete(file.id)} disabled={isDeleting}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", background: isDeleting ? "#F3F4F6" : "#FEE2E2", border: "none", borderRadius: "6px", cursor: isDeleting ? "not-allowed" : "pointer", flexShrink: 0 }}>
        {isDeleting
          ? <div style={{ width: "12px", height: "12px", border: "2px solid #E5E7EB", borderTopColor: "#9CA3AF", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
          : <Trash2 size={12} style={{ color: "#DC2626" }} />}
      </button>
    </div>
  );
};
// ── Upload new document ───────────────────────────────────────────────────────
const FILE_TYPES = [
  { value: "registration_certificate", label: "Registration Certificate" },
  { value: "government_authorization", label: "Government Authorization" },
  { value: "id_proof",                 label: "ID Proof"                 },
  { value: "additional_document",      label: "Additional Document"      },
];

const UploadDocRow = ({ onUpload, isUploading }) => {
  const [selectedType, setSelectedType] = useState("additional_document");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);

  const handleSubmit = () => {
    if (!selectedFile) return;
    onUpload(selectedFile, selectedType);
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div style={{ marginTop: "12px", padding: "12px", background: "#EFF6FF", borderRadius: "8px", border: "1px dashed #93C5FD" }}>
      <p style={{ fontSize: "11px", fontWeight: 700, color: "#1B3A4B", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <Plus size={10} style={{ display: "inline", marginRight: "4px" }} />
        Upload New Document
      </p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "flex-end" }}>
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
          style={{ fontSize: "12px", padding: "7px 10px", borderRadius: "7px", border: "1px solid #BFDBFE", background: "#fff", color: "#1B3A4B", outline: "none", flex: "1", minWidth: "160px" }}>
          {FILE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 12px", background: "#fff", border: "1px solid #BFDBFE", borderRadius: "7px", cursor: "pointer", fontSize: "12px", color: "#3182CE", fontWeight: 500, flex: "1", minWidth: "140px" }}>
          <Upload size={12} />
          {selectedFile ? selectedFile.name.slice(0, 20) + (selectedFile.name.length > 20 ? "..." : "") : "Choose file"}
          <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }}
            onChange={(e) => setSelectedFile(e.target.files[0] || null)} />
        </label>
        <button onClick={handleSubmit} disabled={!selectedFile || isUploading}
          style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", background: !selectedFile || isUploading ? "#E5E7EB" : "#3182CE", color: !selectedFile || isUploading ? "#9CA3AF" : "#fff", border: "none", borderRadius: "7px", fontSize: "12px", fontWeight: 600, cursor: !selectedFile || isUploading ? "not-allowed" : "pointer", flexShrink: 0 }}>
          {isUploading
            ? <><div style={{ width: "11px", height: "11px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> Uploading...</>
            : <><Upload size={11} /> Upload</>}
        </button>
      </div>
    </div>
  );
};

// ── Clickable Avatar with photo upload ────────────────────────────────────────
const ShelterAvatar = ({ shelter, onPhotoUpload, isUploadingPhoto }) => {
  const fileRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onPhotoUpload(file);
    e.target.value = "";
  };

  const showOverlay = hovered || isUploadingPhoto;

  return (
    <div
      onClick={() => !isUploadingPhoto && fileRef.current?.click()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Click to change profile photo"
      style={{
        position: "relative",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        flexShrink: 0,
        cursor: isUploadingPhoto ? "not-allowed" : "pointer",
      }}
    >
      {shelter?.profile_photo_url ? (
        <img
          src={shelter.profile_photo_url}
          alt="Shelter profile"
          style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div style={{
          width: "60px", height: "60px", borderRadius: "50%",
          background: "linear-gradient(135deg, #3182CE, #63B3ED)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "22px", fontWeight: 700, color: "#fff",
        }}>
          {shelter?.name?.[0]?.toUpperCase() || "S"}
        </div>
      )}

      {showOverlay && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "rgba(0,0,0,0.38)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {isUploadingPhoto ? (
            <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
          ) : (
            <Camera size={16} color="#fff" />
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};

// ── MAIN VIEW ─────────────────────────────────────────────────────────────────
const ShelterProfileView = ({
  shelter, form, isEditing, isSaving, saveSuccess,
  error, fieldErrors = {}, onEdit, onCancel, onSave, onFormChange,
  deletingFileId, uploadingDoc, docError, onDeleteDocument, onUploadDocument,
  isUploadingPhoto, onPhotoUpload,
  hasChanges, // ── NEW
}) => {
  const files = shelter?.files || [];

  const locationValue = [form.city, form.zipcode].filter(Boolean).join(", ");
  const [pdfUrl, setPdfUrl] = useState(null);  

  const handleLocationChange = (locationStr) => {
    if (!locationStr) {
      onFormChange("city", "");
      onFormChange("zipcode", "");
      return;
    }
    const parts   = locationStr.split(",").map((s) => s.trim());
    const city    = parts[0] || "";
    const zipcode = parts[1] || "";
    onFormChange("city", city);
    onFormChange("zipcode", zipcode);
  };

  // ── NEW: save button is disabled when no changes or while saving ──────────
  const saveDisabled = isSaving || !hasChanges;

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <ShelterSidebar />

      <div className="flex-1 w-full min-w-0 p-4 lg:p-6 overflow-y-auto mt-[44px] lg:mt-0 ">
        <div style={{ maxWidth: "760px", margin: "0 auto "}}>

          {/* ── Header card ──────────────────────────────────────────────── */}
          <Card>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>

                <ShelterAvatar
                  shelter={shelter}
                  onPhotoUpload={onPhotoUpload}
                  isUploadingPhoto={isUploadingPhoto}
                />

                <div style={{ minWidth: 0 }}>
                  <h1 style={{ fontSize: "17px", fontWeight: 700, color: "#1B3A4B", margin: "0 0 3px", wordBreak: "break-word" }}>{shelter?.name || "—"}</h1>
                  <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 7px" }}>
                    {shelter?.city}{shelter?.state ? `, ${shelter.state}` : ""}
                  </p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <TypeBadge type={shelter?.type} />
                    <StatusBadge status={shelter?.status} />
                  </div>
                </div>
              </div>

              {!isEditing ? (
                <button onClick={onEdit} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "#EFF6FF", color: "#3182CE", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
                  <Edit3 size={12} /> Edit Profile
                </button>
              ) : (
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <button onClick={onCancel} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", background: "#F3F4F6", color: "#6B7280", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                    <X size={12} /> Cancel
                  </button>
                  {/* ── CHANGED: disabled and style driven by saveDisabled ── */}
                  <button
                    onClick={onSave}
                    disabled={saveDisabled}
                    style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "8px 14px",
                      background: saveDisabled ? "#93C5FD" : "#3182CE",
                      color: "#fff",
                      border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                      cursor: saveDisabled ? "not-allowed" : "pointer",
                      opacity: 1,
                    }}>
                    <Save size={12} /> {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>

            {shelter?.status === "Rejected" && shelter?.rejection_reason && (
              <div style={{ marginTop: "14px", background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "10px 14px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#991B1B", marginBottom: "3px" }}>Rejection Reason</p>
                <p style={{ fontSize: "12px", color: "#B91C1C", margin: 0 }}>{shelter.rejection_reason}</p>
              </div>
            )}
            <div style={{ borderTop: "1px solid #F3F4F6", margin: "24px 0" }} />
            {/* ── Shelter Info ──────────────────────────────────────────────── */}
          <h3 style ={{ fontSize: "14px", fontWeight: 700, color: "#1B3A4B", margin: "20px 0 10px" }}>Shelter Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
              <Field label="Shelter Name" icon={Building2} error={isEditing ? fieldErrors.name : null}>
                {isEditing ? <TextInput value={form.name} onChange={(v) => onFormChange("name", v)} placeholder="Shelter name" hasError={!!fieldErrors.name} /> : <Value value={shelter?.name} />}
              </Field>
              <Field label="Description" icon={FileText}>
                {isEditing ? <TextInput value={form.description} onChange={(v) => onFormChange("description", v)} placeholder="Brief description" /> : <Value value={shelter?.description} />}
              </Field>
            </div>
          <div style={{ borderTop: "1px solid #F3F4F6", margin: "24px 0" }} />
          {/* ── Contact Details ───────────────────────────────────────────── */}
            <h3 style ={{ fontSize: "14px", fontWeight: 700, color: "#1B3A4B", margin: "20px 0 10px" }}>Contact Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
              <Field label="Contact Email" icon={Mail}>
                <div style={{ position: "relative" }}>
                  <Value value={shelter?.contact_email} />
                  {isEditing && (
                    <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "10px", fontWeight: 600, color: "#9CA3AF", background: "#F3F4F6", padding: "2px 7px", borderRadius: "20px", letterSpacing: "0.05em" }}>
                    </span>
                  )}
                </div>
              </Field>
              <Field label="Contact Phone" icon={Phone} error={isEditing ? fieldErrors.contact_phone : null}>
                {isEditing ? <TextInput value={form.contact_phone} onChange={(v) => onFormChange("contact_phone", v)} placeholder="Phone number" type="tel" hasError={!!fieldErrors.contact_phone} /> : <Value value={shelter?.contact_phone} />}
              </Field>
              <Field label="UPI ID (for receiving adoption payments)" icon={Phone}>
                {isEditing
                  ? <TextInput value={form.upi_id} onChange={(v) => onFormChange("upi_id", v)} placeholder="e.g. shelter@upi" />
                  : <Value value={shelter?.upi_id} placeholder="Not set — add to receive payments" />}
              </Field>
            </div>
          <div style={{ borderTop: "1px solid #F3F4F6", margin: "24px 0" }} />
          {/* ── Location ──────────────────────────────────────────────────── */}
          <h3 style ={{ fontSize: "14px", fontWeight: 700, color: "#1B3A4B", margin: "20px 0 10px" }}>Location</h3>
            {isEditing ? (
              <>
                <Field label="Auto-detect Location" icon={MapPin}>
                  <LocationPicker
                    key={locationValue || "empty"}
                    value={locationValue}
                    onChange={handleLocationChange}
                    onClear={() => { onFormChange("city", ""); onFormChange("zipcode", ""); }}
                    onLocationDetected={(coords) => setLocationCoords(coords)} 
                  />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px", marginTop: "8px" }}>
                  <Field label="City" icon={MapPin} error={fieldErrors.city}>
                    <TextInput value={form.city} onChange={(v) => onFormChange("city", v)} placeholder="City" hasError={!!fieldErrors.city} />
                  </Field>
                  <Field label="State" icon={MapPin} error={fieldErrors.state}>
                    <TextInput value={form.state} onChange={(v) => onFormChange("state", v)} placeholder="State" hasError={!!fieldErrors.state} />
                  </Field>
                  <Field label="Country" icon={Globe}>
                    <TextInput value={form.country} onChange={(v) => onFormChange("country", v)} placeholder="Country" />
                  </Field>
                  <Field label="Zipcode" icon={MapPin}>
                    <TextInput value={form.zipcode} onChange={(v) => onFormChange("zipcode", v)} placeholder="Zipcode" />
                  </Field>
                </div>
              </>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                <Field label="City"    icon={MapPin}><Value value={shelter?.city} /></Field>
                <Field label="State"   icon={MapPin}><Value value={shelter?.state} /></Field>
                <Field label="Country" icon={Globe}> <Value value={shelter?.country} /></Field>
                <Field label="Zipcode" icon={MapPin}><Value value={shelter?.zipcode ? String(shelter.zipcode) : null} /></Field>
              </div>
            )}
          <div style={{ borderTop: "1px solid #F3F4F6", margin: "24px 0" }} />
          {/* ── Type-specific details (read-only) ─────────────────────────── */}
          <h3 style ={{ fontSize: "14px", fontWeight: 700, color: "#1B3A4B", margin: "20px 0 10px" }}>Documents</h3>
          {(shelter?.ngo_details || shelter?.government_details || shelter?.rescuer_details) && (
            <Card title={`${shelter?.type === "ngo" ? "NGO" : shelter?.type === "government" ? "Government" : "Rescuer"} Details`}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                {shelter?.ngo_details && (
                  <>
                    <Field label="Registration Type"    icon={FileText}><Value value={shelter.ngo_details.registration_type} /></Field>
                    <Field label="Registration Number"  icon={FileText}><Value value={shelter.ngo_details.registration_number} /></Field>
                    <Field label="Year of Registration" icon={FileText}><Value value={String(shelter.ngo_details.year_of_registration)} /></Field>
                  </>
                )}
                {shelter?.government_details && (
                  <>
                    <Field label="Department"    icon={Building2}><Value value={shelter.government_details.department_name} /></Field>
                    <Field label="Municipality"  icon={Building2}><Value value={shelter.government_details.municipality} /></Field>
                    <Field label="Office"        icon={Building2}><Value value={shelter.government_details.office} /></Field>
                    <Field label="Government ID" icon={FileText}> <Value value={shelter.government_details.government_id_number} /></Field>
                  </>
                )}
                {shelter?.rescuer_details && (
                  <>
                    <Field label="ID Type"   icon={User}>    <Value value={shelter.rescuer_details.id_type} /></Field>
                    <Field label="ID Number" icon={FileText}><Value value={shelter.rescuer_details.id_number} /></Field>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <Field label="Rescue Story" icon={FileText}><Value value={shelter.rescuer_details.rescue_story} /></Field>
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}
          </Card>

          {/* ── Banners ───────────────────────────────────────────────────── */}
          {saveSuccess && (
            <div style={{ background: "#D1FAE5", border: "1px solid #6EE7B7", color: "#065F46", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", fontSize: "12px", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle size={13} /> Profile updated successfully!
            </div>
          )}
          {error && (
            <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", fontSize: "12px", fontWeight: 500 }}>
              ⚠️ {error}
            </div>
          )}
          {/* ── Documents ─────────────────────────────────────────────────── */}
          <Card title="Uploaded Documents" style={{ }}>
            {docError && (
              <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B", borderRadius: "8px", padding: "8px 12px", marginBottom: "10px", fontSize: "12px" }}>
                ⚠️ {docError}
              </div>
            )}
            {files.length === 0 && (
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "12px" }}>No documents uploaded yet.</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {files.map((file) => (
                <DocRow key={file.id} file={file} onDelete={onDeleteDocument} isDeleting={deletingFileId === file.id} onView={setPdfUrl}/>
              ))}
            </div>
            <UploadDocRow onUpload={onUploadDocument} isUploading={uploadingDoc} />
          </Card>

        </div>
      </div>
      {pdfUrl && <PdfViewerModal url={pdfUrl} onClose={() => setPdfUrl(null)} />}
    </div>
  );
};

export default ShelterProfileView;