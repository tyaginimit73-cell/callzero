import { useEffect, useRef, useState, useCallback } from 'react';
import { checkCapabilities } from '../utils/connection.js';

/**
 * Runs the Smart Connection Engine once on mount (and on online/offline
 * transitions) to report which legitimate options are available.
 */
export function useCapabilities() {
  const [cap, setCap] = useState(null);
  const [checking, setChecking] = useState(true);
  const ran = useRef(false);

  const run = useCallback(async () => {
    setChecking(true);
    const result = await checkCapabilities({ audio: true, video: true });
    setCap(result);
    setChecking(false);
    ran.current = true;
    return result;
  }, []);

  useEffect(() => {
    run();
    const onOnline = () => run();
    const onOffline = () => setCap((c) => (c ? { ...c, online: false } : c));
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [run]);

  return { cap, checking, run };
}
