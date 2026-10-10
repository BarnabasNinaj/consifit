import { useCallback, useMemo } from 'react';
import {
  createId,
  DATA_VERSION,
  DEFAULT_APP_DATA,
  LEGACY_STORAGE_KEY,
  normalizeRestExtendSeconds,
  STORAGE_KEY,
} from '../data/defaults';
import {
  buildSampleSessions,
  isSampleSessionId,
} from '../data/sampleProgress';
import type {
  AppData,
  AssistanceType,
  Exercise,
  Settings,
  WorkoutSession,
} from '../types';
import { isSameDay } from '../utils/format';
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
        ? raw.exercises.map((ex) => ({
            id: ex.id,
            name: typeof ex.name === 'string' ? ex.name : 'Exercise',
          }))
        : DEFAULT_APP_DATA.exercises,
    sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
    settings: {
      restSeconds:
        raw.settings?.restSeconds ?? DEFAULT_APP_DATA.settings.restSeconds,
      restExtendSeconds: normalizeRestExtendSeconds(
        raw.settings?.restExtendSeconds,
      ),
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
    (name: string) => {
      const exercise: Exercise = {
        id: createId('ex'),
        name: name.trim(),
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
    (id: string, name: string) => {
      update((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === id ? { ...ex, name: name.trim() } : ex,
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
      // Day is the deadline: close anything still open from earlier days.
      const sessions = prev.sessions.map((s) =>
        !s.finishedAt && !isSameDay(s.startedAt)
          ? { ...s, finishedAt: s.startedAt }
          : s,
      );

      const existing = sessions.find(
        (s) =>
          s.exerciseId === exerciseId &&
          !s.finishedAt &&
          isSameDay(s.startedAt),
      );
      if (existing) {
        writeStored({ ...prev, sessions });
        return existing;
      }

      const session: WorkoutSession = {
        id: createId('session'),
        exerciseId,
        startedAt: new Date().toISOString(),
        sets: [],
      };
      writeStored({ ...prev, sessions: [...sessions, session] });
      return session;
    },
    [readStored, writeStored],
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

  const deleteLocalData = useCallback(() => {
    setData(structuredClone(DEFAULT_APP_DATA));
  }, [setData]);

  const loadSampleProgress = useCallback(() => {
    update((prev) => {
      const withoutSamples = prev.sessions.filter(
        (s) => !isSampleSessionId(s.id),
      );
      const samples = buildSampleSessions(prev.exercises);
      return {
        ...prev,
        sessions: [...withoutSamples, ...samples],
      };
    });
  }, [update]);

  const clearSampleProgress = useCallback(() => {
    update((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => !isSampleSessionId(s.id)),
    }));
  }, [update]);

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
    deleteLocalData,
    loadSampleProgress,
    clearSampleProgress,
    getSession,
    getOpenSession,
  };
}

export type WorkoutStore = ReturnType<typeof useWorkoutStore>;
