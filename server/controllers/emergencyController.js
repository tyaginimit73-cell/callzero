import EmergencyContact from '../models/EmergencyContact.js';
import User from '../models/User.js';
import { catchAsync, success } from '../utils/catchAsync.js';
import { NotFoundError } from '../utils/ApiError.js';

export const getEmergencyContacts = catchAsync(async (req, res) => {
  const list = await EmergencyContact.find({ user: req.user._id })
    .populate('contactUser', 'name username avatar status lastSeen')
    .sort({ priority: 1, createdAt: 1 })
    .lean();

  return success(res, { contacts: list });
});

export const addEmergencyContact = catchAsync(async (req, res) => {
  const { name, relationship, contactUser, phone, priority } = req.body;

  let resolvedUser = null;
  if (contactUser) {
    const cu = await User.findById(contactUser);
    if (cu) resolvedUser = cu;
  }

  const contact = await EmergencyContact.create({
    user: req.user._id,
    name,
    relationship,
    contactUser: resolvedUser?._id || null,
    phone,
    priority,
  });

  return success(res, { contact }, 'Emergency contact added', 201);
});

export const updateEmergencyContact = catchAsync(async (req, res) => {
  const contact = await EmergencyContact.findById(req.params.id);
  if (!contact) throw new NotFoundError('Contact not found');
  if (String(contact.user) !== String(req.user._id)) throw new NotFoundError('Contact not found');

  ['name', 'relationship', 'contactUser', 'phone', 'priority'].forEach((k) => {
    if (req.body[k] !== undefined) contact[k] = req.body[k];
  });
  await contact.save();
  return success(res, { contact }, 'Contact updated');
});

export const deleteEmergencyContact = catchAsync(async (req, res) => {
  const contact = await EmergencyContact.findById(req.params.id);
  if (!contact) throw new NotFoundError('Contact not found');
  if (String(contact.user) !== String(req.user._id)) throw new NotFoundError('Contact not found');
  await contact.deleteOne();
  return success(res, null, 'Contact removed');
});
