import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Pause, Play, SkipForward, X } from 'lucide-react';
import { formatDuration } from '../utils/format';
import type { RestTimerPhase } from '../hooks/useRestTimer';

interface RestTimerProps {
  phase: RestTimerPhase;
  remaining: number;
  duration: number;
  minimized: boolean;
  onExtend: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onDismiss: () => void;
  onExpand: () => void;
  onMinimize: () => void;
}

function PhoneColumn({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[120] flex justify-center">
      <div className="pointer-events-auto relative h-full w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

export function RestTimer({
  phase,
  remaining,
  duration,
  minimized,
  onExtend,
  onPause,
  onResume,
  onSkip,
  onDismiss,
  onExpand,
  onMinimize,
}: RestTimerProps) {
  if (phase === 'idle' || typeof document === 'undefined') return null;

  const progress = duration > 0 ? remaining / duration : 0;

  if (minimized || phase === 'done') {
    return createPortal(
      <PhoneColumn>
        <button
          type="button"
          onClick={phase === 'done' ? onDismiss : onExpand}
          className="safe-bottom-banner absolute inset-x-3 z-[120] flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-zinc-900/95 px-4 py-3 shadow-lg shadow-black/40 backdrop-blur"
        >
          <div className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                phase === 'done'
                  ? 'bg-emerald-400'
                  : 'animate-pulse bg-emerald-400'
              }`}
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-zinc-50">
                {phase === 'done' ? 'Rest complete' : 'Resting'}
              </p>
              <p className="text-xs text-zinc-400">
                {phase === 'done'
                  ? 'Tap to dismiss'
                  : `${formatDuration(remaining)} left · tap to expand`}
              </p>
            </div>
          </div>
          {phase !== 'done' && (
            <span className="font-mono text-lg font-bold tabular-nums text-emerald-400">
              {formatDuration(remaining)}
            </span>
          )}
          {phase === 'done' && <X className="h-5 w-5 text-zinc-400" />}
        </button>
      </PhoneColumn>,
      document.body,
    );
  }

  return createPortal(
    <PhoneColumn>
      <div className="absolute inset-x-0 bottom-0 z-[120] rounded-t-3xl border-t border-zinc-700/80 bg-zinc-950 px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl shadow-black/50">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-700" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Rest timer
            </p>
            <p className="mt-1 font-mono text-5xl font-bold tabular-nums text-zinc-50">
              {formatDuration(remaining)}
            </p>
          </div>
          <button
            type="button"
            onClick={onMinimize}
            className="rounded-xl p-2 text-zinc-500 active:bg-zinc-800 active:text-zinc-300"
            aria-label="Minimize"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onExtend}
            className="min-h-12 rounded-2xl bg-zinc-800 text-sm font-semibold text-zinc-100 active:bg-zinc-700"
          >
            +30s
          </button>
          <button
            type="button"
            onClick={phase === 'paused' ? onResume : onPause}
            className="flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-zinc-800 text-sm font-semibold text-zinc-100 active:bg-zinc-700"
          >
            {phase === 'paused' ? (
              <>
                <Play className="h-4 w-4" /> Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" /> Pause
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 text-sm font-semibold text-white active:bg-emerald-500"
          >
            <SkipForward className="h-4 w-4" /> Skip
          </button>
        </div>
      </div>
    </PhoneColumn>,
    document.body,
  );
}
