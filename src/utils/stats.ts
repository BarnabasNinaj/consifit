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
  yesterdayKey,
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
  return getExerciseSessions(sessions, exerciseId).find(
    (s) => s.id !== excludeSessionId && Boolean(s.finishedAt),
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

export function getTodayYesterdayTotals(
  sessions: WorkoutSession[],
  exerciseId: string,
): { today: number; yesterday: number } {
  return {
    today: getDayTotalsForExercise(sessions, exerciseId, todayKey()).totalReps,
    yesterday: getDayTotalsForExercise(
      sessions,
      exerciseId,
      yesterdayKey(),
    ).totalReps,
  };
}

export function getYesterdayTotalsForExercise(
  sessions: WorkoutSession[],
  exerciseId: string,
): SessionTotals {
  return getDayTotalsForExercise(sessions, exerciseId, yesterdayKey());
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

export function formatDeltaPill(bwDelta: number, bandDelta: number): string {
  const parts: string[] = [];
  const fmt = (n: number, label: string) =>
    `${n >= 0 ? '+' : ''}${n} ${label}`;
  parts.push(fmt(bwDelta, 'BW reps'));
  parts.push(fmt(bandDelta, 'Band reps'));
  return `${parts.join(', ')} vs. last time`;
}
