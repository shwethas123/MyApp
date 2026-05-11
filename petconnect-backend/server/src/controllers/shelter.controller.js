import db from "../../models/index.js";
import { v2 as cloudinary } from "cloudinary";
import {
  sendShelterApprovedEmail,
  sendShelterRejectedEmail,
} from "../../utils/mailer.js";
import { createNotification } from "./notification.controller.js";
import { getIO } from "../socket.js";
import { geocodeShelter } from "../../utils/geocode.js";

const { Op } = await import("sequelize");

const validateRegistrationNumber = (type, value) => {
  const societyRegex = /^[A-Z]{2,5}\/[A-fZ]{2,5}\/\d{1,6}\/\d{4}(-\d{2})?$/;
  const trustSerialRegex = /^\d+\s*\/\s*\d{4}\s*\/\s*Book\s*No\.?\s*\d+$/i;
  const trustStateRegex =
    /^[A-Z][\/-]?\d{1,6}(?:\/[A-Za-z\s]+|\s*\([A-Z]\)\s*[A-Za-z\s]+)?$/;
  const darpanRegex = /^[A-Z]{2}\/\d{4}\/\d{6,8}$/;
  const cinRegex = /^[A-Z]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;

  if (type === "society") return societyRegex.test(value);
  if (type === "trust")
    return (
      trustSerialRegex.test(value) ||
      trustStateRegex.test(value) ||
      darpanRegex.test(value)
    );
  if (type === "section8") return cinRegex.test(value);
  return false;
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const {
  Shelter,
  ShelterRescuerDetails,
  Government,
  ShelterNgoDetails,
  ShelterFiles,
} = db;

// ── Helper: notify all admins ─────────────────────────────────────────────────
const notifyAdmins = async ({ message, reference_type, reference_id }) => {
  try {
    const admins = await db.User.findAll({
      include: [
        { model: db.Role, as: "roleDetails", where: { name: "admin" } },
      ],
      attributes: ["id"],
    });
    const io = getIO();
    for (const admin of admins) {
      await createNotification({
        user_id: admin.id,
        message,
        reference_type,
        reference_id,
      });
      io.to(`user_${admin.id}`).emit("new_notification", {
        message,
        reference_type,
        reference_id,
        created_at: new Date(),
        is_read: false,
      });
    }
  } catch (err) {
    console.error("Admin notification failed:", err.message);
  }
};

// ── GET /api/shelters/:id ─────────────────────────────────────────────────────
export const getShelterById = async (req, res) => {
  try {
    const { id } = req.params;
    const shelter = await Shelter.findByPk(id);
    if (!shelter) return res.status(404).json({ message: "Shelter not found" });
    res.json(shelter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkShelterNameAvailability = async (req, res) => {
  try {
    const { name } = req.query;
    console.log("name check hit:", name);
    if (!name) return res.status(400).json({ message: "Name is required" });
    console.log("name check hit:", name);

    const exists = await Shelter.findOne({
      where: {
        name: { [Op.iLike]: name.trim() },
        type: req.query.type,
      },
    });

    if (exists)
      return res.status(409).json({
        message: "An organization with this name is already registered.",
      });
    return res.status(200).json({ available: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ── POST /api/shelters/ngo ────────────────────────────────────────────────────
export const createNgoShelter = async (req, res) => {
  try {
    const {
      name,
      type,
      registration_type,
      registration_number,
      year_of_registration,
      city,
      state,
      country,
      zipcode,
      contact_email,
      contact_phone,
    } = req.body;

    // YOUR CHANGE 1: strip +91 prefix from phone
    const cleanedPhone = (contact_phone || "")
      .replace(/\s/g, "")
      .replace(/^\+91/, "");

    if (
      !name ||
      !type ||
      !registration_type ||
      !registration_number ||
      !year_of_registration ||
      !city ||
      !state ||
      !country ||
      !zipcode ||
      !contact_email ||
      !contact_phone
    )
      return res.status(400).json({ message: "All fields are required" });

    if (name.trim().length < 3)
      return res
        .status(400)
        .json({ message: "Organization name must be at least 3 characters." });

    if (name.trim().length > 100)
      return res
        .status(400)
        .json({ message: "Organization name cannot exceed 100 characters." });

    if (!/^[A-Za-z\s.&'()-]+$/.test(name.trim()))
      return res.status(400).json({
        message:
          "Organization name may only contain letters, spaces, and .  &  '  ( )  -",
      });

    if (!/[A-Za-z]{2,}/.test(name.trim()))
      return res.status(400).json({
        message: "Organization name must contain meaningful letters.",
      });

    if (/^(.)\1+$/.test(name.trim()))
      return res
        .status(400)
        .json({ message: "Please enter a valid organization name." });

    if (!validateRegistrationNumber(registration_type, registration_number))
      return res
        .status(400)
        .json({ message: "Enter valid format : SOR/BLR/1023/2024-25" });

    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year_of_registration, 10);
    if (
      !/^\d{4}$/.test(year_of_registration) ||
      yearNum < 1900 ||
      yearNum > currentYear
    )
      return res
        .status(400)
        .json({ message: `Year must be between 1900 and ${currentYear}` });

    if (!cleanedPhone || !/^(?:\+91)?[6-9]\d{9}$/.test(cleanedPhone))
      return res
        .status(400)
        .json({ message: "Enter a valid 10-digit Indian phone number" });

    if (
      !contact_email ||
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(contact_email)
    )
      return res.status(400).json({ message: "Enter a valid email address" });

    if (contact_email.length > 254)
      return res
        .status(400)
        .json({ message: "Email cannot exceed 254 characters" });

    if (!/^(?=.*[A-Za-z])[A-Za-z\s.-]{3,}$/.test(city))
      return res.status(400).json({ message: "Enter a valid city name" });

    if (!req.files?.registration_certificate)
      return res
        .status(400)
        .json({ message: "Registration certificate is required" });

    const existingShelter = await Shelter.findOne({
      where: { owner_id: req.user.id },
    });
    if (existingShelter)
      return res
        .status(409)
        .json({ message: "You already have a shelter registered" });

    // YOUR CHANGE 3: duplicate email/phone check
    const emailExists = await Shelter.findOne({ where: { contact_email } });
    const phoneExists = await Shelter.findOne({
      where: { contact_phone: cleanedPhone },
    });

    if (emailExists && phoneExists)
      return res.status(409).json({
        message:
          "This email and phone number are already registered with another shelter.",
      });
    if (emailExists)
      return res.status(409).json({
        message: "This email is already registered with another shelter.",
      });
    if (phoneExists)
      return res.status(409).json({
        message:
          "This phone number is already registered with another shelter.",
      });
    const nameExists = await Shelter.findOne({ where: { name: name.trim() } });
    if (nameExists)
      return res.status(409).json({
        message: "An organization with this name is already registered.",
      });
    const shelter = await Shelter.create({
      name,
      type,
      city,
      state,
      country,
      zipcode,
      contact_email,
      contact_phone: cleanedPhone,
      owner_id: req.user.id,
    });
    const coords = await geocodeShelter(shelter);
    if (coords) await shelter.update(coords);

    const ngoDetails = await ShelterNgoDetails.create({
      shelter_id: shelter.id,
      registration_type,
      registration_number,
      year_of_registration,
    });

    const fileRecords = [];
    const processFile = async (file, fileType) => {
      const resourceType = file.path.includes("/raw/upload/") ? "raw" : "image";
      const rawPublicId = file.filename;
      const newPublicId = rawPublicId.replace(
        /shelters\/temp_\d+/,
        `shelters/shelter_${shelter.id}`,
      );
      await cloudinary.uploader.rename(rawPublicId, newPublicId, {
        resource_type: resourceType,
      });
      const newUrl = file.path.replace(rawPublicId, newPublicId);
      return ShelterFiles.create({
        shelter_id: shelter.id,
        file_url: newUrl,
        public_id: newPublicId,
        file_type: fileType,
      });
    };

    const certFile = req.files.registration_certificate[0];
    fileRecords.push(await processFile(certFile, "registration_certificate"));

    if (req.files?.additional_document) {
      for (const file of req.files.additional_document) {
        fileRecords.push(await processFile(file, "additional_document"));
      }
    }

    await notifyAdmins({
      message: `🏠 New shelter "${name}" registered and pending review.`,
      reference_type: "shelter",
      reference_id: shelter.id,
    });

    res.status(201).json({
      message: "NGO shelter registered successfully",
      shelter_id: shelter.id,
      ngo_details: ngoDetails,
      files: fileRecords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ── POST /api/shelters/government ─────────────────────────────────────────────
export const createGovernmentDetails = async (req, res) => {
  try {
    console.log("Government API hit");
    const {
      name,
      type,
      department_name,
      municipality,
      office,
      government_id_number,
      city,
      state,
      zipcode,
      country,
      contact_email,
      contact_phone,
    } = req.body;

    if (
      !name ||
      !type ||
      !department_name ||
      !municipality ||
      !government_id_number ||
      !office ||
      !state ||
      !country ||
      !zipcode ||
      !contact_email ||
      !contact_phone ||
      !city
    )
      return res.status(400).json({ message: "All fields are required" });

    if (name.trim().length < 3)
      return res
        .status(400)
        .json({ message: "Organization name must be at least 3 characters." });

    if (name.trim().length > 100)
      return res
        .status(400)
        .json({ message: "Organization name cannot exceed 100 characters." });

    if (!/^[A-Za-z\s.&'()-]+$/.test(name.trim()))
      return res.status(400).json({
        message:
          "Organization name may only contain letters, spaces, and . & ' ( ) -",
      });

    if (!/[A-Za-z]{2,}/.test(name.trim()))
      return res.status(400).json({
        message: "Organization name must contain meaningful letters.",
      });

    if (/^(.)\1+$/.test(name.trim()))
      return res
        .status(400)
        .json({ message: "Please enter a valid organization name." });

    if (!/^(?=.*[A-Za-z])[A-Za-z\s.&-]{3,50}$/.test(department_name))
      return res.status(400).json({ message: "Enter a valid department name" });
    if (/^(.)\1+$/.test(department_name))
      return res
        .status(400)
        .json({ message: "Department name cannot be repetitive characters" });

    const municipalityValue = municipality.trim().toUpperCase();
    const municipalityPattern1 = /^[A-Z]{2,10}\/[A-Z0-9]+\/\d{4}\/\d+$/;
    const municipalityPattern2 = /^(?=.*[A-Za-z])[A-Za-z0-9\s-]{3,50}$/;
    if (
      !municipalityPattern1.test(municipalityValue) &&
      !municipalityPattern2.test(municipalityValue)
    )
      return res.status(400).json({ message: "Invalid municipality format" });

    if (!/^(?=.*[A-Za-z])[A-Za-z0-9\s,./&()-]{3,100}$/.test(office))
      return res.status(400).json({ message: "Enter a valid office name" });
    if (/^(.)\1+$/.test(office.trim()))
      return res
        .status(400)
        .json({ message: "Office name cannot be repetitive characters" });

    const govId = government_id_number.trim().toUpperCase();
    const govPatterns = [
      /^GO\/[A-Z]{2,5}\/\d+\/\d{4}$/,
      /^[A-Z]{2}-[A-Z]{2,10}-\d{4}-\d+$/,
      /^[A-Z]{3,10}\/[A-Z0-9]+\/\d{4}\/\d+$/,
    ];
    if (!govPatterns.some((regex) => regex.test(govId)))
      return res.status(400).json({ message: "Invalid Government ID format" });

    if (!/^(?=.*[A-Za-z])[A-Za-z\s.-]{2,}$/.test(city))
      return res.status(400).json({ message: "Enter a valid city" });
    if (!/^(?=.*[A-Za-z])[A-Za-z\s.-]{2,}$/.test(state))
      return res.status(400).json({ message: "Enter a valid state" });
    if (!/^(?=.*[A-Za-z])[A-Za-z\s.-]{2,}$/.test(country))
      return res.status(400).json({ message: "Enter a valid country" });
    if (!/^\d{6}$/.test(zipcode))
      return res.status(400).json({ message: "Pincode must be 6 digits" });
    if (
      !/^[a-zA-Z0-9._%+-]+@(gov\.in|nic\.in|india\.gov\.in|mea\.gov\.in|mohfw\.gov\.in)$/.test(
        contact_email,
      )
    )
      return res
        .status(400)
        .json({ message: "Use official email (e.g. @gov.in, @nic.in)" });

    // YOUR CHANGE 1: strip +91 prefix from phone
    const cleanedPhone = (contact_phone || "")
      .replace(/\s/g, "")
      .replace(/^\+91/, "");
    if (!/^(?:\+91)?[6-9]\d{9}$/.test(cleanedPhone))
      return res
        .status(400)
        .json({ message: "Enter a valid Indian phone number" });

    const file = req.file;
    if (!file)
      return res
        .status(400)
        .json({ message: "Government authorization document is required" });

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.mimetype))
      return res
        .status(400)
        .json({ message: "Only PDF, JPG, PNG files allowed" });
    if (file.size > 5 * 1024 * 1024)
      return res
        .status(400)
        .json({ message: "File size must be less than 5MB" });

    const existingShelter = await Shelter.findOne({
      where: { owner_id: req.user.id },
    });
    if (existingShelter)
      return res
        .status(409)
        .json({ message: "You already have a shelter registered" });

    // YOUR CHANGE 3: duplicate email/phone check
    const emailExists = await Shelter.findOne({ where: { contact_email } });
    const phoneExists = await Shelter.findOne({
      where: { contact_phone: cleanedPhone },
    });

    if (emailExists && phoneExists)
      return res.status(409).json({
        message:
          "This email and phone number are already registered with another shelter.",
      });
    if (emailExists)
      return res.status(409).json({
        message: "This email is already registered with another shelter.",
      });
    if (phoneExists)
      return res.status(409).json({
        message:
          "This phone number is already registered with another shelter.",
      });
    const nameExists = await Shelter.findOne({ where: { name: name.trim() } });
    if (nameExists)
      return res.status(409).json({
        message: "An organization with this name is already registered.",
      });
    const shelter = await Shelter.create({
      name,
      type,
      city,
      state,
      country,
      zipcode,
      contact_email,
      contact_phone: cleanedPhone,
      owner_id: req.user.id,
    });
    const coords = await geocodeShelter(shelter);
    if (coords) await shelter.update(coords);

    const governmentDetails = await Government.create({
      shelter_id: shelter.id,
      department_name,
      municipality,
      office,
      government_id_number,
    });

    const resourceType = file.path.includes("/raw/upload/") ? "raw" : "image";
    const rawPublicId = file.filename;
    const newPublicId = rawPublicId.replace(
      /shelters\/temp_\d+/,
      `shelters/shelter_${shelter.id}`,
    );
    await cloudinary.uploader.rename(rawPublicId, newPublicId, {
      resource_type: resourceType,
    });
    const newUrl = file.path.replace(rawPublicId, newPublicId);
    await ShelterFiles.create({
      shelter_id: shelter.id,
      file_url: newUrl,
      public_id: newPublicId,
      file_type: "government_authorization",
    });

    await notifyAdmins({
      message: `🏠 New shelter "${name}" registered and pending review.`,
      reference_type: "shelter",
      reference_id: shelter.id,
    });

    res.status(201).json({
      message: "Government details saved successfully",
      data: governmentDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/shelters/rescuer ────────────────────────────────────────────────
export const createShelterRescuer = async (req, res) => {
  try {
    console.log("Rescuer API hit");
    const {
      name,
      type,
      contact_email,
      contact_phone,
      city,
      state,
      zipcode,
      country,
      id_type,
      id_number,
      rescue_story,
    } = req.body;

    if (
      !name ||
      !type ||
      !contact_email ||
      !contact_phone ||
      !id_type ||
      !id_number ||
      !state ||
      !country ||
      !zipcode ||
      !rescue_story ||
      !city
    )
      return res.status(400).json({ message: "All fields are required" });

    if (name.trim().length < 3)
      return res
        .status(400)
        .json({ message: "Organization name must be at least 3 characters." });

    if (name.trim().length > 100)
      return res
        .status(400)
        .json({ message: "Organization name cannot exceed 100 characters." });

    if (!/^[A-Za-z\s.&'()-]+$/.test(name.trim()))
      return res.status(400).json({
        message:
          "Organization name may only contain letters, spaces, and . & ' ( ) -",
      });

    if (!/[A-Za-z]{2,}/.test(name.trim()))
      return res.status(400).json({
        message: "Organization name must contain meaningful letters.",
      });

    if (/^(.)\1+$/.test(name.trim()))
      return res
        .status(400)
        .json({ message: "Please enter a valid organization name." });

    if (!contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email))
      return res.status(400).json({ message: "Enter a valid email address" });
    if (contact_email.length > 254)
      return res
        .status(400)
        .json({ message: "Email cannot exceed 254 characters" });

    // YOUR CHANGE 1+2: strip +91 and validate cleanedPhone
    const cleanedPhone = (contact_phone || "")
      .replace(/\s/g, "")
      .replace(/^\+91/, "");
    if (!cleanedPhone || !/^[6-9]\d{9}$/.test(cleanedPhone))
      return res
        .status(400)
        .json({ message: "Enter a valid 10-digit Indian phone number" });

    if (/^(.)\1+$/.test(id_number))
      return res
        .status(400)
        .json({ message: "ID number cannot be repetitive characters" });

    if (id_type === "national_id") {
      if (!/^\d{12}$/.test(id_number)) {
        return res.status(400).json({
          message: "Aadhaar must be exactly 12 digits",
        });
      }
    } else if (id_type === "passport") {
      if (!/^[A-Z]\d{7}$/.test(id_number)) {
        return res.status(400).json({
          message: "Invalid passport format",
        });
      }
    } else if (id_type === "drivers_license") {
      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9/-]{6,20}$/.test(id_number)) {
        return res.status(400).json({
          message: "Invalid driving license format",
        });
      }
    } else if (id_type === "voter_id") {
      if (!/^[A-Z]{3}\d{7}$/.test(id_number)) {
        return res.status(400).json({ message: "Invalid Voter ID format" });
      }
    } else if (id_type === "pan_card") {
      if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(id_number)) {
        return res.status(400).json({ message: "Invalid PAN Card format" });
      }
    }

    if (!/^\d{6}$/.test(zipcode))
      return res.status(400).json({ message: "Zip code must be 6 digits" });
    if (!/^(?=.*[A-Za-z])[A-Za-z\s.-]{3,}$/.test(city))
      return res.status(400).json({ message: "Enter a valid city name" });
    if (!/^(?=.*[A-Za-z])[A-Za-z\s.-]{2,}$/.test(country))
      return res.status(400).json({ message: "Enter a valid country name" });
    if (!/^(?=.*[A-Za-z])[A-Za-z\s.-]{3,}$/.test(state))
      return res.status(400).json({ message: "Enter a valid state name" });
    if (!rescue_story || rescue_story.trim().length < 30)
      return res
        .status(400)
        .json({ message: "Rescue story must be at least 30 characters" });
    if (!/[A-Za-z]/.test(rescue_story))
      return res
        .status(400)
        .json({ message: "Rescue story must contain meaningful text" });

    const existingShelter = await Shelter.findOne({
      where: { owner_id: req.user.id },
    });
    if (existingShelter)
      return res
        .status(409)
        .json({ message: "You already have a shelter registered" });

    // YOUR CHANGE 3: duplicate email/phone check
    const emailExists = await Shelter.findOne({ where: { contact_email } });
    const phoneExists = await Shelter.findOne({
      where: { contact_phone: cleanedPhone },
    });

    if (emailExists && phoneExists)
      return res.status(409).json({
        message:
          "This email and phone number are already registered with another shelter.",
      });
    if (emailExists)
      return res.status(409).json({
        message: "This email is already registered with another shelter.",
      });
    if (phoneExists)
      return res.status(409).json({
        message:
          "This phone number is already registered with another shelter.",
      });

    const shelter = await Shelter.create({
      name,
      type,
      city,
      state,
      country,
      zipcode,
      contact_email,
      contact_phone: cleanedPhone,
      owner_id: req.user.id,
    });
    const coords = await geocodeShelter(shelter);
    if (coords) await shelter.update(coords);

    const rescuerDetails = await ShelterRescuerDetails.create({
      shelter_id: shelter.id,
      id_type,
      id_number,
      rescue_story,
    });

    if (req.file) {
      const resourceType = req.file.path.includes("/raw/upload/")
        ? "raw"
        : "image";
      const rawPublicId = req.file.filename;
      const newPublicId = rawPublicId.replace(
        /shelters\/temp_\d+/,
        `shelters/shelter_${shelter.id}`,
      );
      await cloudinary.uploader.rename(rawPublicId, newPublicId, {
        resource_type: resourceType,
      });
      const newUrl = req.file.path.replace(rawPublicId, newPublicId);
      await ShelterFiles.create({
        shelter_id: shelter.id,
        file_url: newUrl,
        public_id: newPublicId,
        file_type: "id_proof",
      });
    }

    await notifyAdmins({
      message: `🏠 New shelter "${name}" registered and pending review.`,
      reference_type: "shelter",
      reference_id: shelter.id,
    });

    res.status(201).json({
      message: "Rescuer details saved successfully",
      data: rescuerDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ── PATCH /api/admin/shelters/:id/verify ─────────────────────────────────────
export const verifyShelter = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    const validStatuses = ["Verified", "Rejected"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status value" });

    if (status === "Rejected" && !rejection_reason?.trim())
      return res.status(400).json({
        message: "Rejection reason is required when rejecting a shelter",
      });

    const shelter = await Shelter.findByPk(id, {
      include: [
        {
          model: db.User,
          as: "owner",
          attributes: ["email", "first_name", "last_name"],
        },
      ],
    });
    if (!shelter) return res.status(404).json({ message: "Shelter not found" });

    await shelter.update({
      status,
      rejection_reason: status === "Rejected" ? rejection_reason : null,
      approved_by: status === "Verified" ? req.user.id : null,
      approved_at: status === "Verified" ? new Date() : null,
    });

    if (status === "Verified") {
      await sendShelterApprovedEmail({
        shelterEmail: shelter.owner.email,
        shelterName: shelter.name,
        ownerName: shelter.owner.first_name,
      });
    } else {
      await sendShelterRejectedEmail({
        shelterEmail: shelter.owner.email,
        shelterName: shelter.name,
        ownerName: shelter.owner.first_name,
        reason: rejection_reason,
      });
    }

    const notificationMessage =
      status === "Verified"
        ? `🎉 Your shelter "${shelter.name}" has been verified by admin!`
        : `❌ Your shelter "${shelter.name}" was rejected. Reason: ${rejection_reason}`;

    await createNotification({
      user_id: shelter.owner_id,
      message: notificationMessage,
      reference_type: "shelter",
      reference_id: shelter.id,
    });

    try {
      const io = getIO();
      io.to(`user_${shelter.owner_id}`).emit("new_notification", {
        message: notificationMessage,
        reference_type: "shelter",
        reference_id: shelter.id,
        created_at: new Date(),
        is_read: false,
      });
    } catch (err) {
      console.error("Socket emit failed:", err.message);
    }

    return res.status(200).json({
      message: `Shelter ${status.toLowerCase()} successfully`,
      data: shelter,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ── DELETE /api/admin/shelters/:id ───────────────────────────────────────────
export const deleteShelter = async (req, res) => {
  try {
    const { id } = req.params;
    const shelter = await Shelter.findByPk(id);
    if (!shelter) return res.status(404).json({ message: "Shelter not found" });
    if (shelter.owner_id !== req.user.id && req.user.roleName !== "admin")
      return res.status(403).json({ message: "Unauthorized" });
    await shelter.destroy();
    return res.status(200).json({ message: "Shelter deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ── GET /api/shelters/my-profile ──────────────────────────────────────────────
export const getShelterProfile = async (req, res) => {
  try {
    const shelter = await Shelter.findOne({
      where: { owner_id: req.user.id },
      include: [
        { model: ShelterNgoDetails, as: "ngo_details" },
        { model: ShelterRescuerDetails, as: "rescuer_details" },
        { model: Government, as: "government_details" },
        { model: ShelterFiles, as: "files" },
      ],
    });
    if (!shelter)
      return res
        .status(404)
        .json({ success: false, message: "Shelter not found" });
    return res.status(200).json({ success: true, data: shelter });
  } catch (error) {
    console.error("Get Shelter Profile Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── PUT /api/shelters/my-profile ──────────────────────────────────────────────
export const updateShelterProfile = async (req, res) => {
  try {
    const shelter = await Shelter.findOne({ where: { owner_id: req.user.id } });
    if (!shelter)
      return res
        .status(404)
        .json({ success: false, message: "Shelter not found" });

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

    const addressChanged =
      (city && city !== shelter.city) ||
      (state && state !== shelter.state) ||
      (zipcode && zipcode !== shelter.zipcode);

    await shelter.update({
      name: name ?? shelter.name,
      contact_email: contact_email ?? shelter.contact_email,
      contact_phone: contact_phone ?? shelter.contact_phone,
      city: city ?? shelter.city,
      state: state ?? shelter.state,
      country: country ?? shelter.country,
      zipcode: zipcode ?? shelter.zipcode,
      description: description ?? shelter.description,
      upi_id: upi_id ?? shelter.upi_id,
    });

    if (addressChanged) {
      const coords = await geocodeShelter(shelter);
      if (coords) await shelter.update(coords);
    }

    return res
      .status(200)
      .json({ success: true, message: "Profile updated", data: shelter });
  } catch (error) {
    console.error("Update Shelter Profile Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE /api/shelters/documents/:fileId ────────────────────────────────────
export const deleteShelterDocument = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await ShelterFiles.findByPk(fileId, {
      include: [{ model: Shelter, as: "shelter" }],
    });
    if (!file)
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    if (file.shelter.owner_id !== req.user.id)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const resourceType = file.file_url?.includes("/raw/") ? "raw" : "image";
    await cloudinary.uploader.destroy(file.public_id, {
      resource_type: resourceType,
    });
    await file.destroy();
    return res.status(200).json({ success: true, message: "Document deleted" });
  } catch (error) {
    console.error("Delete Document Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/shelters/documents ──────────────────────────────────────────────
export const uploadShelterDocument = async (req, res) => {
  try {
    const shelter = await Shelter.findOne({ where: { owner_id: req.user.id } });
    if (!shelter)
      return res
        .status(404)
        .json({ success: false, message: "Shelter not found" });
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });

    const { file_type } = req.body;
    if (!file_type)
      return res
        .status(400)
        .json({ success: false, message: "file_type is required" });

    const oldPublicId = req.file.filename;
    const newPublicId = oldPublicId.replace(
      /shelters\/temp_\d+/,
      `shelters/shelter_${shelter.id}`,
    );
    const resourceType =
      req.file.mimetype === "application/pdf" ? "raw" : "image";

    try {
      await cloudinary.uploader.rename(oldPublicId, newPublicId, {
        resource_type: resourceType,
      });
    } catch {}

    const finalUrl = req.file.path.replace(oldPublicId, newPublicId);
    const newFile = await ShelterFiles.create({
      shelter_id: shelter.id,
      file_url: finalUrl,
      public_id: newPublicId,
      file_type,
    });
    return res
      .status(201)
      .json({ success: true, message: "Document uploaded", data: newFile });
  } catch (error) {
    console.error("Upload Document Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/shelters/profile-photo ─────────────────────────────────────────
export const uploadShelterProfilePhoto = async (req, res) => {
  try {
    const shelter = await Shelter.findOne({ where: { owner_id: req.user.id } });
    if (!shelter) {
      return res
        .status(404)
        .json({ success: false, message: "Shelter not found" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    if (shelter.profile_photo_public_id) {
      try {
        await cloudinary.uploader.destroy(shelter.profile_photo_public_id, {
          resource_type: "image",
        });
      } catch (err) {
        console.warn(
          "Failed to delete old shelter profile photo:",
          err.message,
        );
      }
    }

    await shelter.update({
      profile_photo_url: req.file.path,
      profile_photo_public_id: req.file.filename,
    });

    return res.status(200).json({
      success: true,
      message: "Profile photo updated",
      data: {
        profile_photo_url: shelter.profile_photo_url,
      },
    });
  } catch (error) {
    console.error("Upload Shelter Profile Photo Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
