/**
 * SMART CONNECTION ENGINE
 * Determines which legitimate communication options the user's browser/device
 * currently supports. It only reports what is genuinely possible — it never
 * claims it can make ordinary cellular calls.
 */
export function detectWebRTC() {
  try {
    const RTCPeerConnection =
      window.RTCPeerConnection ||
      window.webkitRTCPeerConnection ||
      window.mozRTCPeerConnection;
    return Boolean(RTCPeerConnection && typeof RTCPeerConnection === 'function');
  } catch {
    return false;
  }
}

export function detectMediaDevices() {
  return Boolean(
    navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

export function detectNetworkType() {
  if (typeof navigator.connection?.effectiveType === 'string') {
    return {
      type: navigator.connection.effectiveType, // 4g / 3g / 2g / slow-2g
      downlink: navigator.connection.downlink ?? null,
      rtt: navigator.connection.rtt ?? null,
      saveData: navigator.connection.saveData ?? false,
    };
  }
  return null;
}

export function networkLabel(effectiveType) {
  const map = {
    'slow-2g': 'Slow 2G',
    '2g': '2G',
    '3g': '3G',
    '4g': '4G',
    unknown: 'Unknown',
  };
  return map[effectiveType] || 'Broadband';
}

/**
 * Returns a capability report.
 * mode can be 'auto' or explicit ('audio' | 'video').
 */
export async function checkCapabilities({ audio = true, video = false } = {}) {
  const webRTC = detectWebRTC();
  const mediaSupported = detectMediaDevices();
  const network = detectNetworkType();
  const online = navigator.onLine;

  let mic = { available: false, permission: 'unknown' };
  let cam = { available: false, permission: 'unknown' };

  if (mediaSupported) {
    try {
      if (audio) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mic.available = true;
        mic.permission = 'granted';
        stream.getTracks().forEach((t) => t.stop());
      } else {
        mic.available = false;
      }
    } catch (e) {
      mic.available = false;
      mic.permission = e.name === 'NotAllowedError' ? 'denied' : 'error';
    }
    try {
      if (video) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cam.available = true;
        cam.permission = 'granted';
        stream.getTracks().forEach((t) => t.stop());
      } else {
        cam.available = false;
      }
    } catch (e) {
      cam.available = false;
      cam.permission = e.name === 'NotAllowedError' ? 'denied' : 'error';
    }
  }

  const available = [];
  const unavailable = [];

  if (online && webRTC && mic.available) available.push('Internet Voice Call');
  else unavailable.push('Internet Voice Call');

  if (online && webRTC && mic.available && cam.available) available.push('Internet Video Call');
  else unavailable.push('Internet Video Call');

  if (online) available.push('Internet Messaging');
  else unavailable.push('Internet Messaging');

  // Honest disclaimer about cellular calling
  unavailable.push('Traditional cellular calling (requires carrier service)');
  unavailable.push('Official emergency-service calling (use your country\u2019s emergency number)');

  return {
    checkedAt: Date.now(),
    online,
    webRTC,
    mediaSupported,
    network: network ? { ...network, label: networkLabel(network.type) } : null,
    microphone: mic,
    camera: cam,
    available,
    unavailable,
  };
}
