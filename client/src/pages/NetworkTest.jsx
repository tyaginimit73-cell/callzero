import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wifi,
  Globe,
  MonitorSmartphone,
  Radio,
  Mic,
  Camera,
  Activity,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';
import { useCapabilities } from '../hooks/useCapabilities.js';
import GlassCard from '../components/ui/GlassCard.jsx';
import Badge from '../components/ui/Badge.jsx';

function Row({ icon: Icon, label, value, ok }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${ok === undefined ? 'bg-white/[0.05]' : ok ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
        <Icon className={`h-5 w-5 ${ok === undefined ? 'text-slate-400' : ok ? 'text-emerald-400' : 'text-rose-400'}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-slate-500">{value}</p>
      </div>
      {ok !== undefined && (ok ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-rose-400" />)}
    </div>
  );
}

export default function NetworkTest() {
  const { cap, checking, run } = useCapabilities();
  const [browser, setBrowser] = useState('Unknown');
  const [os, setOs] = useState('Unknown');

  useEffect(() => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) setBrowser('Chrome');
    else if (ua.includes('Firefox')) setBrowser('Firefox');
    else if (ua.includes('Safari')) setBrowser('Safari');
    else if (ua.includes('Edg')) setBrowser('Edge');
    else setBrowser('Unknown');

    if (ua.includes('Windows')) setOs('Windows');
    else if (ua.includes('Mac')) setOs('macOS');
    else if (ua.includes('Android')) setOs('Android');
    else if (ua.includes('iPhone') || ua.includes('iPad')) setOs('iOS');
    else if (ua.includes('Linux')) setOs('Linux');
    else setOs('Unknown');
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Network & Device Check</h1>
          <p className="mt-1 text-sm text-slate-400">Diagnose what your connection can legitimately do.</p>
        </div>
        <button onClick={run} className="btn-ghost !px-4 !py-2 text-sm" disabled={checking}>
          <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} /> Re-check
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-slate-400">Device & Browser</h3>
          <div className="divide-y divide-white/5">
            <Row icon={MonitorSmartphone} label="Browser" value={browser} />
            <Row icon={Globe} label="Operating system" value={os} />
            <Row icon={Wifi} label="Online status" value={cap?.online ? 'Online' : 'Offline'} ok={cap?.online} />
            <Row icon={Radio} label="WebRTC support" value={cap?.webRTC ? 'Supported' : 'Not supported'} ok={cap?.webRTC} />
            <Row icon={Mic} label="Microphone" value={cap?.microphone?.permission} ok={cap?.microphone?.available} />
            <Row icon={Camera} label="Camera" value={cap?.camera?.permission} ok={cap?.camera?.available} />
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-slate-400">Connection Quality</h3>
          {cap?.network ? (
            <>
              <div className="rounded-2xl bg-white/[0.04] p-4 text-center">
                <p className="font-display text-4xl font-bold text-white">{cap.network.label}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {cap.network.rtt != null && `RTT ${cap.network.rtt} ms`}
                  {cap.network.downlink != null && ` · Downlink ${cap.network.downlink} Mbps`}
                  {cap.network.saveData && ' · Data saver on'}
                </p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.04] p-3 text-center">
                  <Activity className="mx-auto h-5 w-5 text-cyan-400" />
                  <p className="mt-1 text-xs text-slate-500">Latency</p>
                  <p className="text-sm font-medium text-white">{cap.network.rtt ?? '—'} ms</p>
                </div>
                <div className="rounded-2xl bg-white/[0.04] p-3 text-center">
                  <Wifi className="mx-auto h-5 w-5 text-emerald-400" />
                  <p className="mt-1 text-xs text-slate-500">Speed</p>
                  <p className="text-sm font-medium text-white">{cap.network.downlink ?? '—'} Mbps</p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-white/[0.04] p-6 text-center text-sm text-slate-400">
              Connection API not exposed by this browser.
            </div>
          )}
          <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-xs text-cyan-200">
            <Info className="mb-1 h-4 w-4" />
            This page only reads information the browser exposes publicly (online state, connection type,
            media permission). CallZero never collects unnecessary personal or device data and never tracks you.
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-slate-400">Available methods</h3>
        <div className="flex flex-wrap gap-2">
          {(cap?.available || []).map((a) => <Badge key={a} tone="green"><CheckCircle2 className="h-3 w-3" /> {a}</Badge>)}
          {(cap?.unavailable || []).map((a) => <Badge key={a} tone="red"><XCircle className="h-3 w-3" /> {a}</Badge>)}
        </div>
      </GlassCard>
    </div>
  );
}
