import { useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, ChevronRight, Minus, Plus } from 'lucide-react';
import type { AssistanceType } from '../types';
import type { WorkoutStore } from '../hooks/useWorkoutStore';
import { useRestTimer } from '../hooks/useRestTimer';
import { formatDuration, isSameDay } from '../utils/format';
import { getPreviousSession, sumSets } from '../utils/stats';
import { PageTitle } from './PageTitle';

interface WorkoutPlayerProps {
  store: WorkoutStore;
  startIndex: number;
  onExit: () => void;
}

export function WorkoutPlayer({
  store,
  startIndex,
  onExit,
}: WorkoutPlayerProps) {
  const exercises = store.data.exercises;
  const [index, setIndex] = useState(startIndex);
  const [complete, setComplete] = useState(false);
  const [reps, setReps] = useState(8);
  const [assistance, setAssistance] = useState<AssistanceType>('bodyweight');
  const [bandLevel, setBandLevel] = useState(
    store.data.settings.bandPresets[0] ?? 'Light / Red',
  );

  const timer = useRestTimer(store.data.settings.restSeconds);
  const exercise = exercises[index] ?? null;
  const resting =
    timer.phase === 'running' ||
    timer.phase === 'paused' ||
    timer.phase === 'done';

  useEffect(() => {
    if (!exercise) return;
    const session = store.startOrResumeSession(exercise.id);
    setAssistance('bodyweight');
    setComplete(false);
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
  }, [exercise?.id]);

  useEffect(() => {
    if (timer.phase !== 'done') return;
    const t = window.setTimeout(() => timer.dismiss(), 1200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.phase]);

  const todaySets = useMemo(() => {
    if (!exercise) return [];
    return store.data.sessions
      .filter((s) => s.exerciseId === exercise.id && isSameDay(s.startedAt))
      .flatMap((s) => s.sets)
      .sort((a, b) => a.loggedAt.localeCompare(b.loggedAt));
  }, [exercise, store.data.sessions]);

  const setNumber = todaySets.length + 1;
  const todayTotals = todaySets.length > 0 ? sumSets(todaySets) : null;
  const progress =
    timer.duration > 0 ? timer.remaining / timer.duration : 0;

  if (!exercise) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold text-zinc-100">No exercises yet</p>
        <p className="mt-2 text-sm text-zinc-500">
          Add some in the menu to start training.
        </p>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-3xl font-bold text-zinc-50">Done</p>
        <p className="mt-2 text-sm text-zinc-400">
          Nice work. Head back when you&apos;re ready.
        </p>
        <button
          type="button"
          onClick={onExit}
          className="mt-8 min-h-14 w-full max-w-xs rounded-2xl bg-emerald-600 text-base font-bold text-white active:bg-emerald-500"
        >
          Train Hard
        </button>
      </div>
    );
  }

  const handleLog = () => {
    if (!exercise || reps < 1) return;
    const active = store.startOrResumeSession(exercise.id);
    store.logSet(
      active.id,
      reps,
      assistance,
      assistance === 'band' ? bandLevel : undefined,
    );
    timer.start(store.data.settings.restSeconds);
  };

  const handleNextExercise = () => {
    if (!exercise) return;
    const active =
      store.data.sessions.find(
        (s) => s.exerciseId === exercise.id && !s.finishedAt,
      ) ?? store.startOrResumeSession(exercise.id);

    if (active.sets.length > 0) {
      store.finishWorkout(active.id);
    } else {
      store.discardEmptySession(active.id);
    }
    timer.dismiss();

    if (index >= exercises.length - 1) {
      setComplete(true);
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <div className="flex flex-1 flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
      {/* ── Context (lowlight) ───────────────────────────── */}
      <header className="shrink-0">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="text-[11px] font-medium tracking-wide text-zinc-600 active:text-zinc-400"
          >
            ← Train Hard
          </button>
          <p className="text-[11px] tabular-nums text-zinc-600">
            {index + 1}/{exercises.length} · Set {setNumber}
          </p>
        </div>

        <PageTitle title={exercise.name} />

        {/* Today — compact readout, not a competing card */}
        <div className="-mt-2 flex items-baseline gap-2 border-b border-zinc-900 pb-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
            Today
          </span>
          {todayTotals ? (
            <>
              <span className="text-lg font-semibold tabular-nums text-zinc-200">
                {todayTotals.totalReps}
              </span>
              <span className="min-w-0 truncate text-sm text-zinc-500">
                {todaySets.map((s) => s.reps).join(' · ')}
                <span className="text-zinc-700">
                  {' '}
                  · {todayTotals.bodyweightReps}bw
                  {todayTotals.bandReps > 0
                    ? ` / ${todayTotals.bandReps}band`
                    : ''}
                </span>
              </span>
            </>
          ) : (
            <span className="text-sm text-zinc-700">—</span>
          )}
        </div>
      </header>

      {/* ── Decision zone (highlight) ────────────────────── */}
      <div
        className={`flex min-h-0 flex-1 flex-col justify-center gap-4 py-4 transition-opacity ${
          resting ? 'opacity-45' : 'opacity-100'
        }`}
      >
        <div className="mx-auto flex w-full max-w-xs rounded-full bg-zinc-900/80 p-0.5 ring-1 ring-zinc-800/80">
          <button
            type="button"
            onClick={() => setAssistance('bodyweight')}
            className={`min-h-9 flex-1 rounded-full text-xs font-semibold transition ${
              assistance === 'bodyweight'
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-500'
            }`}
          >
            Bodyweight
          </button>
          <button
            type="button"
            onClick={() => setAssistance('band')}
            className={`min-h-9 flex-1 rounded-full text-xs font-semibold transition ${
              assistance === 'band'
                ? 'bg-sky-600/90 text-white'
                : 'text-zinc-500'
            }`}
          >
            Band
          </button>
        </div>

        {assistance === 'band' && (
          <div className="flex justify-center gap-1.5 overflow-x-auto">
            {store.data.settings.bandPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setBandLevel(preset)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  bandLevel === preset
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'text-zinc-600'
                }`}
              >
                {preset.split(' / ')[0]}
              </button>
            ))}
          </div>
        )}

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
          className="mx-auto flex min-h-14 w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-base font-bold text-zinc-950 shadow-[0_0_24px_rgba(16,185,129,0.25)] active:bg-emerald-400 disabled:opacity-40"
        >
          <Check className="h-5 w-5" strokeWidth={2.5} />
          Save
        </button>
      </div>

      {/* ── Rest (amber waiting state — only when active) ── */}
      {resting && (
        <section className="mb-3 shrink-0 rounded-2xl bg-amber-500/8 px-3.5 py-3 ring-1 ring-amber-500/25">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-500/80">
                Resting
              </p>
              <p className="mt-0.5 font-mono text-3xl font-bold tabular-nums text-amber-100">
                {formatDuration(timer.remaining)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => timer.dismiss()}
              className="flex min-h-12 items-center gap-1.5 rounded-xl bg-amber-500 px-4 text-sm font-bold text-zinc-950 active:bg-amber-400"
            >
              <CheckCircle2 className="h-4 w-4" />
              Ready
            </button>
          </div>
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-zinc-900">
            <div
              className="h-full rounded-full bg-amber-500 transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            {([10, 20, 30] as const).map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => timer.extend(sec)}
                className="min-h-9 rounded-lg bg-zinc-950/50 text-xs font-semibold text-amber-200/70 active:bg-zinc-900 active:text-amber-100"
              >
                +{sec}s
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Exit lane (lowlight) ─────────────────────────── */}
      <button
        type="button"
        onClick={handleNextExercise}
        className="flex min-h-12 w-full shrink-0 items-center justify-center gap-1 rounded-xl text-sm font-medium text-zinc-600 ring-1 ring-zinc-900 active:bg-zinc-900/60 active:text-zinc-400"
      >
        {index >= exercises.length - 1 ? 'Finish workout' : 'Next exercise'}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
