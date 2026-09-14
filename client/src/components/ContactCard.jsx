import { motion } from 'framer-motion';
import { Phone, Video, MessageCircle, Star } from 'lucide-react';
import Avatar from './ui/Avatar.jsx';
import StatusIndicator from './ui/StatusIndicator.jsx';
import { lastSeen } from '../utils/format.js';

export default function ContactCard({ contact, onCall, onVideoCall, onMessage, actions }) {
  const c = contact.user;
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="glass rounded-3xl p-4 flex items-center gap-3 card-hover"
    >
      <Avatar name={c.name} src={c.avatar} size="md" online={c.status === 'online'} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-medium text-white">{contact.nickname || c.name}</p>
          {contact.favorite && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
        </div>
        <p className="text-xs text-slate-500">@{c.username}</p>
        <StatusIndicator status={c.status} showLabel={false} />
        <span className="ml-1 text-xs text-slate-500">{lastSeen(c.lastSeen, c.status)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {actions}
        {onCall && (
          <button onClick={() => onCall(c)} title="Voice call" className="rounded-xl bg-emerald-500/15 p-2.5 text-emerald-400 transition hover:bg-emerald-500/25">
            <Phone className="h-4 w-4" />
          </button>
        )}
        {onVideoCall && (
          <button onClick={() => onVideoCall(c)} title="Video call" className="rounded-xl bg-violet-500/15 p-2.5 text-violet-400 transition hover:bg-violet-500/25">
            <Video className="h-4 w-4" />
          </button>
        )}
        {onMessage && (
          <button onClick={() => onMessage(c)} title="Message" className="rounded-xl bg-cyan-500/15 p-2.5 text-cyan-400 transition hover:bg-cyan-500/25">
            <MessageCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
