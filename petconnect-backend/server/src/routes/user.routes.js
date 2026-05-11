import express from "express";
import {
  createUser,
  loginUser,
  sendOtp,
  verifyOtp,
  updateProfile,
  refreshToken,
  getProfile,
  logoutUser,
  getMe,
  completeOAuthProfile,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/Passwordreset.controller.js";
import { profilePhotoUpload, profileDocumentsUpload } from "../middlewares/upload.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import ROLES from "../middlewares/roles.js";

const router = express.Router();

// Public (no auth needed)
router.post("/send-otp", (req, res) => {
  /* #swagger.tags = ['Auth'] */
  sendOtp(req, res);
});
router.post("/verify-otp", (req, res) => {
  /* #swagger.tags = ['Auth'] */
  verifyOtp(req, res);
});
router.post("/register", (req, res) => {
  /* #swagger.tags = ['Auth'] */
  createUser(req, res);
});
router.post("/login", (req, res) => {
  /* #swagger.tags = ['Auth'] */
  loginUser(req, res);
});
router.post("/refresh-token", (req, res) => {
  /* #swagger.tags = ['Auth'] */
  refreshToken(req, res);
});
router.post("/forgot-password", (req, res) => {
  /* #swagger.tags = ['Auth'] */
  forgotPassword(req, res);
});
router.post("/reset-password", (req, res) => {
  /* #swagger.tags = ['Auth'] */
  resetPassword(req, res);
});
router.post("/logout", authMiddleware, (req, res) => {
  /* #swagger.tags = ['Auth'] */
  logoutUser(req, res);
});
router.post("/oauth-complete", authMiddleware, completeOAuthProfile);

// Profile Routes
router.get("/profile", authMiddleware, authorize(ROLES.ADOPTER), (req, res) => {
  /* #swagger.tags = ['Users'] */
  getProfile(req, res);
});
router.put(
  "/:id/profile",
  authMiddleware,
  authorize(ROLES.ADOPTER),
  profileDocumentsUpload,
  (req, res) => {
    /* #swagger.tags = ['Users'] */
    updateProfile(req, res);
  },
);
router.get("/me", authMiddleware, (req, res) => {
  /* #swagger.tags = ['Users'] */
  getMe(req, res);
});

export default router;