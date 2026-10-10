interface ConsifitLogoProps {
  className?: string;
  /** Show wordmark next to the mark */
  withWordmark?: boolean;
  title?: string;
}

/**
 * Consifit mark — Consistently Fit.
 * Open “C” ring (consistency loop) + pull-up bar (the work).
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
      {/* Consistency ring — open C */}
      <path
        d="M46 18.5A20 20 0 1 0 46 45.5"
        stroke="#34d399"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Pull-up bar */}
      <path
        d="M20 32h24"
        stroke="#6ee7b7"
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
