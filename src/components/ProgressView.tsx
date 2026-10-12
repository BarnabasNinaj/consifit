import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import type { WorkoutSession } from '../types';
import type { WorkoutStore } from '../hooks/useWorkoutStore';
import {
  getExerciseProgressStats,
  getExerciseSessions,
  getProgressionData,
} from '../utils/stats';
import { HistorySheet } from './HistorySheet';
import { PageTitle } from './PageTitle';
import { ProgressionChart } from './ProgressionChart';
import { SessionEditor } from './SessionEditor';

interface ProgressViewProps {
  store: WorkoutStore;
}

function StatCell({
  label,
  value,
  hint,
  valueClassName = 'text-zinc-50',
  className = '',
}: {
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
  className?: string;
}) {
  return (
    <div className={`px-3 py-2.5 ${className}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </p>
      <p
        className={`mt-1 font-mono text-xl font-bold leading-none tabular-nums ${valueClassName}`}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1 truncate text-[11px] text-zinc-500">{hint}</p>
      )}
    </div>
  );
}

export function ProgressView({ store }: ProgressViewProps) {
  const exercises = store.data.exercises;
  const [index, setIndex] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editing, setEditing] = useState<WorkoutSession | null>(null);

  const safeIndex =
    exercises.length === 0
      ? 0
      : Math.min(Math.max(index, 0), exercises.length - 1);
  const active = exercises[safeIndex] ?? null;

  const chartData = useMemo(
    () =>
      active
        ? getProgressionData(store.data.sessions, active.id, 10)
        : [],
    [active, store.data.sessions],
  );

  const stats = useMemo(
    () =>
      active
        ? getExerciseProgressStats(store.data.sessions, active.id)
        : null,
    [active, store.data.sessions],
  );

  const historySessions = useMemo(
    () => (active ? getExerciseSessions(store.data.sessions, active.id) : []),
    [active, store.data.sessions],
  );

  const go = (delta: number) => {
    if (exercises.length === 0) return;
    setIndex((i) => {
      const next = i + delta;
      if (next < 0) return exercises.length - 1;
      if (next >= exercises.length) return 0;
      return next;
    });
  };

  const vsLabel =
    stats?.vsPrevious == null
      ? '—'
      : `${stats.vsPrevious >= 0 ? '+' : ''}${stats.vsPrevious}`;
  const vsClass =
    stats?.vsPrevious == null
      ? 'text-zinc-500'
      : stats.vsPrevious > 0
        ? 'text-emerald-400'
        : stats.vsPrevious < 0
          ? 'text-rose-400'
          : 'text-zinc-300';

  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 pb-2">
      <PageTitle
        title={active?.name ?? 'Progress'}
        subtitle={
          active
            ? `${safeIndex + 1} of ${exercises.length} · body vs band`
            : 'Add exercises in Settings to track progression.'
        }
      />

      {active && stats ? (
        <>
          <div className="mb-3 shrink-0 grid grid-cols-2 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70">
            <StatCell
              label="Last"
              value={String(stats.lastTotal)}
              hint={
                stats.lastLabel
                  ? `${stats.lastLabel} · ${stats.lastBw}·${stats.lastBand} body/band`
                  : 'No workouts yet'
              }
              className="border-r border-b border-zinc-800"
            />
            <StatCell
              label="Best"
              value={String(stats.bestTotal)}
              hint={stats.bestLabel ?? '—'}
              className="border-b border-zinc-800"
            />
            <StatCell
              label="Change"
              value={vsLabel}
              valueClassName={vsClass}
              hint="Vs prior workout"
              className="border-r border-zinc-800"
            />
            <StatCell
              label="Workouts"
              value={String(stats.workoutCount)}
              hint="Finished sessions"
            />
          </div>

          <ProgressionChart
            data={chartData}
            exerciseName={active.name}
            className="min-h-0 flex-1"
          />

          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            disabled={historySessions.length === 0}
            className="mt-3 flex h-12 w-full shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-zinc-950 text-sm font-semibold text-zinc-200 ring-1 ring-zinc-800 active:bg-zinc-900 disabled:opacity-40"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit history
            {historySessions.length > 0 ? (
              <span className="tabular-nums text-zinc-500">
                ({historySessions.length})
              </span>
            ) : null}
          </button>

          <div className="mt-2 flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              className="flex h-14 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-emerald-500/10 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-500/25 active:bg-emerald-500/18 active:text-emerald-200"
              aria-label="Previous exercise"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="flex h-14 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-emerald-500/10 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-500/25 active:bg-emerald-500/18 active:text-emerald-200"
              aria-label="Next exercise"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <HistorySheet
            open={historyOpen && !editing}
            exerciseName={active.name}
            sessions={historySessions}
            onClose={() => setHistoryOpen(false)}
            onEdit={(session) => {
              setEditing(session);
              setHistoryOpen(false);
            }}
          />
          <SessionEditor
            store={store}
            session={editing}
            exerciseName={active.name}
            onClose={() => {
              setEditing(null);
              setHistoryOpen(true);
            }}
          />
        </>
      ) : null}
    </div>
  );
}
