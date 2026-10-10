import { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

const DISMISS_KEY = 'consifit-install-dismissed';

interface InstallPromptProps {
  /** Compact banner vs full settings card */
  variant?: 'banner' | 'card';
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export function InstallPrompt({ variant = 'banner' }: InstallPromptProps) {
  const { needsInstall, canPrompt, ios, install } = usePwaInstall();
  const [dismissed, setDismissed] = useState(wasDismissed);

  if (!needsInstall) return null;
  if (variant === 'banner' && dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  const body = ios ? (
    <p className="text-sm leading-snug text-zinc-400">
      Tap <Share className="mx-0.5 inline h-3.5 w-3.5 text-sky-400" /> Share →{' '}
      <span className="text-zinc-200">Add to Home Screen</span>, then open from
      the icon — no browser bar.
    </p>
  ) : canPrompt ? (
    <p className="text-sm leading-snug text-zinc-400">
      Install Consifit — opens full-screen from the home icon, no Chrome bar.
    </p>
  ) : (
    <p className="text-sm leading-snug text-zinc-400">
      Chrome menu (⋮) → <span className="text-zinc-200">Install app</span> or{' '}
      <span className="text-zinc-200">Add to Home screen</span>, then open from
      the icon.
    </p>
  );

  if (variant === 'card') {
    return (
      <section className="mb-5 space-y-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
        <h3 className="text-sm font-semibold text-zinc-200">Use as app</h3>
        {body}
        {canPrompt && (
          <button
            type="button"
            onClick={() => void install()}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-semibold text-zinc-950 active:bg-emerald-400"
          >
            <Download className="h-4 w-4" />
            Install Consifit
          </button>
        )}
      </section>
    );
  }

  return (
    <div className="mb-3 flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-3">
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400/90">
          Hide the browser bar
        </p>
        {body}
        {canPrompt && (
          <button
            type="button"
            onClick={() => void install()}
            className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-semibold text-zinc-950 active:bg-emerald-400"
          >
            <Download className="h-4 w-4" />
            Install
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded-lg p-1.5 text-zinc-500 active:bg-zinc-800 active:text-zinc-300"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
