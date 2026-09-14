import env from './env.js';

const configured = env.CLIENT_URL.split(',').map((s) => s.trim()).filter(Boolean);

/**
 * Decide whether an Origin is allowed.
 *
 * Allows:
 *  - requests with no Origin (curl, same-server, server-to-server)
 *  - the configured CLIENT_URL origins (production / local dev)
 *  - sandbox preview hosts on the *.e2b.app domain (used by hosted dev previews)
 *    so the frontend can reach the API through the dev proxy in a preview iframe.
 */
export function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (configured.includes(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith('.e2b.app')) return true;
  } catch {
    /* invalid URL -> treat as not allowed */
  }
  return false;
}

export function corsOrigin(origin, callback) {
  if (isAllowedOrigin(origin)) return callback(null, true);
  return callback(new Error('Not allowed by CORS'));
}
