import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  createRequest,
  getMyRequests,
  getShelterRequests,
  getRequestById,
  updateRequestStatus,
} from '../controllers/adoptionRequest.controller.js';

const router = express.Router();

// Adopter routes
router.post('/', authMiddleware, (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  createRequest(req, res);
});

router.get('/my', authMiddleware, (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  getMyRequests(req, res);
});

// Shelter routes
router.get('/shelter', authMiddleware, (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  getShelterRequests(req, res);
});

// Shared
router.get('/:id', authMiddleware, (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  getRequestById(req, res);
});

router.patch('/:id/status', authMiddleware, (req, res) => {
  /* #swagger.tags = ['Adoption'] */
  updateRequestStatus(req, res);
});

export default router;