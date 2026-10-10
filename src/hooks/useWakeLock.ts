import { useCallback, useEffect, useRef } from 'react';

type WakeLockSentinelLike = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
};

export function useWakeLock(active: boolean) {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  const release = useCallback(async () => {
    const sentinel = sentinelRef.current;
    sentinelRef.current = null;
    if (sentinel && !sentinel.released) {
      try {
        await sentinel.release();
      } catch {
        // ignore
      }
    }
  }, []);

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      const sentinel = (await (
        navigator as Navigator & {
          wakeLock: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
        }
      ).wakeLock.request('screen')) as WakeLockSentinelLike;
      sentinelRef.current = sentinel;
      sentinel.addEventListener('release', () => {
        if (sentinelRef.current === sentinel) {
          sentinelRef.current = null;
        }
      });
    } catch {
      // Permission denied or unsupported context
    }
  }, []);

  useEffect(() => {
    if (active) {
      void request();
    } else {
      void release();
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && active) {
        void request();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      void release();
    };
  }, [active, request, release]);
}
