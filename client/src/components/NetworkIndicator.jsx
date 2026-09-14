import { Wifi, WifiOff } from 'lucide-react';

export default function NetworkIndicator({ online, label }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border ${
        online
          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
      }`}
    >
      {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      {label || (online ? 'Online' : 'Offline')}
    </span>
  );
}
