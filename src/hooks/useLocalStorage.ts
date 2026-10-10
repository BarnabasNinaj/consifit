import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const read = useCallback((): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return initialValue;
      return JSON.parse(raw) as T;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [stored, setStored] = useState<T>(read);

  useEffect(() => {
    setStored(read());
  }, [read]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Quota or private mode — keep in-memory state.
        }
        return next;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    localStorage.removeItem(key);
    setStored(initialValue);
  }, [key, initialValue]);

  return [stored, setValue, remove];
}
