import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Fraction of viewport height, e.g. 0.92 */
  height?: number;
}

/**
 * Mobile bottom sheet. Portaled to body, but capped to the phone column
 * (max-w-md) so desktop never stretches controls edge-to-edge.
 */
export function Sheet({ open, onClose, children, height = 0.94 }: SheetProps) {
  const [armed, setArmed] = useState(false);
  const pct = Math.round(height * 100);

  useEffect(() => {
    if (!open) {
      setArmed(false);
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const armTimer = window.setTimeout(() => setArmed(true), 320);

    return () => {
      window.clearTimeout(armTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  const panelStyle = {
    height: `${pct}vh`,
    minHeight: '75vh',
  } as CSSProperties;

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70"
        onClick={() => {
          if (armed) onClose();
        }}
      />

      {/* Phone column — matches App max-w-md */}
      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="pointer-events-auto relative flex h-full w-full max-w-md flex-col justify-end">
          <div
            className="sheet-panel relative z-[101] flex w-full flex-col overflow-hidden rounded-t-3xl border-t border-zinc-700/70 bg-zinc-950 shadow-[0_-12px_40px_rgba(0,0,0,0.55)]"
            style={panelStyle}
            data-h={pct}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 justify-center pb-1 pt-3">
              <div className="h-1 w-10 rounded-full bg-zinc-600" />
            </div>
            <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
