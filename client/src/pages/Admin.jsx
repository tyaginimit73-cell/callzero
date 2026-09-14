import { useEffect, useState } from 'react';
import {
  Users, Activity, Phone, MessageCircle, AlertTriangle, Ban, HeartPulse,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { useToast } from '../context/ToastContext.jsx';
import apiService from '../services/apiService.js';
import StatCard from '../components/StatCard.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import Badge from '../components/ui/Badge.jsx';

const dailyData = [
  { day: 'Mon', users: 45, calls: 120, msgs: 680 },
  { day: 'Tue', users: 52, calls: 150, msgs: 740 },
  { day: 'Wed', users: 61, calls: 135, msgs: 810 },
  { day: 'Thu', users: 58, calls: 170, msgs: 760 },
  { day: 'Fri', users: 72, calls: 190, msgs: 900 },
  { day: 'Sat', users: 80, calls: 210, msgs: 1020 },
  { day: 'Sun', users: 88, calls: 240, msgs: 1150 },
];

export default function Admin() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [health, setHealth] = useState(null);

  const load = () => {
    apiService.getStats().then((d) => setStats(d.data.stats)).catch(() => toast.error('Failed to load stats'));
    apiService.getAdminUsers().then((d) => setUsers(d.data.users)).catch(() => {});
    apiService.getHealth().then((d) => setHealth(d.data.health)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const toggleSuspend = async (u) => {
    try {
      if (u.isSuspended) await apiService.unsuspendUser(u._id);
      else await apiService.suspendUser(u._id);
      toast.success(`Account ${u.isSuspended ? 'unsuspended' : 'suspended'}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const s = stats;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Platform health, usage and user management.</p>
        </div>
        <Badge tone="violet"><HeartPulse className="h-3 w-3" /> Server online</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={s?.totalUsers ?? '—'} sub={`${s?.usersToday ?? 0} today`} tone="violet" />
        <StatCard icon={Activity} label="Active now" value={s?.activeUsers ?? '—'} tone="emerald" />
        <StatCard icon={Phone} label="Total calls" value={s?.totalCalls ?? '—'} sub={`${s?.callsToday ?? 0} today`} tone="cyan" />
        <StatCard icon={MessageCircle} label="Messages" value={s?.totalMessages ?? '—'} sub={`${s?.messagesToday ?? 0} today`} tone="amber" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={AlertTriangle} label="Failed calls" value={s?.failedCalls ?? '—'} sub={`${s?.failureRate ?? 0}% failure`} tone="rose" />
        <StatCard icon={Ban} label="Blocked accounts" value={s?.blockedAccounts ?? '—'} tone="rose" />
        <StatCard icon={Activity} label="WebSocket live" value={s?.activeUsers ?? '—'} tone="cyan" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-slate-400">Users & Messages per day</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} /><stop offset="100%" stopColor="#7c3aed" stopOpacity={0} /></linearGradient>
                <linearGradient id="gm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} /><stop offset="100%" stopColor="#22d3ee" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="day" stroke="#ffffff50" fontSize={11} />
              <YAxis stroke="#ffffff50" fontSize={11} />
              <Tooltip contentStyle={{ background: '#151a2e', border: '1px solid #ffffff20', borderRadius: 12, color: '#fff' }} />
              <Area type="monotone" dataKey="users" stroke="#7c3aed" fill="url(#gu)" />
              <Area type="monotone" dataKey="msgs" stroke="#22d3ee" fill="url(#gm)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-slate-400">Calls per day</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ec4899" stopOpacity={0.4} /><stop offset="100%" stopColor="#ec4899" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="day" stroke="#ffffff50" fontSize={11} />
              <YAxis stroke="#ffffff50" fontSize={11} />
              <Tooltip contentStyle={{ background: '#151a2e', border: '1px solid #ffffff20', borderRadius: 12, color: '#fff' }} />
              <Area type="monotone" dataKey="calls" stroke="#ec4899" fill="url(#gc)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* System health */}
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Uptime</p>
          <p className="mt-1 font-display text-lg font-semibold text-white">{Math.floor((health?.uptime || 0) / 60)} min</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Memory (RSS)</p>
          <p className="mt-1 font-display text-lg font-semibold text-white">{Math.round((health?.memory?.rss || 0) / 1024 / 1024)} MB</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Node</p>
          <p className="mt-1 font-display text-lg font-semibold text-white">{health?.nodeVersion || '—'}</p>
        </GlassCard>
      </div>

      {/* User management */}
      <GlassCard>
        <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-slate-400">User management</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                <th className="pb-2 pr-4">User</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Plan</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-white/5">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-white">{u.name}</p>
                    <p className="text-xs text-slate-500">@{u.username} · {u.email}</p>
                  </td>
                  <td className="py-3 pr-4">{u.role === 'admin' ? <Badge tone="violet">Admin</Badge> : <Badge tone="slate">User</Badge>}</td>
                  <td className="py-3 pr-4">
                    {u.isSuspended ? <Badge tone="red">Suspended</Badge> : u.status === 'online' ? <Badge tone="green">Online</Badge> : <Badge tone="slate">Offline</Badge>}
                  </td>
                  <td className="py-3 pr-4 text-slate-400 capitalize">{u.plan}</td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleSuspend(u)}
                      disabled={u.role === 'admin'}
                      className="rounded-lg bg-rose-500/15 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/25 disabled:opacity-30"
                    >
                      {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
