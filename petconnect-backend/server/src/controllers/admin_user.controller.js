import db from "../../models/index.js";
import { Op } from "sequelize";
const { User } = db;

// ── GET /api/admin/users ─────────────────────────────────────────────────────

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


    // Stats
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { account_status: "Active" } });
    const bannedUsers = await User.count({ where: { account_status: "Banned" } });


    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = await User.count({ where: { created_at: { [Op.gte]: oneWeekAgo } } });


    res.json({
      stats: { totalUsers, activeUsers, bannedUsers, newThisWeek },
      users,
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


// ── PATCH /api/admin/users/:id/status ────────────────────────────────────────
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { account_status } = req.body;


    const allowed = ["Active", "Pending", "Banned"];
    if (!allowed.includes(account_status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }


    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });


    await user.update({ account_status });
    res.json({ message: `User status updated to ${account_status}`, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// ── PATCH /api/admin/users/:id/role ──────────────────────────────────────────
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;


    const allowed = ["adopter", "shelter", "admin"];
    if (!allowed.includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }


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


// ── DELETE /api/admin/users/:id ───────────────────────────────────────────────
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
