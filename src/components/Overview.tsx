import { ChevronDown, ChevronRight, ChevronUp, Menu, Shuffle } from 'lucide-react';
import type { WorkoutStore } from '../hooks/useWorkoutStore';
import { getTodayYesterdayTotals } from '../utils/stats';
import { PageTitle } from './PageTitle';

interface OverviewProps {
  store: WorkoutStore;
  onStart: (exerciseIndex: number) => void;
  onOpenMenu: () => void;
}

export function Overview({ store, onStart, onOpenMenu }: OverviewProps) {
  const { exercises, sessions } = store.data;

  if (exercises.length === 0) {
    return (
      <div className="flex flex-1 flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <PageTitle
          title="Train Hard"
          subtitle="Open Menu → Exercises to add some."
        />
        <div className="flex flex-1" />
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-zinc-500 ring-1 ring-zinc-900 active:bg-zinc-900/60 active:text-zinc-300"
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <PageTitle
        title="Train Hard"
        subtitle="Pick your first move. Shuffle if you want."
        action={
          <button
            type="button"
            onClick={() => store.shuffleExercises()}
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-zinc-900 px-3 text-sm font-medium text-zinc-200 active:bg-zinc-800"
          >
            <Shuffle className="h-4 w-4" />
            Shuffle
          </button>
        }
      />

      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pb-3">
        {exercises.map((ex, i) => {
          const { today, yesterday } = getTodayYesterdayTotals(sessions, ex.id);
          const open = store.getOpenSession(ex.id);
          const matchedOrBeat = yesterday > 0 && today >= yesterday;

          return (
            <li
              key={ex.id}
              className="flex items-stretch gap-1 rounded-2xl border border-zinc-800/80 bg-zinc-900/70"
            >
              <div className="flex flex-col justify-center border-r border-zinc-800/80">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => store.moveExercise(ex.id, -1)}
                  className="px-2.5 py-2 text-zinc-500 disabled:opacity-20 active:text-zinc-200"
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={i === exercises.length - 1}
                  onClick={() => store.moveExercise(ex.id, 1)}
                  className="px-2.5 py-2 text-zinc-500 disabled:opacity-20 active:text-zinc-200"
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => onStart(i)}
                className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3.5 text-left active:bg-zinc-800/50"
              >
                <span className="w-5 shrink-0 text-center text-xs font-medium tabular-nums text-zinc-600">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-zinc-50">
                      {ex.name}
                    </p>
                    {open && open.sets.length > 0 && (
                      <span className="shrink-0 rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium uppercase text-emerald-300">
                        Active
                      </span>
                    )}
                  </div>
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
                    <span className="text-zinc-500">
                      {yesterday} yesterday
                    </span>
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-zinc-600" />
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onOpenMenu}
        className="flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-medium text-zinc-500 ring-1 ring-zinc-900 active:bg-zinc-900/60 active:text-zinc-300"
      >
        <Menu className="h-4 w-4" />
        Menu
      </button>
    </div>
  );
}
