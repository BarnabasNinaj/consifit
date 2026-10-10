import { useCallback, useMemo } from 'react';
import {
  createId,
  DATA_VERSION,
  DEFAULT_APP_DATA,
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
} from '../data/defaults';
import type {
  AppData,
  AssistanceType,
  Exercise,
  ExerciseCategory,
  Settings,
  WorkoutSession,
} from '../types';
import { useLocalStorage } from './useLocalStorage';

function migrateLegacyStorage() {
  try {
    if (localStorage.getItem(STORAGE_KEY) != null) return;
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy == null) return;
    localStorage.setItem(STORAGE_KEY, legacy);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // ignore
  }
}

migrateLegacyStorage();

function normalizeData(raw: AppData | null | undefined): AppData {
  if (!raw || typeof raw !== 'object') return structuredClone(DEFAULT_APP_DATA);
  return {
    version: DATA_VERSION,
    exercises:
      Array.isArray(raw.exercises) && raw.exercises.length > 0
        ? raw.exercises
        : DEFAULT_APP_DATA.exercises,
    sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
    settings: {
      restSeconds: raw.settings?.restSeconds ?? DEFAULT_APP_DATA.settings.restSeconds,
      bandPresets:
        raw.settings?.bandPresets?.length
          ? raw.settings.bandPresets
          : DEFAULT_APP_DATA.settings.bandPresets,
    },
  };
}

export function useWorkoutStore() {
  const [data, setData] = useLocalStorage<AppData>(
    STORAGE_KEY,
    DEFAULT_APP_DATA,
  );

  const appData = useMemo(() => normalizeData(data), [data]);

  const update = useCallback(
    (updater: (prev: AppData) => AppData) => {
      setData((prev) => updater(normalizeData(prev)));
    },
    [setData],
  );

  const addExercise = useCallback(
    (name: string, category: ExerciseCategory) => {
      const exercise: Exercise = {
        id: createId('ex'),
        name: name.trim(),
        category,
      };
      update((prev) => ({
        ...prev,
        exercises: [...prev.exercises, exercise],
      }));
      return exercise;
    },
    [update],
  );

  const editExercise = useCallback(
    (id: string, name: string, category: ExerciseCategory) => {
      update((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === id ? { ...ex, name: name.trim(), category } : ex,
        ),
      }));
    },
    [update],
  );

  const deleteExercise = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        exercises: prev.exercises.filter((ex) => ex.id !== id),
        sessions: prev.sessions.filter((s) => s.exerciseId !== id),
      }));
    },
    [update],
  );

  const shuffleExercises = useCallback(() => {
    update((prev) => {
      const next = [...prev.exercises];
      for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return { ...prev, exercises: next };
    });
  }, [update]);

  const moveExercise = useCallback(
    (id: string, direction: -1 | 1) => {
      update((prev) => {
        const i = prev.exercises.findIndex((ex) => ex.id === id);
        if (i < 0) return prev;
        const j = i + direction;
        if (j < 0 || j >= prev.exercises.length) return prev;
        const next = [...prev.exercises];
        [next[i], next[j]] = [next[j], next[i]];
        return { ...prev, exercises: next };
      });
    },
    [update],
  );

  const readStored = useCallback((): AppData => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw == null) return normalizeData(appData);
      return normalizeData(JSON.parse(raw) as AppData);
    } catch {
      return normalizeData(appData);
    }
  }, [appData]);

  const writeStored = useCallback(
    (next: AppData) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota / private mode
      }
      setData(next);
    },
    [setData],
  );

  const startOrResumeSession = useCallback(
    (exerciseId: string): WorkoutSession => {
      const prev = readStored();
      const existing = prev.sessions.find(
        (s) => s.exerciseId === exerciseId && !s.finishedAt,
      );
      if (existing) {
        setData(prev);
        return existing;
      }

      const session: WorkoutSession = {
        id: createId('session'),
        exerciseId,
        startedAt: new Date().toISOString(),
        sets: [],
      };
      writeStored({ ...prev, sessions: [...prev.sessions, session] });
      return session;
    },
    [readStored, setData, writeStored],
  );

  const logSet = useCallback(
    (
      sessionId: string,
      reps: number,
      assistance: AssistanceType,
      bandLevel?: string,
    ) => {
      const prev = readStored();
      const nextSet = {
        id: createId('set'),
        reps,
        assistance,
        bandLevel: assistance === 'band' ? bandLevel : undefined,
        loggedAt: new Date().toISOString(),
      };

      const target =
        prev.sessions.find((s) => s.id === sessionId) ??
        prev.sessions.find((s) => !s.finishedAt);

      if (!target) return;

      writeStored({
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === target.id ? { ...s, sets: [...s.sets, nextSet] } : s,
        ),
      });
    },
    [readStored, writeStored],
  );

  const removeSet = useCallback(
    (sessionId: string, setId: string) => {
      const prev = readStored();
      writeStored({
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === sessionId
            ? { ...s, sets: s.sets.filter((set) => set.id !== setId) }
            : s,
        ),
      });
    },
    [readStored, writeStored],
  );

  const finishWorkout = useCallback(
    (sessionId: string) => {
      const prev = readStored();
      writeStored({
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === sessionId
            ? { ...s, finishedAt: new Date().toISOString() }
            : s,
        ),
      });
    },
    [readStored, writeStored],
  );

  const discardEmptySession = useCallback(
    (sessionId: string) => {
      const prev = readStored();
      writeStored({
        ...prev,
        sessions: prev.sessions.filter(
          (s) => !(s.id === sessionId && s.sets.length === 0 && !s.finishedAt),
        ),
      });
    },
    [readStored, writeStored],
  );

  const updateSettings = useCallback(
    (partial: Partial<Settings>) => {
      update((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...partial },
      }));
    },
    [update],
  );

  const exportData = useCallback((): string => {
    return JSON.stringify(appData, null, 2);
  }, [appData]);

  const importData = useCallback(
    (json: string): { ok: true } | { ok: false; error: string } => {
      try {
        const parsed = JSON.parse(json) as AppData;
        if (!parsed || !Array.isArray(parsed.exercises)) {
          return { ok: false, error: 'Invalid backup: missing exercises.' };
        }
        setData(normalizeData(parsed));
        return { ok: true };
      } catch {
        return { ok: false, error: 'Could not parse JSON backup.' };
      }
    },
    [setData],
  );

  const getSession = useCallback(
    (sessionId: string) => appData.sessions.find((s) => s.id === sessionId),
    [appData.sessions],
  );

  const getOpenSession = useCallback(
    (exerciseId: string) =>
      appData.sessions.find((s) => s.exerciseId === exerciseId && !s.finishedAt),
    [appData.sessions],
  );

  return {
    data: appData,
    addExercise,
    editExercise,
    deleteExercise,
    shuffleExercises,
    moveExercise,
    startOrResumeSession,
    logSet,
    removeSet,
    finishWorkout,
    discardEmptySession,
    updateSettings,
    exportData,
    importData,
    getSession,
    getOpenSession,
  };
}

export type WorkoutStore = ReturnType<typeof useWorkoutStore>;
