import type { AppData, Exercise, Settings } from '../types';

export const STORAGE_KEY = 'consifit-data';
/** Previous key — migrated once on first load. */
export const LEGACY_STORAGE_KEY = 'consifitbar-data';
export const DATA_VERSION = 1;

export const DEFAULT_SETTINGS: Settings = {
  restSeconds: 90,
  restExtendSeconds: [15, 30],
};

export function normalizeRestExtendSeconds(raw: unknown): [number, number] {
  const fallback = DEFAULT_SETTINGS.restExtendSeconds;
  const list = Array.isArray(raw) ? raw : fallback;
  return [0, 1].map((i) => {
    const n = Math.round(Number(list[i]));
    if (!Number.isFinite(n)) return fallback[i]!;
    return Math.max(5, Math.min(180, n));
  }) as [number, number];
}

export const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'ex-standard-pullups', name: 'Standard Pull-Ups' },
  { id: 'ex-chinups', name: 'Chin-Ups' },
  { id: 'ex-wide-grip', name: 'Wide-Grip Pull-Ups' },
  { id: 'ex-commando', name: 'Commando Pull-Ups' },
  { id: 'ex-hanging-leg-raises', name: 'Hanging Leg Raises' },
];

export const DEFAULT_APP_DATA: AppData = {
  version: DATA_VERSION,
  exercises: DEFAULT_EXERCISES,
  sessions: [],
  settings: DEFAULT_SETTINGS,
};

export function createId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
