// server/scripts/geocodeShelters.js
import db from "../models/index.js";

const { Shelter } = db;

const geocodeShelter = async (shelter) => {
  const queries = [];

  // Tier 1 — postalcode structured query (most precise)
  if (shelter.zipcode) {
    queries.push(
      `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(shelter.zipcode)}&countrycodes=in&format=json&limit=1`,
    );
  }

  // Tier 2 — city + state structured query
  if (shelter.city && shelter.state) {
    queries.push(
      `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(shelter.city)}&state=${encodeURIComponent(shelter.state)}&countrycodes=in&format=json&limit=1`,
    );
  }

  // Tier 3 — free-text fallback
  const freeText = [shelter.city, shelter.state, "India"]
    .filter(Boolean)
    .join(", ");
  queries.push(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(freeText)}&format=json&limit=1`,
  );

  for (const url of queries) {
    const res = await fetch(url, {
      headers: { "User-Agent": "PetConnect/1.0", "Accept-Language": "en" },
    });
    const data = await res.json();
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    await new Promise((r) => setTimeout(r, 1100));
  }
  return null;
};
// ← THIS IS WHAT WAS MISSING
const run = async () => {
  await db.sequelize.authenticate();
  console.log("DB connected.");

  const shelters = await Shelter.findAll({ where: { latitude: null } });
  console.log(`Found ${shelters.length} shelters to geocode...`);

  for (const shelter of shelters) {
    const coords = await geocodeShelter(shelter);
    if (coords) {
      await shelter.update(coords);
      console.log(
        `✓ ${shelter.name} (${shelter.zipcode}) → ${coords.latitude}, ${coords.longitude}`,
      );
    } else {
      console.warn(`✗ Could not geocode: ${shelter.name} (${shelter.zipcode})`);
    }
    await new Promise((r) => setTimeout(r, 1100));
  }

  console.log("Done.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
