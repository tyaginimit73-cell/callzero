import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const STUN = 'stun:stun.l.google.com:19302';

export const CallStatus = {
  idle: 'idle',
  calling: 'calling', // outgoing, waiting
  ringing: 'ringing', // incoming, ringing
  connecting: 'connecting', // negotiating
  connected: 'connected',
  ended: 'ended',
  failed: 'failed',
};

/**
 * Complete WebRTC engine for voice/video calls.
 *
 * - Signaling travels over Socket.IO (call:offer/answer/ice-candidate).
 * - Media travels peer-to-peer over the WebRTC peer connection.
 * - Optionally reads a TURN server from /api/config/rtc for hard networks.
 */
export function useWebRTC({ mode = 'voice', autoAccept = false } = {}) {
  const { socket, connected, incomingCall, clearIncomingCall } = useSocket();
  const toast = useToast();

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const timeoutsRef = useRef({});

  const [status, setStatus] = useState(CallStatus.idle);
  const [peer, setPeer] = useState(null); // { id, name, username, avatar }
  const [callId, setCallId] = useState(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [quality, setQuality] = useState('good'); // good | fair | poor
  const [error, setError] = useState(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const statusRef = useRef(status);
  statusRef.current = status;
  const peerRef = useRef(peer);
  peerRef.current = peer;
  const callIdRef = useRef(null);
  callIdRef.current = callId;

  // ---- Ice config from server ----
  async function getRtcConfig() {
    try {
      const res = await fetch('/api/config/rtc');
      const j = await res.json();
      const servers = [{ urls: STUN }];
      if (j.data?.stun) servers.push({ urls: j.data.stun });
      if (j.data?.turn?.url) servers.push({ urls: j.data.turn.url, username: j.data.turn.username, credential: '' });
      return { iceServers: servers };
    } catch {
      return { iceServers: [{ urls: STUN }] };
    }
  }

  const getMedia = useCallback(async (withVideo) => {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Media devices not supported');
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
      video: withVideo
        ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
        : false,
    });
    return stream;
  }, []);

  const startTimer = () => {
    const start = Date.now();
    timeoutsRef.current.duration = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
  };

  const stopTimer = () => {
    if (timeoutsRef.current.duration) clearInterval(timeoutsRef.current.duration);
  };

  // ---- Quality estimator using ICE stats ----
  const monitorQuality = useCallback((pc, peerId) => {
    timeoutsRef.current.quality = setInterval(async () => {
      try {
        const stats = await pc.getStats();
        let lost = 0;
        let total = 0;
        stats.forEach((s) => {
          if (s.type === 'inbound-rtp' && s.packetsLost !== undefined) {
            lost += s.packetsLost;
            total += s.packetsReceived + s.packetsLost;
          }
        });
        const loss = total ? lost / total : 0;
        setQuality(loss < 0.02 ? 'good' : loss < 0.1 ? 'fair' : 'poor');
      } catch {
        /* noop */
      }
    }, 4000);
  }, []);

  // ---- Cleanup ----
  const cleanup = useCallback(() => {
    Object.values(timeoutsRef.current).forEach((t) => clearInterval(t));
    timeoutsRef.current = {};
    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setElapsed(0);
  }, []);

  const endCall = useCallback(() => {
    if (socket && callId && statusRef.current !== CallStatus.idle) {
      socket.emit('call:end', { callId });
    }
    cleanup();
    setStatus(CallStatus.idle);
    setCallId(null);
    setPeer(null);
    clearIncomingCall();
  }, [socket, callId, cleanup, clearIncomingCall]);

  // ---- Incoming call: build pc & answer ----
  const acceptIncoming = useCallback(
    async (payload) => {
      if (statusRef.current !== CallStatus.idle) {
        socket.emit('call:reject-busy', { callId: payload.callId });
        return;
      }
      try {
        const isVideo = payload.type === 'video';
        const stream = await getMedia(isVideo);
        localStreamRef.current = stream;
        setLocalStream(stream);

        const config = await getRtcConfig();
        const pc = new RTCPeerConnection(config);
        pcRef.current = pc;
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        pc.onicecandidate = (e) => {
          if (e.candidate && socket) socket.emit('call:ice-candidate', { callId: payload.callId, candidate: e.candidate, to: payload.from._id });
        };
        pc.ontrack = (e) => {
          const [rStream] = e.streams;
          remoteStreamRef.current = rStream;
          setRemoteStream(rStream);
        };

        setStatus(CallStatus.ringing);
        setPeer(payload.from);
        setCallId(payload.callId);

        pc.onconnectionstatechange = () => {
          const st = pc.connectionState;
          if (st === 'connected') {
            setStatus(CallStatus.connected);
            startTimer();
            monitorQuality(pc, payload.from._id);
          } else if (st === 'failed' || st === 'disconnected' || st === 'closed') {
            if (statusRef.current === CallStatus.connected) {
              endCall();
              toast.error('Call connection lost');
            }
          }
        };

        // apply remote offer & answer
        await pc.setRemoteDescription(payload.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('call:answer', { callId: payload.callId, sdp: pc.localDescription, receiverId: peerRef.current?._id });
        clearIncomingCall();
      } catch (e) {
        setError(e.message);
        toast.error(`Could not start call: ${e.message}`);
        endCall();
      }
    },
    [getMedia, socket, toast, cleanup, clearIncomingCall, monitorQuality, endCall]
  );

  // auto-accept once (used by CallScreen with autoAccept)
  useEffect(() => {
    if (autoAccept && incomingCall && statusRef.current === CallStatus.idle) {
      acceptIncoming(incomingCall);
    }
  }, [incomingCall, autoAccept, acceptIncoming]);

  // ---- Outgoing call ----
  const startCall = useCallback(
    async ({ receiverId, contact }) => {
      if (!socket || !connected) {
        setError('Not connected to signaling server');
        toast.error('You are offline. Connect to the internet to call.');
        setStatus(CallStatus.failed);
        return;
      }
      if (!window.RTCPeerConnection) {
        setError('WebRTC not supported by this browser');
        toast.error('WebRTC is not supported in this browser.');
        setStatus(CallStatus.failed);
        return;
      }
      try {
        const isVideo = mode === 'video';
        const stream = await getMedia(isVideo);
        localStreamRef.current = stream;
        setLocalStream(stream);

        const config = await getRtcConfig();
        const pc = new RTCPeerConnection(config);
        pcRef.current = pc;
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        pc.onicecandidate = (e) => {
          if (e.candidate && socket && callIdRef.current) {
            socket.emit('call:ice-candidate', { callId: callIdRef.current, candidate: e.candidate, to: receiverId });
          }
        };
        pc.ontrack = (e) => {
          const [rStream] = e.streams;
          remoteStreamRef.current = rStream;
          setRemoteStream(rStream);
        };
        pc.onconnectionstatechange = () => {
          const st = pc.connectionState;
          if (st === 'connected') {
            setStatus(CallStatus.connected);
            startTimer();
            monitorQuality(pc, receiverId);
          } else if ((st === 'failed' || st === 'disconnected') && statusRef.current === CallStatus.connected) {
            endCall();
            toast.error('Call connection lost');
          }
        };

        setStatus(CallStatus.calling);
        setPeer(contact || { _id: receiverId, name: 'Contact', username: '', avatar: '' });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const ack = (r) => {
          if (r && r.success === false) {
            if (r.code === 'OFFLINE') {
              setStatus(CallStatus.ended);
              toast.error('Contact is offline right now.');
              // record missed call via server
              fetch('/api/calls', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caller: undefined, receiver: receiverId, type: mode, status: 'missed' }),
              }).catch(() => {});
              cleanup();
            } else if (r.code === 'BLOCKED') {
              setStatus(CallStatus.ended);
              toast.error('Unable to call this contact.');
              cleanup();
            }
          } else if (r?.call) {
            callIdRef.current = String(r.call._id);
            setCallId(String(r.call._id));
          }
        };

        socket.emit('call:offer', { receiverId, type: mode, sdp: pc.localDescription, callId }, ack);

        // timeout if no answer in 30s
        timeoutsRef.current.callTimeout = setTimeout(() => {
          if (statusRef.current === CallStatus.calling) {
            socket.emit('call:timeout', { callId });
            setStatus(CallStatus.ended);
            toast.error('No answer. Call missed.');
            cleanup();
          }
        }, 30000);
      } catch (e) {
        setError(e.message);
        toast.error(`Could not start call: ${e.message}`);
        setStatus(CallStatus.failed);
        cleanup();
      }
    },
    [socket, connected, mode, toast, cleanup, monitorQuality, endCall]
  );

  // ---- Signaling listeners (both directions) ----
  useEffect(() => {
    if (!socket) return;

    const onAnswer = async ({ callId: cid, sdp }) => {
      if (cid && callId && cid !== callId) return;
      if (pcRef.current && sdp && statusRef.current === CallStatus.calling) {
        await pcRef.current.setRemoteDescription(sdp);
        setStatus(CallStatus.connecting);
      }
    };
    const onIce = async ({ callId: cid, candidate }) => {
      if (cid && callId && cid !== callId) return;
      if (pcRef.current && candidate) {
        try {
          await pcRef.current.addIceCandidate(candidate);
        } catch (e) {
          /* ignore */
        }
      }
    };
    const onDeclined = () => {
      setStatus(CallStatus.ended);
      toast.info('Call declined.');
      cleanup();
    };
    const onMissed = () => {
      setStatus(CallStatus.ended);
      toast.info('Call missed.');
      cleanup();
    };
    const onEnd = ({ callId: cid }) => {
      if (cid && callId && cid !== callId) return;
      if (statusRef.current === CallStatus.connected) toast.info('Call ended.');
      cleanup();
      setStatus(CallStatus.ended);
      setCallId(null);
    };

    socket.on('call:answer', onAnswer);
    socket.on('call:ice-candidate', onIce);
    socket.on('call:declined', onDeclined);
    socket.on('call:missed', onMissed);
    socket.on('call:end', onEnd);

    return () => {
      socket.off('call:answer', onAnswer);
      socket.off('call:ice-candidate', onIce);
      socket.off('call:declined', onDeclined);
      socket.off('call:missed', onMissed);
      socket.off('call:end', onEnd);
    };
  }, [socket, callId, status, cleanup, toast]);

  // ---- Toggles ----
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audio = localStreamRef.current.getAudioTracks()[0];
      if (audio) audio.enabled = !audio.enabled;
    }
    setMuted((m) => !m);
  }, []);

  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const video = localStreamRef.current.getVideoTracks()[0];
      if (video) video.enabled = !video.enabled;
    }
    setCamOff((c) => !c);
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (sharing) {
      // stop sharing screen -> back to camera
      const sender = pcRef.current?.getSenders().find((s) => s.track?.kind === 'video');
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (sender && camTrack) sender.replaceTrack(camTrack);
      setSharing(false);
      return;
    }
    if (!navigator.mediaDevices?.getDisplayMedia) return;
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const sender = pcRef.current?.getSenders().find((s) => s.track?.kind === 'video');
      if (sender) await sender.replaceTrack(screen.getVideoTracks()[0]);
      screen.getVideoTracks()[0].onended = () => setSharing(false);
      setSharing(true);
      setCamOff(false);
    } catch {
      /* user cancelled */
    }
  }, [sharing]);

  // ---- cleanup on unmount ----
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    status,
    peer,
    callId,
    localStream,
    remoteStream,
    muted,
    camOff,
    sharing,
    elapsed,
    quality,
    error,
    startCall,
    acceptIncoming,
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  };
}
