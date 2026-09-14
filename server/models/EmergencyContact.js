import mongoose from 'mongoose';

const emergencyContactSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    relationship: { type: String, default: '', maxlength: 40 },
    contactUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    phone: { type: String, default: '', maxlength: 20 },
    priority: { type: Number, default: 1, min: 1, max: 5 },
  },
  { timestamps: true }
);

emergencyContactSchema.index({ user: 1, priority: 1 });

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);
export default EmergencyContact;
