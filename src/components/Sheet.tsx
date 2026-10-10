import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Fraction of viewport height, e.g. 0.92. Omit for content-sized sheets. */
  height?: number;
  /** Content-sized sheet (for short menus). */
  compact?: boolean;
}

const DISMISS_PX = 96;
const DISMISS_VELOCITY = 0.55;

/**
 * Mobile bottom sheet. Portaled to body, capped to the phone column
 * (max-w-md). Swipe the handle (or pull down from top of content) to close.
 */
export function Sheet({
  open,
  onClose,
  children,
  height = 0.94,
  compact = false,
}: SheetProps) {
  const [armed, setArmed] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const lastY = useRef(0);
  const lastT = useRef(0);
  const velocity = useRef(0);
  const dragYRef = useRef(0);
  const armedRef = useRef(false);
  const pct = Math.round(height * 100);

  useEffect(() => {
    if (!open) {
      setArmed(false);
      armedRef.current = false;
      setDragY(0);
      dragYRef.current = 0;
      setDragging(false);
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const armTimer = window.setTimeout(() => {
      setArmed(true);
      armedRef.current = true;
    }, 280);

    return () => {
      window.clearTimeout(armTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  const beginDrag = (clientY: number) => {
    startY.current = clientY;
    lastY.current = clientY;
    lastT.current = performance.now();
    velocity.current = 0;
    setDragging(true);
  };

  const moveDrag = (clientY: number) => {
    const dy = Math.max(0, clientY - startY.current);
    const now = performance.now();
    const dt = Math.max(1, now - lastT.current);
    velocity.current = (clientY - lastY.current) / dt;
    lastY.current = clientY;
    lastT.current = now;
    dragYRef.current = dy;
    setDragY(dy);
  };

  const endDrag = () => {
    const y = dragYRef.current;
    const shouldClose =
      y > DISMISS_PX || velocity.current > DISMISS_VELOCITY;
    setDragging(false);
    dragYRef.current = 0;
    setDragY(0);
    if (shouldClose && armedRef.current) onClose();
  };

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    beginDrag(e.clientY);
  };

  const onHandlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    moveDrag(e.clientY);
  };

  const onHandlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    endDrag();
  };

  const panelStyle = {
    ...(compact
      ? { maxHeight: '70vh' }
      : { height: `${pct}vh`, minHeight: '75vh' }),
    transform: dragY ? `translateY(${dragY}px)` : undefined,
    transition: dragging ? 'none' : 'transform 180ms ease-out',
  } as CSSProperties;

  const backdropOpacity = Math.max(0.25, 0.7 * (1 - dragY / 420));

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black"
        style={{ opacity: backdropOpacity }}
        onClick={() => {
          if (armed) onClose();
        }}
      />

      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="pointer-events-auto relative flex h-full w-full max-w-md flex-col justify-end">
          <div
            className="sheet-panel relative z-[101] flex w-full flex-col overflow-hidden rounded-t-3xl border-t border-zinc-700/70 bg-zinc-950 shadow-[0_-12px_40px_rgba(0,0,0,0.55)] will-change-transform"
            style={panelStyle}
            data-h={compact ? undefined : pct}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex shrink-0 touch-none justify-center pb-2 pt-3"
              onPointerDown={onHandlePointerDown}
              onPointerMove={onHandlePointerMove}
              onPointerUp={onHandlePointerUp}
              onPointerCancel={onHandlePointerUp}
              role="presentation"
              aria-label="Drag down to close"
            >
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
