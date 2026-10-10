import { useState } from 'react';
import { Atmosphere } from './components/Atmosphere';
import { BottomTabs, type AppTab } from './components/BottomTabs';
import { ConsifitLogo } from './components/ConsifitLogo';
import { LaunchHero } from './components/LaunchHero';
import { Overview } from './components/Overview';
import { ProgressView } from './components/ProgressView';
import { SettingsView } from './components/SettingsView';
import { WorkoutPlayer } from './components/WorkoutPlayer';
import { useWorkoutStore } from './hooks/useWorkoutStore';

type Screen = 'launch' | 'tabs' | 'workout';

function chromeTone(
  screen: Screen,
  tab: AppTab,
): 'workout' | 'train' | 'progress' | 'settings' {
  if (screen === 'workout') return 'workout';
  if (tab === 'progress') return 'progress';
  if (tab === 'settings') return 'settings';
  return 'train';
}

export default function App() {
  const store = useWorkoutStore();
  const [screen, setScreen] = useState<Screen>('launch');
  const [tab, setTab] = useState<AppTab>('train');
  const [workoutKey, setWorkoutKey] = useState(0);
  const [workoutStartIndex, setWorkoutStartIndex] = useState(0);

  const showTabs = screen === 'tabs' || screen === 'workout';

  const goToTab = (next: AppTab) => {
    setTab(next);
    setScreen('tabs');
  };

  const startWorkout = (startIndex = 0) => {
    setWorkoutStartIndex(startIndex);
    setWorkoutKey((k) => k + 1);
    setScreen('workout');
  };

  return (
    <div className="app-shell relative mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      <Atmosphere
        tone={screen === 'launch' ? 'hero' : chromeTone(screen, tab)}
      />

      <header className="relative z-10 flex shrink-0 items-center px-5 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => {
            setTab('train');
            setScreen('launch');
          }}
          className="flex h-10 items-center rounded-xl active:opacity-80"
          aria-label="Consifit — back to start"
        >
          <ConsifitLogo withWordmark />
        </button>
      </header>

      {screen === 'launch' && (
        <main className="relative z-10 flex min-h-0 flex-1 flex-col">
          <LaunchHero
            onEnter={() => {
              setTab('train');
              setScreen('tabs');
            }}
          />
        </main>
      )}

      {screen === 'tabs' && (
        <main className="relative z-10 flex min-h-0 flex-1 flex-col">
          {tab === 'progress' && <ProgressView store={store} />}
          {tab === 'train' && (
            <Overview store={store} onStart={startWorkout} />
          )}
          {tab === 'settings' && <SettingsView store={store} />}
        </main>
      )}

      {screen === 'workout' && (
        <main className="relative z-10 flex min-h-0 flex-1 flex-col">
          <WorkoutPlayer
            key={workoutKey}
            store={store}
            startIndex={workoutStartIndex}
            onExit={() => goToTab('train')}
          />
        </main>
      )}

      {showTabs && (
        <div className="relative z-10">
          <BottomTabs
            active={screen === 'workout' ? 'train' : tab}
            onChange={goToTab}
          />
        </div>
      )}
    </div>
  );
}
