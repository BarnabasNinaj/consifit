import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatDeltaPill } from '../utils/stats';
import type { SessionTotals } from '../types';

interface SummaryHeaderProps {
  today: SessionTotals;
  previous?: SessionTotals;
  hasPrevious: boolean;
}

export function SummaryHeader({ today, previous, hasPrevious }: SummaryHeaderProps) {
  const bwDelta = today.bodyweightReps - (previous?.bodyweightReps ?? 0);
  const bandDelta = today.bandReps - (previous?.bandReps ?? 0);
  const netPositive = bwDelta + bandDelta >= 0;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Today&apos;s totals
      </p>
      <div className="mt-2 flex items-end gap-4">
        <div>
          <p className="text-3xl font-bold tabular-nums text-zinc-50">
            {today.totalReps}
          </p>
          <p className="text-xs text-zinc-500">total reps</p>
        </div>
        <div className="mb-0.5 flex flex-1 gap-3 text-sm">
          <div>
            <p className="font-semibold tabular-nums text-emerald-400">
              {today.bodyweightReps}
            </p>
            <p className="text-xs text-zinc-500">BW</p>
          </div>
          <div>
            <p className="font-semibold tabular-nums text-sky-400">
              {today.bandReps}
            </p>
            <p className="text-xs text-zinc-500">Band</p>
          </div>
          <div>
            <p className="font-semibold tabular-nums text-zinc-300">
              {today.setCount}
            </p>
            <p className="text-xs text-zinc-500">Sets</p>
          </div>
        </div>
      </div>

      {hasPrevious && (
        <div
          className={`mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
            netPositive
              ? 'bg-emerald-500/15 text-emerald-300'
              : 'bg-amber-500/15 text-amber-300'
          }`}
        >
          {netPositive ? (
            <TrendingUp className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="truncate">{formatDeltaPill(bwDelta, bandDelta)}</span>
        </div>
      )}
    </div>
  );
}
