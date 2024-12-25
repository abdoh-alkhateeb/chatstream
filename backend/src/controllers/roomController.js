import Room from '../models/room/RoomSchema.js';
import Message from '../models/message/MessageSchema.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// 🏠 Create a Room
export const createRoom = catchAsync(async (req, res, next) => {
  const { name, type } = req.body;

  if (!name) {
    return next(new AppError('Room name is required', 400));
  }

  const newRoom = await Room.create({
    name,
    type: type || 'room',
    creator: req.user._id,
    participants: [req.user._id], // Creator automatically joins the room
  });

  res.status(201).json({ status: 'success', data: newRoom });
});

// 📚 Get All Rooms (User-specific)
export const getRoomsByUser = catchAsync(async (req, res) => {
  const rooms = await Room.find({
    participants: req.user._id,
  })
    .populate('creator', 'name')
    .populate('participants', 'name');

  res.status(200).json({ status: 'success', data: rooms });
});

// 📚 Get All Rooms
export const getAllRooms = catchAsync(async (req, res) => {
  const rooms = await Room.find({})
    .populate('creator', 'name')
    .populate('participants', 'name');

  res.status(200).json({ status: 'success', data: rooms });
});

// 🏢 Get Room Details
export const getRoomDetails = catchAsync(async (req, res, next) => {
  const room = await Room.findById(req.params.id)
    .populate('participants', 'name')
    .populate({
      path: 'messages',
      populate: { path: 'senderId', select: 'name' },
    });

  console.log('🚀 ~ getRoomDetails ~ room:', room);

  if (!room) {
    return next(new AppError('Room not found', 404));
  }

  if (!room.participants.some((part) => part._id.equals(req.user._id))) {
    return next(new AppError('You are not a participant in this room', 403));
  }

  res.status(200).json({ status: 'success', data: room });
});

// 🤝 Join a Room
export const joinRoom = catchAsync(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return next(new AppError('Room not found', 404));
  }

  if (room.participants.some((part) => part._id.equals(req.user._id))) {
    return next(new AppError('You are already in this room', 400));
  }

  room.participants.push(req.user._id);
  await room.save();

  res.status(200).json({ status: 'success', data: room });
});

// 👋 Leave a Room
export const leaveRoom = catchAsync(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return next(new AppError('Room not found', 404));
  }

  room.participants = room.participants.filter(
    (part) => !part._id.equals(req.user._id)
  );

  console.log('🚀 ~ leaveRoom ~ room.participants:', room.participants);

  await room.save();

  res.status(200).json({ status: 'success', message: 'You left the room' });
});

// 🗑️ Delete a Room
export const deleteRoom = catchAsync(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return next(new AppError('Room not found', 404));
  }

  if (room.creator.toString() !== req.user._id.toString()) {
    return next(
      new AppError('You are not authorized to delete this room', 403)
    );
  }

  await room.deleteOne();

  res.status(204).send();
});

/* -------------------------------- */
/* 📨 MESSAGE CONTROLLERS */
/* -------------------------------- */

// 💬 Send a Message
export const sendMessage = catchAsync(async (req, res, next) => {
  const { content, attachments } = req.body;
  const room = await Room.findById(req.params.roomId);

  if (
    !room ||
    !room.participants.some((part) => part._id.equals(req.user._id))
  ) {
    return next(new AppError('Access denied or room not found', 403));
  }

  if (!content) {
    return next(new AppError('Message content is required', 400));
  }

  const message = await Message.create({
    senderId: req.user._id,
    content,
    attachments,
  });

  room.messages.push(message._id);
  await room.save();

  res.status(201).json({ status: 'success', data: message });
});

// 📥 Get Messages in a Room
export const getMessages = catchAsync(async (req, res, next) => {
  const room = await Room.findById(req.params.roomId).populate({
    path: 'messages',
    populate: { path: 'senderId', select: 'name' },
  });

  if (
    !room ||
    !room.participants.some((part) => part._id.equals(req.user._id))
  ) {
    return next(new AppError('Access denied or room not found', 403));
  }

  res.status(200).json({ status: 'success', data: room.messages });
});

// 🗑️ Delete a Message
export const deleteMessage = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  if (!message.senderId.equals(req.user._id)) {
    return next(new AppError('You can only delete your own messages', 403));
  }

  await Room.findByIdAndUpdate(
    roomId,
    {
      $pull: {
        messages: message._id,
      },
    },
    {
      new: true,
    }
  );

  await message.deleteOne();

  res.status(204).send();
});
