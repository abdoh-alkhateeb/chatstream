import express from 'express';
import {
  editMessage,
  deleteMessage,
} from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// 💬 Message Routes
router.patch('/:messageId', editMessage);
router.delete('/:messageId', deleteMessage);

export default router;
