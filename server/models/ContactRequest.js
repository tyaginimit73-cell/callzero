import mongoose from 'mongoose';

const contactRequestSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

contactRequestSchema.index({ sender: 1, receiver: 1 });
contactRequestSchema.index({ receiver: 1, status: 1 });

const ContactRequest = mongoose.model('ContactRequest', contactRequestSchema);
export default ContactRequest;
