// client/src/components/common/LocationPicker.jsx
import { useState, useRef, useEffect } from "react";
import useLocation from "../../hooks/useLocation";

const LocationPicker = ({
  value    = "",
  onChange,
  onClear,
  onLocationDetected,
  placeholder = "e.g. Bangalore, India",
}) => {
  const { getLocation: getCity, locLoading, locError } = useLocation();

  const [gpsSuccess,    setGpsSuccess]    = useState(false);
  const [suggestions,   setSuggestions]   = useState([]);
  const [showDropdown,  setShowDropdown]  = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Text input → Google Places Autocomplete (via backend proxy)
  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setGpsSuccess(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 3) { setSuggestions([]); setShowDropdown(false); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/geo/places-autocomplete?input=${encodeURIComponent(val)}`);
        const data = await res.json();

        if (data.status === "OK" && data.predictions.length > 0) {
          setSuggestions(data.predictions);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      } catch {
        setSuggestions([]);
      }
    }, 400);
  };

  // ── Suggestion selected → fetch place details for exact lat/lng
  const handleSuggestionClick = async (item) => {
    onChange(item.description);
    setSuggestions([]);
    setShowDropdown(false);

    if (onLocationDetected) {
      try {
        const res  = await fetch(`/api/geo/place-details?place_id=${item.place_id}`);
        const data = await res.json();

        if (data.status === "OK") {
          const { lat, lng }  = data.result.geometry.location;
          const components    = data.result.address_components;
          const get = (type)  => components.find((c) => c.types.includes(type))?.long_name || "";

          onLocationDetected({
            city:    get("locality") || get("administrative_area_level_2"),
            zipcode: get("postal_code"),
            lat,
            lng,
          });
        }
      } catch (err) {
        console.error("Place details failed:", err);
      }
    }
  };

  // ── GPS detect button
  const handleDetect = async () => {
    const result = await getCity();
    if (result) {
      const locationStr = [result.city, result.zipcode].filter(Boolean).join(", ");
      onChange(locationStr);
      setGpsSuccess(true);
      setSuggestions([]);
      setShowDropdown(false);
      if (onLocationDetected) {
        onLocationDetected({ city: result.city, zipcode: result.zipcode, lat: result.lat, lng: result.lng });
      }
    }
  };

  // ── Clear button
  const handleClear = () => {
    onChange("");
    setGpsSuccess(false);
    setSuggestions([]);
    setShowDropdown(false);
    if (onClear) onClear();
    if (onLocationDetected) onLocationDetected(null);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className={`flex items-center border rounded-lg transition focus-within:ring-2
        ${locError     ? "border-red-400 focus-within:ring-red-300"
        : gpsSuccess   ? "border-cyan-400 focus-within:ring-cyan-300"
        :                "border-gray-200 focus-within:ring-cyan-400"}`}>

        {/* GPS icon button */}
        <button type="button" onClick={handleDetect} disabled={locLoading}
          title="Auto-detect my location"
          className="flex items-center justify-center w-10 h-10 flex-shrink-0
                     bg-gray-50 border-r border-gray-200 rounded-l-lg
                     text-gray-400 hover:text-cyan-600 hover:bg-cyan-50
                     transition disabled:opacity-50 disabled:cursor-not-allowed">
          {locLoading ? (
            <svg className="animate-spin w-4 h-4 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path  className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" fill="currentColor" />
              <path strokeLinecap="round" d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              <circle cx="12" cy="12" r="7" strokeDasharray="3 2" opacity="0.4" />
            </svg>
          )}
        </button>

        {/* Text input */}
        <input type="text" value={value} onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={locLoading ? "Detecting your location…" : placeholder}
          className="flex-1 min-w-0 px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none placeholder-gray-400" />

        {/* Clear button */}
        {value.trim().length > 0 && (
          <button type="button" onClick={handleClear} title="Clear"
            className="flex items-center justify-center w-8 h-10 text-gray-400 hover:text-gray-600 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Helper text */}
      {gpsSuccess && value && (
        <p className="text-cyan-600 text-xs mt-1">✓ Location detected — you can still edit it manually</p>
      )}
      {!locError && !value && !locLoading && (
        <p className="text-gray-400 text-xs mt-1">Type a city / pincode, or click the icon to auto-detect</p>
      )}
      {locError && <p className="text-red-500 text-xs mt-1">{locError}</p>}

      {/* Autocomplete dropdown — description replaces display_name */}
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {suggestions.map((item) => (
            <li key={item.place_id} onMouseDown={() => handleSuggestionClick(item)}
              className="flex items-start gap-2 px-4 py-2.5 hover:bg-cyan-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-0">
              <svg className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-2 leading-snug">{item.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationPicker;