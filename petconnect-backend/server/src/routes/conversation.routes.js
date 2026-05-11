import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  revealIdentity,
  uploadChatFile,
  checkConversation,
} from '../controllers/conversation.controller.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post('/check', authMiddleware, (req, res) => {
  /* #swagger.tags = ['Conversations'] */
  checkConversation(req, res);
});

router.post('/', authMiddleware, (req, res) => {
  /* #swagger.tags = ['Conversations'] */
  getOrCreateConversation(req, res);
});

router.get('/', authMiddleware, (req, res) => {
  /* #swagger.tags = ['Conversations'] */
  getMyConversations(req, res);
});

router.get('/:id/messages', authMiddleware, (req, res) => {
  /* #swagger.tags = ['Conversations'] */
  getMessages(req, res);
});

router.patch('/:id/reveal', authMiddleware, (req, res) => {
  /* #swagger.tags = ['Conversations'] */
  revealIdentity(req, res);
});

router.post('/:id/upload', authMiddleware, upload.single('file'), (req, res) => {
  /* #swagger.tags = ['Conversations'] */
  uploadChatFile(req, res);
});

export default router;