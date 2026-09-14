import { motion } from 'framer-motion';

export default function LoadingScreen({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#07090f]">
      <div className="relative h-16 w-16">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-violet-500/30 border-t-violet-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-cyan-400/30 border-b-cyan-400"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400" />
        </div>
      </div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-sm text-slate-400"
      >
        {label}
      </motion.p>
    </div>
  );
}
