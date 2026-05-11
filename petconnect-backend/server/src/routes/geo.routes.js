// server/routes/geo.routes.js
import express from "express";

const router = express.Router();

// Helper — reads key fresh every time, never stale
const getKey = () => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) console.error("❌ GOOGLE_MAPS_API_KEY is not set in .env");
  return key;
};

// ── Reverse geocode: lat/lng → address
router.get("/reverse-geocode", async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: "lat and lng required" });

  const KEY = getKey();
  if (!KEY) return res.status(500).json({ error: "Google Maps API key not configured" });

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${KEY}`
    );
    const data = await response.json();
    console.log("reverse-geocode status:", data.status); // debug
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Places autocomplete: text → suggestions
router.get("/places-autocomplete", async (req, res) => {
  const { input } = req.query;
  if (!input) return res.status(400).json({ error: "input required" });

  const KEY = getKey();
  if (!KEY) return res.status(500).json({ error: "Google Maps API key not configured" });

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodeURIComponent(input)}&components=country:in&types=geocode&key=${KEY}`
    );
    const data = await response.json();
    console.log("places-autocomplete status:", data.status); // debug
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Place details: place_id → lat/lng + address components
router.get("/place-details", async (req, res) => {
  const { place_id } = req.query;
  if (!place_id) return res.status(400).json({ error: "place_id required" });

  const KEY = getKey();
  if (!KEY) return res.status(500).json({ error: "Google Maps API key not configured" });

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${place_id}&fields=geometry,address_components,formatted_address&key=${KEY}`
    );
    const data = await response.json();
    console.log("place-details status:", data.status); // debug
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;