import type { ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  /** Optional trailing control (e.g. Shuffle) aligned with the title row */
  action?: ReactNode;
}

/** Large page title — same weight as the exercise name in WorkoutPlayer. */
export function PageTitle({ title, subtitle, action }: PageTitleProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[1.65rem] font-bold leading-tight tracking-tight text-zinc-50">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0 pt-1">{action}</div>}
    </div>
  );
}
