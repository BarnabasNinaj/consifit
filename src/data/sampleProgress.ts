import type { Exercise, SetLog, WorkoutSession } from '../types';
import { createId } from './defaults';

const SAMPLE_PREFIX = 'sample-';

export function isSampleSessionId(id: string): boolean {
  return id.startsWith(SAMPLE_PREFIX);
}

function atNoonDaysAgo(daysAgo: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function setAt(
  when: Date,
  minuteOffset: number,
  reps: number,
  assistance: 'bodyweight' | 'band',
): SetLog {
  const logged = new Date(when.getTime() + minuteOffset * 60_000);
  return {
    id: createId(`${SAMPLE_PREFIX}set`),
    reps,
    assistance,
    loggedAt: logged.toISOString(),
  };
}

/**
 * Builds ~10 finished sessions per exercise (spread over ~3 weeks)
 * so Progress charts show a clear multi-day trend.
 */
export function buildSampleSessions(exercises: Exercise[]): WorkoutSession[] {
  if (exercises.length === 0) return [];

  // Workouts every other day going back — 10 points
  const dayOffsets = [20, 18, 16, 14, 12, 10, 8, 5, 3, 1];

  const sessions: WorkoutSession[] = [];

  for (const [exIndex, exercise] of exercises.entries()) {
    // Slightly different curves per exercise so charts aren't identical
    const bwBase = 18 + exIndex * 4;
    const bandBase = 12 + exIndex * 2;

    dayOffsets.forEach((daysAgo, workoutIndex) => {
      const when = atNoonDaysAgo(daysAgo);
      // Gradual BW climb, band fades as you get stronger
      const progress = workoutIndex / (dayOffsets.length - 1);
      const bwTarget = Math.round(bwBase + progress * 14 + (workoutIndex % 3) - 1);
      const bandTarget = Math.max(
        0,
        Math.round(bandBase - progress * 8 + ((workoutIndex + exIndex) % 2)),
      );

      const sets: SetLog[] = [];
      let loggedBw = 0;
      let loggedBand = 0;
      let setI = 0;

      while (loggedBw < bwTarget) {
        const reps = Math.min(8, bwTarget - loggedBw);
        sets.push(setAt(when, setI * 3, Math.max(3, reps), 'bodyweight'));
        loggedBw += Math.max(3, reps);
        setI += 1;
      }
      while (loggedBand < bandTarget) {
        const reps = Math.min(6, bandTarget - loggedBand);
        sets.push(setAt(when, setI * 3, Math.max(3, reps), 'band'));
        loggedBand += Math.max(3, reps);
        setI += 1;
      }

      if (sets.length === 0) return;

      const started = new Date(when);
      started.setMinutes(started.getMinutes() - 5);
      const finished = new Date(sets[sets.length - 1]!.loggedAt);

      sessions.push({
        id: `${SAMPLE_PREFIX}${exercise.id}-${daysAgo}`,
        exerciseId: exercise.id,
        startedAt: started.toISOString(),
        finishedAt: finished.toISOString(),
        sets,
      });
    });
  }

  return sessions;
}
