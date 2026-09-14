import { AnimatePresence, motion } from 'framer-motion';
import { Phone, Video, PhoneOff } from 'lucide-react';
import { useSocket } from '../context/SocketContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Avatar from './ui/Avatar.jsx';

export default function IncomingCallOverlay() {
  const { incomingCall, clearIncomingCall, socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!incomingCall) return;
    const t = setTimeout(() => {
      socket?.emit('call:timeout', { callId: incomingCall.callId });
      clearIncomingCall();
    }, 30000);
    return () => clearTimeout(t);
  }, [incomingCall, socket, clearIncomingCall]);

  const decline = () => {
    socket?.emit('call:decline', { callId: incomingCall?.callId });
    clearIncomingCall();
  };

  const accept = () => {
    const type = incomingCall.type;
    clearIncomingCall();
    navigate(`/${type === 'video' ? 'video-call' : 'call'}?accept=1&callId=${incomingCall.callId}`);
  };

  return (
    <AnimatePresence>
      {incomingCall && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="glass-strong relative w-full max-w-sm rounded-3xl p-8 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="mx-auto mb-4 w-fit"
            >
              <Avatar name={incomingCall.from?.name} src={incomingCall.from?.avatar} size="xl" />
            </motion.div>
            <h2 className="font-display text-2xl font-semibold text-white">{incomingCall.from?.name}</h2>
            <p className="text-slate-400">@{incomingCall.from?.username}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-cyan-300">
              {incomingCall.type === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
              Incoming {incomingCall.type} call
            </p>
            <div className="mt-6 flex items-center justify-center gap-6">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={decline}
                className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-rose-500 text-white shadow-lg"
              >
                <PhoneOff className="h-6 w-6 rotate-[135deg]" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={accept}
                className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg"
              >
                <Phone className="h-6 w-6" />
              </motion.button>
            </div>
            <div className="mt-4 flex justify-center gap-4 text-xs text-slate-400">
              <span>Decline</span>
              <span>Accept</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
