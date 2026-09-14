import { motion } from 'framer-motion';

const variants = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  danger: 'inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500/90 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_40px_-12px_rgba(244,63,94,0.6)] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
  success: 'inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/90 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50',
  outline: 'inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-500/40 bg-violet-500/10 px-5 py-3 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20 active:scale-[0.98] disabled:opacity-50',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  icon: Icon,
  ...props
}) {
  const cls = `${variants[variant]} ${className}`;
  if (props.as === 'link') {
    return (
      <motion.a
        whileTap={{ scale: 0.97 }}
        className={cls}
        {...props}
        href={props.to}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button whileTap={{ scale: 0.97 }} className={cls} {...props}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </motion.button>
  );
}
