import { useMemo, useState } from 'react';
import { ChartLine, ListPlus, Settings, X } from 'lucide-react';
import { ConsifitLogo } from './components/ConsifitLogo';
import { ExerciseManager } from './components/ExerciseManager';
import { LaunchHero } from './components/LaunchHero';
import { Overview } from './components/Overview';
import { PageTitle } from './components/PageTitle';
import { ProgressionChart } from './components/ProgressionChart';
import { SettingsPanel } from './components/SettingsPanel';
import { WorkoutPlayer } from './components/WorkoutPlayer';
import { useWorkoutStore } from './hooks/useWorkoutStore';
import { getProgressionData } from './utils/stats';

type Screen = 'launch' | 'overview' | 'workout' | 'menu' | 'progress';

export default function App() {
  const store = useWorkoutStore();
  const [screen, setScreen] = useState<Screen>('launch');
  const [startIndex, setStartIndex] = useState(0);
  const [workoutKey, setWorkoutKey] = useState(0);
  const [managerOpen, setManagerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chartExerciseId, setChartExerciseId] = useState<string | null>(null);

  const chartExercise =
    store.data.exercises.find((e) => e.id === chartExerciseId) ??
    store.data.exercises[0];

  const chartData = useMemo(
    () =>
      chartExercise
        ? getProgressionData(store.data.sessions, chartExercise.id, 10)
        : [],
    [chartExercise, store.data.sessions],
  );

  const showChrome = screen !== 'launch';

  return (
    <div className="app-shell relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-zinc-950 text-zinc-100">
      {showChrome && (
        <header className="flex shrink-0 items-center justify-between px-5 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={() => setScreen('launch')}
            className="rounded-xl py-1 active:opacity-80"
            aria-label="Consifit — back to start"
          >
            <ConsifitLogo withWordmark />
          </button>
          {(screen === 'menu' || screen === 'progress') && (
            <button
              type="button"
              onClick={() => setScreen('overview')}
              className="rounded-xl bg-zinc-900 p-2 text-zinc-300 active:bg-zinc-800"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </header>
      )}

      {screen === 'launch' && (
        <main className="flex min-h-0 flex-1 flex-col">
          <LaunchHero onEnter={() => setScreen('overview')} />
        </main>
      )}

      {screen === 'overview' && (
        <main className="flex min-h-0 flex-1 flex-col">
          <Overview
            store={store}
            onStart={(i) => {
              setStartIndex(i);
              setWorkoutKey((k) => k + 1);
              setScreen('workout');
            }}
            onOpenMenu={() => setScreen('menu')}
          />
        </main>
      )}

      {screen === 'workout' && (
        <main className="flex min-h-0 flex-1 flex-col">
          <WorkoutPlayer
            key={workoutKey}
            store={store}
            startIndex={startIndex}
            onExit={() => setScreen('overview')}
          />
        </main>
      )}

      {screen === 'menu' && (
        <main className="flex min-h-0 flex-1 flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1">
          <PageTitle title="Menu" subtitle="Progress, exercises, and settings." />
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setScreen('progress')}
              className="flex w-full items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-4 text-left"
            >
              <ChartLine className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="font-semibold">Progress</p>
                <p className="text-sm text-zinc-500">Charts for last 10 workouts</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setManagerOpen(true)}
              className="flex w-full items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-4 text-left"
            >
              <ListPlus className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="font-semibold">Exercises</p>
                <p className="text-sm text-zinc-500">Add, edit, or delete</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex w-full items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-4 text-left"
            >
              <Settings className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="font-semibold">Settings</p>
                <p className="text-sm text-zinc-500">Rest time, bands, backup</p>
              </div>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setScreen('overview')}
            className="mt-auto flex min-h-12 w-full shrink-0 items-center justify-center rounded-xl text-sm font-medium text-zinc-500 ring-1 ring-zinc-900 active:bg-zinc-900/60 active:text-zinc-300"
          >
            Back to Train Hard
          </button>
        </main>
      )}

      {screen === 'progress' && chartExercise && (
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1">
          <button
            type="button"
            onClick={() => setScreen('menu')}
            className="mb-2 self-start text-[11px] font-medium tracking-wide text-zinc-600 active:text-zinc-400"
          >
            ← Menu
          </button>
          <PageTitle
            title="Progress"
            subtitle="Bodyweight vs band over your last workouts."
          />
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {store.data.exercises.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => setChartExerciseId(ex.id)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium ${
                  chartExercise.id === ex.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800'
                }`}
              >
                {ex.name}
              </button>
            ))}
          </div>
          <ProgressionChart
            data={chartData}
            exerciseName={chartExercise.name}
          />
        </main>
      )}

      <ExerciseManager
        open={managerOpen}
        store={store}
        onClose={() => setManagerOpen(false)}
      />

      <SettingsPanel
        open={settingsOpen}
        store={store}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
