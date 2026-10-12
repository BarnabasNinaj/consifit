import { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { AssistanceType, WorkoutSession } from '../types';
import type { WorkoutStore } from '../hooks/useWorkoutStore';
import { formatDateLabel } from '../utils/format';
import { sumSets } from '../utils/stats';
import { Sheet } from './Sheet';

interface SessionEditorProps {
  store: WorkoutStore;
  session: WorkoutSession | null;
  exerciseName: string;
  onClose: () => void;
}

export function SessionEditor({
  store,
  session,
  exerciseName,
  onClose,
}: SessionEditorProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const live = session ? store.getSession(session.id) : null;
  const open = Boolean(session);

  if (!session) return null;

  const current = live ?? session;
  const totals = sumSets(current.sets);
  const dateLabel = formatDateLabel(current.finishedAt ?? current.startedAt);

  const bumpReps = (setId: string, delta: number) => {
    const set = current.sets.find((s) => s.id === setId);
    if (!set) return;
    store.updateSet(current.id, setId, { reps: Math.max(1, set.reps + delta) });
  };

  const setAssistance = (setId: string, assistance: AssistanceType) => {
    store.updateSet(current.id, setId, { assistance });
  };

  const addSet = (assistance: AssistanceType) => {
    const last = current.sets[current.sets.length - 1];
    store.logSet(
      current.id,
      last?.reps ?? 8,
      assistance,
      assistance === 'band' ? last?.bandLevel : undefined,
    );
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
        <div className="mb-2 shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
            Edit · {dateLabel}
          </p>
          <div className="mt-0.5 flex items-baseline justify-between gap-2">
            <h2 className="min-w-0 truncate text-lg font-bold tracking-tight text-zinc-50">
              {exerciseName}
            </h2>
            <p className="shrink-0 text-xs tabular-nums text-zinc-500">
              {totals.totalReps} ·{' '}
              <span className="text-body">{totals.bodyweightReps}</span>
              {'/'}
              <span className="text-band">{totals.bandReps}</span>
            </p>
          </div>
        </div>

        <ul className="scrollbar-hide min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain">
          {current.sets.map((set, i) => (
            <li
              key={set.id}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/50 px-1.5 py-1"
            >
              <span className="w-5 shrink-0 text-center text-[11px] font-semibold tabular-nums text-zinc-600">
                {i + 1}
              </span>

              <div className="flex min-w-0 flex-1 rounded-full bg-zinc-950/60 p-0.5 ring-1 ring-zinc-800/70">
                <button
                  type="button"
                  onClick={() => setAssistance(set.id, 'bodyweight')}
                  className={`min-h-8 flex-1 rounded-full text-[11px] font-semibold transition ${
                    set.assistance === 'bodyweight'
                      ? 'bg-body/15 text-body ring-1 ring-body/35'
                      : 'text-zinc-500'
                  }`}
                >
                  Body
                </button>
                <button
                  type="button"
                  onClick={() => setAssistance(set.id, 'band')}
                  className={`min-h-8 flex-1 rounded-full text-[11px] font-semibold transition ${
                    set.assistance === 'band'
                      ? 'bg-band/15 text-band ring-1 ring-band/35'
                      : 'text-zinc-500'
                  }`}
                >
                  Band
                </button>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => bumpReps(set.id, -1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 active:bg-zinc-800 active:text-zinc-200"
                  aria-label="Decrease reps"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <p className="min-w-[1.75rem] text-center font-mono text-base font-bold tabular-nums text-zinc-50">
                  {set.reps}
                </p>
                <button
                  type="button"
                  onClick={() => bumpReps(set.id, 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 active:bg-zinc-800 active:text-zinc-200"
                  aria-label="Increase reps"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => store.removeSet(current.id, set.id)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-600 active:bg-zinc-800 active:text-rose-400"
                aria-label={`Delete set ${i + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}

          {current.sets.length === 0 && (
            <p className="py-4 text-center text-xs text-zinc-600">
              No sets left. Add one or delete this workout.
            </p>
          )}
        </ul>

        <div className="mt-2 grid shrink-0 grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => addSet('bodyweight')}
            className="flex h-11 items-center justify-center rounded-xl bg-body/10 text-sm font-semibold text-body ring-1 ring-body/25 active:bg-body/18"
          >
            + Body
          </button>
          <button
            type="button"
            onClick={() => addSet('band')}
            className="flex h-11 items-center justify-center rounded-xl bg-band/10 text-sm font-semibold text-band ring-1 ring-band/25 active:bg-band/18"
          >
            + Band
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 items-center justify-center rounded-xl bg-emerald-500 text-sm font-semibold text-zinc-950 active:bg-emerald-400"
          >
            Done
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex h-11 items-center justify-center rounded-xl text-sm font-semibold text-rose-400 ring-1 ring-rose-500/30 active:bg-rose-500/10"
          >
            Delete
          </button>
        </div>

        {confirmDelete && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/75 p-5">
            <div className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 p-4">
              <p className="text-sm font-semibold text-zinc-50">
                Delete this workout?
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                Removes {dateLabel} · {exerciseName} and all its sets from
                history. Charts update immediately.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="min-h-11 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    store.deleteSession(current.id);
                    setConfirmDelete(false);
                    onClose();
                  }}
                  className="min-h-11 rounded-xl bg-rose-600 text-xs font-semibold text-white active:bg-rose-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
