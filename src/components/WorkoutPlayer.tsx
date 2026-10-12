import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
} from 'lucide-react';
import type { AssistanceType, WorkoutSession } from '../types';
import type { WorkoutStore } from '../hooks/useWorkoutStore';
import { useRestTimer } from '../hooks/useRestTimer';
import { formatDuration, isSameDay } from '../utils/format';
import {
  getLastSessionSummary,
  getPreviousSession,
  sumSets,
} from '../utils/stats';
import { SessionEditor } from './SessionEditor';

interface WorkoutPlayerProps {
  store: WorkoutStore;
  /** Queue index to open first (tap from Train Hard). */
  startIndex?: number;
  onExit: () => void;
}

export function WorkoutPlayer({
  store,
  startIndex = 0,
  onExit,
}: WorkoutPlayerProps) {
  const exercises = store.data.exercises;
  const [index, setIndex] = useState(() => {
    if (exercises.length === 0) return 0;
    return Math.min(Math.max(startIndex, 0), exercises.length - 1);
  });
  const [reps, setReps] = useState(8);
  const [assistance, setAssistance] = useState<AssistanceType>('bodyweight');
  const [editing, setEditing] = useState<WorkoutSession | null>(null);

  const timer = useRestTimer(store.data.settings.restSeconds);
  const exercise = exercises[index] ?? null;
  const resting =
    timer.phase === 'running' ||
    timer.phase === 'paused' ||
    timer.phase === 'done';
  const queueLen = exercises.length;

  useEffect(() => {
    if (!exercise) return;
    const session = store.startOrResumeSession(exercise.id);
    setAssistance('bodyweight');
    timer.dismiss();

    const prev = getPreviousSession(
      store.data.sessions,
      exercise.id,
      session.id,
    );
    if (prev?.sets[0]) {
      setReps(prev.sets[0].reps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise?.id, index]);

  useEffect(() => {
    if (timer.phase !== 'done') return;
    const t = window.setTimeout(() => timer.dismiss(), 1200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.phase]);

  const todaySessions = useMemo(() => {
    if (!exercise) return [];
    return store.data.sessions
      .filter(
        (s) =>
          s.exerciseId === exercise.id &&
          isSameDay(s.startedAt) &&
          s.sets.length > 0,
      )
      .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  }, [exercise, store.data.sessions]);

  const todaySets = useMemo(
    () =>
      todaySessions
        .flatMap((s) => s.sets)
        .sort((a, b) => a.loggedAt.localeCompare(b.loggedAt)),
    [todaySessions],
  );

  const todayTotals = todaySets.length > 0 ? sumSets(todaySets) : null;
  const todayReps = todayTotals?.totalReps ?? 0;
  const todaySetCount = todaySets.length;
  const todayEditable =
    todaySessions.length === 1
      ? todaySessions[0]!
      : todaySessions.find((s) => !s.finishedAt) ??
        todaySessions[todaySessions.length - 1] ??
        null;
  const lastSession = useMemo(
    () =>
      getLastSessionSummary(
        store.data.sessions,
        exercise?.id ?? '',
      ),
    [exercise?.id, store.data.sessions],
  );
  const lastTotals = lastSession.totals;
  const progress =
    timer.duration > 0 ? timer.remaining / timer.duration : 0;

  if (!exercise) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold text-zinc-100">No exercises yet</p>
        <p className="mt-2 text-sm text-zinc-500">
          Add some in Settings to start training.
        </p>
        <button
          type="button"
          onClick={onExit}
          className="mt-8 min-h-14 w-full max-w-xs rounded-2xl bg-emerald-500 text-base font-bold text-zinc-950 active:bg-emerald-400"
        >
          Back to Train Hard
        </button>
      </div>
    );
  }

  const handleLog = () => {
    if (!exercise || reps < 1) return;
    const active = store.startOrResumeSession(exercise.id);
    store.logSet(active.id, reps, assistance);
    timer.start(store.data.settings.restSeconds);
  };

  const hop = (delta: number) => {
    if (queueLen === 0) return;
    // Drop empty shells; keep today's sets open until the day rolls over.
    if (exercise) {
      const open = store.data.sessions.find(
        (s) =>
          s.exerciseId === exercise.id &&
          !s.finishedAt &&
          isSameDay(s.startedAt),
      );
      if (open && open.sets.length === 0) {
        store.discardEmptySession(open.id);
      }
    }
    timer.dismiss();
    setIndex((i) => (i + delta + queueLen) % queueLen);
  };

  return (
    <div className="flex flex-1 flex-col px-5 pb-2">
      <header
        className={`shrink-0 transition-opacity duration-300 ${
          resting ? 'pointer-events-none opacity-25' : 'opacity-100'
        }`}
      >
        <div className="mb-3 flex items-baseline gap-2.5">
          <h2 className="min-w-0 flex-1 truncate text-[1.65rem] font-bold leading-tight tracking-tight text-zinc-50">
            {exercise.name}
          </h2>
          <p className="shrink-0 text-sm font-medium tabular-nums text-zinc-500">
            {index + 1}/{queueLen}
          </p>
        </div>

        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950/40 backdrop-blur-[2px]">
          <div className="border-r border-zinc-800/70 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
              Last
              {lastSession.label ? (
                <span className="ml-1 font-medium normal-case tracking-normal text-zinc-500">
                  {lastSession.label}
                </span>
              ) : null}
            </p>
            <p className="mt-2 font-mono text-lg font-bold leading-none tabular-nums text-zinc-50">
              {lastTotals?.totalReps ?? 0}{' '}
              <span className="text-xs font-semibold text-zinc-500">reps</span>
            </p>
            <p className="mt-1 text-xs tabular-nums text-zinc-500">
              {lastTotals?.setCount ?? 0} set
              {(lastTotals?.setCount ?? 0) === 1 ? '' : 's'}
            </p>
            <div className="mt-2 space-y-0.5 text-xs tabular-nums leading-tight">
              <p>
                <span className="font-semibold text-body">
                  {lastTotals?.bodyweightReps ?? 0}
                </span>{' '}
                <span className="text-body/55">body</span>
              </p>
              <p>
                <span className="font-semibold text-band">
                  {lastTotals?.bandReps ?? 0}
                </span>{' '}
                <span className="text-band/55">band</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (todayEditable) setEditing(todayEditable);
            }}
            disabled={!todayEditable || resting}
            className="px-3 py-3 text-left disabled:opacity-100"
            aria-label={
              todayEditable ? "Edit today's sets" : 'No sets logged today'
            }
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
              Today
              {todayEditable ? (
                <span className="ml-1 font-medium normal-case tracking-normal text-emerald-500/80">
                  edit
                </span>
              ) : null}
            </p>
            <p className="mt-2 font-mono text-lg font-bold leading-none tabular-nums text-zinc-50">
              {todayReps}{' '}
              <span className="text-xs font-semibold text-zinc-500">reps</span>
            </p>
            <p className="mt-1 text-xs tabular-nums text-zinc-500">
              {todaySetCount} set{todaySetCount === 1 ? '' : 's'}
            </p>
            <div className="mt-2 space-y-0.5 text-xs tabular-nums leading-tight">
              <p>
                <span className="font-semibold text-body">
                  {todayTotals?.bodyweightReps ?? 0}
                </span>{' '}
                <span className="text-body/55">body</span>
              </p>
              <p>
                <span className="font-semibold text-band">
                  {todayTotals?.bandReps ?? 0}
                </span>{' '}
                <span className="text-band/55">band</span>
              </p>
            </div>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <div
            className={`flex shrink-0 flex-col gap-3 transition-opacity duration-300 ${
              resting ? 'pointer-events-none opacity-20' : 'opacity-100'
            }`}
          >
            <div className="mx-auto flex w-full max-w-xs rounded-full bg-zinc-950/50 p-0.5 ring-1 ring-zinc-800/70">
              <button
                type="button"
                onClick={() => setAssistance('bodyweight')}
                className={`min-h-9 flex-1 rounded-full text-xs font-semibold transition ${
                  assistance === 'bodyweight'
                    ? 'bg-body/15 text-body ring-1 ring-body/35'
                    : 'text-zinc-500'
                }`}
              >
                Body
              </button>
              <button
                type="button"
                onClick={() => setAssistance('band')}
                className={`min-h-9 flex-1 rounded-full text-xs font-semibold transition ${
                  assistance === 'band'
                    ? 'bg-band/15 text-band ring-1 ring-band/35'
                    : 'text-zinc-500'
                }`}
              >
                Band
              </button>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setReps((r) => Math.max(1, r - 1))}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 active:bg-zinc-800"
                aria-label="Decrease reps"
              >
                <Minus className="h-6 w-6" />
              </button>
              <div className="min-w-[4.5rem] text-center">
                <p className="font-mono text-[3.5rem] font-bold leading-none tabular-nums text-zinc-50">
                  {reps}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  reps
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReps((r) => r + 1)}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 active:bg-zinc-800"
                aria-label="Increase reps"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleLog}
              disabled={resting && timer.phase === 'running'}
              className="mx-auto flex min-h-14 w-full max-w-xs items-center justify-center rounded-2xl bg-emerald-500 text-base font-bold text-zinc-950 shadow-[0_0_24px_rgba(16,185,129,0.28)] active:bg-emerald-400 disabled:opacity-40"
            >
              Done
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <div className="mx-auto h-[11.5rem] max-h-[11.5rem] min-h-0 w-full max-w-sm shrink-0">
            {resting ? (
              <section className="rest-pulse flex h-full max-h-full flex-col justify-center rounded-2xl border bg-amber-500/[0.07] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-500/80">
                      Resting
                    </p>
                    <p className="rest-digit-pulse mt-1 font-mono text-[2.75rem] font-bold leading-none tabular-nums tracking-tight text-amber-50">
                      {formatDuration(timer.remaining)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => timer.dismiss()}
                    className="flex min-h-12 shrink-0 items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 text-sm font-bold text-zinc-950 active:bg-amber-400"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Ready
                  </button>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-900">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-[width] duration-1000 ease-linear"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                  {store.data.settings.restExtendSeconds.map((sec, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => timer.extend(sec)}
                      className="min-h-9 rounded-lg bg-zinc-950/50 text-xs font-semibold text-amber-200/70 active:bg-zinc-900 active:text-amber-100"
                    >
                      +{sec}s
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`mt-2 grid h-14 shrink-0 grid-cols-2 gap-2 transition-opacity duration-300 ${
          resting ? 'opacity-30' : 'opacity-100'
        }`}
      >
        <button
          type="button"
          onClick={() => hop(-1)}
          className="flex h-full items-center justify-center gap-1.5 rounded-2xl bg-emerald-500/10 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-500/25 active:bg-emerald-500/18 active:text-emerald-200"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          Previous
        </button>
        <button
          type="button"
          onClick={() => hop(1)}
          className="flex h-full items-center justify-center gap-1.5 rounded-2xl bg-emerald-500/10 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-500/25 active:bg-emerald-500/18 active:text-emerald-200"
        >
          Next
          <ChevronRight className="h-4 w-4 shrink-0" />
        </button>
      </div>

      <SessionEditor
        store={store}
        session={editing}
        exerciseName={exercise.name}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}
