import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Conversation Schema
const RoomSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['dm', 'room'],
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
      },
    ],
    name: {
      type: String,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Messages',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
RoomSchema.index({ type: 1 }, { name: 'room_type_index' });
RoomSchema.index({ participants: 1 }, { name: 'participants_index' });

const Room = model('Rooms', RoomSchema);

export default Room;
