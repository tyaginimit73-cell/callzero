import Call from '../models/Call.js';
import User from '../models/User.js';

/**
 * WebRTC signaling over Socket.IO.
 *
 * Only control messages (offers, answers, ICE candidates) travel over the
 * socket channel. Actual audio/video is exchanged peer-to-peer over WebRTC.
 */
export function callHandlers(io, socket, onlineUsers) {
  const user = socket.user;

  const isOnline = (userId) => onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;

  socket.on('call:offer', async ({ receiverId, type, sdp, callId }, ack) => {
    try {
      const receiver = await User.findById(receiverId).select('name username avatar blockedUsers isSuspended');
      if (!receiver || receiver.isSuspended) return ack?.({ success: false, code: 'NOT_FOUND' });
      if (receiver.blockedUsers?.includes(user._id)) return ack?.({ success: false, code: 'BLOCKED' });

      let call = callId ? await Call.findById(callId) : null;
      if (!call) {
        call = await Call.create({ caller: user._id, receiver: receiverId, type, status: 'requested' });
      } else {
        call.type = type;
        call.status = 'ringing';
        await call.save();
      }

      if (!isOnline(String(receiverId))) {
        call.status = 'missed';
        call.endReason = 'receiver_offline';
        await call.save();
        return ack?.({ success: false, code: 'OFFLINE', call });
      }

      io.to(`user:${receiverId}`).emit('call:incoming', {
        callId: String(call._id),
        from: { _id: user._id, name: user.name, username: user.username, avatar: user.avatar },
        type,
        sdp,
      });
      ack?.({ success: true, call });
    } catch (err) {
      ack?.({ success: false, message: err.message });
    }
  });

  socket.on('call:answer', async ({ callId, sdp, receiverId }, ack) => {
    const call = await Call.findById(callId);
    if (!call) return ack?.({ success: false, code: 'NOT_FOUND' });
    call.status = 'connected';
    call.startedAt = new Date();
    await call.save();

    io.to(`user:${call.caller}`).emit('call:answer', { callId, sdp });
    ack?.({ success: true });
  });

  socket.on('call:ice-candidate', ({ callId, candidate, to }) => {
    io.to(`user:${to}`).emit('call:ice-candidate', { callId, candidate });
  });

  socket.on('call:decline', async ({ callId }) => {
    const call = await Call.findById(callId);
    if (call) {
      call.status = 'declined';
      call.endReason = 'declined';
      call.endedAt = new Date();
      await call.save();
      io.to(`user:${call.caller}`).emit('call:declined', { callId });
    }
  });

  socket.on('call:reject-busy', async ({ callId }) => {
    const call = await Call.findById(callId);
    if (call) {
      call.status = 'declined';
      call.endReason = 'busy';
      await call.save();
      io.to(`user:${call.caller}`).emit('call:declined', { callId, reason: 'busy' });
    }
  });

  socket.on('call:end', async ({ callId, duration }) => {
    const call = await Call.findById(callId);
    if (call) {
      call.status = call.status === 'connected' ? 'ended' : call.status;
      call.endedAt = new Date();
      call.duration = duration || Math.round((Date.now() - new Date(call.startedAt || Date.now())) / 1000);
      if (call.status === 'ended' && !call.duration) call.duration = 0;
      await call.save();

      const caller = call.caller, receiver = call.receiver;
      io.to(`user:${caller}`).emit('call:end', { callId });
      io.to(`user:${receiver}`).emit('call:end', { callId });
    }
  });

  socket.on('call:timeout', async ({ callId }) => {
    const call = await Call.findById(callId);
    if (call && call.status === 'ringing') {
      call.status = 'missed';
      call.endReason = 'timeout';
      call.endedAt = new Date();
      await call.save();
      io.to(`user:${call.caller}`).emit('call:missed', { callId });
    }
  });
}
