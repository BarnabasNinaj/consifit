interface ConsifitLogoProps {
  className?: string;
  /** Show wordmark next to the mark */
  withWordmark?: boolean;
  title?: string;
}

/**
 * Consifit mark — Consistently Fit.
 * Climb: stacked up-chevrons (keep going up).
 */
export function ConsifitLogo({
  className = 'h-8 w-8',
  withWordmark = false,
  title = 'Consifit',
}: ConsifitLogoProps) {
  const mark = (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={withWordmark ? 'h-8 w-8 shrink-0' : className}
      aria-hidden={withWordmark ? true : undefined}
      role={withWordmark ? undefined : 'img'}
    >
      {!withWordmark && <title>{title}</title>}
      <path
        d="M16 40L32 26L48 40"
        stroke="#34d399"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 30L32 16L48 30"
        stroke="#6ee7b7"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 50H40"
        stroke="#a7f3d0"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );

  if (!withWordmark) return mark;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {mark}
      <span className="text-lg font-bold tracking-tight text-emerald-400/90">
        Consifit
      </span>
    </span>
  );
}
