// src/controllers/shelterProfile.controller.js
// Add these two functions to your existing shelter.controller.js
// and register the routes in shelter.routes.js

import db from "../../models/index.js";
const { Shelter, ShelterNgoDetails, ShelterRescuerDetails, Government, ShelterFiles } = db;

// ── GET /api/shelters/my-profile ──────────────────────────────────────────
// Returns full shelter profile for the logged-in shelter owner
export const getShelterProfile = async (req, res) => {
  try {
    const shelter = await Shelter.findOne({
      where: { owner_id: req.user.id },
      include: [
        { model: ShelterNgoDetails,      as: "ngo_details"        },
        { model: ShelterRescuerDetails,  as: "rescuer_details"    },
        { model: Government,             as: "government_details" },
        { model: ShelterFiles,           as: "files"              },
      ],
    });

    if (!shelter) {
      return res.status(404).json({ success: false, message: "Shelter not found" });
    }

    return res.status(200).json({ success: true, data: shelter });
  } catch (error) {
    console.error("Get Shelter Profile Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── PUT /api/shelters/my-profile ──────────────────────────────────────────
// Updates basic info and contact details for the logged-in shelter owner
export const updateShelterProfile = async (req, res) => {
  try {
    const shelter = await Shelter.findOne({ where: { owner_id: req.user.id } });

    if (!shelter) {
      return res.status(404).json({ success: false, message: "Shelter not found" });
    }

    const {
      name,
      contact_email,
      contact_phone,
      city,
      state,
      country,
      zipcode,
      description,
      upi_id,
    } = req.body;

    console.log("req.body:", req.body);
    console.log("upi_id received:", upi_id);

    await shelter.update({
      name:          name          || shelter.name,
      contact_email: contact_email || shelter.contact_email,
      contact_phone: contact_phone || shelter.contact_phone,
      city:          city          || shelter.city,
      state:         state         || shelter.state,
      country:       country       || shelter.country,
      zipcode:       zipcode       || shelter.zipcode,
      description:   description   !== undefined ? description : shelter.description,
      upi_id:        upi_id        ? upi_id : shelter.upi_id,
    });

    return res.status(200).json({
      success: true,
      message: "Shelter profile updated successfully",
      data: shelter,
    });
  } catch (error) {
    console.error("Update Shelter Profile Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};