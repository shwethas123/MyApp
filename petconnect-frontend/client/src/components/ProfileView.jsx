// src/components/ProfileView.jsx
import { useRef, useState } from "react";
import {
  Mail, Phone, MapPin, Home, PawPrint, Clock,
  Edit3, Save, X, CheckCircle, User, Camera,
} from "lucide-react";
import LocationPicker from "./common/LocationPicker";
import { FileText, Upload } from "lucide-react";
import PdfViewerModal from "./common/PdfViewerModal";

// ── Required fields for the "Complete" badge — must mirror the backend list ─
const REQUIRED_FOR_COMPLETION = [
  "first_name", "last_name", "phone", "location",
  "living_situation", "preferred_species", "pet_experience_years",
];

// Recompute badge status from the live form while editing,
// or from saved profile data while viewing.
const isProfileComplete = (data) =>
  REQUIRED_FOR_COMPLETION.every((key) => {
    const val = data[key];
    return val !== null && val !== undefined && String(val).trim() !== "";
  });

// ── Styles ─────────────────────────────────────────────────────────────────
const ResponsiveStyles = () => (
  <style>{`
    * { box-sizing: border-box; }
    .profile-wrapper { min-height: 100vh; background: #F3F4F6; font-family: 'DM Sans', 'Segoe UI', sans-serif; padding: 24px 16px; width: 100%; overflow-x: hidden; }
    .profile-inner { max-width: 700px; margin: 0 auto; width: 100%; }
    .profile-card { background: #fff; border-radius: 20px; padding: 24px; margin-bottom: 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); width: 100%; }
    .profile-header { display: flex; flex-direction: row; align-items: flex-start; gap: 16px; }
    .profile-header-left { display: flex; flex-direction: row; align-items: center; gap: 16px; flex: 1; min-width: 0; }
    .profile-name { font-size: 18px; font-weight: 700; color: #111827; margin: 0; word-break: break-word; }
    .profile-email { font-size: 12px; color: #6B7280; margin: 3px 0 0; word-break: break-all; }
    .profile-badges { display: flex; align-items: center; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
    .profile-edit-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #EEF2FF; color: #4F46E5; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
    .profile-action-btns { display: flex; gap: 8px; flex-shrink: 0; }
    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; min-width: 0; }
.profile-grid > * { min-width: 0; }
    .profile-section-title { font-size: 12px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.07em; margin: 0 0 20px; }

    /* Avatar */
    .avatar-wrap { position: relative; width: 72px; height: 72px; flex-shrink: 0; }
    .avatar-img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 20px rgba(99,102,241,0.25); display: block; }
    .avatar-initials { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #6366F1, #8B5CF6); display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; color: #fff; box-shadow: 0 4px 20px rgba(99,102,241,0.3); }
    .avatar-edit-overlay { position: absolute; inset: 0; border-radius: 50%; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.18s; cursor: pointer; }
    .avatar-wrap:hover .avatar-edit-overlay { opacity: 1; }
    .avatar-input { display: none; }
    .avatar-edit-hint { font-size: 10px; color: #6B7280; margin-top: 4px; text-align: center; white-space: nowrap; }

    @media (max-width: 480px) {
      .profile-wrapper { padding: 16px 12px; }
      .profile-header { flex-direction: column; gap: 14px; }
      .profile-header-left { gap: 12px; }
      .avatar-wrap, .avatar-img, .avatar-initials { width: 56px; height: 56px; }
      .avatar-initials { font-size: 20px; }
      .profile-name { font-size: 16px; }
      .profile-edit-btn { width: 100%; justify-content: center; }
      .profile-action-btns { width: 100%; }
      .profile-action-btns button { flex: 1; justify-content: center; }
      .profile-grid { grid-template-columns: 1fr; gap: 0; }
      .profile-card { padding: 18px 16px; border-radius: 16px; }
      .species-picker button { padding: 6px 10px !important; font-size: 12px !important; }
    }
  `}</style>
);

// ── Sub-components ──────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, children, error }) => (
  <div style={{ marginBottom: "18px" }}>
    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "7px" }}>
      <Icon size={11} />{label}
    </label>
    {children}
    {error && (
      <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#DC2626", display: "flex", alignItems: "center", gap: "4px" }}>
        ⚠ {error}
      </p>
    )}
  </div>
);

const LockedField = ({ value }) => (
  <div style={{ fontSize: "14px", color: "#6B7280", padding: "10px 12px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", overflow: "hidden" }}>
    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{value || "—"}</span>
    <span style={{ fontSize: "10px", color: "#9CA3AF", background: "#F3F4F6", padding: "2px 7px", borderRadius: "6px", fontWeight: 600, flexShrink: 0 }}>LOCKED</span>
  </div>
);

const Value = ({ value, placeholder = "Not set" }) => (
  <div style={{ fontSize: "14px", color: value ? "#111827" : "#D1D5DB", fontWeight: value ? 500 : 400, padding: "10px 12px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #F3F4F6", wordBreak: "break-word" }}>
    {value || placeholder}
  </div>
);

const TextInput = ({ value, onChange, placeholder, type = "text", hasError }) => (
  <input
    type={type}
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{ width: "100%", fontSize: "14px", color: "#111827", padding: "10px 12px", background: "#fff", borderRadius: "10px", border: hasError ? "1.5px solid #DC2626" : "1.5px solid #6366F1", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
  />
);

const SPECIES = [
  { value: "dog",    label: "🐕 Dog"    },
  { value: "cat",    label: "🐈 Cat"    },
  { value: "birds",  label: "🐦 Birds"  },
  { value: "rabbit", label: "🐇 Rabbit" },
  { value: "both",   label: "🐾 All"    },
];

const SpeciesPicker = ({ value, onChange }) => (
  <div className="species-picker" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
    {SPECIES.map((s) => (
      <button
        key={s.value}
        type="button"
        onClick={() => onChange(s.value)}
        style={{ padding: "7px 13px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s", border: value === s.value ? "none" : "1.5px solid #E5E7EB", background: value === s.value ? "#4F46E5" : "#fff", color: value === s.value ? "#fff" : "#374151", boxShadow: value === s.value ? "0 2px 8px rgba(79,70,229,0.25)" : "none" }}
      >
        {s.label}
      </button>
    ))}
  </div>
);

// ── Avatar with optional photo upload ─────────────────────────────────────
const Avatar = ({ firstName, lastName, photoUrl, isEditing, onPhotoChange }) => {
  const fileInputRef = useRef(null);
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";

  const handleClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onPhotoChange(file);
    // Reset so the same file can be re-selected if needed
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <div className="avatar-wrap" onClick={handleClick} title={isEditing ? "Click to change photo" : undefined}>
        {photoUrl ? (
          <img src={photoUrl} alt="Profile" className="avatar-img" />
        ) : (
          <div className="avatar-initials">{initials}</div>
        )}

        {/* Camera overlay — only visible on hover when editing */}
        {isEditing && (
          <div className="avatar-edit-overlay">
            <Camera size={18} color="#fff" />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="avatar-input"
          onChange={handleFileChange}
        />
      </div>

      {isEditing && (
        <span className="avatar-edit-hint">Click to change</span>
      )}
    </div>
  );
};

// ── CompletionBadge ────────────────────────────────────────────────────────
const CompletionBadge = ({ isComplete }) =>
  isComplete ? (
    <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "4px" }}>
      <CheckCircle size={10} /> Complete
    </span>
  ) : (
    <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "4px" }}>
      ⚠ Incomplete
    </span>
  );

// ── Document slot ─────────────────────────────────────────────────────────
const DocSlot = ({ label, hint, accept, savedUrl, file, preview, isEditing, onChange, onClear }) => {
  const [showPdf, setShowPdf] = useState(false);
  const inputRef = useRef(null);
  const handleFile = (e) => { const f = e.target.files?.[0]; if (f) onChange(f); e.target.value = ""; };
  const savedFileName = savedUrl
    ? decodeURIComponent(savedUrl.split("/").pop().split("?")[0]).slice(0, 40)
    : null;
  const isPdf = file ? file.type === "application/pdf" : savedUrl?.endsWith(".pdf");

  const handleView = (e) => {
    e.preventDefault();
    const isPdfUrl = savedUrl?.includes("/raw/upload/") ||
                     savedUrl?.toLowerCase().endsWith(".pdf");
    if (isPdfUrl) {
      setShowPdf(true);
    } else {
      window.open(savedUrl, "_blank");
    }
  };

  if (!isEditing) {
    if (!savedUrl) return (
      <div style={{ marginBottom: "18px" }}>
        <label style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"11px", fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"7px" }}>
          <FileText size={11}/>{label}
        </label>
        <div style={{ fontSize:"14px", color:"#D1D5DB", padding:"10px 12px", background:"#F9FAFB", borderRadius:"10px", border:"1px solid #F3F4F6" }}>Not uploaded</div>
      </div>
    );
    return (
      <div style={{ marginBottom:"18px" }}>
        <label style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"11px", fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"7px" }}>
          <FileText size={11}/>{label}
        </label>

        {/* PDF Modal */}
        {showPdf && <PdfViewerModal url={savedUrl} onClose={() => setShowPdf(false)} />}

        <a href={savedUrl} target="_blank" rel="noopener noreferrer"
          onClick={handleView}
          style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", background:"#F0F9FF", borderRadius:"10px", border:"1px solid #BAE6FD", textDecoration:"none", color:"#0369A1", fontSize:"13px", fontWeight:600, minWidth:0, overflow:"hidden" }}>
          <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:"#DBEAFE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <FileText size={16} color="#2563EB"/>
          </div>
          <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{savedFileName || label}</span>
          <span style={{ fontSize:"11px", color:"#38BDF8", fontWeight:700, background:"#E0F2FE", padding:"2px 8px", borderRadius:"6px", flexShrink:0 }}>VIEW ↗</span>
        </a>
      </div>
    );
  }

  return (
    <div style={{ marginBottom:"18px" }}>
      <label style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"11px", fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"7px" }}>
        <FileText size={11}/>{label}
      </label>
      {hint && <p style={{ fontSize:"11px", color:"#9CA3AF", marginBottom:"8px", marginTop:"-4px" }}>{hint}</p>}

      {file ? (
        <div style={{ border:"2px solid #A7F3D0", borderRadius:"14px", padding:"14px", background:"#F0FDF4", display:"flex", alignItems:"center", gap:"10px" }}>
          {preview
            ? <img src={preview} alt="preview" style={{ width:"40px", height:"40px", borderRadius:"8px", objectFit:"cover", flexShrink:0 }}/>
            : <div style={{ width:"40px", height:"40px", borderRadius:"8px", background:"#DCFCE7", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"18px" }}>{isPdf ? "📄" : "🖼️"}</div>
          }
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:"13px", fontWeight:600, color:"#111827", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", margin:0 }}>{file.name}</p>
            <p style={{ fontSize:"11px", color:"#059669", fontWeight:600, margin:"2px 0 0" }}>✓ New file selected</p>
          </div>
          <button type="button" onClick={onClear} style={{ background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", padding:"4px", borderRadius:"6px" }}>
            <X size={15}/>
          </button>
        </div>
      ) : savedUrl ? (
        <div style={{ border:"2px solid #BAE6FD", borderRadius:"14px", padding:"14px", background:"#F0F9FF", display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"40px", height:"40px", borderRadius:"8px", background:"#E0F2FE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <FileText size={18} color="#0284C7"/>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:"13px", fontWeight:600, color:"#111827", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", margin:0 }}>{savedFileName || "Uploaded document"}</p>
            <p style={{ fontSize:"11px", color:"#0284C7", fontWeight:600, margin:"2px 0 0" }}>✓ Already on file</p>
          </div>
          <button type="button" onClick={() => inputRef.current?.click()}
            style={{ display:"flex", alignItems:"center", gap:"6px", padding:"6px 11px", background:"#F9FAFB", color:"#6B7280", border:"1.5px solid #E5E7EB", borderRadius:"8px", fontSize:"12px", fontWeight:600, cursor:"pointer" }}>
            <Upload size={12}/> Replace
          </button>
          <input ref={inputRef} type="file" accept={accept} style={{ display:"none" }} onChange={handleFile}/>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()}
          style={{ border:"2px dashed #E5E7EB", borderRadius:"14px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", cursor:"pointer", transition:"border-color 0.18s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor="#A5B4FC"}
          onMouseLeave={e => e.currentTarget.style.borderColor="#E5E7EB"}>
          <Upload size={20} color="#9CA3AF"/>
          <p style={{ fontSize:"13px", color:"#6B7280", fontWeight:500, margin:0 }}>Click to upload <span style={{ color:"#4F46E5", fontWeight:600 }}>{label}</span></p>
          <p style={{ fontSize:"11px", color:"#9CA3AF", margin:0 }}>JPG, PNG or PDF · Max 10MB</p>
          <input ref={inputRef} type="file" accept={accept} style={{ display:"none" }} onChange={handleFile}/>
        </div>
      )}
    </div>
  );
};

// ── ProfileView ─────────────────────────────────────────────────────────────
const ProfileView = ({
  profile,
  form,
  isEditing,
  isSaving,
  isDirty,
  saveSuccess,
  error,
  fieldErrors = {},
  photoPreview,
  onEdit,
  onCancel,
  onSave,
  onFormChange,
  onPhotoChange,
  aadharFile, aadharPreview, rentalFile, rentalPreview,
  onAadharChange, onAadharClear, onRentalChange, onRentalClear,
}) => {
  const speciesLabel = SPECIES.find((s) => s.value === profile?.preferred_species)?.label || null;

  const experienceDisplay = (() => {
    const val = profile?.pet_experience_years;
    if (val === null || val === undefined || val === "") return null;
    const num = Number(val);
    if (isNaN(num)) return null;
    return `${num} year${num !== 1 ? "s" : ""}`;
  })();

  const badgeComplete = isEditing ? isProfileComplete(form) : isProfileComplete(profile || {});

  const displayPhoto = isEditing
    ? (photoPreview || profile?.profile_photo || null)
    : (profile?.profile_photo || null);

  return (
    <div className="profile-wrapper">
      <ResponsiveStyles />
      <div className="profile-inner">

        <div className="profile-card">

          <div className="profile-header">
            <div className="profile-header-left">
              <Avatar
                firstName={isEditing ? form.first_name : profile?.first_name}
                lastName={isEditing ? form.last_name  : profile?.last_name}
                photoUrl={displayPhoto}
                isEditing={isEditing}
                onPhotoChange={onPhotoChange}
              />
              <div style={{ minWidth: 0 }}>
                <h1 className="profile-name">
                  {[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "—"}
                </h1>
                <p className="profile-email">{profile?.email}</p>
                <div className="profile-badges">
                  <span style={{ background: "#EEF2FF", color: "#4F46E5", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", textTransform: "capitalize" }}>
                    {profile?.role || "adopter"}
                  </span>
                  <CompletionBadge isComplete={badgeComplete} />
                </div>
              </div>
            </div>

            {!isEditing ? (
              <button className="profile-edit-btn" onClick={onEdit}>
                <Edit3 size={14} /> Edit Profile
              </button>
            ) : (
              <div className="profile-action-btns">
                <button
                  onClick={onCancel}
                  style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", background: "#F3F4F6", color: "#6B7280", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                >
                  <X size={13} /> Cancel
                </button>
                <button
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={onSave}
                  disabled={isSaving || !isDirty}
                  style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "8px 14px", background: "#4F46E5", color: "#fff",
                    border: "none", borderRadius: "10px", fontSize: "13px",
                    fontWeight: 600,
                    cursor: isSaving || !isDirty ? "not-allowed" : "pointer",
                    opacity: isSaving || !isDirty ? 0.5 : 1,
                  }}
                >
                  <Save size={13} /> {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          {saveSuccess && (
            <div style={{ background: "#D1FAE5", border: "1px solid #6EE7B7", color: "#065F46", borderRadius: "12px", padding: "12px 16px", marginTop: "16px", fontSize: "13px", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle size={13} /> Profile updated successfully!
            </div>
          )}
          {error && (
            <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B", borderRadius: "12px", padding: "12px 16px", marginTop: "16px", fontSize: "13px", fontWeight: 500 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ borderTop: "1px solid #F3F4F6", margin: "24px 0" }} />

          <h2 className="profile-section-title">Personal Info</h2>
          <div className="profile-grid">
            <Field label="First Name" icon={User} error={isEditing ? fieldErrors.first_name : null}>
              {isEditing
                ? <TextInput value={form.first_name} onChange={(v) => onFormChange("first_name", v)} placeholder="First name" hasError={!!fieldErrors.first_name} />
                : <Value value={profile?.first_name} />}
            </Field>
            <Field label="Last Name" icon={User} error={isEditing ? fieldErrors.last_name : null}>
              {isEditing
                ? <TextInput value={form.last_name} onChange={(v) => onFormChange("last_name", v)} placeholder="Last name" hasError={!!fieldErrors.last_name} />
                : <Value value={profile?.last_name} />}
            </Field>
            <Field label="Email" icon={Mail}>
              <LockedField value={profile?.email} />
            </Field>
            <Field label="Phone" icon={Phone} error={isEditing ? fieldErrors.phone : null}>
              {isEditing
                ? <TextInput value={form.phone} onChange={(v) => onFormChange("phone", v)} placeholder="10-digit number" type="tel" hasError={!!fieldErrors.phone} />
                : <Value value={profile?.phone ? String(profile.phone) : null} placeholder="Not provided" />}
            </Field>
          </div>

          <div style={{ borderTop: "1px solid #F3F4F6", margin: "8px 0 24px" }} />

          <h2 className="profile-section-title">Adoption Preferences</h2>
          <div className="profile-grid">
            <Field label="Location" icon={MapPin}>
              {isEditing ? (
                <LocationPicker
                  value={form.location}
                  onChange={(v) => onFormChange("location", v)}
                  onClear={() => onFormChange("location", "")}
                  onLocationDetected={(coords) => setLocationCoords(coords)} 
                />
              ) : (
                <Value value={profile?.location} />
              )}
            </Field>
            <Field label="Living Situation" icon={Home} error={isEditing ? fieldErrors.living_situation : null}>
              {isEditing
                ? <TextInput value={form.living_situation} onChange={(v) => onFormChange("living_situation", v)} placeholder="e.g. Apartment" />
                : <Value value={profile?.living_situation} />}
            </Field>
            <Field label="Pet Experience (years)" icon={Clock} error={isEditing ? fieldErrors.pet_experience_years : null}>
              {isEditing
                ? <TextInput value={form.pet_experience_years ?? ""} onChange={(v) => onFormChange("pet_experience_years", v)} placeholder="e.g. 3" type="number" hasError={!!fieldErrors.pet_experience_years} />
                : <Value value={experienceDisplay} />}
            </Field>
          </div>

          <Field label="Preferred Species" icon={PawPrint}>
            {isEditing
              ? <SpeciesPicker value={form.preferred_species} onChange={(v) => onFormChange("preferred_species", v)} />
              : <Value value={speciesLabel} />}
          </Field>

          <div style={{ borderTop:"1px solid #F3F4F6", margin:"8px 0 24px" }}/>

          <h2 className="profile-section-title">Identity Documents</h2>

          {!isEditing && (
            <div style={{ display:"flex", alignItems:"flex-start", gap:"10px", background:"#F0F9FF", border:"1px solid #BAE6FD", borderRadius:"12px", padding:"12px 14px", marginBottom:"20px" }}>
              <span style={{ fontSize:"16px", flexShrink:0 }}>🔒</span>
              <p style={{ fontSize:"12px", color:"#0369A1", margin:0, lineHeight:1.6 }}>
                Documents are stored securely and shared only with shelters you apply to, solely for identity verification.
              </p>
            </div>
          )}

          <div className="profile-grid">
            <DocSlot
              label="Aadhaar Card"
              hint="Front side · JPG, PNG or PDF"
              accept="image/jpeg,image/png,application/pdf"
              savedUrl={profile?.aadhar_proof_url}
              file={aadharFile}
              preview={aadharPreview}
              isEditing={isEditing}
              onChange={onAadharChange}
              onClear={onAadharClear}
            />
            <DocSlot
              label="Rental Agreement"
              hint="Shows pets are permitted · JPG, PNG or PDF"
              accept="image/jpeg,image/png,application/pdf"
              savedUrl={profile?.rental_agreement_url}
              file={rentalFile}
              preview={rentalPreview}
              isEditing={isEditing}
              onChange={onRentalChange}
              onClear={onRentalClear}
            />
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfileView;