  import { useState, useRef } from "react";
  import api from "../services/Apiservices";
  import { useNavigate } from "react-router-dom";
  import ShelterSidebar from "../components/shelter/ShelterSidebar";
  import {
    PlusCircle,
    Image,
    FileText,
    X,
    CheckCircle,
    Loader2,
    AlertCircle,
  } from "lucide-react";

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      alert(`"${file.name}" exceeds 10MB limit.`);
      return false;
    }
    return true;
  };

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
  function InputField({ label, required, placeholder, type = "text", value, onChange, readOnly, error, onBlur }) {
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
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          readOnly={readOnly}
          className={`border rounded-lg px-3.5 py-2.5 text-sm text-gray-700 
            placeholder-gray-300 transition-all bg-white outline-none
            ${error ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-50"
              : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 hover:border-gray-300"}
            ${readOnly ? "pointer-events-none cursor-default bg-gray-50 text-gray-500" : ""}`}
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
          <label className="text-xs font-semibold text-gray-600  tracking-wide">
            {label}{required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <select
          value={value}
          onChange={onChange}
          className={`border rounded-lg px-3.5 py-2.5 text-sm text-gray-600 
            transition-all bg-white outline-none cursor-pointer
            ${error ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-50"
              : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 hover:border-gray-300"}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
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
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          {options.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border text-sm font-medium transition-all
                ${value === opt.value
                  ? "border-blue-400 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={onChange}
                className="hidden"
              />
              {value === opt.value && (
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

  // ── PHOTO SLOT ──────────────────────────────────────────────────────────────
  function PhotoSlot({ label, file, onUpload, onRemove }) {
    return (
      <div
        onClick={() => document.getElementById(`photo-${label}`).click()}
        className="relative border-2 border-dashed border-gray-200 rounded-xl 
          flex flex-col items-center justify-center cursor-pointer 
          hover:border-blue-300 hover:bg-blue-50/30 transition-all group h-44"
      >
        {file ? (
          <>
            <img
              src={URL.createObjectURL(file)}
              alt={label}
              className="w-full h-full rounded-xl object-contain p-1"
            />
            <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-50 transition-colors"
            >
              <X size={12} className="text-red-400" />
            </button>
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
          id={`photo-${label}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files[0] && validateFile(e.target.files[0]) && onUpload(e.target.files[0])}
        />
      </div>
    );
  }

  // ── DOCUMENT UPLOAD ─────────────────────────────────────────────────────────
  function DocumentUpload({ id, file, onUpload, onRemove, error }) {
    const inputRef = useRef(null);
    const handleRemove = (e) => {
      e.stopPropagation();
      if (inputRef.current) inputRef.current.value = "";
      onRemove();
    };

    return (
      <div className="flex flex-col h-full">
        <div
          onClick={() => document.getElementById(id).click()}
          className={`border-2 border-dashed rounded-xl p-5 flex flex-col 
            items-center justify-center cursor-pointer hover:bg-blue-50/30 
            transition-all h-full min-h-[160px] relative group
            ${error ? "border-red-300 bg-red-50/20" : "border-gray-200 hover:border-blue-300"}`}
        >
          {file ? (
            <>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                <FileText size={18} className="text-blue-500" />
              </div>
              <span className="text-xs text-gray-600 text-center break-all max-w-full px-2 font-medium">
                {file.name}
              </span>
              <span className="text-[10px] text-gray-400 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-red-50 transition-colors"
              >
                <X size={11} className="text-red-400" />
              </button>
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
            ref={inputRef}
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
    { value: "Other", label: "➕ Other" }, 
  ];

  const STERILIZED_OPTIONS = [
    { value: "not_sterilized", label: "Not sterilized" },
    { value: "neutered", label: "Neutered" },
    { value: "spayed", label: "Spayed" },
  ];

  // ── VALIDATION ───────────────────────────────────────────────────────────────
  const LETTERS_ONLY = /^[a-zA-Z\s,]+$/;

  function getErrors(form, photos, docs) {


    const name = form.name.trim();
    const breed = form.breed.trim();
    const temperament = form.temperament.trim();
    const rescue_story = form.rescue_story.trim();

    return {
      name: !name
        ? "Pet name is required"
        : name.length < 2
          ? "Name must be at least 2 characters"
          : !LETTERS_ONLY.test(name)
            ? "Name can only contain letters"
            : "",

      species: !form.species ? "Species is required" : "",
      customSpecies:
       form.species === "Other" && !form.customSpecies.trim()
       ? "Please specify the species"
        : "",

      breed: !breed
        ? "Breed is required"
        : !LETTERS_ONLY.test(breed)
          ? "Breed can only contain letters"
          : "",

      age: !form.age
        ? "Age is required"
        : Number(form.age) < 0
          ? "Age must be positive"
          : Number(form.age) === 0
            ? "Age cant be 0"
          : Number(form.age) > 50
            ? "Age seems too high"
            : !Number.isInteger(Number(form.age))
              ? "Age must be a whole number"
              : "",

      gender: !form.gender ? "Gender is required" : "",

      temperament: !temperament
        ? "Temperament is required"
        : !LETTERS_ONLY.test(temperament)
          ? "Temperament can only contain letters"
          : "",

      adoption_fee:
        form.adoption_fee === ""
          ? "Adoption fee is required"
          : Number(form.adoption_fee) < 0
            ? "Fee cannot be negative"
            : "",

      rescue_story: !rescue_story ? "Short description is required" : "",

      vaccination_notes:
        form.vaccinated === "false" && !form.vaccination_notes.trim()
          ? "Please describe vaccination requirements"
          : "",

      mainPhoto: !photos.main ? "Main photo is required" : "",

      health_record: !docs.health ? "Health record is required" : "",

      sterilization:
        (form.sterilized === "neutered" || form.sterilized === "spayed") &&
          !docs.sterilization
          ? "Sterilization certificate is required"
          : "",
    };
  }

  // ── MAIN PAGE ────────────────────────────────────────────────────────────────
  export default function AddPetPage() {
    const navigate = useNavigate();

    const [photos, setPhotos] = useState({ main: null, side: null, activity: null });
    const [docs, setDocs] = useState({ health: null, vaccination: null, sterilization: null });
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [touched, setTouched] = useState({});
    const [prerequisites, setPrerequisites] = useState([""]);

    const [form, setForm] = useState({
      name: "",
      species: "",
      breed: "",
      age: "",
      gender: "",
      vaccinated: "true",
      special_needs: "false",
      good_with_kids: "true",
      sterilized: "not_sterilized",
      vaccination_notes: "",
      temperament: "",
      adoption_fee: "",
      rescue_story: "",
      customSpecies: "",
    });

    const touch = (field) => setTouched(prev => ({ ...prev, [field]: true }));

    const set = (field) => (e) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      touch(field);
    };

    const errors = getErrors(form, photos, docs);
    const isFormValid = Object.values(getErrors(form, photos, docs)).every(e => e === "");

    // Only show error if field has been touched
    const err = (field) => touched[field] ? errors[field] : "";

    const handleSubmit = async (e) => {
      e.preventDefault();

      // Touch all fields to show all errors at once
      setTouched({
  name: true, species: true, customSpecies: true, breed: true, age: true, gender: true,
  temperament: true, adoption_fee: true, rescue_story: true,
  vaccination_notes: true, mainPhoto: true, health_record: true, sterilization: true,
});

      if (!isFormValid) return;

      setApiError("");
      setLoading(true);

      try {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
  if (key === "species") {
    const speciesValue = form.species === "Other" ? form.customSpecies.trim() : form.species;
    if (speciesValue) formData.append("species", speciesValue);
  } else if (key === "customSpecies") {
    // skip — handled above
  } else if (value !== "") {
    formData.append(key, value);
  }
});

        if (photos.main) formData.append("images", photos.main);
        if (photos.side) formData.append("images", photos.side);
        if (photos.activity) formData.append("images", photos.activity);
        if (docs.health) formData.append("health_record", docs.health);
        if (docs.vaccination) formData.append("vaccination_record", docs.vaccination);
        if (docs.sterilization) formData.append("sterilization_certificate", docs.sterilization);

        const booleanFields = ["vaccinated", "special_needs", "good_with_kids"];
        booleanFields.forEach((field) => {
          if (form[field] === "true") formData.set(field, "true");
          else if (form[field] === "false") formData.set(field, "false");
          else formData.delete(field);
        });

        const filteredPrereqs = prerequisites.filter(p => p.trim() !== "");
formData.append("prerequisites", JSON.stringify(filteredPrereqs));

        await api.post("/shelter/pets", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        navigate("/shelter/pets");
      } catch (error) {
        console.error("Failed to create pet:", error);
        setApiError(error.response?.data?.error || "Failed to create pet. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const handleClear = () => {
      setForm({
        name: "", species: "", breed: "", age: "", gender: "",
        vaccinated: "true", special_needs: "false", good_with_kids: "true",
        sterilized: "not_sterilized", vaccination_notes: "",
temperament: "", adoption_fee: "", rescue_story: "",
customSpecies: "",  
      });
      setPhotos({ main: null, side: null, activity: null });
      setDocs({ health: null, vaccination: null, sterilization: null });
      setPrerequisites([""]);
      setApiError("");
      setTouched({});
    };

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
              <h1 className="text-lg font-bold text-gray-900">Add pet</h1>
              <p className="text-xs text-gray-400 mt-0.5">Update the details for this pet listing</p>
            </div>
            <div className="w-24" />
          </div>
        </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-10">
            {/* API Error */}
            {apiError && (
              <div className="mb-5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

              {/* ── PET PHOTOS ── */}
              <section className="p-5 sm:p-6 border-b border-gray-100">
                <SectionHeader
                  icon={<Image size={16} />}
                  title="Pet photos"
                  subtitle="Upload up to 3 images · JPG, PNG · Max 10MB each"
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    ["main", "MAIN PHOTO"],
                    ["side", "SIDE VIEW"],
                    ["activity", "ACTIVITY"],
                  ].map(([key, label]) => (
                    <PhotoSlot
                      key={key}
                      label={label}
                      file={photos[key]}
                      onUpload={(f) => {
                        setPhotos((p) => ({ ...p, [key]: f }));
                        if (key === "main") touch("mainPhoto");
                      }}
                      onRemove={() => {
                        setPhotos((p) => ({ ...p, [key]: null }));
                        if (key === "main") touch("mainPhoto");
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
                  subtitle="Tell us about this pet"
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
                  <SelectField
                    label="Species"
                    required
                    placeholder="Select species"
                    options={SPECIES_OPTIONS}
                    value={form.species}
                    onChange={set("species")}
                    error={err("species")}
                  />
                  
{form.species === "Other" && (
  <InputField
    label="Specify species"
    required
    placeholder="e.g. Hamster, Guinea Pig..."
    value={form.customSpecies}
    onChange={set("customSpecies")}
    error={err("customSpecies")}
  />
)}
                  <InputField
                    label="Breed"
                    required
                    placeholder="e.g. Golden Retriever"
                    value={form.breed}
                    onChange={set("breed")}
                    error={err("breed")}
                  />
                  <InputField
                    label="Age (years)"
                    required
                    placeholder="e.g. 3"
                    type="number"
                    value={form.age}
                    onChange={set("age")}
                    error={err("age")}
                  />
                  <RadioGroup
                    label="Gender"
                    required
                    name="gender"
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                    ]}
                    value={form.gender}
                    onChange={set("gender")}
                    error={err("gender")}
                  />
                  <InputField label="Status" value="Available" readOnly />
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
                  <BooleanRadio
                    label="Vaccinated"
                    required
                    name="vaccinated"
                    value={form.vaccinated}
                    onChange={set("vaccinated")}
                  />
                  <BooleanRadio
                    label="Special needs"
                    required
                    name="special_needs"
                    value={form.special_needs}
                    onChange={set("special_needs")}
                  />
                  <BooleanRadio
                    label="Social friendly"
                    required
                    name="good_with_kids"
                    value={form.good_with_kids}
                    onChange={set("good_with_kids")}
                  />
                </div>

                {/* Vaccination Notes */}
                {form.vaccinated === "false" && (
                  <div className="mb-5">
                    <label className="text-xs font-semibold text-gray-600 tracking-wide block mb-2">
                      Vaccination Requirements<span className="text-red-400 ml-1">*</span>
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
                      {form.vaccination_notes.length} / 5000
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <SelectField
                    label="Sterilized"
                    required
                    options={STERILIZED_OPTIONS}
                    value={form.sterilized}
                    onChange={set("sterilized")}
                  />

                  {(form.sterilized === "neutered" || form.sterilized === "spayed") && (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <div className="flex items-center gap-4 border border-gray-200 rounded-xl px-4 py-3 bg-white">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700">
                            Sterilization certificate<span className="text-red-400 ml-1">*</span>
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {docs.sterilization ? docs.sterilization.name : "PDF or PNG · max 10MB"}
                          </p>
                        </div>
                        {docs.sterilization ? (
                          <button
                            type="button"
                            onClick={() => { setDocs((p) => ({ ...p, sterilization: null })); touch("sterilization"); }}
                            className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0"
                          >
                            <X size={11} className="text-red-400" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => document.getElementById("doc-sterilization-inline").click()}
                            className="flex-shrink-0 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Upload
                          </button>
                        )}
                        <input
                          id="doc-sterilization-inline"
                          type="file"
                          accept=".pdf,image/png"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files[0] && validateFile(e.target.files[0])) {
                              setDocs((p) => ({ ...p, sterilization: e.target.files[0] }));
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
                  subtitle="Share their background and upload health records"
                />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
                  {/* Rescue Story */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 tracking-wide block mb-2">
                      Short description<span className="text-red-400">*</span>
                    </label>
                    <textarea
                      placeholder="Tell us about their journey, how they were rescued, their personality..."
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
                      {form.rescue_story.length} / 5000
                    </p>
                  </div>

                  {/* Documents */}
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-gray-600 tracking-wide block mb-2">
                        Health records<span className="text-red-400">*</span>
                      </label>
                      <div className="flex-1">
                        <DocumentUpload
                          id="doc-health"
                          file={docs.health}
                          error={err("health_record")}
                          onUpload={(f) => { setDocs((p) => ({ ...p, health: f })); touch("health_record"); }}
                          onRemove={() => { setDocs((p) => ({ ...p, health: null })); touch("health_record"); }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-gray-600 tracking-wide block mb-2">
                        Vaccination proof
                      </label>
                      <div className="flex-1">
                        <DocumentUpload
                          id="doc-vaccination"
                          file={docs.vaccination}
                          onUpload={(f) => setDocs((p) => ({ ...p, vaccination: f }))}
                          onRemove={() => setDocs((p) => ({ ...p, vaccination: null }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── ADOPTION GUIDELINES ── */}
<section className="p-5 sm:p-6 border-b border-gray-100">
  <SectionHeader
    icon={<span className="text-sm">📋</span>}
    title="Adoption guidelines"
    subtitle="List requirements the adopter must meet "
  />

  <div className="flex flex-col gap-3">
    {prerequisites.map((item, index) => (
      <div key={index} className="flex items-center gap-2">
        <span className="text-xs font-bold text-gray-300 w-4 flex-shrink-0">
          {index + 1}.
        </span>
        <input
          type="text"
          placeholder={`e.g. Must have a fenced yard`}
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
      Add guideline
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
                    onClick={handleClear}
                    disabled={loading}
                    className="flex-1 sm:flex-none sm:w-36 h-11 text-sm text-gray-500 font-medium 
                      rounded-xl border border-gray-200 bg-white hover:bg-red-50 hover:text-red-500
                      hover:border-red-200 transition-all disabled:opacity-50"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !isFormValid}
                    className="flex-1 sm:flex-none sm:w-36 h-11 text-sm font-semibold text-white 
                      bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center 
                      gap-2 transition-all shadow-sm shadow-blue-200 disabled:opacity-70 
                      disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <PlusCircle size={15} />
                        Add new pet
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }