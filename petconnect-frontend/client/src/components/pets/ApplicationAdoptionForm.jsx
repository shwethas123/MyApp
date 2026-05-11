import LocationPicker from "../common/LocationPicker";
import { useState, useRef } from "react";

const TOTAL_STEPS = 4;

const LIVING_OPTIONS = [
  { val: "I live alone", label: "I live alone", icon: "🧍" },
  { val: "Family", label: "With family", icon: "👨‍👩‍👧" },
  { val: "House/Room mates", label: " Roommates", icon: "🏠" },
];

const AGREEMENT_OPTIONS = [
  { val: "Yes", label: "Yes, everyone agrees", icon: "✅" },
  { val: "No", label: "No / Not sure", icon: "❌" },
];

const RENTED_OPTIONS = [
  { val: "Yes", label: "Yes", icon: "✅" },
  { val: "No", label: "No", icon: "🚫" },
];

const PETS_ALLOWED_OPTIONS = [
  { val: "Yes", label: "Yes", icon: "✅" },
  { val: "No", label: "No", icon: "🚫" },
];

const LIVING_LABELS = {
  "I live alone": "Living Alone",
  Family: "With Family",
  "House/Room mates": "House / Roommates",
};

const LANDLORD_LABELS = {
  Yes: "Yes",
  No: "No",
  "I am the owner": "Not Applicable",
};

// ── Sub-components ────────────────────────────────────────────────────────────

const ChoiceButton = ({ value, selected, icon, label, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    className={`flex-1 min-w-[110px] flex flex-col items-center gap-1.5 py-4 px-3 rounded-2xl border-2 text-sm font-semibold transition-all duration-150 cursor-pointer
      ${
        selected
          ? "border-sky-500 bg-sky-50 text-sky-600"
          : "border-slate-200 bg-white text-slate-500 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-500"
      }`}
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </button>
);

const ReviewRow = ({ label, val, full }) => (
  <div className={full ? "col-span-2" : ""}>
    <p className="text-[11px] font-bold tracking-wide text-slate-400 mb-0.5">
      {label}
    </p>
    <p className="text-sm font-semibold text-slate-700">{val || "—"}</p>
  </div>
);

const StepPills = ({ step, onStepChange }) => (
  <div className="flex gap-2 flex-wrap mb-3">
    {["Your details", "Living & lifestyle", "Documents", "Review & submit"].map(
      (label, i) => {
        const num = i + 1;
        const isActive = step === num;
        const isDone = step > num;
        return (
          <button
            key={i}
            type="button"
            onClick={() => isDone && onStepChange(num)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 text-sm font-bold transition-all duration-200
            ${
              isActive
                ? "bg-sky-500 border-sky-500 text-white cursor-default"
                : isDone
                  ? "bg-emerald-50 border-emerald-400 text-emerald-600 cursor-pointer hover:brightness-95"
                  : "bg-white border-slate-200 text-slate-400 cursor-default"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold
            ${
              isActive
                ? "bg-white/25 text-white"
                : isDone
                  ? "bg-emerald-400 text-white"
                  : "bg-slate-100 text-slate-400"
            }`}
            >
              {isDone ? "✓" : num}
            </span>
            <span>{label}</span>
          </button>
        );
      },
    )}
  </div>
);

const PetBanner = ({ pet }) => (
  <div className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm mb-6">
    <img
      src={pet.images?.[0]?.file_url || "https://placehold.co/400x250?text=No+Photo"}
      alt={pet?.name}
      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold tracking-widest text-sky-500 uppercase mb-0.5">
        Applying For
      </p>
      <h2 className="text-lg font-extrabold text-slate-800 mb-0.5">
        {pet?.name}
      </h2>
      <p className="text-sm text-slate-400">
        {pet?.breed} • {pet?.age} {pet?.age === 1 ? "Year" : "years"} old
      </p>
    </div>
    {pet?.adoption_fee && (
      <div className="ml-auto text-right flex-shrink-0">
        <span className="block text-xl font-extrabold text-sky-500">
          ₹{pet.adoption_fee}
        </span>
        <span className="text-xs text-slate-400">Adoption fee</span>
      </div>
    )}
  </div>
);

const InputWrap = ({ locked, children }) => (
  <div
    className={`rounded-xl border-2 overflow-hidden transition-all duration-200 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100
    ${locked ? "bg-slate-50 border-dashed border-slate-200" : "bg-white border-slate-200"}`}
  >
    {children}
  </div>
);

const inputClass =
  "w-full bg-transparent border-none outline-none px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-300 resize-none";

// ── Inline field error ────────────────────────────────────────────────────────
const FieldError = ({ msg }) =>
  msg ? (
    <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
      ⚠ {msg}
    </p>
  ) : null;

// ── Shared regex applied to occupation, vacation_care, landlord_no_reason ─────
const LETTERS_ONLY = /^[A-Za-z\s,.'"\-()&/]+$/;

// ── Terms & Conditions Modal ──────────────────────────────────────────────────

const TermsModal = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(0,0,0,0.45)" }}
    onClick={onClose}
  >
    <div
      className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-extrabold text-slate-800">
          📋 Adoption Terms & Conditions
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="overflow-y-auto px-6 py-5 flex-1 text-sm text-slate-600 leading-relaxed space-y-4">
  <section>
    <p>
      These Terms and Conditions ("Terms") form a legally binding electronic agreement
      under the Information Technology Act, 2000, between you ("User") and PetConnect
      (operated from 80 Feet Road, Koramangala, Bengaluru, Karnataka – 560034,
      hereinafter referred to as "Company," "we," "us," or "our").
    </p>
  </section>
  <section> 
     <h3 className="font-bold text-slate-800 mb-1">1. Adoption Limit Policy</h3>
       <p>To prevent misuse and ensure responsible adoption practices, each user is permitted to complete a maximum of 
      <strong> 5 adoptions within any rolling 1-year period</strong>.
       Applications exceeding this limit will be automatically restricted. If you believe your account has been incorrectly restricted, please contact our support team for review.  
       </p>
      </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">2. Acceptance of Terms</h3>
    <p>
      By accessing or using our website https://www.petconnect.com ("Platform"), you
      agree to these Terms and our Privacy Policy. If you do not agree, please
      discontinue use immediately.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">3. Eligibility</h3>
    <p>
      Users must be 18 years or older and legally competent to contract under the
      Indian Contract Act, 1872.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">4. Account Registration</h3>
    <p>
      To access or book services, users may be required to register an account by
      providing accurate and current information.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">5. Account Responsibility</h3>
    <p>
      Users are responsible for maintaining the confidentiality of their account
      credentials and for all activities under their account.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">6. Services Offered</h3>
    <p>
      PetConnect offers a variety of pet-related products and services, including but
      not limited to grooming, training, hostel stays, walking, and the sale of pet
      accessories, foods, toys and other pet-care products.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">7. Availability of Services</h3>
    <p>
      All orders and services are subject to availability, local regulations, and may
      be modified or discontinued without prior notice.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">8. Zero-Tolerance Policy</h3>
    <p>
      The Company follows and enforces a strict zero-tolerance policy against any
      unethical, unsafe, or illegal practices in the delivery of its services, sale or
      promotion of pet-related foods, products, or accessories. All offerings made
      available through the Platform are sourced, prepared, and provided in compliance
      with applicable quality, safety, and animal welfare standards. The Company neither
      engages in nor supports any activity that may compromise the health, safety, or
      well-being of pets or users. Any violation of this policy by associated service
      providers, vendors, or partners shall result in immediate suspension, removal,
      and reporting to the relevant authorities.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">9. Payments</h3>
    <p>
      All payments are processed securely through third-party payment gateways or UPI.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">10. Payment Authorization</h3>
    <p>
      By completing a transaction, users authorize the Company to process payments in
      compliance with applicable laws.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">11. Service Execution</h3>
    <p>
      Services such as grooming, training, walking, boarding, and adoption support are
      executed by authorized professionals or partners.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">12. Delivery & Fulfillment</h3>
    <p>
      Delivery and fulfillment of all products and services are subject to availability,
      location, and scheduling.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">13. Delays</h3>
    <p>
      The Company is not liable for delays caused by unforeseen circumstances such as
      weather, logistics issues, or emergencies.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">14. Cancellations</h3>
    <p>
      Cancellations made at least 24 hours before a scheduled service are eligible for
      a partial refund.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">15. Refund Policy</h3>
    <p>
      Cancellations of scheduled services made at least 24 hours in advance are eligible
      for a partial refund. Cancellations of food products, accessories, or other pet-care
      products must be made at least 48 hours in advance to be eligible for a refund.
      For a complete and detailed refund policy, please refer to the Refund Policy
      available on our website.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">16. No Refund Conditions</h3>
    <p>
      No refund is provided for services already rendered, last-minute cancellations, or
      "change of mind" requests.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">17. Data Collection & Privacy</h3>
    <p>
      The Company collects and processes personal data as per its Privacy Policy, in
      compliance with the Digital Personal Data Protection Act, 2023, and IT Rules, 2021.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">18. Data Sharing</h3>
    <p>
      Users consent to sharing limited data with third parties such as service providers
      and logistics partners for service fulfillment.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">19. Data Security</h3>
    <p>
      Reasonable security measures are implemented to protect user data; however, the
      Company is not liable for breaches beyond its control.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">20. Limitation of Liability</h3>
    <p>
      The Company shall not be liable for any indirect, incidental, or consequential
      damages arising from use of the Platform or services.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">21. Maximum Liability</h3>
    <p>
      The total liability of the Company shall not exceed the transaction amount paid
      by the user.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">22. Dispute Resolution</h3>
    <p>
      Disputes will be resolved through arbitration in Bengaluru, Karnataka, under the
      Arbitration and Conciliation Act, 1996.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">23. Jurisdiction</h3>
    <p>
      Courts in Bengaluru, Karnataka shall have exclusive jurisdiction.
    </p>
  </section>

  <section>
    <h3 className="font-bold text-slate-800 mb-1">24. Governing Law</h3>
    <p>
      These Terms are governed by and construed in accordance with the laws of India.
    </p>
  </section>
  
</div>

      <div className="px-6 py-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-full text-sm transition-all duration-200"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

// ── Location Picker with "Use My Location" ────────────────────────────────────

const LocationPickerWithGPS = ({ value, onChange }) => {
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const parts = [
            addr.house_number,
            addr.road || addr.pedestrian,
            addr.suburb || addr.neighbourhood,
            addr.city || addr.town || addr.village,
            addr.state,
            addr.postcode,
          ].filter(Boolean);
          onChange(parts.join(", ") || data.display_name || `${latitude}, ${longitude}`);
        } catch {
          onChange(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setGpsError("Location access denied. Please allow location permission.");
        else if (err.code === 2) setGpsError("Location unavailable. Please enter manually.");
        else setGpsError("Could not get location. Please enter manually.");
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-600">Home address</label>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="flex items-center gap-1.5 text-xs font-bold text-sky-500 hover:text-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {locating ? (
            <>
              <span className="w-3 h-3 border-2 border-sky-300 border-t-sky-500 rounded-full animate-spin inline-block" />
              Locating…
            </>
          ) : (
            <>
              <span>📍</span>
              Use my location
            </>
          )}
        </button>
      </div>
      <InputWrap>
        <textarea
          rows={1}
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Street, City, State, PIN"
        />
      </InputWrap>
    </div>
  );
};

// ── DocUploadSlot ─────────────────────────────────────────────────────────────

const DocUploadSlot = ({
  label,
  hint,
  accept,
  savedUrl,
  file,
  preview,
  onChange,
  onClear,
  required,
}) => {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) onChange(f);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onChange(f);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const savedFileName = savedUrl
    ? decodeURIComponent(savedUrl.split("/").pop().split("?")[0])
    : null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <label className="text-xs font-bold text-slate-600">{label}</label>
        {required && <span className="text-red-400 text-xs font-bold">*</span>}
      </div>
      {hint && <p className="text-[11px] text-slate-400 font-medium -mt-1">{hint}</p>}

      {file ? (
        <div className="border-2 border-emerald-200 bg-emerald-50 rounded-xl p-4 flex items-start gap-3">
          {preview && file.type.startsWith("image/") ? (
            <img
              src={preview}
              alt="preview"
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-emerald-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 text-xl">
              {file.type === "application/pdf" ? "📄" : "🖼️"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              ✓ New file selected · {formatSize(file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-slate-400 hover:text-red-400 transition-colors text-lg flex-shrink-0 leading-none mt-0.5"
            title="Remove file"
          >
            ×
          </button>
        </div>

      ) : savedUrl ? (
        <div className="border-2 border-sky-200 bg-sky-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0 text-lg">
            📁
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-700 truncate">
              {savedFileName || "Previously uploaded"}
            </p>
            <p className="text-[11px] text-sky-500 font-semibold mt-0.5">
              ✓ Already on file — will be reused
            </p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex-shrink-0 text-xs font-bold text-sky-500 hover:text-sky-700 border border-sky-300 hover:border-sky-500 rounded-lg px-2.5 py-1 transition-all duration-150"
          >
            Replace
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFile}
          />
        </div>

      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-all duration-200 group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform duration-200">📎</span>
          <p className="text-sm font-semibold text-slate-400 group-hover:text-sky-500 transition-colors text-center">
            Click or drag & drop to upload
          </p>
          <p className="text-[11px] text-slate-300 font-medium">JPG, PNG or PDF · Max 10MB</p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFile}
          />
        </div>
      )}
    </div>
  );
};

// ── Step 1 ────────────────────────────────────────────────────────────────────

const Step1PersonalDetails = ({ form, set, onNext }) => {
  const [occError, setOccError] = useState("");

  const isFormFilled =
    form.name &&
    form.phone &&
    form.email &&
    form.current_occupation &&
    form.address;

  const handleNext = () => {
    const val = (form.current_occupation || "").trim();
    if (val && !LETTERS_ONLY.test(val)) {
      setOccError("Only letters and basic punctuation allowed — no numbers or special characters.");
      return;
    }
    setOccError("");
    onNext();
  };

  return (
    <div className="p-7 animate-fadeUp">
      <h3 className="text-lg font-extrabold text-slate-800 mb-1">Your details</h3>
      <p className="text-sm text-slate-400 mb-5">
        Pre-filled from your profile — verify before continuing.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600">Full name</label>
          <InputWrap locked>
            <input className={inputClass} value={form.name} readOnly placeholder="Your full name" />
          </InputWrap>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600">Phone number</label>
          <InputWrap>
            <input className={inputClass} value={form.phone} readOnly placeholder="+91 XXXXX XXXXX" />
          </InputWrap>
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600">Email address</label>
          <InputWrap locked>
            <input className={inputClass} value={form.email} readOnly placeholder="you@example.com" />
          </InputWrap>
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600">Past pet experience (years)</label>
          <InputWrap>
            <input type="number" min="0" className={inputClass} value={form.past_pet_experience} onChange={(e) => set("past_pet_experience", e.target.value)} placeholder="0" />
          </InputWrap>
          <span className="text-[11px] text-slate-400 font-semibold">
            Total years you've owned or cared for pets
          </span>
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600">Current occupation</label>
          <div className={`rounded-xl border-2 overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-sky-100
            ${occError ? "border-red-400 bg-red-50" : "bg-white border-slate-200 focus-within:border-sky-400"}`}>
            <input
              className={inputClass}
              value={form.current_occupation}
              onChange={(e) => {
                set("current_occupation", e.target.value);
                if (occError) setOccError("");
              }}
              placeholder="e.g. Software Engineer, Student, Freelancer…"
            />
          </div>
          <FieldError msg={occError} />
        </div>

        <div className="col-span-2">
          <LocationPickerWithGPS
            value={form.address}
            onChange={(val) => set("address", val)}
            onLocationDetected={(coords) => setLocationCoords(coords)} 
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleNext}
          disabled={!isFormFilled}
          className="bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-7 py-3 rounded-full text-sm shadow-md shadow-sky-200 transition-all duration-200 hover:-translate-y-0.5"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

// ── Step 2 ────────────────────────────────────────────────────────────────────

const Step2Lifestyle = ({ form, set, onBack, onNext }) => {
  const [errors, setErrors] = useState({ vacation_care: "" });

  const showFamilyAgreement =
    form.living_situation === "Family" ||
    form.living_situation === "House/Room mates";

  const isFormFilled =
   form.living_situation &&
    form.is_rented &&
    (form.is_rented === "No" || form.pets_allowed === "Yes") &&
    form.vacation_care;

  const handleNext = () => {
    const errs = { vacation_care: "", landlord_no_reason: "" };
    let hasError = false;

    const care = (form.vacation_care || "").trim();
    if (care && !LETTERS_ONLY.test(care)) {
      errs.vacation_care = "Only letters and basic punctuation allowed — no numbers or special characters.";
      hasError = true;
    }

    if (hasError) {
      setErrors(errs);
      return;
    }

    setErrors({ vacation_care: ""});
    onNext();
  };

  return (
    <div className="p-7 animate-fadeUp">
      <h3 className="text-lg font-extrabold text-slate-800 mb-1">Living & lifestyle</h3>
      <p className="text-sm text-slate-400 mb-6">
        Help the shelter understand your home environment.
      </p>

      <div className="flex flex-col gap-1.5 mb-5">
        <label className="text-xs font-bold text-slate-600">
          Are you living alone or with others?
        </label>
        <div className="flex gap-2 flex-wrap mt-1">
          {LIVING_OPTIONS.map(({ val, label, icon }) => (
            <ChoiceButton
              key={val}
              value={val}
              label={label}
              icon={icon}
              selected={form.living_situation === val}
              onClick={(v) => set("living_situation", v)}
            />
          ))}
        </div>
      </div>

      {showFamilyAgreement && (
        <div className="flex flex-col gap-1.5 mb-5">
          <label className="text-xs font-bold text-slate-600">
            Are all your family / housemates in agreement to adopt a pet?
          </label>
          <div className="flex gap-2 flex-wrap mt-1">
            {AGREEMENT_OPTIONS.map(({ val, label, icon }) => (
              <ChoiceButton
                key={val}
                value={val}
                label={label}
                icon={icon}
                selected={form.family_agreement === val}
                onClick={(v) => set("family_agreement", v)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5 mb-5">
        <label className="text-xs font-bold text-slate-600">
          Are you currently living in a rented house?
        </label>
        <div className="flex gap-2 flex-wrap mt-1">
          {RENTED_OPTIONS.map(({ val, label, icon }) => (
            <ChoiceButton
              key={val}
              value={val}
              label={label}
              icon={icon}
              selected={form.is_rented === val}
              onClick={(v) => {
                set("is_rented", v);
                if (v !== "Yes") set("pets_allowed", "");
              }}
            />
          ))}
        </div>
      </div>

      {form.is_rented && (
        <div className="flex flex-col gap-1.5 mb-5">
          <label className="text-xs font-bold text-slate-600">
            Are pets allowed in your residence?
          </label>
          <div className="flex gap-2 flex-wrap mt-1">
            {PETS_ALLOWED_OPTIONS.map(({ val, label, icon }) => (
              <ChoiceButton
                key={val}
                value={val}
                label={label}
                icon={icon}
                selected={form.pets_allowed === val}
                onClick={(v) => set("pets_allowed", v)}
              />
            ))}
          </div>
        </div>
      )}
     
      {form.pets_allowed === "No" && (
        <p className="text-sm text-red-500 font-semibold mt-2">
          You cannot proceed with the application since pets are not allowed in your residence.
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-600">
          Who will take care of your pet when you travel or go on vacation?
        </label>
        <div className={`rounded-xl border-2 overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-sky-100
          ${errors.vacation_care ? "border-red-400 bg-red-50" : "bg-white border-slate-200 focus-within:border-sky-400"}`}>
          <textarea
            rows={3}
            className={inputClass}
            value={form.vacation_care}
            onChange={(e) => {
              set("vacation_care", e.target.value);
              if (errors.vacation_care) setErrors((p) => ({ ...p, vacation_care: "" }));
            }}
            placeholder="e.g. My parents will look after the pet, or I'll use a pet boarding service…"
          />
        </div>
        <FieldError msg={errors.vacation_care} />
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          type="button"
          onClick={onBack}
          className="border-2 border-slate-200 text-slate-500 hover:border-sky-400 hover:text-sky-500 font-semibold px-6 py-2.5 rounded-full text-sm transition-all duration-200"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!isFormFilled}
          className="bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-7 py-3 rounded-full text-sm shadow-md shadow-sky-200 transition-all duration-200 hover:-translate-y-0.5"
        >
          Upload documents →
        </button>
      </div>
    </div>
  );
};

// ── Step 3: Documents ─────────────────────────────────────────────────────────

const Step3Documents = ({ form, set, onBack, onNext }) => {
  const needsRentalAgreement = form.landlord_permission === "Yes"|| form.landlord_permission === "No";
  const [aadharPreview, setAadharPreview] = useState(null);
  const [rentalPreview, setRentalPreview] = useState(null);

  const handleAadhar = (file) => {
    set("aadhar_file", file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setAadharPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setAadharPreview(null);
    }
  };

  const handleRental = (file) => {
    set("rental_agreement_file", file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setRentalPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setRentalPreview(null);
    }
  };

  const clearAadhar = () => {
    set("aadhar_file", null);
    setAadharPreview(null);
  };

  const clearRental = () => {
    set("rental_agreement_file", null);
    setRentalPreview(null);
  };

  const aadharOk = !!(form.aadhar_file || form.aadhar_saved_url);
  const rentalOk = !needsRentalAgreement || !!(form.rental_agreement_file || form.rental_saved_url);
  const isValid = aadharOk && rentalOk;

  const hasAllSaved =
    form.aadhar_saved_url &&
    (!needsRentalAgreement || form.rental_saved_url);

  return (
    <div className="p-7 animate-fadeUp">
      <h3 className="text-lg font-extrabold text-slate-800 mb-1">Identity & documents</h3>
      <p className="text-sm text-slate-400 mb-6">
        {hasAllSaved
          ? "Your documents are already on file. You can replace them below if needed."
          : "Upload the required documents to verify your identity. These are shared securely with the shelter."}
      </p>

      {hasAllSaved && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5">
          <span className="text-lg flex-shrink-0 mt-0.5">✅</span>
          <p className="text-xs text-emerald-700 font-semibold leading-relaxed">
            We have your documents from a previous application — you don't need
            to upload them again. Hit <strong>Continue</strong> to proceed.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <DocUploadSlot
          label="Aadhaar card"
          hint="Front side of your Aadhar card (JPG, PNG or PDF)"
          accept="image/jpeg,image/png,application/pdf"
          savedUrl={form.aadhar_saved_url}
          file={form.aadhar_file}
          preview={aadharPreview}
          onChange={handleAadhar}
          onClear={clearAadhar}
          required
        />

        {needsRentalAgreement && (
          <DocUploadSlot
            label="Rental / Lease agreement"
            hint="A copy of your rental agreement showing pets are permitted (JPG, PNG or PDF)"
            accept="image/jpeg,image/png,application/pdf"
            savedUrl={form.rental_saved_url}
            file={form.rental_agreement_file}
            preview={rentalPreview}
            onChange={handleRental}
            onClear={clearRental}
            required
          />
        )}

        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <span className="text-lg flex-shrink-0 mt-0.5">🔒</span>
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            Your documents are stored securely and only shared with the shelter
            you're applying to. They are used solely for identity verification
            during the adoption process.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          type="button"
          onClick={onBack}
          className="border-2 border-slate-200 text-slate-500 hover:border-sky-400 hover:text-sky-500 font-semibold px-6 py-2.5 rounded-full text-sm transition-all duration-200"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-7 py-3 rounded-full text-sm shadow-md shadow-sky-200 transition-all duration-200 hover:-translate-y-0.5"
        >
          Review application →
        </button>
      </div>
    </div>
  );
};

// ── Step 4: Review & Submit ───────────────────────────────────────────────────

const Step4Review = ({ form, error, submitting, onBack, onSubmit }) => {
  const [certified, setCertified] = useState(false);
  const [breedingConfirmed, setBreedingConfirmed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const aadharLabel = form.aadhar_file
    ? `✓ New file: ${form.aadhar_file.name}`
    : form.aadhar_saved_url
      ? "✓ On file from previous application"
      : "—";

  const needsRentalAgreement = form.landlord_permission === "Yes"|| form.landlord_permission === "No";

  const rentalLabel = needsRentalAgreement
    ? form.rental_agreement_file
      ? `✓ New file: ${form.rental_agreement_file.name}`
      : form.rental_saved_url
        ? "✓ On file from previous application"  
        : null
    : null;

  return (
    <>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      <div className="p-7 animate-fadeUp">
        <h3 className="text-lg font-extrabold text-slate-800 mb-1">Review & submit</h3>
        <p className="text-sm text-slate-400 mb-5">
          Double-check your answers before submitting.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">
            Your details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <ReviewRow label="Name" val={form.name} />
            <ReviewRow label="Phone" val={form.phone} />
            <ReviewRow label="Email" val={form.email} full />
            <ReviewRow label="Pet experience" val={`${form.past_pet_experience || 0} year(s)`} />
            <ReviewRow label="Occupation" val={form.current_occupation} />
            <ReviewRow label="Address" val={form.address} full />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">
            Lifestyle
          </p>
          <div className="grid grid-cols-2 gap-3">
            <ReviewRow
              label="Living situation"
              val={LIVING_LABELS[form.living_situation] || "—"}
            />
            {form.family_agreement && (
              <ReviewRow
                label="Family agreement"
                val={form.family_agreement === "yes" ? "Yes" : "No"}
              />
            )}
            <ReviewRow
              label="Landlord allows pets"
              val={LANDLORD_LABELS[form.landlord_permission] || "—"}
            />
            <ReviewRow label="Vacation pet care" val={form.vacation_care} full />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">
            Documents
          </p>
          <div className="grid grid-cols-2 gap-3">
            <ReviewRow label="Aadhaar card" val={aadharLabel} />
            {rentalLabel && (
              <ReviewRow label="Rental agreement" val={rentalLabel} />
            )}
          </div>
        </div>

        <div className="border-2 border-slate-200 rounded-2xl overflow-hidden mb-5">
          <label
            className={`flex items-start gap-3 p-4 cursor-pointer transition-all duration-200
              ${certified ? "bg-emerald-50" : "bg-white hover:bg-sky-50/40"}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                className="sr-only"
                checked={certified}
                onChange={(e) => setCertified(e.target.checked)}
              />
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                  ${certified ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300"}`}
              >
                {certified && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed select-none">
              I certify that the information provided is accurate and I agree to the{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowTerms(true);
                }}
                className="text-sky-500 font-bold underline underline-offset-2 hover:text-sky-700 transition-colors"
              >
                Terms & Conditions
              </button>
              {" "}of this adoption process, including the possibility of a home visit.
            </p>
          </label>
                  
          <label className={`flex items-start gap-3 p-4 cursor-pointer transition-all duration-200
            ${breedingConfirmed ? "bg-emerald-50" : "bg-white hover:bg-sky-50/40"}`}>
            <div className="flex-shrink-0 mt-0.5">
              <input type="checkbox" className="sr-only" checked={breedingConfirmed}
                onChange={(e) => setBreedingConfirmed(e.target.checked)} />
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                ${breedingConfirmed ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300"}`}>
                {breedingConfirmed && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed select-none">
              I confirm that I am not involved in illegal breeding, puppy mills, or 
              unauthorized sale or trade of animals. I understand that violations will 
              result in a permanent ban and reporting to relevant authorities.
            </p>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm font-bold rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mt-2">
          <button
            type="button"
            onClick={onBack}
            className="border-2 border-slate-200 text-slate-500 hover:border-sky-400 hover:text-sky-500 font-semibold px-6 py-2.5 rounded-full text-sm transition-all duration-200"
          >
            ← Edit
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || !certified || !breedingConfirmed}
            className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-full text-sm shadow-md shadow-sky-200 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
            ) : (
              <>Submit application ▷</>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

// ── NEW: Blocked screen shown when user has hit the 5-adoption limit ──────────

const AdoptionLimitBlocked = ({ pet, onBack }) => (
  <div className="p-10 flex flex-col items-center text-center">
    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl mb-4">
      🚫
    </div>
    <h3 className="text-lg font-extrabold text-red-500 mb-2">
      Application limit reached
    </h3>
    <p className="text-sm text-slate-500 leading-relaxed max-w-sm mb-6">
      You have completed <strong className="text-slate-700">5 adoptions</strong> within
      the past year. Further adoption applications are currently restricted to prevent
      misuse. If you believe this is a mistake, please contact our support team.
    </p>
    <button
      type="button"
      onClick={onBack}
      className="border-2 border-slate-200 text-slate-500 hover:border-sky-400 hover:text-sky-500 font-semibold px-6 py-2.5 rounded-full text-sm transition-all duration-200"
    >
      ← Back to {pet?.name}'s profile
    </button>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const AdoptionApplicationForm = ({
  pet,
  loading,
  submitting,
  submitted,
  error,
  step,
  form,
  onFieldChange,
  onStepChange,
  onSubmit,
  onBack,
  onViewApplications,
  onBackToBrowse,
  adoptionCount, // ── NEW prop
}) => {
  const set = (field, value) => onFieldChange(field, value);
  const progress = (step / TOTAL_STEPS) * 100;

  // ── NEW: derive blocked state from adoptionCount ──────────────────────
  const isBlocked = adoptionCount >= 5;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-3">
        <div className="text-5xl animate-spin">🐾</div>
        <p className="text-sm text-slate-400 font-semibold">Loading application…</p>
      </div>
    );
  }

  if (error && !pet) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-500 font-bold bg-red-50 px-4 py-2 rounded-xl">
          {error}
        </p>
        <button
          onClick={onBackToBrowse}
          className="text-sm text-slate-500 hover:text-sky-500 font-semibold transition-colors"
        >
          ← Back to browse
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 text-center max-w-md shadow-xl shadow-slate-200">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
            Application submitted!
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-3">
            Your application to adopt{" "}
            <strong className="text-slate-700">{pet?.name}</strong> has been
            received. The shelter will reach out to you soon.
          </p>
          <p className="text-xs text-amber-500 font-semibold bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mb-6">
            ⏳ If the shelter does not respond within 10 days, the application
            will be automatically cancelled.
          </p>
          <button
            onClick={onViewApplications}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-3 rounded-full text-sm shadow-md shadow-sky-200 transition-all duration-200"
          >
            View my applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-2xl mx-auto px-5 py-8 pb-20">
        <div className="mb-5">
          <button
            onClick={onBack}
            className="text-sm text-slate-400 hover:text-sky-500 font-semibold transition-colors mb-2 flex items-center gap-1"
          >
            ← Back to {pet?.name}'s profile
          </button>
          <h1 className="text-2xl font-extrabold text-slate-800">Adoption form</h1>
        </div>

        <PetBanner pet={pet} />

        {/* ── NEW: if blocked, show the limit screen and skip all steps ─── */}
        {isBlocked ? (
          <div className="bg-white rounded-3xl shadow-lg shadow-slate-200 overflow-hidden">
            <AdoptionLimitBlocked pet={pet} onBack={onBack} />
          </div>
        ) : (
          <>
            <StepPills step={step} onStepChange={onStepChange} />

            <div className="h-1 bg-slate-200 rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="bg-white rounded-3xl shadow-lg shadow-slate-200 overflow-hidden">
              {step === 1 && (
                <Step1PersonalDetails form={form} set={set} onNext={() => onStepChange(2)} />
              )}
              {step === 2 && (
                <Step2Lifestyle form={form} set={set} onBack={() => onStepChange(1)} onNext={() => onStepChange(3)} />
              )}
              {step === 3 && (
                <Step3Documents form={form} set={set} onBack={() => onStepChange(2)} onNext={() => onStepChange(4)} />
              )}
              {step === 4 && (
                <Step4Review
                  form={form}
                  error={error}
                  submitting={submitting}
                  onBack={() => onStepChange(3)}
                  onSubmit={onSubmit}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdoptionApplicationForm;
