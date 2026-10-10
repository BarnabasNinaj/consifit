import { Play, Shuffle } from 'lucide-react';
import type { WorkoutStore } from '../hooks/useWorkoutStore';
import { getTodayLastTotals } from '../utils/stats';
import { InstallPrompt } from './InstallPrompt';
import { PageTitle } from './PageTitle';

interface OverviewProps {
  store: WorkoutStore;
  onStart: (startIndex?: number) => void;
}

export function Overview({ store, onStart }: OverviewProps) {
  const { exercises, sessions } = store.data;

  if (exercises.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-3">
        <PageTitle
          title="Train Hard"
          subtitle="Add exercises in Settings."
        />
        <div className="flex flex-1" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 pb-2">
      <PageTitle
        title="Train Hard"
        subtitle="Tap an exercise, or Start from the top. Day closes the book."
      />
      <InstallPrompt variant="banner" />

      <ul className="scrollbar-hide min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pb-3">
        {exercises.map((ex, i) => {
          const { today, last } = getTodayLastTotals(sessions, ex.id);
          const matchedOrBeat = last > 0 && today >= last;

          return (
            <li key={ex.id}>
              <button
                type="button"
                onClick={() => onStart(i)}
                className="flex w-full items-center gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 px-3 py-3.5 text-left active:bg-zinc-800/80"
              >
                <span className="w-5 shrink-0 text-center text-xs font-medium tabular-nums text-zinc-600">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-zinc-50">
                    {ex.name}
                  </p>
                  <p className="mt-0.5 truncate text-sm tabular-nums">
                    <span
                      className={
                        matchedOrBeat
                          ? 'font-medium text-emerald-400'
                          : 'text-zinc-300'
                      }
                    >
                      {today} today
                    </span>
                    <span className="text-zinc-600"> / </span>
                    <span className="text-zinc-500">{last} last</span>
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-1 flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => store.shuffleExercises()}
          className="flex h-14 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-emerald-500/10 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-500/25 active:bg-emerald-500/18 active:text-emerald-200"
        >
          <Shuffle className="h-4 w-4" />
          Shuffle
        </button>
        <button
          type="button"
          onClick={() => onStart(0)}
          className="flex h-14 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-emerald-500 text-sm font-semibold text-zinc-950 shadow-[0_0_24px_rgba(16,185,129,0.25)] active:bg-emerald-400"
        >
          <Play className="h-4 w-4" fill="currentColor" />
          Start
        </button>
      </div>
    </div>
  );
}
