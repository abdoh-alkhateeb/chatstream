import express from 'express';
import {
  createRoom,
  getRoomsByUser,
  getRoomDetails,
  joinRoom,
  leaveRoom,
  deleteRoom,
  getAllRooms,
  sendMessage,
  getMessages,
  deleteMessage,
} from '../controllers/roomController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

/* Public Routes */

// 📚 Get All Rooms
router.get('/', getAllRooms);

/* Protected Routes */
router.use(protect);

// 🏠 Room Routes
router.post('/', createRoom);
router.get('/', getRoomsByUser);
router.get('/:id', getRoomDetails);
router.post('/:id/join', joinRoom);
router.post('/:id/leave', leaveRoom);
router.delete('/:id', deleteRoom);

router.post('/:roomId/messages', sendMessage);
router.get('/:roomId/messages', getMessages);

router.delete('/:roomId/messages/:messageId', deleteMessage);

export default router;
