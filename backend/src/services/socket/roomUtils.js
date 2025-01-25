import Room from '../../models/room/RoomSchema.js';
import AppError from '../../utils/appError.js';

export const validateRoomAccess = async (roomId, userId) => {
  const room = await Room.findById(roomId);

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  if (
    !room.creator.equals(userId) &&
    !room.participants.some((part) => part._id.equals(userId))
  ) {
    throw new AppError('You are not a participant in this room', 403);
  }

  return room;
};
