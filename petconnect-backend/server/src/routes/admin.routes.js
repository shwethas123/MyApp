import express from 'express';
import {
  getDashboardStats,
  getAdminShelterById,
  updateShelterStatus,
  getAdminShelters,
  getAdminUsers,
  getUserDetail,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAdminReports,
  updateReportStatus,
  getAdminReportById,
  banReportedUser,
  getAdminAdoptionById,
  getAdminApplications,
  getAdminApplicationById,
  getConversationBetweenUsers,
} from '../controllers/admin.controller.js';

import { getAdminAnalytics } from '../controllers/adminAnalytics.controller.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import ROLES from "../middlewares/roles.js";

const router = express.Router();

router.get('/dashboard', authMiddleware, authorize('admin'), (req, res) => {
  getDashboardStats(req, res);
});

router.get("/users", authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  getAdminUsers(req, res);
});
router.get("/users/:id", authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  getUserDetail(req, res);
});
router.patch("/users/:id/status", authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  updateUserStatus(req, res);
});
router.patch("/users/:id/role", authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  updateUserRole(req, res);
});
router.delete("/users/:id", authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  deleteUser(req, res);
});

router.get("/shelters", authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  getAdminShelters(req, res);
});
router.get("/shelters/:id", authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  getAdminShelterById(req, res);
});
router.patch("/shelters/:id/verify", authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  updateShelterStatus(req, res);
});

router.get("/reports", authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  getAdminReports(req, res);
});
router.get("/reports/:id", authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  getAdminReportById(req, res);
});
router.patch("/reports/:id", authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  updateReportStatus(req, res);
});
router.post("/reports/:id/ban", authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  banReportedUser(req, res);
});

router.get("/analytics", authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  getAdminAnalytics(req, res);
});

router.get("/adoptions/:id", authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  getAdminAdoptionById(req, res);
});
router.get('/applications', authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  getAdminApplications(req, res);
});
router.get('/applications/:id', authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  getAdminApplicationById(req, res);
});

router.get("/conversations/:reporterId/:reportedId", authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  getConversationBetweenUsers(req, res);
});

router.post("/trigger-expiry-cron", authMiddleware, authorize(ROLES.ADMIN), async (req, res) => {
  try {
    const { dissolveExpiredApplications } = await import("../jobs/adoptionExpiry.cron.js");
    await dissolveExpiredApplications();
    res.json({ message: "Expiry cron triggered successfully" });
  } catch (err) {
    console.error("Manual cron trigger failed:", err);
    res.status(500).json({ message: "Cron trigger failed", error: err.message });
  }
});

export default router;