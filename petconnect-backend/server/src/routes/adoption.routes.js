import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import ROLES from "../middlewares/roles.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import {
  getAdopterPrefillData,
  submitAdoptionApplication,
  getMyApplications,
  getApplicationsForShelter,
  getShelterApplicationById,
  updateApplicationStatus,
  getApplicationById,
  completeAdopterPayment,
   submitHomeVisitOutcome, 
  submitHomeVisit,
  downloadAdoptionCertificate,
  scheduleHomeVisit
} from "../controllers/Adoption.controller.js";
import { adoptionDocUpload } from "../middlewares/upload.js";
import { uploadHomeVisitPhotos } from "../middlewares/upload.js";

const router = express.Router();

router.use(authMiddleware);

router.patch("/:applicationId/payment", (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  completeAdopterPayment(req, res);
});

router.get("/prefill", (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  getAdopterPrefillData(req, res);
});

router.patch("/:applicationId/schedule-home-visit",authorize(ROLES.SHELTER,ROLES.ADMIN), (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  scheduleHomeVisit(req, res);
});

router.post("/apply/:petId", adoptionDocUpload, (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  submitAdoptionApplication(req, res);
});

router.get("/my-applications", (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  getMyApplications(req, res);
});

router.get("/shelter/:shelterId", authorize(ROLES.SHELTER, ROLES.ADMIN), (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  getApplicationsForShelter(req, res);
});

router.patch("/:applicationId/status", authorize(ROLES.SHELTER, ROLES.ADMIN), (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  updateApplicationStatus(req, res);
});
router.patch("/:applicationId/home-visit", authorize(ROLES.SHELTER, ROLES.ADMIN), uploadHomeVisitPhotos, (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  submitHomeVisit(req, res);
});

router.patch("/:applicationId/home-visit-outcome", authorize(ROLES.SHELTER,ROLES.ADMIN), (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  submitHomeVisitOutcome(req, res);
});

router.get("/shelter/:shelterId/application/:applicationId", authorize(ROLES.SHELTER, ROLES.ADMIN), (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  getShelterApplicationById(req, res);
});

router.get("/:applicationId/certificate", (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  downloadAdoptionCertificate(req, res);
});

router.get("/:applicationId", (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  getApplicationById(req, res);
});

export default router;