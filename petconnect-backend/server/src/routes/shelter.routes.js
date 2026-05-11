import express from "express";
import * as shelterController from "../controllers/shelter.controller.js";
import { checkShelterNameAvailability } from "../controllers/shelter.controller.js";
import upload, { shelterProfilePhotoUpload } from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import ROLES from "../middlewares/roles.js";

const router = express.Router();

router.get("/check-name", checkShelterNameAvailability);

router.get("/my-profile", authMiddleware, authorize(ROLES.SHELTER), (req, res) => {
  /* #swagger.tags = ['Shelters'] */
  shelterController.getShelterProfile(req, res);
});

router.put("/my-profile", authMiddleware, authorize(ROLES.SHELTER), (req, res) => {
  /* #swagger.tags = ['Shelters'] */
  shelterController.updateShelterProfile(req, res);
});

router.post("/my-profile/photo", authMiddleware, authorize(ROLES.SHELTER), shelterProfilePhotoUpload.single("profile_photo"), (req, res) => {
  /* #swagger.tags = ['Shelters'] */
  shelterController.uploadShelterProfilePhoto(req, res);
});

router.post("/documents", authMiddleware, authorize(ROLES.SHELTER), upload.single("document"), (req, res) => {
  /* #swagger.tags = ['Shelters'] */
  shelterController.uploadShelterDocument(req, res);
});

router.delete("/documents/:fileId", authMiddleware, authorize(ROLES.SHELTER), (req, res) => {
  /* #swagger.tags = ['Shelters'] */
  shelterController.deleteShelterDocument(req, res);
});

router.post("/ngo_register", authMiddleware, authorize(ROLES.SHELTER), upload.fields([
  { name: "registration_certificate", maxCount: 1 },
  { name: "additional_document", maxCount: 5 },
]), (req, res) => {
  /* #swagger.tags = ['Shelters'] */
  shelterController.createNgoShelter(req, res);
});

router.post("/government_register", authMiddleware, authorize(ROLES.SHELTER), upload.single("government_authorization"), (req, res) => {
  /* #swagger.tags = ['Shelters'] */
  shelterController.createGovernmentDetails(req, res);
});

router.post("/rescuer_register", authMiddleware, authorize(ROLES.SHELTER), upload.single("id_proof"), (req, res) => {
  /* #swagger.tags = ['Shelters'] */
  shelterController.createShelterRescuer(req, res);
});

router.post("/rescuer_register", authMiddleware, authorize(ROLES.SHELTER), upload.single("id_proof"), (req, res) => {
  /* #swagger.tags = ['Shelters'] */
  shelterController.createShelterRescuer(req, res);
});

router.patch("/:id/verify", authMiddleware, authorize(ROLES.ADMIN), (req, res) => {
  /* #swagger.tags = ['Shelters'] */
  shelterController.verifyShelter(req, res);
});

router.delete("/:id", authMiddleware, (req, res) => {
  /* #swagger.tags = ['Shelters'] */
  shelterController.deleteShelter(req, res);
});

router.get("/:id", authMiddleware, authorize(ROLES.SHELTER), (req, res) => {
  /* #swagger.tags = ['Shelters'] */
  shelterController.getShelterById(req, res);
});




export default router;