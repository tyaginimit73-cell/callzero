import { describe, it, expect } from 'vitest';
import { formatDuration, timeAgo, initials, clamp } from '../src/utils/format.js';
import { networkLabel } from '../src/utils/connection.js';

describe('format utils', () => {
  it('formats durations as mm:ss', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(65)).toBe('01:05');
    expect(formatDuration(3600)).toBe('60:00');
  });

  it('returns compact time-ago strings', () => {
    expect(timeAgo(new Date())).toBe('now');
    expect(timeAgo(Date.now() - 5 * 60 * 1000)).toBe('5m');
    expect(timeAgo(Date.now() - 2 * 3600 * 1000)).toBe('2h');
  });

  it('derives initials', () => {
    expect(initials('Alice Johnson')).toBe('AJ');
    expect(initials('Bob')).toBe('B');
    expect(initials('')).toBe('');
  });

  it('clamps values into range', () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-5, 0, 100)).toBe(0);
    expect(clamp(42, 0, 100)).toBe(42);
  });
});

describe('connection helpers', () => {
  it('maps effective network types to labels', () => {
    expect(networkLabel('4g')).toBe('4G');
    expect(networkLabel('3g')).toBe('3G');
    expect(networkLabel('slow-2g')).toBe('Slow 2G');
    expect(networkLabel('wifi')).toBe('Broadband');
  });
});
