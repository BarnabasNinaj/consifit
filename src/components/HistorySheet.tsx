import { Pencil } from 'lucide-react';
import type { WorkoutSession } from '../types';
import { formatDateLabel } from '../utils/format';
import { sumSets } from '../utils/stats';
import { Sheet } from './Sheet';

interface HistorySheetProps {
  open: boolean;
  exerciseName: string;
  sessions: WorkoutSession[];
  onClose: () => void;
  onEdit: (session: WorkoutSession) => void;
}

export function HistorySheet({
  open,
  exerciseName,
  sessions,
  onClose,
  onEdit,
}: HistorySheetProps) {
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <div className="mb-3 shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
            History
          </p>
          <h2 className="mt-1 truncate text-xl font-bold tracking-tight text-zinc-50">
            {exerciseName}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Tap a workout to fix reps or assistance.
          </p>
        </div>

        <ul className="scrollbar-hide min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain">
          {sessions.map((session) => {
            const totals = sumSets(session.sets);
            const date = formatDateLabel(
              session.finishedAt ?? session.startedAt,
            );
            return (
              <li key={session.id}>
                <button
                  type="button"
                  onClick={() => onEdit(session)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-3 py-3 text-left active:bg-zinc-800/80"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-100">
                      {date}
                    </p>
                    <p className="mt-0.5 text-xs tabular-nums text-zinc-500">
                      {totals.totalReps} reps · {totals.setCount} set
                      {totals.setCount === 1 ? '' : 's'} ·{' '}
                      <span className="text-body">
                        {totals.bodyweightReps} body
                      </span>
                      {' · '}
                      <span className="text-band">{totals.bandReps} band</span>
                    </p>
                  </div>
                  <Pencil className="h-4 w-4 shrink-0 text-zinc-500" />
                </button>
              </li>
            );
          })}
          {sessions.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-600">
              No workouts to edit yet.
            </p>
          )}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 min-h-12 shrink-0 rounded-xl bg-zinc-800 text-sm font-semibold text-zinc-200 active:bg-zinc-700"
        >
          Close
        </button>
      </div>
    </Sheet>
  );
}
