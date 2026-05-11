import express from 'express';
import { createReport } from '../controllers/report.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
  /* #swagger.tags = ['Reports'] */
  createReport(req, res);
});

export default router;