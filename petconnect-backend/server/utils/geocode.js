const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;

const googleGeocode = async (params) => {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set("key", GOOGLE_MAPS_KEY);

  const res  = await fetch(url.toString());
  const data = await res.json();

  if (data.status === "OK" && data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry.location;
    return { latitude: lat, longitude: lng };
  }
  return null;
};

export const geocodeShelter = async (shelter) => {
  try {
    if (shelter.zipcode) {
      const result = await googleGeocode({
        components: `postal_code:${shelter.zipcode}|country:IN`,
      });
      if (result) return result;
    }

    if (shelter.city && shelter.state) {
      const result = await googleGeocode({
        address: `${shelter.city}, ${shelter.state}, India`,
      });
      if (result) return result;
    }

    if (shelter.city) {
      return await googleGeocode({ address: `${shelter.city}, India` });
    }

    return null;
  } catch (err) {
    console.error("Geocode failed for shelter:", shelter.id, err.message);
    return null;
  }
};
