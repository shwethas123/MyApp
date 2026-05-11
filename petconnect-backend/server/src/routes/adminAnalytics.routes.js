import express from "express";
import { getAdminAnalytics } from "../controllers/adminAnalytics.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/analytics", authMiddleware, (req, res) => {
  /* #swagger.tags = ['Admin'] */
  getAdminAnalytics(req, res);
});

export default router;