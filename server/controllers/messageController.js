import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { catchAsync, success } from '../utils/catchAsync.js';
import { NotFoundError } from '../utils/ApiError.js';

export const getConversations = catchAsync(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name username avatar status lastSeen')
    .sort({ lastMessageAt: -1 })
    .limit(100)
    .lean();

  const result = conversations.map((c) => {
    const other = c.participants.find((p) => String(p._id) !== String(req.user._id));
    return {
      _id: c._id,
      participant: other,
      lastMessage: c.lastMessage,
      lastMessageAt: c.lastMessageAt,
      unread: (c.unreadBy && c.unreadBy.get?.(String(req.user._id))) || 0,
      updatedAt: c.updatedAt,
    };
  });

  return success(res, { conversations: result });
});

export const getOrCreateConversation = catchAsync(async (req, res) => {
  const otherId = req.params.userId;
  let conv = await Conversation.findOne({
    participants: { $all: [req.user._id, otherId], $size: 2 },
  });

  if (!conv) {
    conv = await Conversation.create({
      participants: [req.user._id, otherId],
      lastMessageAt: new Date(),
    });
  }

  return success(res, { conversation: conv });
});

export const getMessages = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const conv = await Conversation.findById(conversationId);
  if (!conv) throw new NotFoundError('Conversation not found');
  if (!conv.participants.some((p) => String(p) === String(req.user._id))) {
    throw new NotFoundError('Conversation not found');
  }

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const skip = (page - 1) * limit;

  const total = await Message.countDocuments({ conversation: conversationId });
  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Mark messages delivered/read
  await Message.updateMany(
    { conversation: conversationId, receiver: req.user._id, status: { $in: ['sent', 'delivered'] } },
    { $set: { status: 'read' } }
  );
  await Conversation.updateOne(
    { _id: conversationId, [`unreadBy.${req.user._id}`]: { $exists: true } },
    { $set: { [`unreadBy.${req.user._id}`]: 0 } }
  );

  return success(res, { messages: messages.reverse(), total, page, limit });
});

export const sendMessage = catchAsync(async (req, res) => {
  const { conversationId, receiverId, content, replyTo } = req.body;

  const conv = await Conversation.findById(conversationId);
  if (!conv) throw new NotFoundError('Conversation not found');
  if (!conv.participants.some((p) => String(p) === String(req.user._id))) {
    throw new NotFoundError('Conversation not found');
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) throw new NotFoundError('Receiver not found');
  if (receiver.blockedUsers?.includes(req.user._id)) {
    throw new NotFoundError('Receiver not found');
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    receiver: receiverId,
    content,
    replyTo: replyTo || null,
  });

  conv.lastMessage = content;
  conv.lastMessageAt = new Date();
  const unread = (conv.unreadBy?.get(String(receiverId)) || 0) + 1;
  conv.unreadBy.set(String(receiverId), unread);
  await conv.save();

  const populated = await message.populate('sender', 'name username avatar');
  return success(res, { message: populated }, 'Message sent', 201);
});

export const deleteMessage = catchAsync(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) throw new NotFoundError('Message not found');
  if (String(message.sender) !== String(req.user._id)) throw new NotFoundError('Message not found');

  message.deleted = true;
  message.content = 'This message was deleted';
  await message.save();
  return success(res, null, 'Message deleted');
});

export const markRead = catchAsync(async (req, res) => {
  await Message.updateMany(
    { conversation: req.params.conversationId, receiver: req.user._id, status: { $in: ['sent', 'delivered'] } },
    { $set: { status: 'read' } }
  );
  return success(res, null, 'Marked read');
});
