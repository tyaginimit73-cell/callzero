import { Check, CheckCheck } from 'lucide-react';
import { fullTime } from '../utils/format.js';

export default function MessageBubble({ message, isMine, onReply }) {
  const statusIcon =
    message.status === 'read' ? (
      <CheckCheck className="h-3.5 w-3.5 text-cyan-400" />
    ) : message.status === 'delivered' ? (
      <CheckCheck className="h-3.5 w-3.5 text-slate-500" />
    ) : (
      <Check className="h-3.5 w-3.5 text-slate-500" />
    );

  return (
    <div className={`group flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${
          isMine
            ? 'bg-gradient-to-br from-violet-600/80 to-fuchsia-600/70 text-white rounded-br-md'
            : 'bg-white/[0.06] text-slate-100 border border-white/10 rounded-bl-md'
        }`}
      >
        <div
          className="cursor-pointer select-none"
          onClick={onReply}
          title={fullTime(message.createdAt)}
        >
          {message.content}
        </div>
        <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isMine ? 'text-white/70' : 'text-slate-500'}`}>
          {fullTime(message.createdAt)}
          {isMine && statusIcon}
        </div>
      </div>
    </div>
  );
}
