import db from "../../models/index.js";
const { AdoptionRequest, Pet, User, Shelter } = db;
import { createNotification } from "./notification.controller.js";
import { getIO } from "../socket.js";

// POST /api/adoptions — adopter submits request
export const createRequest = async (req, res) => {
  try {
    const adopter_id = req.user.id;
    const {
      pet_id,
      living_condition,
      current_occupation,
      address,
      pet_allowed_in_rented,
      housing_type,
      pet_allowed_in_apartment,
      pet_supervision_plan,
      working_hours,
      past_experience,
    } = req.body;

    const pet = await Pet.findByPk(pet_id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    const existing = await AdoptionRequest.findOne({
      where: { pet_id, adopter_id },
    });
    if (existing)
      return res
        .status(409)
        .json({ message: "You already applied for this pet" });

    const request = await AdoptionRequest.create({
      pet_id,
      adopter_id,
      shelter_id: pet.shelter_id,
      living_condition,
      current_occupation,
      address,
      pet_allowed_in_rented,
      housing_type,
      pet_allowed_in_apartment,
      pet_supervision_plan,
      working_hours,
      past_experience,
      status: "Pending",
    });

 // Notify shelter owner about new adoption application
try {
  const shelter = await Shelter.findByPk(pet.shelter_id, {
    attributes: ["owner_id", "name"],
  });

  if (shelter) {
    const notifMsg = `🐾 New adoption application received for "${pet.name}"!`;

    await createNotification({
      user_id: shelter.owner_id,
      message: notifMsg,
      reference_type: "adoption",
      reference_id: request.id,
    });

    const io = getIO();
    io.to(`user_${shelter.owner_id}`).emit("new_notification", {
      message: notifMsg,
      reference_type: "adoption",
      reference_id: request.id,
      created_at: new Date(),
      is_read: false,
    });
  }
} catch (err) {
  console.error("Shelter notification failed:", err.message);
}

res
  .status(201)
  .json({ message: "Adoption request submitted", data: request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/adoptions/my — adopter sees their own requests
export const getMyRequests = async (req, res) => {
  try {
    const requests = await AdoptionRequest.findAll({
      where: { adopter_id: req.user.id },
      include: [
        {
          model: Pet,
          as: "pet",
          attributes: ["id", "name", "species", "breed", "photo_url"],
        },
        { model: Shelter, as: "shelter", attributes: ["id", "name", "city"] },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json({ data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/adoptions/shelter — shelter sees all requests for their pets
export const getShelterRequests = async (req, res) => {
  try {
    const shelter = req.user.shelter;
    if (!shelter)
      return res
        .status(403)
        .json({ message: "No shelter found for this user" });

    const { status } = req.query;
    const where = { shelter_id: shelter.id };
    if (status) where.status = status;

    const requests = await AdoptionRequest.findAll({
      where,
      include: [
        {
          model: Pet,
          as: "pet",
          attributes: ["id", "name", "species", "breed", "photo_url"],
        },
        {
          model: User,
          as: "adopter",
          attributes: ["id", "first_name", "last_name", "email", "phone"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/adoptions/:id — get single request details
export const getRequestById = async (req, res) => {
  try {
    const request = await AdoptionRequest.findByPk(req.params.id, {
      include: [
        {
          model: Pet,
          as: "pet",
          attributes: ["id", "name", "species", "breed", "photo_url", "age"],
        },
        {
          model: User,
          as: "adopter",
          attributes: ["id", "first_name", "last_name", "email", "phone"],
        },
        { model: Shelter, as: "shelter", attributes: ["id", "name", "city"] },
      ],
    });
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json({ data: request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/adoptions/:id/status — shelter updates status
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, interview_scheduled_at, home_visit_scheduled_at } =
      req.body;

    const validStatuses = [
      "Pending",
      "Interviewing",
      "HomeVisit",
      "Approved",
      "Rejected",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await AdoptionRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const updates = {
      status,
      reviewed_by: req.user.id,
      reviewed_at: new Date(),
    };

    if (status === "Approved") updates.approved_at = new Date();
    if (status === "Rejected") updates.rejected_at = new Date();
    if (interview_scheduled_at)
      updates.interview_scheduled_at = interview_scheduled_at;
    if (home_visit_scheduled_at)
      updates.home_visit_scheduled_at = home_visit_scheduled_at;

 await request.update(updates);

// Only notify adopter when status is Approved or Rejected
// Notify adopter on every meaningful status change
const pet = await Pet.findByPk(request.pet_id, { attributes: ["name"] });
const petName = pet ? pet.name : "your pet";

const statusMessages = {
  Approved:     `🎉 Your adoption request for "${petName}" has been approved!`,
  Rejected:     `❌ Your adoption request for "${petName}" has been rejected.`,
  Interviewing: `📋 Your application for "${petName}" is moving forward — an interview has been scheduled!`,
  HomeVisit:    `🏠 A home visit has been scheduled for your adoption of "${petName}"!`,
};

if (statusMessages[status]) {
  const notificationMessage = statusMessages[status];

  await createNotification({
    user_id: request.adopter_id,
    message: notificationMessage,
    reference_type: "adoption",
    reference_id: request.id,
  });

  try {
    const io = getIO();
    io.to(`user_${request.adopter_id}`).emit("new_notification", {
      message: notificationMessage,
      reference_type: "adoption",
      reference_id: request.id,
      created_at: new Date(),
      is_read: false,
    });
  } catch (err) {
    console.error("Socket emit failed:", err.message);
  }
}

res.json({ message: "Status updated", data: request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
