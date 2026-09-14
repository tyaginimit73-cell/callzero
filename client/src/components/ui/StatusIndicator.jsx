import { motion } from 'framer-motion';

const config = {
  online: { color: 'bg-emerald-400', text: 'Online' },
  offline: { color: 'bg-slate-500', text: 'Offline' },
  away: { color: 'bg-amber-400', text: 'Away' },
  busy: { color: 'bg-rose-400', text: 'Busy' },
};

export default function StatusIndicator({ status = 'offline', showLabel = true, className = '' }) {
  const c = config[status] || config.offline;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <motion.span
        animate={status === 'online' ? { opacity: [1, 0.4, 1] } : undefined}
        transition={{ duration: 2, repeat: Infinity }}
        className={`h-2.5 w-2.5 rounded-full ${c.color}`}
      />
      {showLabel && <span className="text-xs text-slate-400">{c.text}</span>}
    </span>
  );
}
