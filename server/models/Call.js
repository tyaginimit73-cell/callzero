import mongoose from 'mongoose';

const callSchema = new mongoose.Schema(
  {
    caller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['voice', 'video'], required: true },
    status: {
      type: String,
      enum: ['requested', 'ringing', 'connected', 'declined', 'missed', 'ended', 'failed'],
      default: 'requested',
    },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    duration: { type: Number, default: 0 }, // seconds
    endReason: { type: String, default: '' },
  },
  { timestamps: true }
);

callSchema.index({ caller: 1, createdAt: -1 });
callSchema.index({ receiver: 1, createdAt: -1 });
callSchema.index({ status: 1, createdAt: -1 });

const Call = mongoose.model('Call', callSchema);
export default Call;
