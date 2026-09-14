const tones = {
  green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  red: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  violet: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  slate: 'bg-white/5 text-slate-300 border-white/10',
};

export default function Badge({ children, tone = 'slate', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
