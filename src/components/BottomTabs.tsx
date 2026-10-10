import { ChartLine, Dumbbell, Settings } from 'lucide-react';

export type AppTab = 'progress' | 'train' | 'settings';

interface BottomTabsProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

const TABS: {
  id: AppTab;
  label: string;
  icon: typeof ChartLine;
}[] = [
  { id: 'progress', label: 'Progress', icon: ChartLine },
  { id: 'train', label: 'Train Hard', icon: Dumbbell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function BottomTabs({ active, onChange }: BottomTabsProps) {
  return (
    <nav
      className="shrink-0 border-t border-zinc-800/60 bg-zinc-950/70 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md"
      aria-label="Main"
    >
      <div className="grid grid-cols-3 gap-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const selected = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={selected ? 'page' : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-medium transition ${
                selected
                  ? 'bg-zinc-900 text-zinc-100'
                  : 'text-zinc-500 active:bg-zinc-900/80 active:text-zinc-300'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  selected ? 'text-zinc-200' : 'text-zinc-600'
                }`}
                strokeWidth={selected ? 2.25 : 2}
              />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
