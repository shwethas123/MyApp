import express from "express";
import { chatAboutPet } from "../controllers/petChat.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:petId/chat", authMiddleware, chatAboutPet);

export default router;