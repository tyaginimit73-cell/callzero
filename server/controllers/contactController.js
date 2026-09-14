import User from '../models/User.js';
import ContactRequest from '../models/ContactRequest.js';
import { catchAsync, success } from '../utils/catchAsync.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/ApiError.js';

export const getContacts = catchAsync(async (req, res) => {
  const ids = req.user.contacts.map((c) => c.user);
  const users = await User.find({ _id: { $in: ids } })
    .select('name username avatar status lastSeen')
    .lean();

  const meta = new Map(req.user.contacts.map((c) => [String(c.user), c]));

  const contacts = users.map((u) => ({
    user: {
      _id: u._id,
      name: u.name,
      username: u.username,
      avatar: u.avatar,
      status: u.status,
      lastSeen: u.lastSeen,
    },
    nickname: meta.get(String(u._id))?.nickname || '',
    favorite: meta.get(String(u._id))?.favorite || false,
    addedAt: meta.get(String(u._id))?.addedAt,
  }));

  return success(res, { contacts });
});

export const getContactRequests = catchAsync(async (req, res) => {
  const requests = await ContactRequest.find({ receiver: req.user._id, status: 'pending' })
    .populate('sender', 'name username avatar')
    .sort({ createdAt: -1 })
    .lean();
  return success(res, { requests });
});

export const sendContactRequest = catchAsync(async (req, res) => {
  const target = await User.findById(req.body.userId);
  if (!target) throw new NotFoundError('User not found');
  if (String(target._id) === String(req.user._id)) throw new ConflictError('You cannot add yourself');
  if ((req.user.blockedUsers || []).includes(target._id)) throw new ForbiddenError('Cannot send request to blocked user');

  const alreadyContact = req.user.contacts.some((c) => String(c.user) === String(target._id));
  if (alreadyContact) throw new ConflictError('Already a contact');

  const existing = await ContactRequest.findOne({
    $or: [
      { sender: req.user._id, receiver: target._id },
      { sender: target._id, receiver: req.user._id },
    ],
  }).lean();

  if (existing && existing.status === 'pending') throw new ConflictError('A request already exists');
  if (existing && existing.status === 'accepted') throw new ConflictError('Already a contact');

  const request = await ContactRequest.create({
    sender: req.user._id,
    receiver: target._id,
    status: 'pending',
  });

  return success(res, { request }, 'Contact request sent', 201);
});

export const respondToRequest = catchAsync(async (req, res) => {
  const { requestId, action } = req.body;
  const request = await ContactRequest.findById(requestId);
  if (!request) throw new NotFoundError('Request not found');
  if (String(request.receiver) !== String(req.user._id)) throw new ForbiddenError('Not your request');
  if (request.status !== 'pending') throw new ConflictError('Request already handled');

  const otherId = request.sender;
  request.status = action === 'accept' ? 'accepted' : 'rejected';
  await request.save();

  if (action === 'accept') {
    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { contacts: { user: otherId, addedAt: new Date() } } }
    );
    await User.updateOne(
      { _id: otherId },
      { $addToSet: { contacts: { user: req.user._id, addedAt: new Date() } } }
    );
  }

  return success(res, { request }, action === 'accept' ? 'Contact added' : 'Request rejected');
});

export const removeContact = catchAsync(async (req, res) => {
  const targetId = req.params.id;
  req.user.contacts = req.user.contacts.filter((c) => String(c.user) !== String(targetId));
  await req.user.save();
  return success(res, null, 'Contact removed');
});

export const updateContact = catchAsync(async (req, res) => {
  const targetId = req.params.id;
  const entry = req.user.contacts.find((c) => String(c.user) === String(targetId));
  if (!entry) throw new NotFoundError('Not a contact');

  if (req.body.nickname !== undefined) entry.nickname = req.body.nickname;
  if (req.body.favorite !== undefined) entry.favorite = req.body.favorite;
  req.user.markModified('contacts');
  await req.user.save();
  return success(res, null, 'Contact updated');
});

export const blockAndRemove = catchAsync(async (req, res) => {
  const targetId = req.params.id;
  req.user.contacts = req.user.contacts.filter((c) => String(c.user) !== String(targetId));
  if (!req.user.blockedUsers.includes(targetId)) req.user.blockedUsers.push(targetId);
  req.user.markModified('contacts');
  await req.user.save();
  return success(res, null, 'User blocked and removed');
});
