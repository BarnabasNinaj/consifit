type AtmosphereTone = 'hero' | 'workout' | 'train' | 'progress' | 'settings';

const TONES: Record<AtmosphereTone, string> = {
  hero:
    'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(16,185,129,0.16), transparent 55%), radial-gradient(ellipse 70% 40% at 80% 90%, rgba(245,158,11,0.08), transparent)',
  workout:
    'radial-gradient(ellipse 95% 55% at 50% -5%, rgba(16,185,129,0.18), transparent 56%), radial-gradient(ellipse 75% 42% at 85% 88%, rgba(251,191,36,0.12), transparent 52%), radial-gradient(ellipse 45% 30% at 8% 65%, rgba(34,211,238,0.06), transparent)',
  train:
    'radial-gradient(ellipse 90% 50% at 40% -8%, rgba(16,185,129,0.11), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(251,191,36,0.07), transparent)',
  progress:
    'radial-gradient(ellipse 85% 45% at 60% -8%, rgba(16,185,129,0.10), transparent 55%), radial-gradient(ellipse 55% 40% at 0% 90%, rgba(34,211,238,0.05), transparent)',
  settings:
    'radial-gradient(ellipse 80% 40% at 50% -8%, rgba(16,185,129,0.08), transparent 50%), radial-gradient(ellipse 50% 35% at 100% 80%, rgba(245,158,11,0.05), transparent)',
};

interface AtmosphereProps {
  tone?: AtmosphereTone;
}

/** Soft radial wash — same language as the launch hero. */
export function Atmosphere({ tone = 'train' }: AtmosphereProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{ background: TONES[tone] }}
    />
  );
}
