import express from "express";
import {
  getMyNotifications,
  markAsRead,
  
} from "../controllers/notification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
  /* #swagger.tags = ['Notifications'] */
  getMyNotifications(req, res);
});



router.patch("/:id/read", authMiddleware, (req, res) => {
  /* #swagger.tags = ['Notifications'] */
  markAsRead(req, res);
});

export default router;