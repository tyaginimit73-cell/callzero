/** Format seconds as mm:ss */
export function formatDuration(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/** Compact relative time: "now", "5m", "2h", "3d", or date */
export function timeAgo(date) {
  if (!date) return 'never';
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 15) return 'now';
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString();
}

/** Full timestamp for tooltips */
export function fullTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Last seen wording */
export function lastSeen(date, status) {
  if (status === 'online') return 'Online now';
  if (!date) return 'Offline';
  return `Last seen ${timeAgo(date)} ago`;
}

/** Initials for avatar fallback */
export function initials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
