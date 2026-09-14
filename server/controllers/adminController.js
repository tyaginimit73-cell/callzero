import User from '../models/User.js';
import Call from '../models/Call.js';
import Message from '../models/Message.js';
import ContactRequest from '../models/ContactRequest.js';
import EmergencyContact from '../models/EmergencyContact.js';
import { catchAsync, success } from '../utils/catchAsync.js';
import { NotFoundError } from '../utils/ApiError.js';

export const getStats = catchAsync(async (req, res) => {
  const [totalUsers, activeUsers, totalCalls, totalMessages, connectedCalls, failedCalls, blockedAccounts, contactRequests, emergencyContacts, messagesToday, callsToday, usersToday] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'online' }),
      Call.countDocuments(),
      Message.countDocuments(),
      Call.countDocuments({ status: 'connected' }),
      Call.countDocuments({ status: { $in: ['failed', 'declined', 'missed'] } }),
      User.countDocuments({ isSuspended: true }),
      ContactRequest.countDocuments(),
      EmergencyContact.countDocuments(),
      Message.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 3600e3) } }),
      Call.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 3600e3) } }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 3600e3) } }),
    ]);

  return success(res, {
    stats: {
      totalUsers,
      activeUsers,
      totalCalls,
      totalMessages,
      connectedCalls,
      failedCalls,
      blockedAccounts,
      contactRequests,
      emergencyContacts,
      messagesToday,
      callsToday,
      usersToday,
      failureRate: totalCalls ? Math.round((failedCalls / totalCalls) * 100) : 0,
    },
  });
});

export const getUsers = catchAsync(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const q = (req.query.q || '').trim();

  const filter = q ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { username: new RegExp(q, 'i') }] } : {};
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  return success(res, { users, total, page, limit });
});

export const getCalls = catchAsync(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const calls = await Call.find()
    .populate('caller', 'name username')
    .populate('receiver', 'name username')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  return success(res, { calls });
});

export const suspendUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('User not found');
  user.isSuspended = true;
  await user.save();
  return success(res, null, 'Account suspended');
});

export const unsuspendUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('User not found');
  user.isSuspended = false;
  await user.save();
  return success(res, null, 'Account unsuspended');
});

export const getSystemHealth = catchAsync(async (req, res) => {
  const mem = process.memoryUsage();
  return success(res, {
    health: {
      uptime: process.uptime(),
      memory: { rss: mem.rss, heapUsed: mem.heapUsed, heapTotal: mem.heapTotal },
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
      time: new Date().toISOString(),
    },
  });
});
