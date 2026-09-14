import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hover = false,
  ...props
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      className={`glass rounded-3xl p-5 ${hover ? 'card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
