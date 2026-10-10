import type { AppData, Exercise, Settings } from '../types';

export const STORAGE_KEY = 'consifit-data';
/** Previous key — migrated once on first load. */
export const LEGACY_STORAGE_KEY = 'consifitbar-data';
export const DATA_VERSION = 1;

export const DEFAULT_BAND_PRESETS = [
  'Light / Red',
  'Medium / Black',
  'Heavy / Green',
];

export const DEFAULT_SETTINGS: Settings = {
  restSeconds: 90,
  bandPresets: DEFAULT_BAND_PRESETS,
};

export const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'ex-standard-pullups', name: 'Standard Pull-Ups', category: 'Pull' },
  { id: 'ex-chinups', name: 'Chin-Ups', category: 'Pull' },
  { id: 'ex-wide-grip', name: 'Wide-Grip Pull-Ups', category: 'Pull' },
  { id: 'ex-commando', name: 'Commando Pull-Ups', category: 'Pull' },
  { id: 'ex-hanging-leg-raises', name: 'Hanging Leg Raises', category: 'Core' },
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
