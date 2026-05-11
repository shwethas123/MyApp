import db from "../../models/index.js";
import { v2 as cloudinary } from "cloudinary";

const { Pet, Shelter, Sequelize, PetImage, AdoptionApplication } = db;
const { Op } = Sequelize;

// ── VALIDATION HELPER ────────────────────────────────────────────────────────
const LETTERS_ONLY = /^[a-zA-Z\s,]+$/;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validatePetFields(body, files = {}, isUpdate = false) {
  const errors = [];

  // ── Name ──────────────────────────────────────────────────────────────────
  if (!isUpdate || body.name !== undefined) {
    const name = (body.name || "").trim();
    if (!name) errors.push("Pet name is required");
    else if (name.length < 2) errors.push("Name must be at least 2 characters");
    else if (!LETTERS_ONLY.test(name))
      errors.push("Name can only contain letters");
  }

  // ── Age ───────────────────────────────────────────────────────────────────
  if (!isUpdate || body.age !== undefined) {
    if (body.age === "" || body.age === undefined || body.age === null)
      errors.push("Age is required");
    else if (Number(body.age) < 0) errors.push("Age must be positive");
    else if (Number(body.age) > 50) errors.push("Age seems too high");
    else if (!Number.isInteger(Number(body.age)))
      errors.push("Age must be a whole number");
  }

  // ── Species (only on create) ───────────────────────────────────────────────
  if (!isUpdate) {
    if (!body.species) errors.push("Species is required");
  }

  // ── Breed (only on create) ────────────────────────────────────────────────
  if (!isUpdate) {
    const breed = (body.breed || "").trim();
    if (!breed) errors.push("Breed is required");
    else if (!LETTERS_ONLY.test(breed))
      errors.push("Breed can only contain letters");
  }

  // ── Gender (only on create) ───────────────────────────────────────────────
  if (!isUpdate) {
    if (!body.gender) errors.push("Gender is required");
  }

  // ── Temperament ───────────────────────────────────────────────────────────
  if (!isUpdate || body.temperament !== undefined) {
    const temperament = (body.temperament || "").trim();
    if (!temperament) errors.push("Temperament is required");
    else if (!LETTERS_ONLY.test(temperament))
      errors.push("Temperament can only contain letters");
  }

  // ── Adoption Fee ──────────────────────────────────────────────────────────
  if (!isUpdate || body.adoption_fee !== undefined) {
    if (
      body.adoption_fee === "" ||
      body.adoption_fee === undefined ||
      body.adoption_fee === null
    )
      errors.push("Adoption fee is required");
    else if (Number(body.adoption_fee) < 0)
      errors.push("Adoption fee cannot be negative");
  }

  // ── Rescue Story ──────────────────────────────────────────────────────────
  if (!isUpdate || body.rescue_story !== undefined) {
    if (!(body.rescue_story || "").trim())
      errors.push("Short description is required");
  }

  // ── Vaccination Notes ─────────────────────────────────────────────────────
  if (body.vaccinated === "false" || body.vaccinated === false) {
    if (!(body.vaccination_notes || "").trim())
      errors.push("Vaccination requirements description is required");
  }

  // ── Sterilization Certificate ─────────────────────────────────────────────
  if (
    !isUpdate &&
    (body.sterilized === "neutered" || body.sterilized === "spayed")
  ) {
    if (!files.sterilization_certificate?.[0])
      errors.push("Sterilization certificate is required");
  }

  // ── Health Record (only on create) ────────────────────────────────────────
  if (!isUpdate) {
    if (!files.health_record?.[0]) errors.push("Health record is required");
  }

  // ── Main Photo (only on create) ───────────────────────────────────────────
  if (!isUpdate) {
    if (!files.images?.[0]) errors.push("Main photo is required");
  }

  // ── File Size Validation ──────────────────────────────────────────────────
  const allFiles = Object.values(files).flat();
  const oversized = allFiles.find((f) => f.size > MAX_FILE_SIZE);
  if (oversized) errors.push(`"${oversized.originalname}" exceeds 10MB limit`);

  return errors;
}

const imageInclude = {
  model: PetImage,
  as: "images",
  attributes: ["id", "file_url", "public_id", "display_order"],
};

const saveImages = async (petId, files) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    await PetImage.create({
      pet_id: petId,
      file_url: file.path,
      public_id: file.filename,
      display_order: i,
    });
  }
};

const parsePrerequisites = (body) => {
  let prereqs = body.prerequisites;
  if (!prereqs) return [];
  if (typeof prereqs === "string") {
    try {
      return JSON.parse(prereqs);
    } catch {
      return [prereqs];
    }
  }
  return Array.isArray(prereqs) ? prereqs : [prereqs];
};

/*
CREATE PET
POST /api/shelter/pets
*/
export const createPet = async (req, res) => {
  try {
    if (req.user.roleName !== "shelter") {
      return res.status(403).json({ error: "Only shelter users can add pets" });
    }

    const body = { ...req.body };
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const allFiles = Object.values(req.files || {}).flat();
    const oversized = allFiles.find((f) => f.size > MAX_SIZE);
    if (oversized) {
      return res
        .status(400)
        .json({ error: `"${oversized.originalname}" exceeds 10MB limit.` });
    }
    const files = req.files || {};

    // ── Backend Validation ───────────────────────────────────────────────────
    const errors = validatePetFields(body, files, false);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0], errors });
    }

    // FormData sends everything as strings — convert booleans
    const toBool = (val) =>
      val === "true" ? true : val === "false" ? false : null;
    body.vaccinated = toBool(body.vaccinated);
    body.special_needs = toBool(body.special_needs);
    body.good_with_kids = toBool(body.good_with_kids);

    const pet = await Pet.create({
      ...body,
      status: "Available",
      listed_at: new Date(),
      shelter_id: req.user.shelter.id,
      created_by: req.user.id,
      health_record_url: files.health_record?.[0]?.path || null,
      vaccination_record_url: files.vaccination_record?.[0]?.path || null,
      sterilization_certificate_url:
        files.sterilization_certificate?.[0]?.path || null,
      vaccination_notes: body.vaccination_notes || null,
      prerequisites: parsePrerequisites(body),
    });

    const imageFiles = files.images || [];
    if (imageFiles.length) {
      await saveImages(pet.id, imageFiles);
    }

    return res.status(201).json({
      message: "Pet created successfully",
      data: pet,
    });
  } catch (error) {
    console.error("Create Pet Error:", error);
    return res.status(500).json({
      error: "Failed to create pet",
      details: error.message,
    });
  }
};

/*
GET ALL PETS FOR SHELTER
GET /api/shelter/pets
*/
export const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.findAll({
      where: {
        shelter_id: req.user.shelter.id,
        deleted_at: null,
      },
      include: [imageInclude],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      data: pets,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch pets",
    });
  }
};

/*
GET PET BY ID
GET /api/shelter/pets/:id
*/
export const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findOne({
      where: { id: req.params.id, deleted_at: null },
      attributes: { include: ["health_record_url", "vaccination_record_url"] },
      include: [
        imageInclude,
        {
          model: Shelter,
          attributes: [
            "id",
            "name",
            "city",
            "state",
            "zipcode",
            "contact_email",
            "contact_phone",
            "owner_id",
          ],
          as: "shelter",
        },
      ],
    });

    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }

    return res.status(200).json({ data: pet });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch pet" });
  }
};

/*
UPDATE PET
PUT /api/shelter/pets/:id
*/
export const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);

    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }

    if (
      !req.user.shelter ||
      Number(pet.shelter_id) !== Number(req.user.shelter.id)
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to modify this pet" });
    }

    const body = { ...req.body };
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const allFiles = Object.values(req.files || {}).flat();
    const oversized = allFiles.find((f) => f.size > MAX_SIZE);
    if (oversized) {
      return res
        .status(400)
        .json({ error: `"${oversized.originalname}" exceeds 10MB limit.` });
    }
    const files = req.files || {};

    // ── Backend Validation ───────────────────────────────────────────────────
    const errors = validatePetFields(body, files, true);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0], errors });
    }

    const toBool = (val) =>
      val === "true" ? true : val === "false" ? false : null;
    body.vaccinated = toBool(body.vaccinated);
    body.special_needs = toBool(body.special_needs);
    body.good_with_kids = toBool(body.good_with_kids);

    await pet.update({
      ...body,
      updated_by: req.user.id,
      ...(body.status === "Adopted" && { adopted_at: new Date() }),
      ...(body.status && body.status !== "Adopted" && { adopted_at: null }),
      ...(files.health_record?.[0]?.path && {
        health_record_url: files.health_record[0].path,
      }),
      ...(files.vaccination_record?.[0]?.path && {
        vaccination_record_url: files.vaccination_record[0].path,
      }),
      ...(files.sterilization_certificate?.[0]?.path && {
        sterilization_certificate_url: files.sterilization_certificate[0].path,
        ...(body.vaccination_notes !== undefined && {
          vaccination_notes: body.vaccination_notes,
        }),
      }),
      ...(body.prerequisites !== undefined && {
        prerequisites: parsePrerequisites(body),
      }),
    });

    // ── Replace only changed image slots ─────────────────────────────────────
    const imageFiles = files.images || [];
    if (imageFiles.length) {
      const imageSlots = body.imageSlots
        ? [body.imageSlots].flat().map(Number)
        : imageFiles.map((_, i) => i);

      const oldImages = await PetImage.findAll({
        where: { pet_id: pet.id },
        order: [["display_order", "ASC"]],
      });

      for (let i = 0; i < imageFiles.length; i++) {
        const newFile = imageFiles[i];
        const slotIndex = imageSlots[i];

        const existingSlot = oldImages.find(
          (img) => img.display_order === slotIndex,
        );

        if (existingSlot) {
          await cloudinary.uploader.destroy(existingSlot.public_id, {
            resource_type: "image",
          });
          await existingSlot.update({
            file_url: newFile.path,
            public_id: newFile.filename,
          });
        } else {
          await PetImage.create({
            pet_id: pet.id,
            file_url: newFile.path,
            public_id: newFile.filename,
            display_order: slotIndex,
          });
        }
      }
    }

    const updated = await Pet.findByPk(pet.id, { include: [imageInclude] });

    return res.status(200).json({
      message: "Pet updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Pet Error:", error);
    return res.status(500).json({
      error: "Failed to update pet",
      details: error.message,
    });
  }
};

/*
UPDATE PET STATUS
PATCH /api/shelter/pets/:id/status
*/
export const updatePetStatus = async (req, res) => {
  try {
    console.log("updatePetStatus called:", req.params.id, req.body.status);
    const pet = await Pet.findByPk(req.params.id);

    if (!pet) return res.status(404).json({ error: "Pet not found" });

    if (
      !req.user.shelter ||
      Number(pet.shelter_id) !== Number(req.user.shelter.id)
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to modify this pet" });
    }

    const VALID_STATUSES = ["Available", "Reserved", "Adopted"];
    if (!req.body.status || !VALID_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    pet.status = req.body.status;
    if (req.body.status === "Adopted") pet.adopted_at = new Date();
    if (req.body.status !== "Adopted") pet.adopted_at = null;

    await pet.save();

    return res.status(200).json({
      message: "Pet status updated",
      data: pet,
    });
  } catch (error) {
    console.error("Update Pet Status Error:", error);
    return res.status(500).json({
      error: "Failed to update pet status",
      details: error.message,
    });
  }
};

/*
DELETE PET
DELETE /api/shelter/pets/:id
*/
export const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);

    if (!pet) return res.status(404).json({ error: "Pet not found" });

    if (
      !req.user.shelter ||
      Number(pet.shelter_id) !== Number(req.user.shelter.id)
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to modify this pet" });
    }

    const images = await PetImage.findAll({ where: { pet_id: pet.id } });
    for (const img of images) {
      await cloudinary.uploader.destroy(img.public_id, {
        resource_type: "image",
      });
    }
    await PetImage.destroy({ where: { pet_id: pet.id } });

    await pet.update({ deleted_at: new Date() });

    return res.status(200).json({ message: "Pet listing deleted" });
  } catch (error) {
    console.error("Delete Pet Error:", error);
    return res.status(500).json({
      error: "Failed to delete pet",
      details: error.message,
    });
  }
};

export const browsePets = async (req, res) => {
  try {
    console.log("Browse query params:", req.query);
    const {
      species,
      breed,
      gender,
      vaccinated,
      special_needs,
      good_with_kids,
      age_min,
      age_max,
      city,
      lat,
      lng,
      radius,
      page = 1,
      limit = 9,
      sort = "newest",
    } = req.query;

    const isShelterOrAdmin =
      req.user?.roleName === "shelter" || req.user?.roleName === "admin";

    const where = {
      deleted_at: null,
      ...(!isShelterOrAdmin && { status: "Available" }),
    };

if (species) {
      const SPECIES_MAP = {
        dog: "Dog", cat: "Cat", birds: "Bird", rabbit: "Rabbit",
      };
      const dbSpecies = SPECIES_MAP[species.toLowerCase()] || species;
      where.species = { [Op.iLike]: dbSpecies };
    }
    if (breed) where.breed = { [Op.iLike]: `%${breed}%` };
    if (gender) where.gender = gender;
    if (vaccinated !== undefined) where.vaccinated = vaccinated === "true";
    if (special_needs !== undefined) where.special_needs = special_needs === "true";
    if (good_with_kids !== undefined) where.good_with_kids = good_with_kids === "true";
    if (age_min || age_max) {
      where.age = {};
      if (age_min) where.age[Op.gte] = age_min;
      if (age_max) where.age[Op.lte] = age_max;
    }

    // City text filter (SQL) — only when no GPS lat/lng provided
    const shelterWhere = {};
    if (city && !lat) {
      const cleaned      = city.trim().replace(/[\s\-,]+$/, "");
      const pincodeMatch = cleaned.match(/^([a-zA-Z\s]+?)[\s\-,]+(\d{5,6})$/);
      if (pincodeMatch) {
        shelterWhere[Op.and] = [
          { city: { [Op.iLike]: `%${pincodeMatch[1].trim()}%` } },
          Sequelize.where(
            Sequelize.cast(Sequelize.col("shelter.zipcode"), "TEXT"),
            { [Op.iLike]: `%${pincodeMatch[2].trim()}%` },
          ),
        ];
      } else if (/^[a-zA-Z\s]+$/.test(cleaned)) {
        shelterWhere.city = { [Op.iLike]: `%${cleaned}%` };
      }
    }

    const hasShelterFilter =
      Object.keys(shelterWhere).length > 0 ||
      Object.getOwnPropertySymbols(shelterWhere).length > 0;

    const order = sort === "oldest"
      ? [["listed_at", "ASC"]]
      : [["listed_at", "DESC"]];

    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);

    // ── GPS radius path: fetch ALL (no DB pagination), filter in JS, then slice ──
    if (lat && lng && radius) {
      const latF    = parseFloat(lat);
      const lngF    = parseFloat(lng);
      const radiusF = parseFloat(radius);

      const allPets = await Pet.findAll({
        where,
        include: [
          {
            model: Shelter,
            as: "shelter",
            attributes: ["name", "city", "state", "zipcode", "latitude", "longitude"],
            where:    hasShelterFilter ? shelterWhere : undefined,
            required: hasShelterFilter,
          },
          imageInclude,
        ],
        order,
      });

      const toRad = (v) => (v * Math.PI) / 180;

      const filtered = allPets.filter((pet) => {
        const s = pet.shelter;
        if (!s || s.latitude == null || s.longitude == null) return false;

        const sLat = parseFloat(s.latitude);
        const sLon = parseFloat(s.longitude);
        if (isNaN(sLat) || isNaN(sLon)) return false;

        const dLat = toRad(sLat - latF);
        const dLng = toRad(sLon - lngF);

        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(latF)) * Math.cos(toRad(sLat)) *
          Math.sin(dLng / 2)  * Math.sin(dLng / 2);

        const distance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return distance <= radiusF;
      });

      const total      = filtered.length;
      const totalPages = Math.ceil(total / limitNum);
      const offset     = (pageNum - 1) * limitNum;
      const paginated  = filtered.slice(offset, offset + limitNum);

      return res.status(200).json({
        total,
        page:       pageNum,
        totalPages,
        pets:       paginated,
      });
    }

    // ── Non-GPS path: DB-level pagination (unchanged, was already correct) ──
    const offset = (pageNum - 1) * limitNum;

    const pets = await Pet.findAndCountAll({
      where,
      distinct: true,
      include: [
        {
          model: Shelter,
          as: "shelter",
          attributes: ["name", "city", "state", "zipcode", "latitude", "longitude"],
          where:    hasShelterFilter ? shelterWhere : undefined,
          required: hasShelterFilter,
        },
        imageInclude,
      ],
      limit:  limitNum,
      offset,
      order,
    });

    return res.status(200).json({
      total:      pets.count,
      page:       pageNum,
      totalPages: Math.ceil(pets.count / limitNum),
      pets:       pets.rows,
    });

  } catch (error) {
    console.error("browsePets ERROR:", error.message);
    return res.status(500).json({
      error:   "Failed to browse pets",
      details: error.message,
    });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const shelterId = req.user.shelter.id;

    const pets = await Pet.findAll({
      where: { shelter_id: shelterId, deleted_at: null },
    });

    const totalPets = pets.length;
    const available = pets.filter((p) => p.status === "Available").length;
    const adopted = pets.filter((p) => p.status === "Adopted").length;
    const reserved = pets.filter((p) => p.status === "Reserved").length;
    const adoptionRate =
      totalPets > 0 ? Math.round((adopted / totalPets) * 100) : 0;

    const adoptedPets = pets.filter(
      (p) => p.status === "Adopted" && p.adopted_at && p.listed_at,
    );
    const avgDays =
      adoptedPets.length > 0
        ? Math.round(
            adoptedPets.reduce((sum, p) => {
              const adoptedDate = p.adopted_at
                ? new Date(p.adopted_at)
                : new Date(p.updated_at);
              const diff = adoptedDate - new Date(p.listed_at);
              return sum + diff / (1000 * 60 * 60 * 24);
            }, 0) / adoptedPets.length,
          )
        : 0;

    const breedCount = {};
    pets
      .filter((p) => p.status === "Adopted" && p.breed)
      .forEach((p) => {
        breedCount[p.breed] = (breedCount[p.breed] || 0) + 1;
      });

    const adoptionTrend = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString("default", { month: "short" });
      const year = d.getFullYear();
      const month = d.getMonth();
      const count = pets.filter((p) => {
        if (p.status !== "Adopted") return false;
        // ✅ Fall back to updated_at if adopted_at is null (handles existing bad data)
        const dateToUse = p.adopted_at
          ? new Date(p.adopted_at)
          : new Date(p.updated_at);
        return (
          dateToUse.getMonth() === month && dateToUse.getFullYear() === year
        );
      }).length;
      adoptionTrend.push({ month: label, adoptions: count });
    }
    const applications = await AdoptionApplication.findAll({
      where: { shelterId },
    });

    const totalRequests = applications.length;
    const pending = applications.filter((r) => r.status === "pending").length;
    const approved = applications.filter((r) => r.status === "approved").length;
    const rejected = applications.filter((r) => r.status === "rejected").length;
    const homeVisit = applications.filter(
      (r) => r.status === "home_visit",
    ).length;

    const petsWithFee = pets.filter(
      (p) => p.adoption_fee && p.adoption_fee > 0,
    );
    const avgAdoptionFee =
      petsWithFee.length > 0
        ? Math.round(
            petsWithFee.reduce((sum, p) => sum + Number(p.adoption_fee), 0) /
              petsWithFee.length,
          )
        : 0;

    const listingActivity = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString("default", { month: "short" });
      const year = d.getFullYear();
      const month = d.getMonth();
      const count = pets.filter((p) => {
        const listed = new Date(p.listed_at);
        return listed.getMonth() === month && listed.getFullYear() === year;
      }).length;
      listingActivity.push({ month: label, listed: count });
    }

    const speciesMap = {
      Dog: { total: 0, adopted: 0 },
      Cat: { total: 0, adopted: 0 },
      Bird: { total: 0, adopted: 0 },
      Rabbit: { total: 0, adopted: 0 },
    };
    pets.forEach((p) => {
      const s = p.species;
      if (!speciesMap[s]) speciesMap[s] = { total: 0, adopted: 0 };
      speciesMap[s].total += 1;
      if (p.status === "Adopted") speciesMap[s].adopted += 1;
    });
    const speciesAdoptionRate = Object.entries(speciesMap).map(
      ([species, data]) => ({
        species,
        total: data.total,
        adopted: data.adopted,
        rate:
          data.total > 0 ? Math.round((data.adopted / data.total) * 100) : 0,
      }),
    );

    const applicantMap = {};
    applications.forEach((app) => {
      const key = app.userId;
      if (!applicantMap[key]) {
        applicantMap[key] = {
          name: `${app.first_name || ""} ${app.last_name || ""}`.trim(),
          email: app.email,
          count: 0,
        };
      }
      applicantMap[key].count += 1;
    });
    const repeatApplicants = Object.values(applicantMap)
      .filter((a) => a.count > 1)
      .sort((a, b) => b.count - a.count);

    return res.status(200).json({
      data: {
        totalPets,
        available,
        adopted,
        reserved,
        adoptionRate,
        avgDays,
        avgAdoptionFee,
        adoptionTrend,
        listingActivity,
        speciesAdoptionRate,
        repeatApplicants,
        requests: {
          total: totalRequests,
          pending,
          approved,
          rejected,
          homeVisit,
        },
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({
      error: "Failed to fetch analytics",
      details: error.message,
    });
  }
};
