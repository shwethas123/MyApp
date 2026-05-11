import express from "express";
import { combinedPetUpload } from "../middlewares/upload.js";
import {
  createPet,
  getAllPets,
  getPetById,
  updatePet,
  updatePetStatus,
  deletePet,
  browsePets,
  getAnalytics,
} from "../controllers/pet.controller.js";
import {
  authMiddleware,
  optionalAuthenticate,
} from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import ROLES from "../middlewares/roles.js";

const router = express.Router();

/* PUBLIC - Browse Pets (no auth needed) */
router.get("/browse", optionalAuthenticate, (req, res) => {
  /* #swagger.tags = ['Pets'] */
  browsePets(req, res);
});

router.get("/public/:id", optionalAuthenticate, (req, res) => {
  /* #swagger.tags = ['Pets'] */
  getPetById(req, res);
});

/* SHELTER PET MANAGEMENT - AUTH REQUIRED */
router.post("/", authMiddleware, authorize(ROLES.SHELTER), combinedPetUpload, (req, res) => {
  /* #swagger.tags = ['Pets'] */
  createPet(req, res);
});

router.get("/", authMiddleware, (req, res) => {
  /* #swagger.tags = ['Pets'] */
  getAllPets(req, res);
});

router.get("/analytics", authMiddleware, (req, res) => {
  /* #swagger.tags = ['Pets'] */
  getAnalytics(req, res);
});

router.get("/:id", optionalAuthenticate, (req, res) => {
  /* #swagger.tags = ['Pets'] */
  getPetById(req, res);
});

router.put("/:id", authMiddleware, authorize(ROLES.SHELTER), combinedPetUpload, (req, res) => {
  /* #swagger.tags = ['Pets'] */
  updatePet(req, res);
});

router.patch("/:id/status", authMiddleware, authorize(ROLES.SHELTER), (req, res) => {
  /* #swagger.tags = ['Pets'] */
  updatePetStatus(req, res);
});

router.delete("/:id", authMiddleware, authorize(ROLES.SHELTER), (req, res) => {
  /* #swagger.tags = ['Pets'] */
  deletePet(req, res);
});

export default router;