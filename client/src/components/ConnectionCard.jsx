import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const Row = ({ label, ok, checking }) => (
  <div className="flex items-center justify-between py-2.5">
    <span className="text-sm text-slate-300">{label}</span>
    {checking ? (
      <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
    ) : ok ? (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
        <CheckCircle2 className="h-4 w-4" /> Yes
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-400">
        <XCircle className="h-4 w-4" /> No
      </span>
    )}
  </div>
);

export default function ConnectionCard({ cap, checking = false }) {
  return (
    <div className="glass rounded-3xl p-5">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-slate-400">
        Connection Status
      </h3>
      <div className="divide-y divide-white/5">
        <Row label="Internet" ok={cap?.online} checking={checking} />
        <Row label="WebRTC" ok={cap?.webRTC} checking={checking} />
        <Row label="Microphone" ok={cap?.microphone?.available} checking={checking} />
        <Row label="Camera" ok={cap?.camera?.available} checking={checking} />
        <Row label="Media Devices API" ok={cap?.mediaSupported} checking={checking} />
      </div>
      {cap?.network && (
        <div className="mt-3 rounded-2xl bg-white/[0.04] p-3 text-xs text-slate-400">
          <span className="text-slate-500">Network:</span> {cap.network.label}
          {cap.network.rtt != null && ` · RTT ${cap.network.rtt}ms`}
          {cap.network.downlink != null && ` · ${cap.network.downlink} Mbps`}
        </div>
      )}
    </div>
  );
}
