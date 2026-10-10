import type {
  ProgressionPoint,
  SessionTotals,
  SetLog,
  WorkoutSession,
} from '../types';
import {
  dayKeyFromIso,
  formatDateLabel,
  isSameDay,
  todayKey,
} from './format';

export function sumSets(sets: SetLog[]): SessionTotals {
  return sets.reduce<SessionTotals>(
    (acc, set) => {
      if (set.assistance === 'bodyweight') {
        acc.bodyweightReps += set.reps;
      } else {
        acc.bandReps += set.reps;
      }
      acc.totalReps += set.reps;
      acc.setCount += 1;
      return acc;
    },
    { bodyweightReps: 0, bandReps: 0, totalReps: 0, setCount: 0 },
  );
}

export function getExerciseSessions(
  sessions: WorkoutSession[],
  exerciseId: string,
): WorkoutSession[] {
  return sessions
    .filter((s) => s.exerciseId === exerciseId && s.sets.length > 0)
    .sort(
      (a, b) =>
        new Date(b.finishedAt ?? b.startedAt).getTime() -
        new Date(a.finishedAt ?? a.startedAt).getTime(),
    );
}

export function getPreviousSession(
  sessions: WorkoutSession[],
  exerciseId: string,
  excludeSessionId?: string,
): WorkoutSession | undefined {
  // Prefer a prior calendar day for defaults; today stays open until day end.
  return (
    getExerciseSessions(sessions, exerciseId).find(
      (s) => s.id !== excludeSessionId && !isSameDay(s.startedAt),
    ) ??
    getExerciseSessions(sessions, exerciseId).find(
      (s) => s.id !== excludeSessionId,
    )
  );
}

export function getTodayTotalsForExercise(
  sessions: WorkoutSession[],
  exerciseId: string,
): SessionTotals {
  const todaySets = sessions
    .filter((s) => s.exerciseId === exerciseId && isSameDay(s.startedAt))
    .flatMap((s) => s.sets);
  return sumSets(todaySets);
}

/** Daily totals by set `loggedAt` (local calendar day). */
export function getDayTotalsForExercise(
  sessions: WorkoutSession[],
  exerciseId: string,
  day: string,
): SessionTotals {
  const daySets = sessions
    .filter((s) => s.exerciseId === exerciseId)
    .flatMap((s) => s.sets)
    .filter((set) => dayKeyFromIso(set.loggedAt) === day);
  return sumSets(daySets);
}

/** Most recent session with sets that is not from today. */
export function getLastSessionSummary(
  sessions: WorkoutSession[],
  exerciseId: string,
): {
  totals: SessionTotals;
  label: string | null;
} {
  const empty: SessionTotals = {
    bodyweightReps: 0,
    bandReps: 0,
    totalReps: 0,
    setCount: 0,
  };
  const last = getExerciseSessions(sessions, exerciseId).find(
    (s) => !isSameDay(s.startedAt),
  );
  if (!last) return { totals: empty, label: null };
  return {
    totals: sumSets(last.sets),
    label: formatDateLabel(last.finishedAt ?? last.startedAt),
  };
}

export function getTodayLastTotals(
  sessions: WorkoutSession[],
  exerciseId: string,
): { today: number; last: number; lastLabel: string | null } {
  const last = getLastSessionSummary(sessions, exerciseId);
  return {
    today: getDayTotalsForExercise(sessions, exerciseId, todayKey()).totalReps,
    last: last.totals.totalReps,
    lastLabel: last.label,
  };
}

export function compareToPrevious(
  current: SessionTotals,
  previous?: SessionTotals,
): { bwDelta: number; bandDelta: number } {
  if (!previous) return { bwDelta: current.bodyweightReps, bandDelta: current.bandReps };
  return {
    bwDelta: current.bodyweightReps - previous.bodyweightReps,
    bandDelta: current.bandReps - previous.bandReps,
  };
}

export function getProgressionData(
  sessions: WorkoutSession[],
  exerciseId: string,
  limit = 10,
): ProgressionPoint[] {
  const finished = getExerciseSessions(sessions, exerciseId)
    .filter((s) => s.finishedAt)
    .slice(0, limit)
    .reverse();

  return finished.map((session) => {
    const totals = sumSets(session.sets);
    const date = session.finishedAt ?? session.startedAt;
    return {
      date,
      label: formatDateLabel(date),
      bodyweightReps: totals.bodyweightReps,
      bandReps: totals.bandReps,
      totalReps: totals.totalReps,
    };
  });
}

export interface ExerciseProgressStats {
  workoutCount: number;
  lastTotal: number;
  lastBw: number;
  lastBand: number;
  lastLabel: string | null;
  bestTotal: number;
  bestLabel: string | null;
  /** Last workout total minus previous workout total */
  vsPrevious: number | null;
}

export function getExerciseProgressStats(
  sessions: WorkoutSession[],
  exerciseId: string,
): ExerciseProgressStats {
  const finished = getExerciseSessions(sessions, exerciseId).filter((s) =>
    Boolean(s.finishedAt),
  );

  if (finished.length === 0) {
    return {
      workoutCount: 0,
      lastTotal: 0,
      lastBw: 0,
      lastBand: 0,
      lastLabel: null,
      bestTotal: 0,
      bestLabel: null,
      vsPrevious: null,
    };
  }

  const withTotals = finished.map((session) => {
    const totals = sumSets(session.sets);
    const date = session.finishedAt ?? session.startedAt;
    return { totals, date };
  });

  const last = withTotals[0]!;
  const previous = withTotals[1];
  let best = withTotals[0]!;
  for (const row of withTotals) {
    if (row.totals.totalReps > best.totals.totalReps) best = row;
  }

  return {
    workoutCount: finished.length,
    lastTotal: last.totals.totalReps,
    lastBw: last.totals.bodyweightReps,
    lastBand: last.totals.bandReps,
    lastLabel: formatDateLabel(last.date),
    bestTotal: best.totals.totalReps,
    bestLabel: formatDateLabel(best.date),
    vsPrevious: previous
      ? last.totals.totalReps - previous.totals.totalReps
      : null,
  };
}

export function formatDeltaPill(bwDelta: number, bandDelta: number): string {
  const parts: string[] = [];
  const fmt = (n: number, label: string) =>
    `${n >= 0 ? '+' : ''}${n} ${label}`;
  parts.push(fmt(bwDelta, 'Body reps'));
  parts.push(fmt(bandDelta, 'Band reps'));
  return `${parts.join(', ')} vs. last time`;
}
