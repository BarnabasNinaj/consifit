import { useCallback, useEffect, useRef, useState } from 'react';
import { playTimerChime } from '../utils/audio';
import { useWakeLock } from './useWakeLock';

export type RestTimerPhase = 'idle' | 'running' | 'paused' | 'done';

export interface RestTimerState {
  phase: RestTimerPhase;
  remaining: number;
  duration: number;
  minimized: boolean;
}

export function useRestTimer(defaultSeconds: number) {
  const [phase, setPhase] = useState<RestTimerPhase>('idle');
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [duration, setDuration] = useState(defaultSeconds);
  const [minimized, setMinimized] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const chimedRef = useRef(false);

  const clearTick = useCallback(() => {
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds?: number) => {
      const next = seconds ?? defaultSeconds;
      clearTick();
      chimedRef.current = false;
      setDuration(next);
      setRemaining(next);
      setPhase('running');
      setMinimized(false);
    },
    [clearTick, defaultSeconds],
  );

  const pause = useCallback(() => {
    if (phase !== 'running') return;
    clearTick();
    setPhase('paused');
  }, [clearTick, phase]);

  const resume = useCallback(() => {
    if (phase !== 'paused') return;
    setPhase('running');
  }, [phase]);

  const skip = useCallback(() => {
    clearTick();
    setRemaining(0);
    setPhase('done');
    setMinimized(false);
  }, [clearTick]);

  const extend = useCallback((extraSeconds = 30) => {
    setRemaining((r) => r + extraSeconds);
    setDuration((d) => d + extraSeconds);
    setPhase((p) => (p === 'done' || p === 'idle' ? 'running' : p));
    setMinimized(false);
    chimedRef.current = false;
  }, []);

  const dismiss = useCallback(() => {
    clearTick();
    setPhase('idle');
    setRemaining(defaultSeconds);
    setMinimized(false);
  }, [clearTick, defaultSeconds]);

  useEffect(() => {
    if (phase !== 'running') {
      clearTick();
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTick();
          setPhase('done');
          setMinimized(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTick;
  }, [phase, clearTick]);

  useEffect(() => {
    if (phase === 'done' && !chimedRef.current) {
      chimedRef.current = true;
      void playTimerChime();
    }
  }, [phase]);

  useWakeLock(phase === 'running' || phase === 'paused');

  return {
    phase,
    remaining,
    duration,
    minimized,
    setMinimized,
    start,
    pause,
    resume,
    skip,
    extend,
    dismiss,
  } satisfies RestTimerState & {
    setMinimized: (v: boolean) => void;
    start: (seconds?: number) => void;
    pause: () => void;
    resume: () => void;
    skip: () => void;
    extend: (extraSeconds?: number) => void;
    dismiss: () => void;
  };
}
