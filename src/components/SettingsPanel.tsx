import { useEffect, useRef, useState } from 'react';
import { Download, Upload, X } from 'lucide-react';
import type { WorkoutStore } from '../hooks/useWorkoutStore';
import { PageTitle } from './PageTitle';
import { Sheet } from './Sheet';

interface SettingsPanelProps {
  open: boolean;
  store: WorkoutStore;
  onClose: () => void;
}

export function SettingsPanel({ open, store, onClose }: SettingsPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [restInput, setRestInput] = useState(
    String(store.data.settings.restSeconds),
  );
  const [bandDraft, setBandDraft] = useState(
    store.data.settings.bandPresets.join(', '),
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setRestInput(String(store.data.settings.restSeconds));
    setBandDraft(store.data.settings.bandPresets.join(', '));
    setMessage(null);
  }, [open, store.data.settings.restSeconds, store.data.settings.bandPresets]);

  const saveSettings = () => {
    const rest = Math.max(15, Math.min(600, Number(restInput) || 90));
    const presets = bandDraft
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    store.updateSettings({
      restSeconds: rest,
      bandPresets: presets.length ? presets : store.data.settings.bandPresets,
    });
    setRestInput(String(rest));
    setMessage('Settings saved.');
  };

  const handleExport = () => {
    const blob = new Blob([store.exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consifit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Export downloaded.');
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const result = store.importData(text);
    setMessage(result.ok ? 'Import successful.' : result.error);
  };

  return (
    <Sheet open={open} onClose={onClose} height={0.88}>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <PageTitle
          title="Settings"
          subtitle="Rest time, bands, and backups."
          action={
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-zinc-900 p-2.5 text-zinc-400"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          }
        />

        <section className="mb-5 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="text-sm font-semibold text-zinc-200">Rest timer</h3>
          <label className="block text-xs text-zinc-500">
            Default rest (seconds)
            <input
              type="number"
              inputMode="numeric"
              min={15}
              max={600}
              value={restInput}
              onChange={(e) => setRestInput(e.target.value)}
              className="mt-1.5 min-h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-base text-zinc-100 focus:border-emerald-500/40 focus:outline-none"
            />
          </label>
          <label className="block text-xs text-zinc-500">
            Band presets (comma-separated)
            <input
              type="text"
              value={bandDraft}
              onChange={(e) => setBandDraft(e.target.value)}
              className="mt-1.5 min-h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-base text-zinc-100 focus:border-emerald-500/40 focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={saveSettings}
            className="min-h-12 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white"
          >
            Save settings
          </button>
        </section>

        <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="text-sm font-semibold text-zinc-200">Data backup</h3>
          <p className="text-xs text-zinc-500">
            Export or import a JSON backup. Everything stays on this device unless
            you move the file yourself.
          </p>
          <button
            type="button"
            onClick={handleExport}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 text-sm font-semibold text-zinc-100"
          >
            <Download className="h-4 w-4" />
            Export Data (JSON)
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 text-sm font-semibold text-zinc-100"
          >
            <Upload className="h-4 w-4" />
            Import Data
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImport(file);
              e.target.value = '';
            }}
          />
        </section>

        {message && (
          <p className="mt-4 text-center text-sm text-emerald-400">{message}</p>
        )}

        <p className="mt-6 text-center text-[11px] text-zinc-600">
          Consifit · Offline-first PWA · localStorage
        </p>
      </div>
    </Sheet>
  );
}
