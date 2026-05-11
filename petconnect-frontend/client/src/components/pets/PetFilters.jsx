import { MapPin, Loader2, X } from "lucide-react";
import useLocation from "../../hooks/useLocation";

const AGE_MIN = 0;
const AGE_MAX = 100;

const AgeRangeSlider = ({ ageMin, ageMax, onChange }) => {
  const min    = ageMin === "" ? AGE_MIN : Number(ageMin);
  const max    = AGE_MAX;
  const minPct = ((min - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100;

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), max - 1);
    onChange("age_min", val === AGE_MIN ? "" : String(val));
  };

  return (
    <>
      <style>{`
        .age-track-wrap { position: relative; height: 20px; display: flex; align-items: center; }
        .age-track-bg   { position: absolute; left: 0; right: 0; height: 4px; background: #E5E7EB; border-radius: 2px; }
        .age-track-fill { position: absolute; height: 4px; background: #2563EB; border-radius: 2px; }
        .age-slider {
          position: absolute; left: 0; right: 0; width: 100%; height: 20px;
          background: transparent; appearance: none; -webkit-appearance: none;
          pointer-events: none; margin: 0; padding: 0; outline: none;
        }
        .age-slider::-webkit-slider-runnable-track { background: transparent; height: 20px; }
        .age-slider::-moz-range-track              { background: transparent; height: 20px; }
        .age-slider::-webkit-slider-thumb {
          appearance: none; -webkit-appearance: none; width: 18px; height: 18px;
          border-radius: 50%; background: #2563EB; border: 2.5px solid #fff;
          box-shadow: 0 1px 5px rgba(37,99,235,0.35); pointer-events: all; cursor: pointer;
        }
        .age-slider::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%; background: #2563EB;
          border: 2.5px solid #fff; box-shadow: 0 1px 5px rgba(37,99,235,0.35);
          pointer-events: all; cursor: pointer;
        }
        .age-slider::-webkit-slider-thumb:hover { background: #1D4ED8; transform: scale(1.1); }
        .age-slider::-moz-range-thumb:hover     { background: #1D4ED8; }
        .age-slider-disabled::-webkit-slider-thumb { width:0; height:0; background:transparent; border:none; box-shadow:none; pointer-events:none; }
        .age-slider-disabled::-moz-range-thumb     { width:0; height:0; background:transparent; border:none; box-shadow:none; pointer-events:none; }
        .radius-slider { width:100%; appearance:none; -webkit-appearance:none; height:4px; border-radius:2px; background:#E5E7EB; outline:none; cursor:pointer; }
        .radius-slider::-webkit-slider-thumb {
          appearance:none; -webkit-appearance:none; width:18px; height:18px;
          border-radius:50%; background:#2563EB; border:2.5px solid #fff;
          box-shadow:0 1px 5px rgba(37,99,235,0.35); cursor:pointer;
        }
        .radius-slider::-moz-range-thumb {
          width:18px; height:18px; border-radius:50%; background:#2563EB;
          border:2.5px solid #fff; box-shadow:0 1px 5px rgba(37,99,235,0.35); cursor:pointer;
        }
        .radius-slider::-webkit-slider-thumb:hover { background:#1D4ED8; transform:scale(1.1); }
      `}</style>

      <div className="age-track-wrap" style={{ margin: "8px 0 6px" }}>
        <div className="age-track-bg" />
        <div className="age-track-fill" style={{ left: 0, width: `${minPct}%` }} />
        <input type="range" min={AGE_MIN} max={AGE_MAX} value={min}
          onChange={handleMinChange} className="age-slider"
          style={{ zIndex: min > AGE_MAX - 2 ? 5 : 3 }} />
        <input type="range" min={AGE_MIN} max={AGE_MAX} value={AGE_MAX}
          readOnly className="age-slider age-slider-disabled"
          style={{ zIndex: 2, pointerEvents: "none" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
        <span style={{ fontSize: "11px", color: "#6B7280" }} />
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#2563EB" }}>
          {min === AGE_MIN ? "Any age" : `${min}yr+`}
        </span>
        <span style={{ fontSize: "11px", color: "#6B7280" }} />
      </div>
    </>
  );
};

const PetFilters = ({ filters, onChange, mobileDrawer = false, availableSpecies = [] }) => {
  
  const PRESET = ["Dog", "Cat", "Bird", "Rabbit"];

  const dynamicSpecies = [
    { value: "", label: "All" },
    { value: "dog", label: "🐕 Dog" },
    { value: "cat", label: "🐈 Cat" },
    { value: "birds", label: "🐦 Birds" },
    { value: "rabbit", label: "🐇 Rabbit" },
    ...availableSpecies
      .filter(s => !PRESET.map(p => p.toLowerCase()).includes(s.toLowerCase()))
      .map(s => ({ value: s.toLowerCase(), label: `🐾 ${s}` }))
  ];
  const { getLocation, locLoading, locError } = useLocation();

  const handleChange = (field, value) => onChange({ ...filters, [field]: value, page: 1 });
  const handleToggle = (field)        => onChange({ ...filters, [field]: !filters[field], page: 1 });

  const handleReset = () => onChange({
    species: "", breed: "", gender: "",
    vaccinated: undefined, special_needs: undefined, good_with_kids: undefined,
    age_min: "", age_max: "", city: "", zipcode: "",
    displayLocation: "",
    lat: undefined, lng: undefined, radius: undefined,
    page: 1, limit: 9, sort: filters.sort ?? "newest",
  });

  // ── Use my location ────────────────────────────────────────────────────────
  const handleUseLocation = async () => {
    const result = await getLocation();
    if (!result) return;
    onChange({
      ...filters,
      city:   result.city    || "",
      zipcode: result.zipcode || "",
      displayLocation: result.displayLocation || "",
      lat:    result.lat,
      lng:    result.lng,
      radius: filters.radius ?? 50, 
      page:   1,
    });
  };

  // ── Clear location ─────────────────────────────────────────────────────────
  const handleClearLocation = () => {
    onChange({
      ...filters,
      city: "", zipcode: "",
      lat: undefined, lng: undefined, radius: undefined,
      page: 1,
    });
  };

  const hasLocation = filters.lat !== undefined && filters.lng !== undefined;

  const content = (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-gray-900">Filters</h2>
        <button onClick={handleReset} className="text-xs text-blue-600 hover:underline">Reset all</button>
      </div>
{/* ── LOCATION ────────────────────────────────────────────────────── */}
<div className="mb-5">
  <p className="text-xs font-semibold text-gray-400  tracking-wider mb-2">Location</p>

  {/* City input */}
  <div className="relative mb-2">
    <input
      type="text"
      placeholder="Enter city"
      value={hasLocation ? (filters.displayLocation || filters.city) : (filters.city || "")}
      onChange={(e) => handleChange("city", e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 pr-7"
    />
    {filters.city && (
      <button onClick={() => handleChange("city", "")}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        <X size={13} />
      </button>
    )}
  </div>

  {/* Use my location button — only shown when no GPS location active */}
  {!hasLocation && (
    <button
      onClick={handleUseLocation}
      disabled={locLoading}
      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-60 mt-1"
    >
      {locLoading
        ? <Loader2 size={13} className="animate-spin" />
        : <MapPin size={13} />
      }
      {locLoading ? "Detecting location..." : "Use my location"}
    </button>
  )}

  {/* Location detected pill */}
  {hasLocation && (
    <div className="flex items-center gap-2 mt-1">
      <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-1 font-medium">
        <MapPin size={11} />
        {filters.displayLocation || filters.city || "Current location"}
      </span>
      <button onClick={handleClearLocation}
        className="text-xs text-gray-400 hover:text-red-500 transition-colors">
        <X size={13} />
      </button>
    </div>
  )}

  {/* Location error */}
  {locError && (
    <p className="text-xs text-red-500 mt-1">{locError}</p>
  )}

  {/* Radius slider — only when GPS location is active */}
  {hasLocation && (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-gray-400  tracking-wider">Radius</p>
        <span className="text-xs font-bold text-blue-600">{filters.radius ?? 50} km</span>
      </div>
      <input
        type="range"
        min={10}
        max={100}
        step={5}
        value={filters.radius ?? 50}
        onChange={(e) => handleChange("radius", Number(e.target.value))}
        className="radius-slider"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>10 km</span>
        <span>100 km</span>
      </div>
    </div>
  )}
</div>
{/* ── SPECIES ─────────────────────────────────────────────────────── */}
<div className="mb-5">
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Species</p>
  <div className="flex gap-2 flex-wrap">
    {dynamicSpecies.map(({ value, label }) => (
      <button key={value} onClick={() => handleChange("species", value)}
        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
          filters.species === value
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
        }`}>
        {label}
      </button>
    ))}
  </div>
</div>
      {/* ── BREED ───────────────────────────────────────────────────────── */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-400  tracking-wider mb-2">Breed</p>
        <input type="text" placeholder="e.g. Golden Retriever" value={filters.breed || ""}
          onChange={(e) => handleChange("breed", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
      </div>

      {/* ── AGE SLIDER ──────────────────────────────────────────────────── */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-400  tracking-wider mb-1">Age (years)</p>
        <AgeRangeSlider ageMin={filters.age_min} ageMax={filters.age_max} onChange={handleChange} />
      </div>

      {/* ── GENDER ──────────────────────────────────────────────────────── */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-400  tracking-wider mb-2">Gender</p>
        <div className="flex gap-2 flex-wrap">
          {[{ label: "All", value: "" }, { label: "Male", value: "male" }, { label: "Female", value: "female" }].map((g) => (
            <button key={g.value} onClick={() => handleChange("gender", g.value)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                filters.gender === g.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
              }`}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TOGGLES ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {[
          { label: "Vaccinated",     field: "vaccinated"     },
          { label: "Special needs",  field: "special_needs"  },
          { label: "Social friendly", field: "good_with_kids" },
        ].map(({ label, field }) => (
          <div key={field} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{label}</span>
            <button onClick={() => handleToggle(field)}
              className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${filters[field] ? "bg-blue-600" : "bg-gray-200"}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${filters[field] ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>
    </>
  );

  if (mobileDrawer) return <div>{content}</div>;

  return (
    <div className="w-64 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit sticky top-20">
      {content}
    </div>
  );
};

export default PetFilters;