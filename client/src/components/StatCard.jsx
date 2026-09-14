import { motion } from 'framer-motion';
import GlassCard from './ui/GlassCard.jsx';

export default function StatCard({ icon: Icon, label, value, sub, tone = 'violet', onClick }) {
  const tones = {
    violet: 'from-violet-500 to-fuchsia-500',
    cyan: 'from-cyan-400 to-blue-500',
    emerald: 'from-emerald-400 to-teal-500',
    amber: 'from-amber-400 to-orange-500',
    rose: 'from-rose-400 to-pink-500',
  };
  return (
    <motion.div whileHover={onClick ? { y: -4 } : undefined}>
      <GlassCard hover={!!onClick} onClick={onClick} className="cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-white">{value}</p>
            {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${tones[tone]} text-white shadow-lg`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
