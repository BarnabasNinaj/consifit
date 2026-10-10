import { ChevronRight, Dumbbell } from 'lucide-react';
import type { Exercise } from '../types';
import { sumSets } from '../utils/stats';
import type { WorkoutSession } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  lastSession?: WorkoutSession;
  hasOpenSession?: boolean;
  onClick: () => void;
}

export function ExerciseCard({
  exercise,
  lastSession,
  hasOpenSession,
  onClick,
}: ExerciseCardProps) {
  const totals = lastSession ? sumSets(lastSession.sets) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/80 px-4 py-4 text-left transition active:scale-[0.98] active:bg-zinc-800/80"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
        <Dumbbell className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold text-zinc-50">{exercise.name}</h3>
          {hasOpenSession && (
            <span className="shrink-0 rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300">
              Active
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-zinc-400">
          <span className="text-zinc-500">{exercise.category}</span>
          {totals ? (
            <>
              {' · '}
              Last: {totals.totalReps} reps ({totals.bodyweightReps} BW /{' '}
              {totals.bandReps} Band)
            </>
          ) : (
            ' · No history yet'
          )}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-zinc-600 transition group-active:text-zinc-400" />
    </button>
  );
}
