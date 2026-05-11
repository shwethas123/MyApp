import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  Image,
  FileText,
  X,
  CheckCircle,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
} from "lucide-react";
import api from "../services/Apiservices";
import ShelterSidebar from "../components/shelter/ShelterSidebar";
import PdfViewerModal from "../components/common/PdfViewerModal";


const MAX_FILE_SIZE = 10 * 1024 * 1024;
const validateFile = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    alert(`"${file.name}" exceeds 10MB limit.`);
    return false;
  }
  return true;
};

// ── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, required }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-800">
          {title}
          {required && <span className="text-red-400 ml-1">*</span>}
        </h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── INPUT FIELD ─────────────────────────────────────────────────────────────
function InputField({ label, required, placeholder, type = "text", value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-gray-600 tracking-wide">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        className={`border rounded-lg px-3.5 py-2.5 text-sm text-gray-700
          placeholder-gray-300 transition-all bg-white outline-none
          ${error
            ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-50"
            : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 hover:border-gray-300"}`}
      />
      {error && (
        <p className="text-[11px] text-red-500 mt-0.5 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// ── SELECT FIELD ────────────────────────────────────────────────────────────
function SelectField({ label, required, options, value, onChange, placeholder, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-gray-600 tracking-wide">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        value={value || ""}
        onChange={onChange}
        className={`border rounded-lg px-3.5 py-2.5 text-sm text-gray-600
          transition-all bg-white outline-none cursor-pointer
          ${error
            ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-50"
            : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 hover:border-gray-300"}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-[11px] text-red-500 mt-0.5">⚠ {error}</p>}
    </div>
  );
}

// ── RADIO GROUP ─────────────────────────────────────────────────────────────
function RadioGroup({ label, required, name, options, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-semibold text-gray-600 tracking-wide">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="flex items-center gap-3 flex-wrap">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border text-sm font-medium transition-all
              ${String(value) === String(opt.value)
                ? "border-blue-400 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
              }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={String(value) === String(opt.value)}
              onChange={onChange}
              className="hidden"
            />
            {String(value) === String(opt.value) && (
              <CheckCircle size={12} className="text-blue-500" />
            )}
            {opt.label}
          </label>
        ))}
      </div>
      {error && <p className="text-[11px] text-red-500 mt-0.5">⚠ {error}</p>}
    </div>
  );
}

function BooleanRadio({ label, name, value, onChange, required }) {
  return (
    <RadioGroup
      label={label}
      name={name}
      required={required}
      options={[
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ]}
      value={value}
      onChange={onChange}
    />
  );
}

// ── EXISTING IMAGE SLOT ─────────────────────────────────────────────────────
function ExistingImageSlot({ label, imageUrl, newFile, onUpload, onRemove }) {
  const displayUrl = newFile ? URL.createObjectURL(newFile) : imageUrl;
  return (
    <div
      onClick={() => document.getElementById(`edit-photo-${label}`).click()}
      className="relative border-2 border-dashed border-gray-200 rounded-xl h-44
        flex flex-col items-center justify-center cursor-pointer
        hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
    >
      {displayUrl ? (
        <>
          <img src={displayUrl} alt={label} className="w-full h-full object-contain rounded-xl p-1" />
          <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-semibold">Click to replace</span>
          </div>
          {newFile && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-50 transition-colors z-10"
            >
              <X size={12} className="text-red-400" />
            </button>
          )}
          {newFile && (
            <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
              NEW
            </span>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
            <Image size={18} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 group-hover:text-blue-500 block transition-colors">{label}</span>
            <span className="text-[10px] text-gray-300">Click to upload</span>
          </div>
        </div>
      )}
      <input
        id={`edit-photo-${label}`}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files[0] && validateFile(e.target.files[0]) && onUpload(e.target.files[0])}
      />
    </div>
  );
}

// ── DOCUMENT SLOT ──────────────────────────────────────────────────────────
function DocumentSlot({ id, label, required, existingUrl, newFile, onUpload, onRemove, onViewFile, error }) {
  const [hovering, setHovering] = useState(false);
  return (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-gray-600 tracking-wide block mb-2">
        {label}{required && <span className="text-red-400"> *</span>}
      </label>
      <div
        onClick={() => document.getElementById(id).click()}
        className={`flex-1 border-2 border-dashed rounded-xl p-5 flex flex-col
          items-center justify-center cursor-pointer hover:bg-blue-50/30
          transition-all min-h-[140px] relative group
          ${error ? "border-red-300 bg-red-50/20" : "border-gray-200 hover:border-blue-300"}`}
      >
        {newFile ? (
          <>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
              <FileText size={18} className="text-blue-500" />
            </div>
            <span className="text-xs text-gray-600 text-center break-all max-w-full px-2 font-medium">{newFile.name}</span>
            <span className="text-[10px] text-blue-500 mt-1 font-semibold">NEW FILE</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); window.open(URL.createObjectURL(newFile), "_blank"); }}
              className="text-[10px] font-semibold text-blue-500 hover:text-blue-700 underline mt-1 transition-colors"
            >
              View new file ↗
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-red-50 transition-colors"
            >
              <X size={11} className="text-red-400" />
            </button>
          </>
        ) : existingUrl ? (
          <>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-2">
              <FileText size={18} className="text-green-500" />
            </div>
            <button
              type="button"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              onClick={(e) => {
                e.stopPropagation();
                const isPdf = existingUrl?.includes("/raw/upload/") || existingUrl?.toLowerCase().endsWith(".pdf");
                if (isPdf) onViewFile(existingUrl);
                else window.open(existingUrl, "_blank");
              }}
              className="text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg transition-colors z-10 flex items-center gap-1"
            >
              <FileText size={11} /> View existing file ↗
            </button>
            <span className="text-[10px] text-gray-400 mt-2">Click card to replace</span>
            <div className={`absolute inset-0 rounded-xl bg-blue-500/5 transition-opacity pointer-events-none ${hovering ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`} />
          </>
        ) : (
          <>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors
              ${error ? "bg-red-100" : "bg-gray-100 group-hover:bg-blue-100"}`}>
              <FileText size={17} className={error ? "text-red-400" : "text-gray-300 group-hover:text-blue-400 transition-colors"} />
            </div>
            <span className={`text-xs font-semibold transition-colors
              ${error ? "text-red-400" : "text-gray-400 group-hover:text-blue-500"}`}>
              UPLOAD PDF/PNG
            </span>
            <span className="text-[10px] text-gray-300 mt-0.5">Max file size 10MB</span>
          </>
        )}
        <input
          id={id}
          type="file"
          accept=".pdf,image/png"
          className="hidden"
          onChange={(e) => e.target.files[0] && validateFile(e.target.files[0]) && onUpload(e.target.files[0])}
        />
      </div>
      {error && <p className="text-[11px] text-red-500 mt-1">⚠ {error}</p>}
    </div>
  );
}

// ── OPTIONS ─────────────────────────────────────────────────────────────────
const SPECIES_OPTIONS = [
  { value: "Dog", label: "🐕 Dog" },
  { value: "Cat", label: "🐈 Cat" },
  { value: "Bird", label: "🐦 Bird" },
  { value: "Rabbit", label: "🐇 Rabbit" },
  { value: "Other", label: "🐾 Other" },
];
const STATUS_OPTIONS = [
  { value: "Available", label: "Available" },
  { value: "Reserved", label: "Reserved" },
  { value: "Adopted", label: "Adopted" },
];
const STERILIZED_OPTIONS = [
  { value: "not_sterilized", label: "Not sterilized" },
  { value: "neutered", label: "Neutered" },
  { value: "spayed", label: "Spayed" },
];

// ── VALIDATION ───────────────────────────────────────────────────────────────
const LETTERS_ONLY = /^[a-zA-Z\s,]+$/;

function getErrors(form, newPhotos, newDocs, existingImages, existingDocs, newSterilizationCert) {
  const name = (form.name || "").trim();
  const temperament = (form.temperament || "").trim();
  const rescue_story = (form.rescue_story || "").trim();

  return {
    name: !name
      ? "Pet name is required"
      : name.length < 2
        ? "Name must be at least 2 characters"
        : !LETTERS_ONLY.test(name)
          ? "Name can only contain letters"
          : "",

    species: "",
    breed: "",

    age: !form.age
      ? "Age is required"
      : Number(form.age) < 0
        ? "Age must be positive"
        : Number(form.age) > 50
          ? "Age seems too high"
          : !Number.isInteger(Number(form.age))
            ? "Age must be a whole number"
            : "",

    gender: "",

    temperament: !temperament
      ? "Temperament is required"
      : !LETTERS_ONLY.test(temperament)
        ? "Temperament can only contain letters"
        : "",

    adoption_fee:
      form.adoption_fee === "" || form.adoption_fee === null || form.adoption_fee === undefined
        ? "Adoption fee is required"
        : Number(form.adoption_fee) < 0
          ? "Fee cannot be negative"
          : "",

    rescue_story: !rescue_story ? "Short description is required" : "",

    vaccination_notes:
      form.vaccinated === "false" && !(form.vaccination_notes || "").trim()
        ? "Please describe vaccination requirements"
        : "",

    mainPhoto:
      existingImages[0] === null && newPhotos[0] === null
        ? "Main photo is required"
        : "",

    health_record:
      existingDocs.health === null && newDocs.health === null
        ? "Health record is required"
        : "",

    sterilization:
      (form.sterilized === "neutered" || form.sterilized === "spayed") &&
        !newSterilizationCert &&
        !existingDocs.sterilization
        ? "Sterilization certificate is required"
        : "",
  };
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function EditPetPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [touched, setTouched] = useState({});

  // Existing data from DB
  const [existingImages, setExistingImages] = useState([null, null, null]);
  const [existingDocs, setExistingDocs] = useState({ health: null, vaccination: null, sterilization: null });

  // New files to upload
  const [newPhotos, setNewPhotos] = useState([null, null, null]);
  const [newDocs, setNewDocs] = useState({ health: null, vaccination: null });
  const [newSterilizationCert, setNewSterilizationCert] = useState(null);

  // ── Prerequisites ──────────────────────────────────────────────────────
  const [prerequisites, setPrerequisites] = useState([""]);
  const [originalPrerequisites, setOriginalPrerequisites] = useState([""]);

  const [form, setForm] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    gender: "",
    status: "Available",
    vaccinated: "true",
    special_needs: "false",
    good_with_kids: "true",
    sterilized: "not_sterilized",
    temperament: "",
    adoption_fee: "",
    rescue_story: "",
    vaccination_notes: "",
  });

  const [originalForm, setOriginalForm] = useState(null);
  const [originalImages, setOriginalImages] = useState([null, null, null]);
  const [originalDocs, setOriginalDocs] = useState({ health: null, vaccination: null, sterilization: null });
  const [pdfUrl, setPdfUrl] = useState(null);

  // ── Fetch existing pet ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await api.get(`/shelter/pets/${id}`);
        const pet = res.data.data;
        const sorted = [...(pet.images || [])].sort((a, b) => a.display_order - b.display_order);

        const formData = {
          name: pet.name || "",
          species: pet.species || "",
          breed: pet.breed || "",
          age: pet.age || "",
          gender: pet.gender || "",
          status: pet.status || "Available",
          vaccinated: pet.vaccinated !== null ? String(pet.vaccinated) : "true",
          special_needs: pet.special_needs !== null ? String(pet.special_needs) : "false",
          good_with_kids: pet.good_with_kids !== null ? String(pet.good_with_kids) : "true",
          sterilized: pet.sterilized || "not_sterilized",
          temperament: pet.temperament || "",
          adoption_fee: pet.adoption_fee || "",
          rescue_story: pet.rescue_story || "",
          vaccination_notes: pet.vaccination_notes || "",
        };

        setForm(formData);
        setOriginalForm(formData);

        setOriginalImages([
          sorted[0]?.file_url || null,
          sorted[1]?.file_url || null,
          sorted[2]?.file_url || null,
        ]);
        setOriginalDocs({
          health: pet.health_record_url || null,
          vaccination: pet.vaccination_record_url || null,
          sterilization: pet.sterilization_certificate_url || null,
        });

        setExistingImages([
          sorted[0]?.file_url || null,
          sorted[1]?.file_url || null,
          sorted[2]?.file_url || null,
        ]);
        setExistingDocs({
          health: pet.health_record_url || null,
          vaccination: pet.vaccination_record_url || null,
          sterilization: pet.sterilization_certificate_url || null,
        });

        // ── Pre-fill prerequisites ───────────────────────────────────────
        const loadedPrereqs = pet.prerequisites?.length > 0 ? pet.prerequisites : [""];
        setPrerequisites(loadedPrereqs);
        setOriginalPrerequisites(loadedPrereqs);

      } catch (err) {
        console.error("Failed to load pet:", err);
        setApiError("Failed to load pet details.");
      } finally {
        setPageLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  const touch = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    touch(field);
  };

  const errors = getErrors(form, newPhotos, newDocs, existingImages, existingDocs, newSterilizationCert);
  const isFormValid = Object.values(errors).every(e => e === "");
  const err = (field) => touched[field] ? errors[field] : "";

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      name: true, species: true, breed: true, age: true, gender: true,
      temperament: true, adoption_fee: true, rescue_story: true,
      vaccination_notes: true, mainPhoto: true, health_record: true, sterilization: true,
    });

    if (!isFormValid) return;

    setSaving(true);
    setApiError("");
    setSuccess("");

    const filteredPrereqs = prerequisites.filter(p => p.trim() !== "");

    try {
      const hasNewFiles =
        newPhotos.some(Boolean) ||
        newDocs.health ||
        newDocs.vaccination ||
        newSterilizationCert;

      const onlyStatusChanged =
        !hasNewFiles &&
        originalForm &&
        form.status !== originalForm.status &&
        JSON.stringify(filteredPrereqs) === JSON.stringify(originalPrerequisites.filter(p => p.trim() !== "")) &&
        Object.keys(form).every(
          (key) => key === "status" || form[key] === originalForm[key]
        );

      if (onlyStatusChanged) {
        await api.patch(`/shelter/pets/${id}/status`, { status: form.status });
      } else if (hasNewFiles) {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (value !== "") formData.append(key, value);
        });
        formData.append("prerequisites", JSON.stringify(filteredPrereqs));
        newPhotos.forEach((photo, index) => {
          if (photo) {
            formData.append("images", photo);
            formData.append("imageSlots", index);
          }
        });
        if (newDocs.health) formData.append("health_record", newDocs.health);
        if (newDocs.vaccination) formData.append("vaccination_record", newDocs.vaccination);
        if (newSterilizationCert) formData.append("sterilization_certificate", newSterilizationCert);

        await api.put(`/shelter/pets/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.put(`/shelter/pets/${id}`, {
          ...form,
          prerequisites: filteredPrereqs,
        });
      }

      setSuccess("Pet updated successfully!");
      setTimeout(() => navigate("/shelter/pets"), 1500);
    } catch (err) {
      console.error("Failed to update pet:", err);
      setApiError(err.response?.data?.error || "Failed to update pet. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <ShelterSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-blue-400 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading pet details...</p>
          </div>
        </div>
      </div>
    );
  }

  const PHOTO_LABELS = ["MAIN PHOTO", "SIDE VIEW", "ACTIVITY"];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ShelterSidebar />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 mt-[44px] lg:mt-0">
        {/* ── Sticky Page Header ── */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-5 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate("/shelter/pets")}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
            >
              ← Back to listings
            </button>
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900">Edit pet</h1>
              <p className="text-xs text-gray-400 mt-0.5">Update the details for this pet listing</p>
            </div>
            <div className="w-24" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-10">
          {/* Error / Success banners */}
          {apiError && (
            <div className="mb-5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}
          {success && (
            <div className="mb-5 bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* ── PET PHOTOS ── */}
            <section className="p-5 sm:p-6 border-b border-gray-100">
              <SectionHeader
                icon={<Image size={16} />}
                title="Pet photos"
                subtitle="Click any photo to replace it · JPG, PNG · Max 10MB each"
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PHOTO_LABELS.map((label, i) => (
                  <ExistingImageSlot
                    key={label}
                    label={label}
                    imageUrl={existingImages[i]}
                    newFile={newPhotos[i]}
                    onUpload={(f) => {
                      setNewPhotos((prev) => { const n = [...prev]; n[i] = f; return n; });
                      if (i === 0) touch("mainPhoto");
                    }}
                    onRemove={() => {
                      setNewPhotos((prev) => { const n = [...prev]; n[i] = null; return n; });
                      if (i === 0) touch("mainPhoto");
                    }}
                  />
                ))}
              </div>
              {err("mainPhoto") && (
                <p className="text-[11px] text-red-500 mt-2">⚠ {err("mainPhoto")}</p>
              )}
            </section>

            {/* ── BASIC INFORMATION ── */}
            <section className="p-5 sm:p-6 border-b border-gray-100">
              <SectionHeader
                icon={<span className="text-sm">🐾</span>}
                title="Basic information"
                subtitle="Update this pet's core details"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField
                  label="Pet name"
                  required
                  placeholder="Enter pet name"
                  value={form.name}
                  onChange={set("name")}
                  error={err("name")}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 tracking-wide">
                    Species
                  </label>
                  <div className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed">
                    {SPECIES_OPTIONS.find(o => o.value === form.species)?.label || form.species}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 tracking-wide">
                    Breed
                  </label>
                  <div className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed">
                    {form.breed}
                  </div>
                </div>
                <InputField
                  label="Age (years)"
                  required
                  placeholder="e.g. 3"
                  type="number"
                  value={form.age}
                  onChange={set("age")}
                  error={err("age")}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 tracking-wide">
                    Gender
                  </label>
                  <div className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed capitalize">
                    {form.gender}
                  </div>
                </div>
                <SelectField
                  label="Status"
                  required
                  options={STATUS_OPTIONS}
                  value={form.status}
                  onChange={set("status")}
                />
              </div>
            </section>

            {/* ── HEALTH & TEMPERAMENT ── */}
            <section className="p-5 sm:p-6 border-b border-gray-100">
              <SectionHeader
                icon={<span className="text-sm">❤️</span>}
                title="Health & temperament"
                subtitle="Medical and behavioral details"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                <BooleanRadio label="Vaccinated" required name="vaccinated" value={form.vaccinated} onChange={set("vaccinated")} />
                <BooleanRadio label="Special needs" required name="special_needs" value={form.special_needs} onChange={set("special_needs")} />
                <BooleanRadio label="Social friendly" required name="good_with_kids" value={form.good_with_kids} onChange={set("good_with_kids")} />
              </div>

              {/* Vaccination Notes */}
              {form.vaccinated === "false" && (
                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-600 tracking-wide block mb-2">
                    Vaccination requirements<span className="text-red-400 ml-1">*</span>
                  </label>
                  <p className="text-[11px] text-gray-400 mb-2">Describe what vaccinations this pet needs</p>
                  <textarea
                    placeholder="e.g. Needs rabies vaccine, DHPP booster due in March..."
                    value={form.vaccination_notes}
                    onChange={set("vaccination_notes")}
                    maxLength={5000}
                    rows={4}
                    className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-700
                      placeholder-gray-300 focus:ring-2 transition-all resize-none bg-white outline-none
                      ${err("vaccination_notes")
                        ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                        : "border-gray-200 focus:border-blue-400 focus:ring-blue-50 hover:border-gray-300"}`}
                  />
                  {err("vaccination_notes") && (
                    <p className="text-[11px] text-red-500 mt-1">⚠ {err("vaccination_notes")}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1 text-right">
                    {(form.vaccination_notes || "").length} / 5000
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {form.sterilized === "not_sterilized" || (
                  (form.sterilized === "neutered" || form.sterilized === "spayed") && !existingDocs.sterilization
                ) ? (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <SelectField
                      label="Sterilized"
                      required
                      options={STERILIZED_OPTIONS}
                      value={form.sterilized}
                      onChange={(e) => {
                        set("sterilized")(e);
                        setNewSterilizationCert(null);
                      }}
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      If the pet has been sterilized since registration, select the status and upload the certificate.
                    </p>

                    {(form.sterilized === "neutered" || form.sterilized === "spayed") && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 bg-white">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <FileText size={16} className="text-blue-500" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-700">
                                Sterilization Certificate<span className="text-red-400 ml-1">*</span>
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {newSterilizationCert ? newSterilizationCert.name : "PDF or PNG · max 10MB"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {newSterilizationCert && (
                              <button
                                type="button"
                                onClick={() => { setNewSterilizationCert(null); touch("sterilization"); }}
                                className="p-1 hover:bg-red-50 rounded-full transition-colors"
                              >
                                <X size={13} className="text-red-400" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => document.getElementById("edit-sterilization-cert").click()}
                              className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {newSterilizationCert ? "Change" : "Upload"}
                            </button>
                          </div>
                          <input
                            id="edit-sterilization-cert"
                            type="file"
                            accept=".pdf,image/png"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files[0] && validateFile(e.target.files[0])) {
                                setNewSterilizationCert(e.target.files[0]);
                                touch("sterilization");
                              }
                            }}
                          />
                        </div>
                        {err("sterilization") && (
                          <p className="text-[11px] text-red-500 mt-1">⚠ {err("sterilization")}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="text-xs font-semibold text-gray-600 tracking-wide block mb-2">
                      Sterilized <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center gap-4 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                      <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 capitalize">
                          {form.sterilized === "neutered" ? "Neutered" : "Spayed"}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {existingDocs.sterilization ? "Certificate uploaded during registration" : "No certificate on file"}
                        </p>
                      </div>
                      {existingDocs.sterilization ? (
                        <button
                          type="button"
                          onClick={() => {
                            const url = existingDocs.sterilization;
                            const isPdf = url?.includes("/raw/upload/") || url?.toLowerCase().endsWith(".pdf");
                            if (isPdf) setPdfUrl(url);
                            else window.open(url, "_blank");
                          }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                        >
                          <CheckCircle size={13} className="text-green-500" />
                          View certificate
                        </button>
                      ) : (
                        <span className="text-xs text-orange-400 font-semibold flex-shrink-0">No certificate</span>
                      )}
                    </div>
                  </div>
                )}

                <InputField
                  label="Temperament"
                  required
                  placeholder="e.g. Calm, Playful, Energetic"
                  value={form.temperament}
                  onChange={set("temperament")}
                  error={err("temperament")}
                />
                <InputField
                  label="Adoption fee (₹)"
                  required
                  type="number"
                  placeholder="0"
                  value={form.adoption_fee}
                  onChange={set("adoption_fee")}
                  error={err("adoption_fee")}
                />
              </div>
            </section>

            {/* ── STORY & DOCUMENTS ── */}
            <section className="p-5 sm:p-6 border-b border-gray-100">
              <SectionHeader
                icon={<FileText size={16} />}
                title="Story & documents"
                subtitle="Update rescue story or replace documents"
              />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
                {/* Rescue Story */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 tracking-wide block mb-2">
                    Short description<span className="text-red-400">*</span>
                  </label>
                  <textarea
                    placeholder="Tell us about their journey..."
                    value={form.rescue_story}
                    onChange={set("rescue_story")}
                    maxLength={5000}
                    className={`flex-1 border rounded-lg px-3.5 py-2.5 text-sm text-gray-700
                      placeholder-gray-300 focus:ring-2 transition-all resize-none bg-white outline-none w-full min-h-[160px]
                      ${err("rescue_story")
                        ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                        : "border-gray-200 focus:border-blue-400 focus:ring-blue-50 hover:border-gray-300"}`}
                  />
                  {err("rescue_story") && (
                    <p className="text-[11px] text-red-500 mt-1">⚠ {err("rescue_story")}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1 text-right">
                    {(form.rescue_story || "").length} / 5000
                  </p>
                </div>

                {/* Documents */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DocumentSlot
                    id="edit-doc-health"
                    label="Health records"
                    required
                    existingUrl={existingDocs.health}
                    newFile={newDocs.health}
                    error={err("health_record")}
                    onUpload={(f) => { setNewDocs((p) => ({ ...p, health: f })); touch("health_record"); }}
                    onRemove={() => { setNewDocs((p) => ({ ...p, health: null })); touch("health_record"); }}
                    onViewFile={setPdfUrl}
                  />
                  <DocumentSlot
                    id="edit-doc-vaccination"
                    label="Vaccination proof"
                    existingUrl={existingDocs.vaccination}
                    newFile={newDocs.vaccination}
                    onUpload={(f) => setNewDocs((p) => ({ ...p, vaccination: f }))}
                    onRemove={() => setNewDocs((p) => ({ ...p, vaccination: null }))}
                    onViewFile={setPdfUrl}
                  />
                </div>
              </div>
            </section>

            {/* ── ADOPTION GUIDELINES ── */}
            <section className="p-5 sm:p-6 border-b border-gray-100">
              <SectionHeader
                icon={<span className="text-sm">📋</span>}
                title="Adoption guidelines"
                subtitle="List requirements the adopter must meet · Max 5 points"
              />
              <div className="flex flex-col gap-3">
                {prerequisites.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-300 w-4 flex-shrink-0">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Must have a fenced yard"
                      value={item}
                      onChange={(e) => {
                        const updated = [...prerequisites];
                        updated[index] = e.target.value;
                        setPrerequisites(updated);
                      }}
                      className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm
                        text-gray-700 placeholder-gray-300 focus:border-blue-400 focus:ring-2
                        focus:ring-blue-50 hover:border-gray-300 outline-none transition-all bg-white"
                    />
                    {prerequisites.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPrerequisites(prerequisites.filter((_, i) => i !== index))}
                        className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 flex items-center
                          justify-center transition-colors flex-shrink-0"
                      >
                        <X size={12} className="text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {prerequisites.length < 5 && (
                <button
                  type="button"
                  onClick={() => setPrerequisites([...prerequisites, ""])}
                  className="mt-3 flex items-center gap-2 text-xs font-semibold text-blue-600
                    hover:text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100
                    px-3 py-1.5 rounded-lg transition-colors"
                >
                  <PlusCircle size={13} />
                  Add guidelines
                </button>
              )}
            </section>

            {/* ── ACTIONS ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 sm:p-6 bg-gray-50/60">
              <p className="text-xs text-gray-400 order-2 sm:order-1">
                Fields marked with <span className="text-red-400">*</span> are required
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm(originalForm);
                    setExistingImages(originalImages);
                    setExistingDocs(originalDocs);
                    setNewPhotos([null, null, null]);
                    setNewDocs({ health: null, vaccination: null });
                    setNewSterilizationCert(null);
                    setPrerequisites(originalPrerequisites);
                    setApiError("");
                    setTouched({});
                  }}
                  disabled={saving}
                  className="flex-1 sm:flex-none sm:w-36 h-11 text-sm text-gray-500 font-medium
                    rounded-xl border border-gray-200 bg-white hover:bg-red-50 hover:text-red-500
                    hover:border-red-200 transition-all disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={saving || !isFormValid}
                  className="flex-1 sm:flex-none sm:w-36 h-11 text-sm font-semibold text-white
                    bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center
                    gap-2 transition-all shadow-sm shadow-blue-200 disabled:opacity-70
                    disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {pdfUrl && <PdfViewerModal url={pdfUrl} onClose={() => setPdfUrl(null)} />}
    </div>
  );
}