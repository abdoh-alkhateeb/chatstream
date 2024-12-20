import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Message Schema
const MessageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        type: {
          type: String,
          enum: ['document', 'file', 'poll', 'thread'],
        },
        resource: { type: String }, // URL or resource link
        thread: {
          type: Schema.Types.ObjectId,
          ref: 'Rooms',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
MessageSchema.index({ senderId: 1 }, { name: 'message_sender_index' });

const Message = model('Messages', MessageSchema);

export default Message;
