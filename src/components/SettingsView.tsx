import { useEffect, useState, type ReactNode } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { normalizeRestExtendSeconds } from '../data/defaults';
import type { WorkoutStore } from '../hooks/useWorkoutStore';
import { ExerciseEditor } from './ExerciseEditor';
import { InstallPrompt } from './InstallPrompt';
import { PageTitle } from './PageTitle';

interface SettingsViewProps {
  store: WorkoutStore;
}

function SettingsSection({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {title}
        </h3>
        {meta && (
          <span className="text-[11px] tabular-nums text-zinc-600">{meta}</span>
        )}
      </div>
      {children}
    </section>
  );
}

export function SettingsView({ store }: SettingsViewProps) {
  const [restInput, setRestInput] = useState(
    String(store.data.settings.restSeconds),
  );
  const [extendInputs, setExtendInputs] = useState(
    store.data.settings.restExtendSeconds.map(String),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setRestInput(String(store.data.settings.restSeconds));
    setExtendInputs(store.data.settings.restExtendSeconds.map(String));
  }, [
    store.data.settings.restSeconds,
    store.data.settings.restExtendSeconds,
  ]);

  const saveRest = () => {
    const rest = Math.max(15, Math.min(600, Number(restInput) || 90));
    const extendsSec = normalizeRestExtendSeconds(
      extendInputs.map((v) => Number(v)),
    );
    store.updateSettings({
      restSeconds: rest,
      restExtendSeconds: extendsSec,
    });
    setRestInput(String(rest));
    setExtendInputs(extendsSec.map(String));
    setMessage('Saved.');
  };

  const handleExport = () => {
    const blob = new Blob([store.exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consifit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Exported.');
  };

  return (
    <div className="scrollbar-hide relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-3">
      <PageTitle title="Settings" subtitle="Rest, exercises, backup." />

      <InstallPrompt variant="banner" />

      <div className="flex flex-col gap-3">
        <SettingsSection title="Rest">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <label
                className="min-w-0 flex-1 text-sm text-zinc-400"
                htmlFor="rest"
              >
                Default (sec)
              </label>
              <input
                id="rest"
                type="number"
                inputMode="numeric"
                min={15}
                max={600}
                value={restInput}
                onChange={(e) => setRestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveRest();
                }}
                className="min-h-10 w-20 rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-center text-sm tabular-nums text-zinc-100 focus:border-emerald-500/40 focus:outline-none"
              />
            </div>
            <div>
              <p className="mb-1.5 text-sm text-zinc-400">
                Quick add (+sec)
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {extendInputs.map((value, i) => (
                  <input
                    key={i}
                    type="number"
                    inputMode="numeric"
                    min={5}
                    max={180}
                    value={value}
                    onChange={(e) => {
                      const next = [...extendInputs];
                      next[i] = e.target.value;
                      setExtendInputs(next);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRest();
                    }}
                    className="min-h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-center text-sm tabular-nums text-zinc-100 focus:border-emerald-500/40 focus:outline-none"
                    aria-label={`Quick add button ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={saveRest}
              className="min-h-10 w-full rounded-lg bg-emerald-500 text-xs font-semibold text-zinc-950 active:bg-emerald-400"
            >
              Save
            </button>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Exercises"
          meta={String(store.data.exercises.length)}
        >
          <ExerciseEditor store={store} />
        </SettingsSection>

        <SettingsSection title="Backup">
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-zinc-950 text-xs font-medium text-zinc-300 ring-1 ring-zinc-800 active:bg-zinc-900"
              >
                <Download className="h-3.5 w-3.5" />
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-rose-400 ring-1 ring-rose-500/30 active:bg-rose-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete data
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  store.loadSampleProgress();
                  setMessage('Sample chart data loaded. Open Progress.');
                }}
                className="flex min-h-10 flex-1 items-center justify-center rounded-lg bg-zinc-950 text-xs font-medium text-zinc-300 ring-1 ring-zinc-800 active:bg-zinc-900"
              >
                Load sample
              </button>
              <button
                type="button"
                onClick={() => {
                  store.clearSampleProgress();
                  setMessage('Sample chart data cleared.');
                }}
                className="flex min-h-10 flex-1 items-center justify-center rounded-lg bg-zinc-950 text-xs font-medium text-zinc-500 ring-1 ring-zinc-800 active:bg-zinc-900"
              >
                Clear sample
              </button>
            </div>
          </div>
        </SettingsSection>
      </div>

      {message && (
        <p className="mt-3 text-center text-xs text-emerald-400">{message}</p>
      )}

      {confirmDelete && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 p-5">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-4">
            <p className="text-sm font-semibold text-zinc-50">
              Delete all local data?
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
              This wipes exercises, sessions, and settings on this device. Export
              first if you want a copy. This cannot be undone.
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
                  store.deleteLocalData();
                  setConfirmDelete(false);
                  setMessage('Local data deleted.');
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
  );
}
