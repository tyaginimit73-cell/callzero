import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  Maximize2,
  Minimize2,
  Signal,
} from 'lucide-react';
import { useWebRTC, CallStatus } from '../hooks/useWebRTC.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './ui/Avatar.jsx';
import { formatDuration } from '../utils/format.js';

const qualityMeta = {
  good: { color: 'text-emerald-400', bars: 3, label: 'Excellent' },
  fair: { color: 'text-amber-400', bars: 2, label: 'Fair' },
  poor: { color: 'text-rose-400', bars: 1, label: 'Poor' },
};

function Quality({ level }) {
  const q = qualityMeta[level] || qualityMeta.good;
  return (
    <div className="flex items-center gap-1.5">
      <Signal className={`h-4 w-4 ${q.color}`} />
      <span className={`text-xs ${q.color}`}>{q.label}</span>
    </div>
  );
}

export default function CallScreen({ mode }) {
  const isVideo = mode === 'video';
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { socket } = useSocket();
  const { user } = useAuth();

  const autoAccept = params.get('accept') === '1';

  const call = useWebRTC({ mode, autoAccept });
  const {
    status, peer, localStream, remoteStream, muted, camOff, sharing,
    elapsed, quality, startCall, acceptIncoming, endCall, toggleMute, toggleCamera, toggleScreenShare,
  } = call;

  const [target, setTarget] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const remoteRef = useRef(null);
  const localRef = useRef(null);
  const screenRef = useRef(null);

  // attach streams
  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream;
      localRef.current.play().catch(() => {});
    }
  }, [localStream]);
  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream;
      remoteRef.current.play().catch(() => {});
    }
  }, [remoteStream]);
  useEffect(() => {
    if (screenRef.current && localStream) {
      screenRef.current.srcObject = localStream;
      screenRef.current.play().catch(() => {});
    }
  }, [localStream]);

  const goBack = () => navigate('/dashboard');

  // If no peer yet and idle, and not auto-accepting, allow choosing a contact
  // via a simple text/id input (full flow from contacts uses ?to=userId&name=).
  const initialTo = params.get('to');
  useEffect(() => {
    if (initialTo && status === CallStatus.idle) {
      startCall({
        receiverId: initialTo,
        contact: { _id: initialTo, name: params.get('name') || 'Contact', avatar: '' },
      });
    }
  }, [initialTo, status, startCall, params]);

  // -------- Render states --------
  if (status === CallStatus.idle && !autoAccept) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass rounded-3xl p-10 max-w-md">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400">
            {isVideo ? <Video className="h-7 w-7 text-white" /> : <PhoneOff className="h-7 w-7 text-white rotate-[135deg]" />}
          </div>
          <h2 className="font-display text-2xl font-bold text-white">
            {isVideo ? 'Start a video call' : 'Start a voice call'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Pick a contact from your contacts page, or call from the dashboard. Calls are
            browser-to-browser over the internet.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => navigate('/contacts')} className="btn-primary">Choose contact</button>
            <button onClick={goBack} className="btn-ghost">Back</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // auto-accept waiting
  if (status === CallStatus.idle) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center text-slate-400">
          <p className="animate-pulse text-lg">Waiting for incoming call…</p>
          <button onClick={goBack} className="btn-ghost mt-6">Back to dashboard</button>
        </div>
      </div>
    );
  }

  // In-call UI
  const connected = status === CallStatus.connected;
  const phaseLabel = {
    calling: 'Calling…',
    ringing: 'Ringing…',
    connecting: 'Connecting…',
    connected: 'Connected',
  }[status];

  return (
    <div
      className={`relative flex h-[100dvh] overflow-hidden rounded-none bg-black lg:rounded-3xl lg:h-[calc(100vh-8rem)] ${
        fullscreen ? '!fixed !inset-0 !z-50 !rounded-none' : ''
      }`}
    >
      {/* Remote video (video call) */}
      {isVideo && remoteStream ? (
        <video ref={remoteRef} autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_30%,rgba(124,58,237,0.15),transparent_60%),#0a0d16]">
          {peer && (
            <div className="text-center">
              <motion.div animate={{ scale: connected ? 1 : [1, 1.05, 1] }} transition={{ duration: connected ? 0 : 1.4, repeat: connected ? 0 : Infinity }}>
                <Avatar name={peer.name} src={peer.avatar} size="xl" />
              </motion.div>
              <h2 className="mt-4 font-display text-2xl font-bold text-white">{peer.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{phaseLabel}</p>
            </div>
          )}
        </div>
      )}

      {/* Local preview - video */}
      {isVideo && localStream && (
        <div className="absolute right-4 top-4 h-40 w-28 overflow-hidden rounded-2xl border border-white/20 bg-black shadow-lg sm:h-52 sm:w-36">
          <video ref={localRef} autoPlay playsInline muted className={`h-full w-full object-cover ${camOff ? 'opacity-30' : ''}`} />
          {camOff && (
            <div className="absolute inset-0 flex items-center justify-center">
              <VideoOff className="h-6 w-6 text-slate-400" />
            </div>
          )}
        </div>
      )}

      {/* Screen share */}
      {isVideo && sharing && (
        <div className="absolute inset-4 bottom-24 rounded-2xl overflow-hidden border border-cyan-400/40">
          <video ref={screenRef} autoPlay playsInline muted className="h-full w-full object-contain bg-black" />
        </div>
      )}

      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-400' : 'animate-pulse bg-amber-400'}`} />
          <span className="text-sm font-medium text-white">
            {connected ? formatDuration(elapsed) : phaseLabel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Quality level={quality} />
          {isVideo && (
            <button onClick={() => setFullscreen((f) => !f)} className="rounded-xl bg-white/10 p-2 text-white">
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          className={`flex h-14 w-14 items-center justify-center rounded-full transition ${muted ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </motion.button>

        {isVideo && (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleCamera}
              className={`flex h-14 w-14 items-center justify-center rounded-full transition ${camOff ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              title={camOff ? 'Camera on' : 'Camera off'}
            >
              {camOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleScreenShare}
              className={`flex h-14 w-14 items-center justify-center rounded-full transition ${sharing ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              title="Screen share"
            >
              <MonitorUp className="h-6 w-6" />
            </motion.button>
          </>
        )}

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={endCall}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-[0_0_40px_-10px_rgba(244,63,94,0.8)]"
          title="End call"
        >
          <PhoneOff className="h-7 w-7 rotate-[135deg]" />
        </motion.button>
      </div>
    </div>
  );
}
