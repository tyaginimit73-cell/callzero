import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 4000 },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ sender: 1, receiver: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
