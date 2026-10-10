import type { SetLog } from '../types';

export function formatSetLabel(set: SetLog, index: number): string {
  const assistance =
    set.assistance === 'bodyweight'
      ? 'BW'
      : set.bandLevel
        ? `${set.bandLevel} Band`
        : 'Band';
  return `Set ${index + 1}: ${set.reps} reps (${assistance})`;
}

export function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Local calendar day key (YYYY-MM-DD). */
export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dayKeyFromIso(iso: string): string {
  return dayKey(new Date(iso));
}

export function todayKey(date = new Date()): string {
  return dayKey(date);
}

export function yesterdayKey(date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

export function isSameDay(iso: string, key = todayKey()): boolean {
  return dayKeyFromIso(iso) === key;
}
