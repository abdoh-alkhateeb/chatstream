import Room from '../../models/room/RoomSchema.js';
import Message from '../../models/message/MessageSchema.js';
import { validateRoomAccess } from './roomUtils.js';
import socketAuthMiddleware from './socketAuthMiddleware.js';

const socketHandler = (io) => {
  // Apply Authentication Middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    console.log(
      `🔌 User connected: ${socket.user.name} (ID: ${socket.user._id})`
    );

    /* ROOM EVENTS */

    // Create Room
    socket.on('createRoom', async ({ name, type }) => {
      try {
        const newRoom = await Room.create({
          name,
          type: type || 'room',
          creator: socket.user._id,
          participants: [socket.user._id],
        });

        io.emit('roomCreated', { room: newRoom });
        console.log(`🏠 Room created: ${name} by ${socket.user.name}`);
      } catch (err) {
        console.error('❌ Create Room Error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });

    // 📚 Get User Rooms
    socket.on('getRoomsByUser', async () => {
      try {
        const rooms = await Room.find({ participants: socket.user._id })
          .populate('creator', 'name')
          .populate('participants', 'name');

        socket.emit('userRooms', { rooms });
      } catch (err) {
        console.error('❌ Get Rooms Error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });

    // 📚 Get All Rooms
    socket.on('getAllRooms', async () => {
      try {
        const rooms = await Room.find({})
          .populate('creator', 'name')
          .populate('participants', 'name');

        socket.emit('allRooms', { rooms });
      } catch (err) {
        console.error('❌ Get All Rooms Error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });

    // 🏢 Get Room Details
    socket.on('getRoomDetails', async ({ roomId }) => {
      try {
        const room = await validateRoomAccess(roomId, socket.user._id);

        socket.emit('roomDetails', { room });
      } catch (err) {
        console.error('❌ Room Details Error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });

    // 🤝 Join Room
    socket.on('joinRoom', async ({ roomId }) => {
      try {
        const room = await validateRoomAccess(roomId, socket.user._id);

        if (!room.participants.includes(socket.user._id)) {
          room.participants.push(socket.user._id);
          await room.save();
        }

        socket.join(roomId);
        io.to(roomId).emit('userJoined', { userId: socket.user._id });
        console.log(`📥 User ${socket.user.name} joined room ${roomId}`);
      } catch (err) {
        console.error('❌ Join Room Error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });

    // 👋 Leave Room
    socket.on('leaveRoom', async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) {
          return socket.emit('error', { message: 'Room not found' });
        }

        room.participants = room.participants.filter(
          (part) => !part.equals(socket.user._id)
        );
        await room.save();

        socket.leave(roomId);
        io.to(roomId).emit('userLeft', { userId: socket.user._id });
        console.log(`📤 User ${socket.user.name} left room ${roomId}`);
      } catch (err) {
        console.error('❌ Leave Room Error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });

    // 🗑️ Delete Room
    socket.on('deleteRoom', async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId);

        if (!room) {
          return socket.emit('error', { message: 'Room not found' });
        }

        if (room.creator.toString() !== socket.user._id.toString()) {
          return socket.emit('error', {
            message: 'Unauthorized to delete room',
          });
        }

        await room.deleteOne();
        io.emit('roomDeleted', { roomId });
        console.log(`🗑️ Room ${roomId} deleted`);
      } catch (err) {
        console.error('❌ Delete Room Error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });

    /* -------------------------------- */
    /* 💬 MESSAGE EVENTS */
    /* -------------------------------- */

    // 💬 Send Message
    socket.on('sendMessage', async ({ roomId, content }) => {
      try {
        const room = await validateRoomAccess(roomId, socket.user._id);

        if (!content) {
          return socket.emit('error', {
            message: 'Message content is required',
          });
        }

        const message = await Message.create({
          senderId: socket.user._id,
          content,
        });

        room.messages.push(message._id);
        await room.save();

        io.to(roomId).emit('newMessage', {
          roomId,
          senderId: socket.user._id,
          content,
          createdAt: message.createdAt,
        });
      } catch (err) {
        console.error('❌ Send Message Error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });

    // 📥 Get Messages
    socket.on('getMessages', async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId).populate({
          path: 'messages',
          populate: { path: 'senderId', select: 'name' },
          options: { sort: { createdAt: 1 } }, // Sort messages by creation date
        });

        if (!room || !room.participants.includes(socket.user._id)) {
          return socket.emit('error', {
            message: 'Access denied or room not found',
          });
        }

        socket.emit('roomMessages', { roomId, messages: room.messages });
      } catch (err) {
        console.error('❌ Get Messages Error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });

    // 📝 Edit Message
    socket.on('editMessage', async ({ messageId, content }) => {
      try {
        const message = await Message.findById(messageId);

        if (!message || !message.senderId.equals(socket.user._id)) {
          return socket.emit('error', {
            message: 'Unauthorized to edit message',
          });
        }

        message.content = content;
        await message.save();

        io.emit('messageEdited', { messageId, content });
      } catch (err) {
        console.error('❌ Edit Message Error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('deleteMessage', async ({ roomId, messageId }) => {
      try {
        // Validate message existence and ownership
        const message = await Message.findById(messageId);
        if (!message) {
          return socket.emit('error', { message: 'Message not found' });
        }

        if (!message.senderId.equals(socket.user._id)) {
          return socket.emit('error', {
            message: 'Unauthorized to delete message',
          });
        }

        // Remove message reference from the room
        const room = await Room.findByIdAndUpdate(
          roomId,
          { $pull: { messages: messageId } },
          { new: true }
        );

        if (!room) {
          return socket.emit('error', { message: 'Room not found' });
        }

        // Delete the actual message document
        await message.deleteOne();

        // Notify all room participants about the deleted message
        io.to(roomId).emit('messageDeleted', { messageId });
      } catch (err) {
        console.error('❌ Delete Message Error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });
  });
};

export default socketHandler;
