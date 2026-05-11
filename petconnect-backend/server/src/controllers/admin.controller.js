import db from '../../models/index.js';
import { Op } from 'sequelize';
import { sendShelterApprovedEmail, sendShelterRejectedEmail } from '../../utils/mailer.js';
import { createNotification } from "./notification.controller.js";
import { getIO } from "../socket.js";
const { Shelter, User, Pet, AdoptionRequest, AdoptionApplication } = db;





export const getDashboardStats = async (req, res) => {
  try {
    const totalPets = await Pet.count();
    const pendingAdoptions = await AdoptionApplication.count({ where: { status: 'pending' } });
    const successfulAdoptions = await AdoptionApplication.count({ where: { status: 'completed' } });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
const adminRole = await db.Role.findOne({ where: { name: 'admin' } });
const newUsers = await User.count({ 
  where: { role_id: { [Op.ne]: adminRole.id } } 
});



    const recentRequests = await AdoptionApplication.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'applicant', attributes: ['first_name', 'last_name'] },
        { model: Pet, as: 'pet', attributes: ['name', 'breed'] },
      ],
    });

    res.status(200).json({ totalPets, pendingAdoptions, successfulAdoptions, newUsers, recentRequests });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};




export const getAdminShelters = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "" } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { contact_email: { [Op.iLike]: `%${search}%` } },
        { "$owner.first_name$": { [Op.iLike]: `%${search}%` } },
        { "$owner.last_name$": { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: shelters } = await Shelter.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
      subQuery: false,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    const totalShelters = await Shelter.count();
    const pendingVerification = await Shelter.count({ where: { status: "Pending" } });
    const activeListings = await Shelter.count({ where: { status: "Verified" } });

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthVerified = await Shelter.count({
      where: { status: "Verified", approved_at: { [Op.gte]: startOfThisMonth } },
    });

    const lastMonthVerified = await Shelter.count({
      where: { status: "Verified", approved_at: { [Op.between]: [startOfLastMonth, endOfLastMonth] } },
    });

    const growth =
      lastMonthVerified === 0
        ? thisMonthVerified > 0 ? 100 : 0
        : (((thisMonthVerified - lastMonthVerified) / lastMonthVerified) * 100).toFixed(1);

    res.json({
      stats: {
        totalShelters,
        pendingVerification,
        activeListings,
        growth: parseFloat(growth),
      },
      shelters,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getAdminShelterById = async (req, res) => {
  try {
    const { id } = req.params;
    const { ShelterNgoDetails, Government, ShelterRescuerDetails, ShelterFiles } = db;

    const shelter = await Shelter.findByPk(id, {
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "first_name", "last_name", "email", "phone"],
        },
        { model: ShelterNgoDetails, as: "ngo_details", required: false },
        { model: Government, as: "government_details", required: false },
        { model: ShelterRescuerDetails, as: "rescuer_details", required: false },
        { model: ShelterFiles, as: "files", required: false },
      ],
    });

    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }

    res.json({ shelter });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const updateShelterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    const allowedStatuses = ["Verified", "Rejected", "Inactive"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const shelter = await Shelter.findByPk(id);
    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }

    if (status === "Rejected" && !rejection_reason?.trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    await shelter.update({
      status,
      approved_by: req.user.id,
      approved_at: status === "Verified" ? new Date() : null,
      rejection_reason: status === "Rejected" ? rejection_reason.trim() : null,
    });

    const owner = await User.findByPk(shelter.owner_id, { attributes: ["first_name", "last_name", "email"] });
    if (owner) {
      if (status === "Verified") {
        await sendShelterApprovedEmail({
          shelterEmail: owner.email,
          shelterName: shelter.name,
          ownerName: `${owner.first_name} ${owner.last_name}`,
        }).catch((err) => console.error("Approved email error:", err));
      } else if (status === "Rejected") {
        await sendShelterRejectedEmail({
          shelterEmail: owner.email,
          shelterName: shelter.name,
          ownerName: `${owner.first_name} ${owner.last_name}`,
          reason: rejection_reason,
        }).catch((err) => console.error("Rejected email error:", err));
      }
    }

    const notificationMessage =
      status === "Verified"
        ? `🎉 Your shelter "${shelter.name}" has been verified by admin!`
        : status === "Rejected"
          ? `❌ Your shelter "${shelter.name}" was rejected by admin.`
          : `ℹ️ Your shelter "${shelter.name}" status changed to ${status}.`;

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

    res.json({
      message: `Shelter status updated to ${status}`,
      shelter,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getAdminUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role = "" } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (role) whereClause["$roleDetails.name$"] = role;
    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: ["id", "first_name", "last_name", "email", "phone", "account_status", "email_verified", "created_at"],
      include: [{ model: db.Role, as: "roleDetails", attributes: ["name"] }],
      subQuery: false,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

   const adminRole = await db.Role.findOne({ where: { name: 'admin' } });
const totalUsers = await User.count({ where: { role_id: { [Op.ne]: adminRole.id } } });
const activeUsers = await User.count({ where: { account_status: "Active", role_id: { [Op.ne]: adminRole.id } } });
const bannedUsers = await User.count({ where: { account_status: "Banned", role_id: { [Op.ne]: adminRole.id } } });
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
const newThisWeek = await User.count({ where: { created_at: { [Op.gte]: oneWeekAgo }, role_id: { [Op.ne]: adminRole.id } } });

    res.json({
      stats: { totalUsers, activeUsers, bannedUsers, newThisWeek },
      users,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { AdoptionApplication, Shelter, Pet, PetImage, Wishlist } = db;

    const user = await User.findByPk(id, {
      attributes: ["id", "first_name", "last_name", "email", "phone",
        "account_status", "email_verified", "location", "living_situation",
        "pet_experience_years", "preferred_species", "profile_completed", "created_at"],
      include: [{ model: db.Role, as: "roleDetails", attributes: ["name"] }],
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    let extra = {};

    if (user.roleDetails?.name === "adopter") {
      const applications = await AdoptionRequest.findAll({
        where: { adopter_id: id },
        include: [{ model: Pet, as: "pet", attributes: ["id", "name", "breed", "species"], include: [{ model: PetImage, as: "images", attributes: ["file_url"], limit: 1 }] }],
        order: [["created_at", "DESC"]],
        limit: 5,
      });

      const wishlist = await Wishlist.findAll({
        where: { user_id: id },
        include: [{ model: Pet, as: "pet", attributes: ["id", "name", "breed", "species"], include: [{ model: PetImage, as: "images", attributes: ["file_url"], limit: 1 }] }],
        limit: 5,
      });

      extra = { applications, wishlist };
    }

    if (user.roleDetails?.name === "shelter") {
      const shelter = await Shelter.findOne({
        where: { owner_id: id },
        include: [
          { model: Pet, as: "pets", attributes: ["id", "name", "breed", "species", "status"], include: [{ model: PetImage, as: "images", attributes: ["file_url"], limit: 1 }], limit: 5 },
        ],
      });
      extra = { shelter };
    }

    res.json({ success: true, data: { user, ...extra } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { account_status } = req.body;
    if (!["Active", "Pending", "Banned"].includes(account_status))
      return res.status(400).json({ message: "Invalid status value" });
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.update({ account_status });
    res.json({ message: `User status updated to ${account_status}`, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["adopter", "shelter", "admin"].includes(role))
      return res.status(400).json({ message: "Invalid role value" });
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const roleRecord = await db.Role.findOne({ where: { name: role } });
    if (!roleRecord) return res.status(400).json({ message: "Invalid role value" });
    await user.update({ role_id: roleRecord.id });
    res.json({ message: `User role updated to ${role}`, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getAdminReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "" } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;

    const { Report } = db;

    const { count, rows: reports } = await Report.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: "reporter", attributes: ["id", "first_name", "last_name", "email"] },
        { model: User, as: "reportedUser", attributes: ["id", "first_name", "last_name", "email", "account_status"] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    const totalReports = await Report.count();
    const pendingCount = await Report.count({ where: { status: "pending" } });
    const resolvedCount = await Report.count({ where: { status: "resolved" } });
    const dismissedCount = await Report.count({ where: { status: "dismissed" } });

    res.json({
      stats: { totalReports, pendingCount, resolvedCount, dismissedCount },
      reports,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// ── GET /api/admin/reports/:id ────────────────────────────────────────────────
export const getAdminReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const { Report } = db;

    const report = await Report.findByPk(id, {
    include: [
      {
        model: User, as: "reporter",
        attributes: ["id", "first_name", "last_name", "email", "phone", "account_status", "created_at"],
        include: [{ model: db.Role, as: "roleDetails", attributes: ["name"] }],
      },
      {
        model: User, as: "reportedUser",
        attributes: ["id", "first_name", "last_name", "email", "phone", "account_status", "created_at"],
        include: [{ model: db.Role, as: "roleDetails", attributes: ["name"] }],
      },
    ],
  });

    if (!report) return res.status(404).json({ message: "Report not found" });

    res.json({ success: true, data: report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_note } = req.body;
    const { Report } = db;

    const allowed = ["pending", "reviewed", "resolved", "dismissed"];
    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const report = await Report.findByPk(id, {
      include: [
        { model: User, as: "reportedUser", attributes: ["first_name", "last_name", "email"] },
      ],
    });
    if (!report) return res.status(404).json({ message: "Report not found" });

    const updatePayload = { status };
    if (status === "resolved" && resolution_note?.trim()) {
      updatePayload.resolution_note = resolution_note.trim();
    }

    await report.update(updatePayload);

    if (status === "reviewed" && report.reportedUser) {
      const { sendWarningEmail } = await import("../../utils/mailer.js");
      await sendWarningEmail({
        userEmail: report.reportedUser.email,
        userName: `${report.reportedUser.first_name} ${report.reportedUser.last_name}`,
        reason: report.reason,
        reportId: report.id,
      }).catch((err) => console.error("Warning email error:", err));
    }

    res.json({ message: `Report marked as ${status}`, report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// ── POST /api/admin/reports/:id/ban ──────────────────────────────────────────
export const banReportedUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, resolution_note } = req.body;
    const { Report, Blacklist } = db;

    const report = await Report.findByPk(id, {
      include: [
        { model: User, as: "reportedUser", attributes: ["id", "first_name", "last_name", "email", "account_status"] },
      ],
    });

    if (!report) return res.status(404).json({ message: "Report not found" });
    if (!report.reportedUser) return res.status(404).json({ message: "Reported user not found" });
    if (!report.reportedUser.id) return res.status(400).json({ message: "Cannot resolve reported user id" });

    const reportedUserId = report.reportedUser.id;

    const existing = await Blacklist.findOne({ where: { user_id: reportedUserId } });
    if (!existing) {
      await Blacklist.create({
        user_id: reportedUserId,
        reason: reason || report.reason || "Banned by admin",
        flagged_by: req.user.id,
      });
    }

    await User.update(
      { account_status: "Banned" },
      { where: { id: reportedUserId } }
    );

    await report.update({
      status: "resolved",
      resolution_note: resolution_note?.trim() || `User banned: ${reason || report.reason}`,
    });

    res.json({ success: true, message: "User banned and added to blacklist. Report resolved." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getAdminAdoptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "" } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;

    const { count, rows: adoptions } = await AdoptionRequest.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: "adopter", attributes: ["id", "first_name", "last_name", "email"] },
        { model: Pet, as: "pet", attributes: ["id", "name", "breed", "species"] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    res.json({
      adoptions,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getAdminAdoptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { PetImage } = db;

    const adoption = await AdoptionRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: "adopter",
          attributes: ["id", "first_name", "last_name", "email", "phone", "location", "living_situation", "pet_experience_years", "preferred_species"],
        },
        {
          model: Pet,
          as: "pet",
          attributes: ["id", "name", "breed", "species", "age", "gender", "vaccinated", "sterilized", "special_needs", "health_status", "adoption_fee", "health_record_url", "vaccination_record_url", "sterilization_certificate_url"],
          include: [
            { model: PetImage, as: "images", attributes: ["file_url", "display_order"] }
          ],
        },
        {
          model: Shelter,
          as: "shelter",
          attributes: ["id", "name", "city"],
          include: [
            {
              model: User,
              as: "owner",
              attributes: ["first_name", "last_name", "email", "phone"],
            }
          ]
        },
      ],
    });

    if (!adoption) return res.status(404).json({ message: "Adoption request not found" });

    res.json({ success: true, data: adoption });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAdminApplications = async (req, res) => {
  try {
    const { page = 1, limit = 5, status = "" } = req.query;
    const offset = (page - 1) * limit;
    const { AdoptionApplication } = db;

    const whereClause = {};
    if (status) whereClause.status = status;

    const { count, rows: applications } = await AdoptionApplication.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: "applicant", attributes: ["id", "first_name", "last_name"] },
        { model: Pet, as: "pet", attributes: ["id", "name", "breed"] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      adoptions: applications,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getAdminApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { AdoptionApplication, PetImage } = db;

    const application = await AdoptionApplication.findByPk(id, {
      include: [
        {
          model: User,
          as: "applicant",
          attributes: ["id", "first_name", "last_name", "email", "phone", "location", "living_situation", "pet_experience_years", "preferred_species"],
        },
        {
          model: Pet,
          as: "pet",
          attributes: ["id", "name", "breed", "species", "age", "gender", "vaccinated", "sterilized", "special_needs", "health_status", "adoption_fee", "health_record_url", "vaccination_record_url", "sterilization_certificate_url", "temperament", "good_with_kids"],
          include: [{ model: PetImage, as: "images", attributes: ["file_url", "display_order"] }],
        },
        {
          model: Shelter,
          as: "shelter",
          attributes: ["id", "name", "city", "zipcode"],
          include: [{ model: User, as: "owner", attributes: ["first_name", "last_name", "email", "phone"] }],
        },
      ],
    });

    if (!application) return res.status(404).json({ message: "Application not found" });

    res.json({ success: true, data: application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getConversationBetweenUsers = async (req, res) => {
  try {
    const { reporterId, reportedId } = req.params;
    const { Message, Conversation, Shelter } = db;

    // The conversation links adopter_id (user) ↔ shelter_id (shelter)
    // Either the reporter is the adopter and reported owns the shelter, or vice versa

    // Find shelters owned by either user
    const shelterOfReporter = await Shelter.findOne({ where: { owner_id: reporterId } });
    const shelterOfReported = await Shelter.findOne({ where: { owner_id: reportedId } });

    // Build OR conditions covering all possible combinations
    const orConditions = [];

    // reporter=adopter, reported=shelter owner
    if (shelterOfReported) {
      orConditions.push({
        adopter_id: reporterId,
        shelter_id: shelterOfReported.id,
      });
    }

    // reported=adopter, reporter=shelter owner
    if (shelterOfReporter) {
      orConditions.push({
        adopter_id: reportedId,
        shelter_id: shelterOfReporter.id,
      });
    }

    if (orConditions.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const conversation = await Conversation.findOne({
      where: { [Op.or]: orConditions },
    });

    if (!conversation) {
      return res.json({ success: true, data: [] });
    }

    const messages = await Message.findAll({
      where: { conversation_id: conversation.id },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    res.json({ success: true, data: messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};