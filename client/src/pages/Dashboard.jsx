import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Phone,
  Video,
  MessageCircle,
  Users,
  Siren,
  PhoneCall,
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import apiService from '../services/apiService.js';
import ConnectionCard from '../components/ConnectionCard.jsx';
import StatCard from '../components/StatCard.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useCapabilities } from '../hooks/useCapabilities.js';
import { timeAgo } from '../utils/format.js';

const quickActions = [
  { to: '/call', label: 'Voice Call', icon: Phone, tone: 'emerald' },
  { to: '/video-call', label: 'Video Call', icon: Video, tone: 'violet' },
  { to: '/messages', label: 'Messages', icon: MessageCircle, tone: 'cyan' },
  { to: '/contacts', label: 'Contacts', icon: Users, tone: 'amber' },
  { to: '/emergency', label: 'Emergency', icon: Siren, tone: 'rose' },
];

function CallRow({ call, user }) {
  const peer = call.peer;
  const icon =
    call.direction === 'incoming' && call.missed ? (
      <PhoneMissed className="h-4 w-4 text-rose-400" />
    ) : call.direction === 'incoming' ? (
      <PhoneIncoming className="h-4 w-4 text-cyan-400" />
    ) : (
      <PhoneOutgoing className="h-4 w-4 text-violet-400" />
    );
  return (
    <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-white/[0.04]">
      <Avatar name={peer?.name} src={peer?.avatar} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-white">{peer?.name}</p>
        <p className="text-xs text-slate-500">
          {call.direction === 'incoming' ? 'Incoming' : 'Outgoing'} · {call.type} · {call.status}
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        {icon}
        <span>{call.duration ? `${Math.round(call.duration / 60)}m` : timeAgo(call.createdAt)}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const { cap, checking } = useCapabilities();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService
      .getCallHistory()
      .then((d) => setCalls(d.data.calls))
      .finally(() => setLoading(false));
  }, []);

  const outgoing = calls.filter((c) => c.direction === 'outgoing' && c.status === 'ended').length;
  const missed = calls.filter((c) => c.missed).length;
  const incoming = calls.filter((c) => c.direction === 'incoming' && !c.missed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-2xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </motion.h1>
          <p className="mt-1 text-sm text-slate-400">You're connected and ready to reach out.</p>
        </div>
        <Avatar name={user?.name} src={user?.avatar} size="lg" online={user?.status === 'online'} className="hidden sm:block" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={PhoneCall} label="Outgoing" value={outgoing} tone="violet" />
        <StatCard icon={PhoneIncoming} label="Incoming" value={incoming} tone="cyan" />
        <StatCard icon={PhoneMissed} label="Missed" value={missed} tone="rose" />
        <StatCard icon={Users} label="Online friends" value={onlineUsers.size} tone="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <GlassCard>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-slate-400">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
            {quickActions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group flex flex-col items-center gap-2 rounded-2xl bg-white/[0.04] border border-white/10 p-4 text-center transition hover:border-violet-500/40 hover:bg-white/[0.07]"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/40 to-cyan-500/20`}>
                  <a.icon className="h-5 w-5 text-violet-200" />
                </div>
                <span className="text-xs text-slate-300">{a.label}</span>
              </Link>
            ))}
          </div>
        </GlassCard>

        {/* Connection */}
        <ConnectionCard cap={cap} checking={checking} />

        {/* Availability summary */}
        <GlassCard>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-slate-400">Available now</h3>
          <div className="space-y-3">
            {(cap?.available || []).map((a) => (
              <div key={a} className="flex items-center gap-2 text-sm text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {a}
              </div>
            ))}
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="text-xs text-slate-500">
                Cellular calling requires carrier service and is not provided by this website.
              </p>
              <Link to="/network-test" className="mt-3 inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
                Run network test <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent activity */}
      <GlassCard>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-400">Recent Activity</h3>
          <Link to="/contacts" className="text-xs text-violet-400 hover:text-violet-300">View contacts</Link>
        </div>
        {loading ? (
          <p className="py-6 text-center text-sm text-slate-500">Loading activity…</p>
        ) : calls.length === 0 ? (
          <EmptyState icon={Phone} title="No calls yet" subtitle="Reach out to a contact to start your first call." />
        ) : (
          <div className="divide-y divide-white/5">
            {calls.slice(0, 6).map((c) => (
              <CallRow key={c._id} call={c} user={user} />
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
