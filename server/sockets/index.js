import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { isAllowedOrigin } from '../config/cors.js';
import User from '../models/User.js';
import Call from '../models/Call.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { callHandlers } from './callHandlers.js';

/** Maps socket.id -> userId and userId -> set of socket ids (multi-tab). */
const onlineUsers = new Map(); // userId -> Set<socketId>

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
      credentials: true,
    },
    // WebRTC signaling payloads (SDP) can be large
    maxHttpBufferSize: 1e6,
  });

  // ---- Auth middleware for socket.io ----
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie?.match(/callzero_token=([^;]+)/)?.[1];
      if (!token) return next(new Error('unauthorized'));
      const payload = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(payload.id).select('+passwordHash');
      if (!user || user.isSuspended) return next(new Error('forbidden'));
      socket.user = user;
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;

    // ---- Register presence ----
    if (!onlineUsers.has(String(user._id))) onlineUsers.set(String(user._id), new Set());
    onlineUsers.get(String(user._id)).add(socket.id);
    socket.join(`user:${user._id}`);

    await User.updateOne({ _id: user._id }, { status: 'online', lastSeen: new Date() });
    io.emit('user:online', { userId: String(user._id) });

    // ---- Chat events ----
    socket.on('message:send', async (payload, ack) => {
      try {
        const { conversationId, receiverId, content, replyTo } = payload;
        const conv = await Conversation.findById(conversationId);
        if (!conv || !conv.participants.some((p) => String(p) === String(user._id))) {
          return ack?.({ success: false, message: 'Invalid conversation' });
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: user._id,
          receiver: receiverId,
          content,
          replyTo: replyTo || null,
        });
        const populated = await message.populate('sender', 'name username avatar');

        conv.lastMessage = content;
        conv.lastMessageAt = new Date();
        const unread = (conv.unreadBy?.get(String(receiverId)) || 0) + 1;
        conv.unreadBy.set(String(receiverId), unread);
        await conv.save();

        io.to(`user:${receiverId}`).emit('message:receive', { message: populated });
        io.to(`user:${user._id}`).emit('message:delivered', { messageId: String(message._id), status: 'delivered' });
        ack?.({ success: true, message });
      } catch (err) {
        ack?.({ success: false, message: err.message });
      }
    });

    socket.on('message:read', async ({ conversationId }) => {
      await Message.updateMany(
        { conversation: conversationId, receiver: user._id, status: { $in: ['sent', 'delivered'] } },
        { $set: { status: 'read' } }
      );
      await Conversation.updateOne({ _id: conversationId }, { $set: { [`unreadBy.${user._id}`]: 0 } });
      io.to(`user:${user._id}`).emit('message:read', { conversationId });
    });

    socket.on('typing:start', ({ conversationId, receiverId }) => {
      io.to(`user:${receiverId}`).emit('typing:start', { conversationId, userId: String(user._id) });
    });
    socket.on('typing:stop', ({ conversationId, receiverId }) => {
      io.to(`user:${receiverId}`).emit('typing:stop', { conversationId, userId: String(user._id) });
    });

    // ---- Call signaling (WebRTC) ----
    callHandlers(io, socket, onlineUsers);

    socket.on('disconnect', async () => {
      const ids = onlineUsers.get(String(user._id));
      if (ids) {
        ids.delete(socket.id);
        if (ids.size === 0) {
          onlineUsers.delete(String(user._id));
          await User.updateOne({ _id: user._id }, { status: 'offline', lastSeen: new Date() });
          io.emit('user:offline', { userId: String(user._id) });
        }
      }
    });
  });

  return io;
}

export { onlineUsers };
