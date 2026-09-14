import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import apiService from '../services/apiService.js';
import GlassCard from '../components/ui/GlassCard.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [status, setStatus] = useState(user?.status || 'online');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await apiService.updateProfile({ ...form, status });
      updateUser(data.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-white">Your Profile</h1>

      <GlassCard className="text-center pt-8">
        <div className="relative mx-auto w-fit">
          <Avatar name={user?.name} src={user?.avatar} size="xl" />
          <button className="absolute -bottom-1 -right-1 rounded-full bg-violet-500 p-2 text-white shadow-lg">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-white">{user?.name}</h2>
        <p className="text-sm text-slate-400">@{user?.username}</p>
        <p className="mt-1 text-xs text-slate-500">{user?.email}</p>
      </GlassCard>

      <GlassCard>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Display name</label>
            <input className="input-dark" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Avatar URL</label>
            <input className="input-dark" placeholder="https://…" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Status</label>
            <div className="grid grid-cols-4 gap-2">
              {['online', 'away', 'busy', 'offline'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`rounded-xl border px-2 py-2 text-xs capitalize transition ${status === s ? 'border-violet-500 bg-violet-500/15 text-violet-200' : 'border-white/10 bg-white/[0.04] text-slate-400'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving} className="btn-primary flex-1">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
            </button>
            <button onClick={handleLogout} className="btn-ghost">Log out</button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
