
import { useState } from "react";

const useLocation = () => {
  const [locLoading, setLocLoading] = useState(false);
  const [locError,   setLocError]   = useState(null);

  const reverseGeocode = async (latitude, longitude) => {
    const res  = await fetch(`/api/geo/reverse-geocode?lat=${latitude}&lng=${longitude}`);
    const data = await res.json();

    console.log("reverseGeocode raw response:", data.status);

    if (data.status !== "OK" || !data.results.length) return null;

    const components = data.results[0].address_components;
    const get = (type) =>
      components.find((c) => c.types.includes(type))?.long_name || "";

    const city    = get("locality") || get("sublocality_level_1") || get("administrative_area_level_2");
    const zipcode = get("postal_code");
    const suburb  = get("sublocality_level_1") || get("neighborhood");
    const state   = get("administrative_area_level_1");

    console.log("reverseGeocode parsed:", { city, zipcode, suburb });

    return {
      city,
      zipcode,
      displayLocation: [suburb, city, state].filter(Boolean).join(", "),
    };
  };

  const getLocation = async () => {
    setLocLoading(true);
    setLocError(null);

    try {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });

        const { latitude, longitude, accuracy } = position.coords;
        console.log("GPS accuracy:", accuracy, "meters");

        if (accuracy <= 500) {
          const geo = await reverseGeocode(latitude, longitude);
          if (geo) {
            setLocLoading(false);
            return { ...geo, lat: latitude, lng: longitude };
          }
        }
        console.warn("GPS accuracy too low:", accuracy, "m — trying IP");
      } catch {
        console.warn("GPS unavailable — trying IP");
      }

      const ipRes  = await fetch("http://localhost:5000/api/geoip");
      const ipData = await ipRes.json();
      console.log("IP data received:", ipData);

      if (ipData.status === "fail") throw new Error("IP geolocation failed");

      const { lat, lon, city, zip, regionName } = ipData;
      console.log("IP coords:", lat, lon);

      if (lat && lon) {
        const geo = await reverseGeocode(lat, lon);
        console.log("Google geo from IP coords:", geo);
        if (geo) {
          setLocLoading(false);
          return { ...geo, lat, lng: lon };
        }
      }

      console.warn("Google geocode failed — using raw IP data");
      setLocLoading(false);
      return {
        city,
        zipcode:         zip || "",
        displayLocation: `${city}, ${regionName}`,
        lat,
        lng:             lon,
      };

    } catch (err) {
      console.error("getLocation error:", err);
      if      (err.code === 1) setLocError("Location access denied. Please allow in browser settings.");
      else if (err.code === 2) setLocError("Location unavailable. Try again or enter city manually.");
      else if (err.code === 3) setLocError("Location timed out. Try again.");
      else setLocError("Could not get your location. Please enter city manually.");
      setLocLoading(false);
      return null;
    }
  };

  return { getLocation, locLoading, locError };
};

export default useLocation;
