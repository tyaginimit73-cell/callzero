import { initials } from '../../utils/format.js';

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
};

export default function Avatar({ name = '', src = '', size = 'md', online = false, className = '' }) {
  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover border border-white/10`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full flex items-center justify-center font-display font-semibold bg-gradient-to-br from-violet-600 to-cyan-500 text-white`}
        >
          {initials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-[#0e1220] ${
            online ? 'bg-emerald-400' : 'bg-slate-600'
          } ${size === 'sm' ? 'h-2.5 w-2.5' : size === 'md' ? 'h-3 w-3' : 'h-3.5 w-3.5'}`}
        />
      )}
    </div>
  );
}
