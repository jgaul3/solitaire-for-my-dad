import { AllStats } from '../types';

const SHIFT = 3;

/**
 * Obfuscated export: JSON → base64 → reverse → char shift.
 * Not encryption — just enough so it's not human-editable.
 */
export function exportStats(stats: AllStats): string {
  const json = JSON.stringify(stats);
  const b64 = btoa(json);
  const reversed = b64.split('').reverse().join('');
  const shifted = reversed
    .split('')
    .map(c => String.fromCharCode(c.charCodeAt(0) + SHIFT))
    .join('');
  return shifted;
}

export function importStats(encoded: string): AllStats | null {
  try {
    const unshifted = encoded
      .split('')
      .map(c => String.fromCharCode(c.charCodeAt(0) - SHIFT))
      .join('');
    const unreversed = unshifted.split('').reverse().join('');
    const json = atob(unreversed);
    const stats = JSON.parse(json) as AllStats;
    // Basic validation
    if (!stats.easy || !stats.medium || !stats.hard) return null;
    return stats;
  } catch {
    return null;
  }
}
