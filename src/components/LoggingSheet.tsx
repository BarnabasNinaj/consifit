import { useEffect, useMemo, useState } from 'react';
import { Check, Minus, Plus, Trash2, X } from 'lucide-react';
import type { AssistanceType, Exercise, WorkoutSession } from '../types';
import { formatSetLabel } from '../utils/format';
import {
  compareToPrevious,
  getPreviousSession,
  getProgressionData,
  getTodayTotalsForExercise,
  sumSets,
} from '../utils/stats';
import type { WorkoutStore } from '../hooks/useWorkoutStore';
import { SummaryHeader } from './SummaryHeader';
import { ProgressionChart } from './ProgressionChart';
import { Sheet } from './Sheet';

interface LoggingSheetProps {
  open: boolean;
  exercise: Exercise | null;
  store: WorkoutStore;
  onClose: () => void;
  onSetLogged: () => void;
  onFinished: () => void;
}

export function LoggingSheet({
  open,
  exercise,
  store,
  onClose,
  onSetLogged,
  onFinished,
}: LoggingSheetProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reps, setReps] = useState(8);
  const [assistance, setAssistance] = useState<AssistanceType>('bodyweight');
  const [bandLevel, setBandLevel] = useState(
    store.data.settings.bandPresets[0] ?? '',
  );
  const [customBand, setCustomBand] = useState('');
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    if (!open || !exercise) {
      setSessionId(null);
      return;
    }

    try {
      const session = store.startOrResumeSession(exercise.id);
      setSessionId(session.id);
      setReps(8);
      setAssistance('bodyweight');
      setBandLevel(store.data.settings.bandPresets[0] ?? '');
      setCustomBand('');
      setShowChart(false);
    } catch (err) {
      console.error('Failed to start session', err);
    }
  }, [open, exercise?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const session: WorkoutSession | undefined = sessionId
    ? store.data.sessions.find((s) => s.id === sessionId)
    : undefined;

  const previous = useMemo(() => {
    if (!exercise) return undefined;
    return getPreviousSession(
      store.data.sessions,
      exercise.id,
      sessionId ?? undefined,
    );
  }, [exercise, store.data.sessions, sessionId]);

  const todayTotals = useMemo(() => {
    if (!exercise) {
      return { bodyweightReps: 0, bandReps: 0, totalReps: 0, setCount: 0 };
    }
    return getTodayTotalsForExercise(store.data.sessions, exercise.id);
  }, [exercise, store.data.sessions]);

  const previousTotals = previous ? sumSets(previous.sets) : undefined;
  const progression = useMemo(() => {
    if (!exercise) return [];
    return getProgressionData(store.data.sessions, exercise.id, 10);
  }, [exercise, store.data.sessions]);

  const closeSheet = () => {
    if (sessionId) store.discardEmptySession(sessionId);
    onClose();
  };

  const handleLog = () => {
    if (!sessionId || reps < 1) return;
    const level =
      assistance === 'band'
        ? customBand.trim() || bandLevel || 'Band'
        : undefined;
    store.logSet(sessionId, reps, assistance, level);
    onSetLogged();
  };

  const handleFinish = () => {
    if (!sessionId) return;
    store.finishWorkout(sessionId);
    onFinished();
    onClose();
  };

  const presets = store.data.settings.bandPresets;

  return (
    <Sheet open={open && Boolean(exercise)} onClose={closeSheet} height={0.94}>
      {exercise && (
        <>
          {/* Upper reference zone (~40%) */}
          <div className="min-h-0 flex-[0.42] overflow-y-auto overscroll-contain px-4 pb-2">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-400/80">
                  {exercise.category}
                </p>
                <h2 className="truncate text-xl font-bold text-zinc-50">
                  {exercise.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeSheet}
                className="shrink-0 rounded-xl bg-zinc-900 p-3 text-zinc-400 active:bg-zinc-800"
                aria-label="Close sheet"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {previous ? (
              <div className="mb-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Previous session
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  {sumSets(previous.sets).totalReps} reps · {previous.sets.length}{' '}
                  sets · {sumSets(previous.sets).bodyweightReps} BW /{' '}
                  {sumSets(previous.sets).bandReps} Band
                </p>
                <ul className="mt-2 space-y-1">
                  {previous.sets.map((set, i) => (
                    <li key={set.id} className="text-xs text-zinc-500">
                      {formatSetLabel(set, i)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mb-3 rounded-2xl border border-dashed border-zinc-800 px-3 py-3 text-sm text-zinc-500">
                First session for this exercise — set your baseline.
              </div>
            )}

            <SummaryHeader
              today={todayTotals}
              previous={previousTotals}
              hasPrevious={Boolean(previous)}
            />

            {session && session.sets.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  This workout
                </p>
                <ul className="space-y-1.5">
                  {session.sets.map((set, i) => (
                    <li
                      key={set.id}
                      className="flex items-center justify-between rounded-xl bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-200"
                    >
                      <span>{formatSetLabel(set, i)}</span>
                      <button
                        type="button"
                        onClick={() => store.removeSet(session.id, set.id)}
                        className="rounded-lg p-2 text-zinc-500 active:bg-zinc-800 active:text-rose-400"
                        aria-label="Delete set"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowChart((v) => !v)}
              className="mt-3 w-full rounded-xl border border-zinc-800 py-3 text-sm font-medium text-zinc-400 active:bg-zinc-900"
            >
              {showChart ? 'Hide' : 'Show'} progression chart
            </button>
            {showChart && (
              <div className="mt-2 pb-2">
                <ProgressionChart
                  data={progression}
                  exerciseName={exercise.name}
                />
              </div>
            )}
          </div>

          {/* Thumb zone — bottom ~58% */}
          <div className="flex min-h-0 flex-[0.58] flex-col justify-end border-t border-zinc-800 bg-zinc-950 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            <div className="mb-3 flex rounded-2xl bg-zinc-900 p-1">
              <button
                type="button"
                onClick={() => setAssistance('bodyweight')}
                className={`min-h-12 flex-1 rounded-xl text-sm font-semibold transition ${
                  assistance === 'bodyweight'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-zinc-400'
                }`}
              >
                Bodyweight
              </button>
              <button
                type="button"
                onClick={() => setAssistance('band')}
                className={`min-h-12 flex-1 rounded-xl text-sm font-semibold transition ${
                  assistance === 'band'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-zinc-400'
                }`}
              >
                Band Assisted
              </button>
            </div>

            {assistance === 'band' && (
              <div className="mb-3 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setBandLevel(preset);
                        setCustomBand('');
                      }}
                      className={`min-h-10 rounded-full px-3 py-2 text-xs font-medium transition ${
                        !customBand && bandLevel === preset
                          ? 'bg-sky-500/25 text-sky-300 ring-1 ring-sky-500/50'
                          : 'bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customBand}
                  onChange={(e) => setCustomBand(e.target.value)}
                  placeholder="Custom band…"
                  className="min-h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-base text-zinc-100 placeholder:text-zinc-600 focus:border-sky-500/50 focus:outline-none"
                />
              </div>
            )}

            <div className="mb-4 flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => setReps((r) => Math.max(1, r - 1))}
                className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-zinc-800 text-zinc-100 active:bg-zinc-700"
                aria-label="Decrease reps"
              >
                <Minus className="h-8 w-8" />
              </button>
              <div className="min-w-[5.5rem] text-center">
                <p className="font-mono text-5xl font-bold tabular-nums text-zinc-50">
                  {reps}
                </p>
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  reps
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReps((r) => r + 1)}
                className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-zinc-800 text-zinc-100 active:bg-zinc-700"
                aria-label="Increase reps"
              >
                <Plus className="h-8 w-8" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleLog}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-base font-bold text-white active:bg-emerald-500"
              >
                <Check className="h-5 w-5" />
                Log Set
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={!session?.sets.length}
                className="min-h-14 rounded-2xl bg-zinc-800 text-base font-bold text-zinc-100 active:bg-zinc-700 disabled:opacity-40"
              >
                Finish
              </button>
            </div>

            {previousTotals && session && (
              <p className="mt-2 text-center text-[11px] text-zinc-600">
                Target beat:{' '}
                {(() => {
                  const cur = sumSets(session.sets);
                  const d = compareToPrevious(cur, previousTotals);
                  return `${d.bwDelta >= 0 ? '+' : ''}${d.bwDelta} BW, ${
                    d.bandDelta >= 0 ? '+' : ''
                  }${d.bandDelta} Band`;
                })()}
              </p>
            )}
          </div>
        </>
      )}
    </Sheet>
  );
}
