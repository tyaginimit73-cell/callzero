import { motion } from 'framer-motion';
import { Phone, Video } from 'lucide-react';

export function VoiceButton({ onClick, size = 'md', disabled }) {
  const sz = size === 'lg' ? 'h-14 w-14' : 'h-10 w-10';
  const ic = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled}
      onClick={onClick}
      className={`${sz} inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-[0_0_30px_-10px_rgba(16,185,129,0.7)] transition hover:brightness-110 disabled:opacity-40`}
      title="Voice call"
    >
      <Phone className={ic} />
    </motion.button>
  );
}

export function VideoButton({ onClick, size = 'md', disabled }) {
  const sz = size === 'lg' ? 'h-14 w-14' : 'h-10 w-10';
  const ic = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled}
      onClick={onClick}
      className={`${sz} inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_0_30px_-10px_rgba(139,92,246,0.7)] transition hover:brightness-110 disabled:opacity-40`}
      title="Video call"
    >
      <Video className={ic} />
    </motion.button>
  );
}
