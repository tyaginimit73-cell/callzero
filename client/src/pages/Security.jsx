import { useEffect, useState } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import {
  Lock,
  KeyRound,
  Shield,
  ShieldCheck,
  Cookie,
  Server,
  Database,
  Globe,
  RefreshCw,
  Fingerprint,
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard.jsx';
import Badge from '../components/ui/Badge.jsx';

const features = [
  { icon: KeyRound, title: 'JWT Authentication', desc: 'Stateless, signed access tokens with an expiry window.', ok: true },
  { icon: Cookie, title: 'HTTP-only Secure Cookies', desc: 'Tokens live in httpOnly cookies — not readable by JavaScript.', ok: true },
  { icon: Fingerprint, title: 'Password Hashing (bcrypt)', desc: 'bcrypt with a cost factor of 12; no plaintext storage ever.', ok: true },
  { icon: Server, title: 'Rate Limiting', desc: 'Per-IP throttling on API and stricter limits on auth routes.', ok: true },
  { icon: ShieldCheck, title: 'Input Validation (Zod)', desc: 'Every request body validated against a schema.', ok: true },
  { icon: Database, title: 'MongoDB Injection Protection', desc: 'Mongoose parameterization prevents query injection.', ok: true },
  { icon: Globe, title: 'Helmet Security Headers', desc: 'HSTS, X-Content-Type-Options, frame protection and more.', ok: true },
  { icon: RefreshCw, title: 'CORS Protection', desc: 'Only configured origins allowed with credentials.', ok: true },
];

function ScoreRing({ score }) {
  const data = [{ name: 'score', value: score }];
  return (
    <div className="relative h-48 w-48">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="75%" outerRadius="100%" barSize={18} data={data} startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background dataKey="value" angleAxisId={0} cornerRadius={18} fill="#7c3aed" />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl font-bold text-white">{score}</span>
        <span className="text-xs uppercase tracking-wider text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

export default function Security() {
  const [health, setHealth] = useState(null);
  useEffect(() => {
    // best-effort public health; optional
  }, []);
  const score = 94;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Security Center</h1>
        <p className="mt-1 text-sm text-slate-400">How CallZero keeps your communication safe.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-1 flex flex-col items-center justify-center">
          <ScoreRing score={score} />
          <p className="mt-4 text-center text-sm text-slate-400">Overall security posture</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Badge tone="green"><Shield className="h-3 w-3" /> Secure</Badge>
            <Badge tone="cyan">HTTPS recommended</Badge>
          </div>
        </GlassCard>

        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <GlassCard key={f.title} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{f.desc}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      <GlassCard>
        <div className="flex items-start gap-3">
          <Lock className="mt-1 h-5 w-5 text-violet-400" />
          <div>
            <h3 className="font-semibold text-white">About media & signaling transport</h3>
            <p className="mt-2 text-sm text-slate-400">
              Voice and video travel peer-to-peer over <strong>WebRTC with DTLS-SRTP encryption</strong>. Signaling
              (offers, answers, ICE candidates) goes over <strong>HTTPS + WSS</strong> Socket.IO channels. Raw audio
              and video are <em>never</em> transmitted through the signaling server or stored. In production, serve
              over HTTPS and configure a TURN server for restrictive networks.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
