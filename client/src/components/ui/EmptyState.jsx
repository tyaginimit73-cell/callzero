import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-16 px-6"
    >
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.05] border border-white/10">
          <Icon className="h-8 w-8 text-slate-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-slate-400">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
