import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Phone,
  Video,
  MessageCircle,
  Wifi,
  ShieldCheck,
  Users,
  Gauge,
  Lock,
  Radio,
  CheckCircle2,
  XCircle,
  Activity,
  Sparkles,
} from 'lucide-react';
import { useCapabilities } from '../hooks/useCapabilities.js';
import GlassCard from '../components/ui/GlassCard.jsx';

function DashboardMock() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-600/30 to-cyan-500/20 blur-2xl" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-strong relative rounded-3xl p-6"
      >
        {/* status row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-sm text-slate-300">Connection live</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-300 border border-violet-500/30">
            <Lock className="h-3 w-3" /> Secured
          </span>
        </div>

        {/* live call card */}
        <div className="mt-5 rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 border border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Live call</p>
              <p className="text-xs text-slate-400">with Alice · 03:24</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {['You', 'Alice'].map((n) => (
              <div key={n} className="flex-1 rounded-xl bg-black/30 border border-white/10 p-3 text-center">
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white">
                  {n[0]}
                </div>
                <p className="text-xs text-slate-400">{n}</p>
              </div>
            ))}
          </div>
        </div>

        {/* recent contacts */}
        <div className="mt-5">
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">Recent contacts</p>
          <div className="flex gap-3">
            {['Mom', 'Bro', 'Sam'].map((n, i) => (
              <div key={n} className="flex flex-col items-center gap-1.5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white bg-gradient-to-br ${i === 0 ? 'from-rose-400 to-pink-500' : i === 1 ? 'from-cyan-400 to-blue-500' : 'from-amber-400 to-orange-500'}`}>
                  {n[0]}
                </div>
                <span className="text-[10px] text-slate-400">{n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* network */}
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/[0.04] p-3 text-sm">
          <span className="inline-flex items-center gap-2 text-slate-300">
            <Wifi className="h-4 w-4 text-emerald-400" /> 4G · 23ms
          </span>
          <span className="inline-flex items-center gap-2 text-slate-300">
            <ShieldCheck className="h-4 w-4 text-cyan-400" /> End-to-end
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function EngineDemo() {
  const { cap, checking } = useCapabilities();
  const items = [
    { label: 'Internet Voice Call', avail: cap?.online && cap?.webRTC && cap?.microphone?.available },
    { label: 'Internet Video Call', avail: cap?.online && cap?.webRTC && cap?.microphone?.available && cap?.camera?.available },
    { label: 'Internet Messaging', avail: cap?.online },
  ];
  return (
    <div className="glass rounded-3xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <Radio className="h-5 w-5 text-violet-400" />
        <h3 className="font-display text-lg font-semibold text-white">Smart Connection Engine</h3>
      </div>
      <p className="mb-4 text-sm text-slate-400">Live capability check on this device:</p>
      <div className="mb-4 rounded-2xl bg-black/30 border border-white/10 p-4 font-mono text-xs text-slate-300 space-y-1">
        <p><span className="text-slate-500">Internet:</span> {checking ? 'checking…' : cap?.online ? 'Connected' : 'Offline'}</p>
        <p><span className="text-slate-500">WebRTC:</span> {cap?.webRTC ? 'Supported' : 'Not supported'}</p>
        <p><span className="text-slate-500">Microphone:</span> {cap?.microphone?.available ? 'Available' : 'Unavailable'}</p>
        <p><span className="text-slate-500">Camera:</span> {cap?.camera?.available ? 'Available' : 'Unavailable'}</p>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">Available</p>
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.label} className={`flex items-center gap-2 text-sm ${i.avail ? 'text-emerald-300' : 'text-slate-600 line-through'}`}>
            <CheckCircle2 className="h-4 w-4" /> {i.label}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2">Not available on this website</p>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-600"><XCircle className="h-4 w-4" /> Traditional cellular calling (needs carrier service)</div>
        <div className="flex items-center gap-2 text-sm text-slate-600"><XCircle className="h-4 w-4" /> Official emergency-service calling</div>
      </div>
    </div>
  );
}

const features = [
  { icon: Phone, title: 'Internet Voice Calls', desc: 'Browser-to-browser WebRTC calls over Wi-Fi or mobile data. No balance needed — just internet.' },
  { icon: Video, title: 'Video Calls', desc: 'HD video calling with screen share, camera control and live connection quality.' },
  { icon: MessageCircle, title: 'Real-time Messaging', desc: 'Instant chat with read receipts, typing indicators and online presence.' },
  { icon: Users, title: 'Contacts & Presence', desc: 'Friends, favorites, emergency contacts and live online status.' },
  { icon: Gauge, title: 'Network Diagnostics', desc: 'See what your connection can actually do with a transparent capability check.' },
  { icon: ShieldCheck, title: 'Security First', desc: 'JWT auth, hashed passwords, rate limiting, and secure transport throughout.' },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-aurora">
      <div className="pointer-events-none absolute inset-0 grid-overlay" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">
            Call<span className="gradient-text">Zero</span>
          </span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-slate-400 sm:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#security" className="hover:text-white">Security</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-slate-300 hover:text-white">Log in</Link>
          <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-5 pt-10 pb-20 lg:grid-cols-2 lg:pt-16">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs text-violet-300"
          >
            <Sparkles className="h-3.5 w-3.5" /> Internet-based communication
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 font-display text-4xl font-bold leading-[1.1] text-white sm:text-6xl"
          >
            No Recharge.
            <br />
            <span className="gradient-text">Still Connected.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 max-w-lg text-lg text-slate-400"
          >
            Connect with people through secure internet-based calling and messaging when
            traditional mobile balance isn't available.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Link to="/register" className="btn-primary !px-6 !py-3.5 text-base">
              <Phone className="h-5 w-5" /> Start Calling
            </Link>
            <Link to="/network-test" className="btn-ghost !px-6 !py-3.5 text-base">
              <Gauge className="h-5 w-5" /> Try Demo
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-xs text-slate-500"
          >
            Works over Wi-Fi & mobile data. Honest about what it can and can't do — no fake cellular calls.
          </motion.p>
        </div>

        <div className="animate-float">
          <DashboardMock />
        </div>
      </section>

      {/* Engine demo strip */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <EngineDemo />
          <GlassCard>
            <h3 className="mb-4 font-display text-lg font-semibold text-white">What it really does</h3>
            <div className="space-y-4 text-sm">
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
                <p className="font-medium text-white">Cellular calling</p>
                <p className="mt-1 text-slate-400">Requires appropriate carrier or network service. CallZero doesn't bypass it.</p>
              </div>
              <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4">
                <p className="font-medium text-emerald-300">Internet calling</p>
                <p className="mt-1 text-slate-400">Works over Wi-Fi or mobile data using WebRTC — no recharge needed, just internet.</p>
              </div>
              <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4">
                <p className="font-medium text-amber-300">Emergency calling</p>
                <p className="mt-1 text-slate-400">Always use your country's official emergency number. This web app can't replace it.</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Everything you need to <span className="gradient-text">stay connected</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            A complete communication suite that works when you're out of balance.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <GlassCard hover className="h-full">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20 border border-white/10">
                  <f.icon className="h-6 w-6 text-violet-300" />
                </div>
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="relative z-10 mx-auto max-w-6xl px-5 pb-20">
        <GlassCard className="text-center p-10">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Start free. <span className="gradient-text">Stay connected.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Basic internet calling, video and messaging are always free. Premium plans add
            convenience — never gate the core experience behind payment.
          </p>
          <Link to="/register" className="btn-primary mt-6">
            Explore plans <ArrowRight className="h-4 w-4" />
          </Link>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-xs text-slate-500">
        <p>CallZero — an internet communication platform. It does not replace official emergency services.</p>
        <p className="mt-1">© {new Date().getFullYear()} CallZero. Built with WebRTC, Node.js & MongoDB.</p>
      </footer>
    </div>
  );
}
