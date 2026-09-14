import { useState } from 'react';
import { Bell, Shield, Lock, Palette, Globe, Smartphone, Volume2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import apiService from '../services/apiService.js';
import GlassCard from '../components/ui/GlassCard.jsx';
import { useNavigate } from 'react-router-dom';

function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} className={`relative h-6 w-11 rounded-full transition ${on ? 'bg-violet-500' : 'bg-white/10'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

const groups = [
  {
    title: 'Notifications',
    icon: Bell,
    items: [
      { label: 'Call alerts', key: 'calls', def: true },
      { label: 'Message previews', key: 'previews', def: true },
      { label: 'Contact request alerts', key: 'requests', def: true },
    ],
  },
  {
    title: 'Privacy',
    icon: Shield,
    items: [
      { label: 'Show online status', key: 'presence', def: true },
      { label: 'Show last seen', key: 'lastseen', def: true },
      { label: 'Read receipts', key: 'readreceipts', def: true },
    ],
  },
];

export default function Settings() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(
    Object.fromEntries(groups.flatMap((g) => g.items.map((i) => [i.key, i.def])))
  );
  const [plan, setPlan] = useState('free');
  const [showPassword, setShowPassword] = useState(false);

  const changePref = (k) => {
    setPrefs((p) => ({ ...p, [k]: !p[k] }));
    toast.success('Preference saved');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Personalize your CallZero experience.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Preferences */}
        <div className="lg:col-span-2 space-y-5">
          {groups.map((g) => (
            <GlassCard key={g.title}>
              <div className="mb-4 flex items-center gap-2">
                <g.icon className="h-5 w-5 text-violet-400" />
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-400">{g.title}</h3>
              </div>
              <div className="divide-y divide-white/5">
                {g.items.map((i) => (
                  <div key={i.key} className="flex items-center justify-between py-3">
                    <span className="text-sm text-slate-200">{i.label}</span>
                    <Toggle on={prefs[i.key]} onClick={() => changePref(i.key)} />
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}

          <GlassCard>
            <div className="mb-4 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-violet-400" />
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-400">Account</h3>
            </div>
            <div className="space-y-3">
              <button onClick={() => navigate('/profile')} className="flex w-full items-center justify-between rounded-2xl bg-white/[0.04] p-4 text-left hover:bg-white/[0.07]">
                <div>
                  <p className="text-sm text-white">Edit profile</p>
                  <p className="text-xs text-slate-500">Name, avatar, status</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>
              <button onClick={() => navigate('/pricing')} className="flex w-full items-center justify-between rounded-2xl bg-white/[0.04] p-4 text-left hover:bg-white/[0.07]">
                <div>
                  <p className="text-sm text-white">Subscription</p>
                  <p className="text-xs text-slate-500">Current plan: {plan}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>
              <button onClick={() => setShowPassword((s) => !s)} className="flex w-full items-center justify-between rounded-2xl bg-white/[0.04] p-4 text-left hover:bg-white/[0.07]">
                <div>
                  <p className="text-sm text-white">Security</p>
                  <p className="text-xs text-slate-500">View security center</p>
                </div>
                {showPassword ? 'Now' : 'Later'}
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Side card */}
        <div className="space-y-5">
          <GlassCard className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400">
              <Globe className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-semibold text-white">Account plan</h3>
            <p className="mt-1 text-sm text-slate-400">Free tier — all core features</p>
            <button onClick={() => navigate('/pricing')} className="btn-primary mt-4 w-full">Upgrade</button>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="h-5 w-5 text-violet-400" />
              <h3 className="text-sm font-semibold text-white">Support</h3>
            </div>
            <p className="text-xs text-slate-400">Need help? Reach out — we're here for you.</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
