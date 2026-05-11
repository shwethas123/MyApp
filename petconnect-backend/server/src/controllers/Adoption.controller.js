import db from "../../models/index.js";
import {
  sendAdoptionRequestToShelter,
  sendAdoptionConfirmationToApplicant,
  sendStatusUpdateToApplicant,
  sendHomeVisitNotificationToShelter,
} from "../../utils/mailer.js";
import { createNotification } from "./notification.controller.js";
import { getIO } from "../socket.js";

const { User, Pet, Shelter, AdoptionApplication, PetImage } = db;
console.log("AdoptionApplication model:", AdoptionApplication);

import puppeteer from "puppeteer";
import generateCertificateHTML from "../../utils/certificateTemplate.js";
import { sendHomeVisitWarningEmail } from "../../utils/mailer.js";

// GET /adoption/prefill
const getAdopterPrefillData = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "first_name",
        "last_name",
        "phone",
        "email",
        "pet_experience_years",
        "aadhar_proof_url",
        "rental_agreement_url",
      ],
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res
      .status(200)
      .json({ message: "Prefill data fetched successfully", data: user });
  } catch (error) {
    console.error("Error fetching prefill data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /adoption/apply/:petId
const submitAdoptionApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { petId } = req.params;
    const {
      shelterId,
      currentOccupation,
      address,
      livingArrangement,
      familyAgreement,
      landlordAllowsPets,
      petCareWhenAway,
    } = req.body;

    if (
      !shelterId ||
      !currentOccupation ||
      !address ||
      !livingArrangement ||
      !landlordAllowsPets ||
      !petCareWhenAway
    )
      return res.status(400).json({ message: "All fields are required" });

    const validLivingArrangements = [
      "Family",
      "I live alone",
      "House/Room mates",
    ];
    const validFamilyAgreement = ["Yes", "No", "N/A"];
    const validLandlord = ["Yes", "No", "I am the owner"];

    if (!validLivingArrangements.includes(livingArrangement))
      return res
        .status(400)
        .json({ message: "Invalid livingArrangement value" });
    if (familyAgreement && !validFamilyAgreement.includes(familyAgreement))
      return res.status(400).json({ message: "Invalid familyAgreement value" });
    if (!validLandlord.includes(landlordAllowsPets))
      return res
        .status(400)
        .json({ message: "Invalid landlordAllowsPets value" });

    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    const shelter = await Shelter.findByPk(shelterId);
    if (!shelter) return res.status(404).json({ message: "Shelter not found" });

    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "first_name",
        "last_name",
        "phone",
        "email",
        "pet_experience_years",
        "aadhar_proof_url",
        "rental_agreement_url",
      ],
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const newAadharFile = req.files?.aadhar_proof?.[0];
    const newRentalFile = req.files?.rental_agreement?.[0];

    const aadharUrl = newAadharFile
      ? newAadharFile.path
      : user.aadhar_proof_url || null;
    const rentalUrl = newRentalFile
      ? newRentalFile.path
      : landlordAllowsPets === "Yes" || landlordAllowsPets === "No"
        ? user.rental_agreement_url || null
        : null;

    if (!aadharUrl)
      return res.status(400).json({
        message: "Aadhaar card is required. Please upload your Aadhaar card.",
      });

    if (
      (landlordAllowsPets === "Yes" || landlordAllowsPets === "No") &&
      !rentalUrl
    )
      return res.status(400).json({
        message:
          "Rental agreement is required when your landlord allows pets. Please upload it.",
      });

    const existing = await AdoptionApplication.findOne({
      where: { userId, petId, status: ["pending"] },
    });
    if (existing)
      return res
        .status(409)
        .json({ message: "You have already applied for this pet" });

    const userUpdates = {};
    if (newAadharFile) userUpdates.aadhar_proof_url = aadharUrl;
    if (newRentalFile) userUpdates.rental_agreement_url = rentalUrl;
    if (Object.keys(userUpdates).length > 0) {
      await User.update(userUpdates, { where: { id: userId } });
    }

    const application = await AdoptionApplication.create({
      userId,
      petId,
      shelterId,
      first_name: user.first_name,
      last_name: user.last_name,
      phoneNumber: user.phone,
      email: user.email,
      petExperienceYears: user.pet_experience_years || 0,
      currentOccupation,
      address,
      livingArrangement,
      familyAgreement: familyAgreement || "N/A",
      landlordAllowsPets,
      petCareWhenAway,
      aadhar_proof_url: aadharUrl,
      rental_agreement_url: rentalUrl,
      status: "pending",
    });

    await pet.update({ status: "Reserved" });

    try {
      await sendAdoptionRequestToShelter({
        shelterEmail: shelter.contact_email,
        shelterName: shelter.name,
        applicantFirstName: user.first_name,
        applicantLastName: user.last_name,
        applicantEmail: user.email,
        applicantPhone: user.phone,
        petName: pet.name,
        petSpecies: pet.species,
        petBreed: pet.breed,
        currentOccupation,
        address,
        livingArrangement,
        familyAgreement: familyAgreement || "N/A",
        landlordAllowsPets,
        petCareWhenAway,
        petExperienceYears: user.pet_experience_years || 0,
        applicationId: application.id,
      });

      await sendAdoptionConfirmationToApplicant({
        applicantEmail: user.email,
        applicantFirstName: user.first_name,
        petName: pet.name,
        shelterName: shelter.name,
        applicationId: application.id,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
    }

    try {
      const notifMsg = `🐾 New adoption application received for "${pet.name}" from ${user.first_name} ${user.last_name}!`;
      await createNotification({
        user_id: shelter.owner_id,
        message: notifMsg,
        reference_type: "adoption",
        reference_id: application.id,
      });
      const io = getIO();
      io.to(`user_${shelter.owner_id}`).emit("new_notification", {
        message: notifMsg,
        reference_type: "adoption",
        reference_id: application.id,
        created_at: new Date(),
        is_read: false,
      });
    } catch (err) {
      console.error("Shelter notification failed:", err.message);
    }

    return res.status(201).json({
      message: "Adoption application submitted successfully",
      data: application,
    });
  } catch (error) {
    console.error("ERROR MESSAGE:", error.message);
    console.error("ERROR STACK:", error.stack);
    return res
      .status(500)
      .json({ message: "Internal server error", detail: error.message });
  }
};

// GET /adoption/my-applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await AdoptionApplication.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Pet,
          as: "pet",
          attributes: ["id", "name", "species", "breed", "age"],
          include: [
            {
              model: PetImage,
              as: "images",
              attributes: ["id", "file_url", "public_id", "display_order"],
            },
          ],
        },
        { model: Shelter, as: "shelter", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({
      message: "Applications fetched successfully",
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /adoption/:applicationId
const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;

    const application = await AdoptionApplication.findByPk(applicationId, {
      include: [
        {
          model: Pet,
          as: "pet",
          attributes: [
            "id",
            "name",
            "species",
            "breed",
            "age",
            "gender",
            "vaccinated",
            "sterilized",
            "health_status",
            "temperament",
            "adoption_fee",
            "status",
            "health_record_url",
            "vaccination_record_url",
            "sterilization_certificate_url",
          ],
          include: [
            {
              model: PetImage,
              as: "images",
              attributes: ["id", "file_url", "public_id", "display_order"],
            },
          ],
        },
        {
          model: Shelter,
          as: "shelter",
          attributes: [
            "id",
            "name",
            "contact_email",
            "contact_phone",
            "city",
            "state",
            "country",
            "upi_id",
            "owner_id", // ← add this
          ],
        },
      ],
    });

    if (!application)
      return res.status(404).json({ message: "Application not found" });
    if (application.userId !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    const data = application.toJSON();
    if (data.status !== "rejected") data.rejection_reason = null;

    return res
      .status(200)
      .json({ message: "Application fetched successfully", data });
  } catch (error) {
    console.error("Error fetching application:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /adoption/shelter/:shelterId
const getApplicationsForShelter = async (req, res) => {
  try {
    const { shelterId } = req.params;
    const shelter = await Shelter.findByPk(shelterId, {
      attributes: ["id", "name", "contact_email"],
    });
    if (!shelter) return res.status(404).json({ message: "Shelter not found" });

    const applications = await AdoptionApplication.findAll({
      where: { shelterId },
      include: [
        {
          model: Pet,
          as: "pet",
          attributes: ["id", "name", "species", "breed", "age"],
          include: [
            {
              model: PetImage,
              as: "images",
              attributes: ["id", "file_url", "public_id", "display_order"],
            },
          ],
        },
        {
          model: User,
          as: "applicant",
          attributes: ["id", "first_name", "last_name", "email", "phone"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({
      message: "Shelter applications fetched successfully",
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching shelter applications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /adoption/:applicationId/status
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, rejection_reason } = req.body;

    const validStatuses = [
      "pending",
      "approved",
      "home_visit",
      "payment_pending",
      "completed",
      "rejected",
    ];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status value" });

    if (
      status === "rejected" &&
      (!rejection_reason || !rejection_reason.trim())
    )
      return res.status(400).json({
        message: "Rejection reason is required when rejecting an application",
      });

    const application = await AdoptionApplication.findByPk(applicationId, {
      include: [
        { model: Pet, as: "pet", attributes: ["id", "name"] },
        { model: Shelter, as: "shelter", attributes: ["id", "name"] },
      ],
    });
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    application.status = status;
    if (status === "rejected" && rejection_reason)
      application.rejection_reason = rejection_reason;

    let tentativeDate = null;
    if (status === "approved") {
      tentativeDate = new Date();
      tentativeDate.setDate(tentativeDate.getDate() + 2);
      tentativeDate.setHours(10, 0, 0, 0);
      // application.home_visit_date = tentativeDate;
    }
    await application.save();

    if (status === "rejected") {
      const pet = await Pet.findByPk(application.petId);
      if (pet) await pet.update({ status: "Available", adopted_at: null });
    }

    if (status === "completed") {
      const pet = await Pet.findByPk(application.petId);
      if (pet) {
        await pet.update({ status: "Adopted", adopted_at: new Date() });
        try {
          const { Wishlist } = db;
          const wishlistEntries = await Wishlist.findAll({
            where: { pet_id: pet.id },
            attributes: ["user_id"],
          });
          const io = getIO();
          const wishlistMsg = `💔 "${pet.name}" from your wishlist has been adopted by someone else.`;
          for (const entry of wishlistEntries) {
            if (entry.user_id === application.userId) continue;
            await createNotification({
              user_id: entry.user_id,
              message: wishlistMsg,
              reference_type: "adoption",
              reference_id: pet.id,
            });
            io.to(`user_${entry.user_id}`).emit("new_notification", {
              message: wishlistMsg,
              reference_type: "adoption",
              reference_id: pet.id,
              created_at: new Date(),
              is_read: false,
            });
          }
        } catch (err) {
          console.error("Wishlist notification failed:", err.message);
        }
      }
    }
       // ── Trafficking Check ─────────────────────────────────────────────
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const recentAdoptions = await AdoptionApplication.count({
        where: {
          userId: application.userId,
          status: "completed",
          updatedAt: { [db.Sequelize.Op.gte]: oneYearAgo },
        },
      });
       // recent years within 1 year 5+ adoption completed across different shelters → flag for review and notify admins
      if (recentAdoptions >= 5) {
        const io = getIO();

        // Notify the adopter
        const adopterMsg = `⚠️ You have adopted ${recentAdoptions} pets within the past year. This is flagged as unusual activity. If this is unintentional, please contact support.`;
        await createNotification({
          user_id: application.userId,
          message: adopterMsg,
          reference_type: "adoption",
          reference_id: application.id,
        });
        io.to(`user_${application.userId}`).emit("new_notification", {
          message: adopterMsg,
          reference_type: "adoption",
          reference_id: application.id,
          created_at: new Date(),
          is_read: false,
        });

        // Flag the user
        const adopter = await User.findByPk(application.userId);
        await adopter.update({
          flagged_for_review: true,
          flag_reason: `Adopted ${recentAdoptions} pets within 1 year — possible animal trafficking (Application #${application.id})`,
        });

        // Notify all admins
        const admins = await User.findAll({
          include: [
            { model: db.Role, as: "roleDetails", where: { name: "admin" } },
          ],
          attributes: ["id"],
        });

        const adminMsg = `🚨 Animal trafficking alert: User "${adopter.first_name} ${adopter.last_name}" (ID: ${adopter.id}) has completed ${recentAdoptions} adoptions in the past year across different shelters. Please review.`;

        for (const admin of admins) {
          await createNotification({
            user_id: admin.id,
            message: adminMsg,
            reference_type: "adoption",
            reference_id: application.id,
          });
          io.to(`user_${admin.id}`).emit("new_notification", {
            message: adminMsg,
            reference_type: "adoption",
            reference_id: application.id,
            created_at: new Date(),
            is_read: false,
          });
        }
      }
    } catch (traffickingErr) {
      console.error("Trafficking check failed:", traffickingErr.message);
    }

    try {
      // 1. Always send the status update email to the adopter
      await sendStatusUpdateToApplicant({
        applicantEmail: application.email,
        applicantFirstName: application.first_name,
        petName: application.pet?.name,
        shelterName: application.shelter?.name,
        status,
        applicationId: application.id,
        //homeVisitDate: tentativeDate,
      });

      // // 2. When approved, also send a SEPARATE home visit email to adopter + shelter
      // if (status === "approved" && tentativeDate) {
      //   const shelter = await Shelter.findByPk(application.shelterId);

      //   // ── Adopter: dedicated home_visit email ──────────────────────────
      //   await sendStatusUpdateToApplicant({
      //     applicantEmail: application.email,
      //     applicantFirstName: application.first_name,
      //     petName: application.pet?.name,
      //     shelterName: shelter.name,
      //     status: "home_visit", // triggers the home_visit template
      //     applicationId: application.id,
      //     homeVisitDate: tentativeDate,
      //   });

      //   // ── Shelter: home visit notification ─────────────────────────────
      //   await sendHomeVisitNotificationToShelter({
      //     shelterEmail: shelter.contact_email,
      //     shelterName: shelter.name,
      //     applicantFirstName: application.first_name,
      //     applicantLastName: application.last_name,
      //     applicantEmail: application.email,
      //     applicantPhone: application.phoneNumber,
      //     petName: application.pet?.name,
      //     homeVisitDate: tentativeDate,
      //     applicationId: application.id,
      //   });
      // }
    } catch (emailError) {
      console.error("Status update email failed:", emailError.message);
    }

    if (status === "approved") {
      const { Conversation } = db;
      const conversation = await Conversation.findOne({
        where: { adopter_id: application.userId, pet_id: application.petId },
      });
      if (conversation)
        await conversation.update({ is_anonymous: false, status: "Applied" });
    }

    try {
      const petName = application.pet?.name || "your pet";
      const statusMessages = {
        approved: `🎉 Your adoption application for "${petName}" has been approved!`,
        rejected: `❌ Your adoption application for "${petName}" has been rejected.`,
        home_visit: `🏠 A home visit has been scheduled for your adoption of "${petName}"!`,
        completed: `🎊 Congratulations! Your adoption of "${petName}" is now complete!`,
        pending: null,
      };
      const notifMsg = statusMessages[status];
      if (notifMsg) {
        await createNotification({
          user_id: application.userId,
          message: notifMsg,
          reference_type: "adoption",
          reference_id: application.id,
        });
        const io = getIO();
        io.to(`user_${application.userId}`).emit("new_notification", {
          message: notifMsg,
          reference_type: "adoption",
          reference_id: application.id,
          created_at: new Date(),
          is_read: false,
        });
      }
    } catch (err) {
      console.error("Adopter notification failed:", err.message);
    }

    return res.status(200).json({
      message: `Application status updated to '${status}'`,
      data: application,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /adoption/:applicationId/payment
const completeAdopterPayment = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { payment_method } = req.body;
    const userId = req.user.id;

    const application = await AdoptionApplication.findByPk(applicationId, {
      include: [
        { model: Pet, as: "pet", attributes: ["id", "name"] },
        { model: Shelter, as: "shelter", attributes: ["id", "name"] },
      ],
    });

    if (!application)
      return res.status(404).json({ message: "Application not found" });
    if (application.userId !== userId)
      return res.status(403).json({ message: "Unauthorized" });
    if (application.status !== "home_visit")
      return res
        .status(400)
        .json({ message: "Payment only allowed at home visit stage" });

    application.status = "payment_pending";
    if (payment_method) application.payment_method = payment_method;
    await application.save();

    try {
      await sendStatusUpdateToApplicant({
        applicantEmail: application.email,
        applicantFirstName: application.first_name,
        petName: application.pet?.name,
        shelterName: application.shelter?.name,
        status: "payment_pending",
        applicationId: application.id,
      });
    } catch (emailError) {
      console.error("Completion email failed:", emailError.message);
    }

    return res.status(200).json({
      message: "Payment received and waiting for shelter confirmation",
      data: application,
    });
  } catch (error) {
    console.error("Complete Payment Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /adoption/shelter/:shelterId/application/:applicationId
const getShelterApplicationById = async (req, res) => {
  try {
    const { applicationId, shelterId } = req.params;

    const application = await AdoptionApplication.findByPk(applicationId, {
      include: [
        {
          model: Pet,
          as: "pet",
          attributes: [
            "id",
            "name",
            "species",
            "breed",
            "age",
            "gender",
            "vaccinated",
            "sterilized",
            "health_status",
            "temperament",
            "adoption_fee",
            "status",
            "special_needs",
            "good_with_kids",
          ],
          include: [
            {
              model: PetImage,
              as: "images",
              attributes: ["id", "file_url", "public_id", "display_order"],
            },
          ],
        },
        {
          model: User,
          as: "applicant",
          attributes: ["id", "first_name", "last_name", "email", "phone"],
        },
        { model: Shelter, as: "shelter", attributes: ["id", "name", "upi_id"] },
      ],
    });

    if (!application)
      return res.status(404).json({ message: "Application not found" });
    if (String(application.shelterId) !== String(shelterId))
      return res.status(403).json({ message: "Unauthorized" });

    return res
      .status(200)
      .json({ message: "Application fetched successfully", data: application });
  } catch (error) {
    console.error("Error fetching shelter application:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /adoption/:applicationId/home-visit
const submitHomeVisit = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { documents_verified } = req.body;
    const photos = req.files?.map((f) => f.path) || [];

    if (!documents_verified || documents_verified === "false")
      return res.status(400).json({
        message: "Documents must be verified before marking home visit.",
      });

    if (photos.length === 0)
      return res
        .status(400)
        .json({ message: "At least one home visit photo is required." });

    const application = await AdoptionApplication.findByPk(applicationId, {
      include: [
        { model: Pet, as: "pet", attributes: ["id", "name"] },
        { model: Shelter, as: "shelter", attributes: ["id", "name"] },
      ],
    });
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    application.status = "home_visit";
    application.home_visit_photos = photos;
    application.documents_verified = true;
    // application.home_visit_date = new Date();
    // Reset outcome so shelter can mark fresh result for this upload
    application.home_visit_status = null;
    await application.save();

    try {
      const petName = application.pet?.name || "your pet";
      const notifMsg = `🏠 The shelter has visited your home for "${petName}". Outcome coming soon!`;
      await createNotification({
        user_id: application.userId,
        message: notifMsg,
        reference_type: "adoption",
        reference_id: application.id,
      });
      const io = getIO();
      io.to(`user_${application.userId}`).emit("new_notification", {
        message: notifMsg,
        reference_type: "adoption",
        reference_id: application.id,
        created_at: new Date(),
        is_read: false,
      });
    } catch (err) {
      console.error("Home visit notification failed:", err.message);
    }

    return res
      .status(200)
      .json({ message: "Home visit marked successfully", data: application });
  } catch (error) {
    console.error("Error submitting home visit:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /adoption/:applicationId/home-visit-outcome
const submitHomeVisitOutcome = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { outcome, notes } = req.body;

    if (!["passed", "failed"].includes(outcome))
      return res
        .status(400)
        .json({ message: "Invalid outcome. Use 'passed' or 'failed'" });

    const application = await AdoptionApplication.findByPk(applicationId, {
      include: [
        { model: Pet, as: "pet", attributes: ["id", "name"] },
        {
          model: Shelter,
          as: "shelter",
          attributes: ["id", "name", "owner_id"],
        },
      ],
    });

    if (!application)
      return res.status(404).json({ message: "Application not found" });
    if (application.status !== "home_visit")
      return res
        .status(400)
        .json({ message: "Application is not in home_visit stage" });

    const petName = application.pet?.name || "your pet";
    const io = getIO();

    // ── PASSED ───────────────────────────────────────────────────────────
    if (outcome === "passed") {
      await application.update({
        home_visit_status: "passed",
        home_visit_notes: notes || null,
        home_visit_attempt: application.home_visit_attempt + 1,
      });

      const passMsg = ` Great news! Your home visit for "${petName}" has passed! You can now proceed to payment.`;
      await createNotification({
        user_id: application.userId,
        message: passMsg,
        reference_type: "adoption",
        reference_id: application.id,
      });
      io.to(`user_${application.userId}`).emit("new_notification", {
        message: passMsg,
        reference_type: "adoption",
        reference_id: application.id,
        created_at: new Date(),
        is_read: false,
      });

      return res.status(200).json({
        message: "Home visit passed. Adopter notified.",
        data: application,
      });
    }

    // ── FAILED ───────────────────────────────────────────────────────────
    const newAttempt = application.home_visit_attempt + 1;

    await application.update({
      home_visit_status: "failed",
      home_visit_notes: notes || null,
      home_visit_attempt: newAttempt,
      home_visit_warning_sent: true,
      ...(newAttempt === 1 && {
        home_visit_photos: [],
        documents_verified: false,
      }),
    });

    const adopter = await User.findByPk(application.userId);
    const newWarningCount = (adopter.home_visit_warning_count || 0) + 1;
    await adopter.update({
      home_visit_warning_count: newWarningCount,
      flagged_for_review: true,
      flag_reason: `Home visit failed (attempt ${newAttempt}) for application #${applicationId} — Pet: ${petName}`,
    });
    // Send warning email to adopter
    await sendHomeVisitWarningEmail({
      applicantEmail: adopter.email,
      applicantFirstName: adopter.first_name,
      petName,
      attemptNumber: newAttempt,
      notes: notes || null,
      applicationId,
    });

    // Notify adopter
    const adopterMsg =
      newAttempt === 1
        ? ` Your home visit for "${petName}" did not pass. You have been given one more chance. Please prepare better for the next visit.`
        : ` Your home visit for "${petName}" has failed for the second time. The admin will review your case and may ban your account.`;

    await createNotification({
      user_id: application.userId,
      message: adopterMsg,
      reference_type: "adoption",
      reference_id: application.id,
    });
    io.to(`user_${application.userId}`).emit("new_notification", {
      message: adopterMsg,
      reference_type: "adoption",
      reference_id: application.id,
      created_at: new Date(),
      is_read: false,
    });

    // Notify all admins
    const admins = await User.findAll({
      include: [
        { model: db.Role, as: "roleDetails", where: { name: "admin" } },
      ],
      attributes: ["id"],
    });

    const adminMsg =
      newAttempt === 1
        ? ` Home visit failed (attempt 1) for "${petName}" — Application #${applicationId}. Adopter warned. They have 1 more chance.`
        : ` Home visit failed TWICE for "${petName}" — Application #${applicationId}. Adopter flagged. Please review and consider banning.`;

    for (const admin of admins) {
      await createNotification({
        user_id: admin.id,
        message: adminMsg,
        reference_type: "adoption",
        reference_id: application.id,
      });
      io.to(`user_${admin.id}`).emit("new_notification", {
        message: adminMsg,
        reference_type: "adoption",
        reference_id: application.id,
        created_at: new Date(),
        is_read: false,
      });
    }

    if (newAttempt >= 2) {
      const pet= await Pet.findByPk(application.petId);
      if (pet) await pet.update({ status: "Available", adopted_at: null });
      return res.status(200).json({
        message:
          "Home visit failed twice. Admin notified. Awaiting admin action.",
        data: application,
      });
    }

    return res.status(200).json({
      message: "Home visit failed. Adopter warned and given a second chance.",
      data: application,
    });
  } catch (error) {
    console.error("submitHomeVisitOutcome error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /adoption/:applicationId/certificate
const downloadAdoptionCertificate = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;

    const application = await AdoptionApplication.findByPk(applicationId, {
      include: [
        {
          model: Pet,
          as: "pet",
          attributes: [
            "id",
            "name",
            "species",
            "breed",
            "age",
            "gender",
            "vaccinated",
            "sterilized",
          ],
          include: [
            {
              model: PetImage,
              as: "images",
              attributes: ["file_url", "display_order"],
              order: [["display_order", "ASC"]],
            },
          ],
        },
        {
          model: Shelter,
          as: "shelter",
          attributes: ["id", "name", "contact_email", "city", "state"],
        },
      ],
    });

    if (!application)
      return res.status(404).json({ message: "Application not found" });
    if (application.userId !== userId)
      return res.status(403).json({ message: "Unauthorized" });
    if (application.status !== "completed")
      return res.status(400).json({
        message: "Certificate only available for completed adoptions",
      });

    const pet = application.pet;
    const adopter = {
      firstName: application.first_name || "",
      fullName:
        `${application.first_name || ""} ${application.last_name || ""}`.trim(),
      email: application.email || "-",
      phone: application.phoneNumber || "-",
      address: application.address || "-",
      occupation: application.currentOccupation || "-",
    };
    const appData = {
      id: application.id,
      updatedAt: application.updatedAt,
      submittedOn: new Date(application.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      shelterName: application.shelter?.name || "-",
      shelterLocation:
        [application.shelter?.city, application.shelter?.state]
          .filter(Boolean)
          .join(", ") || "-",
      shelterEmail: application.shelter?.contact_email || "-",
    };

    const html = generateCertificateHTML(pet, adopter, appData);
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
      preferCSSPageSize: true,
    });
    await browser.close();

    const filename = `PetConnect-Certificate-PC-${String(applicationId).padStart(6, "0")}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Certificate generation error:", error);
    return res.status(500).json({ message: "Failed to generate certificate" });
  }
};
// PATCH /adoption/:applicationId/schedule-home-visit
const scheduleHomeVisit = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { home_visit_date, home_visit_time_slot } = req.body;

    if (!home_visit_date || !home_visit_time_slot) {
      return res.status(400).json({
        message: "Both home_visit_date and home_visit_time_slot are required.",
      });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const visitDate = new Date(home_visit_date);
    visitDate.setHours(0, 0, 0, 0);

    if (visitDate < today) {
      return res.status(400).json({
        message: "Home visit date cannot be in the past.",
      });
    }

    const application = await AdoptionApplication.findByPk(applicationId, {
      include: [
        { model: Pet, as: "pet", attributes: ["id", "name"] },
        { model: Shelter, as: "shelter", attributes: ["id", "name"] },
      ],
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }
    const isFailedAwaitingReschedule =
      application.status === "home_visit" &&
      application.home_visit_status === "failed" &&
      (application.home_visit_attempt || 0) < 2;

    if (
      !["pending", "approved"].includes(application.status) &&
      !isFailedAwaitingReschedule
    ) {
      return res.status(400).json({
        message:
          "Home visit can only be scheduled when application status is 'approved'.",
      });
    }
    const isReschedule = !!application.home_visit_date;
    await application.update({ home_visit_date, home_visit_time_slot });

    try {
      const shelterForEmail = await Shelter.findByPk(application.shelterId);

      await sendStatusUpdateToApplicant({
        applicantEmail: application.email,
        applicantFirstName: application.first_name,
        petName: application.pet?.name,
        shelterName: application.shelter?.name || shelterForEmail?.name,
        status: "home_visit",
        applicationId: application.id,
        homeVisitDate: home_visit_date, // ← real date from request body
        homeVisitTimeSlot: home_visit_time_slot, // ← real slot from request body
      });

      await sendHomeVisitNotificationToShelter({
        shelterEmail: shelterForEmail?.contact_email,
        shelterName: shelterForEmail?.name,
        applicantFirstName: application.first_name,
        applicantLastName: application.last_name,
        applicantEmail: application.email,
        applicantPhone: application.phoneNumber,
        petName: application.pet?.name,
        homeVisitDate: home_visit_date, // ← real date
        homeVisitTimeSlot: home_visit_time_slot, // ← real slot
        applicationId: application.id,
      });
    } catch (emailErr) {
      console.error("Schedule home visit email failed:", emailErr.message);
    }

    // ── Notify adopter via socket + in-app ─────────────────────────────
    try {
      const petName = application.pet?.name || "your pet";
      const shelterName = application.shelter?.name || "The shelter";
      const formattedDate = new Date(home_visit_date).toLocaleDateString(
        "en-IN",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );

      const notifMsg = ` ${shelterName} has ${isReschedule ? "rescheduled" : "scheduled"} a home visit on ${formattedDate} (${home_visit_time_slot}) for your adoption of "${petName}".`;

      await createNotification({
        user_id: application.userId,
        message: notifMsg,
        reference_type: "adoption",
        reference_id: application.id,
      });

      const io = getIO();
      io.to(`user_${application.userId}`).emit("new_notification", {
        message: notifMsg,
        reference_type: "adoption",
        reference_id: application.id,
        created_at: new Date(),
        is_read: false,
      });
    } catch (notifErr) {
      console.error(
        "Schedule home visit notification failed:",
        notifErr.message,
      );
    }

    return res.status(200).json({
      message: "Home visit scheduled successfully.",
      data: {
        home_visit_date: application.home_visit_date,
        home_visit_time_slot: application.home_visit_time_slot,
      },
    });
  } catch (error) {
    console.error("scheduleHomeVisit error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getAdopterPrefillData,
  submitAdoptionApplication,
  getMyApplications,
  getApplicationById,
  getApplicationsForShelter,
  updateApplicationStatus,
  completeAdopterPayment,
  getShelterApplicationById,
  submitHomeVisit,
  submitHomeVisitOutcome,
  downloadAdoptionCertificate,
  scheduleHomeVisit,
};
