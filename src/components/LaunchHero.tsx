import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

const ROASTS = [
  'You weak, bitch.',
  'Still soft for the bar?',
  'The bar doesn’t miss you.',
  'Come prove you’re not soft.',
  'Gravity’s been clowning you.',
  'Weak hands. Weaker excuses.',
  'Missed yesterday. Own today.',
  'Your couch is undefeated.',
  'Reps don’t negotiate.',
  'Discipline called. You declined.',
  'Chin over the bar. Ego under it.',
  'Soft grip. Softer commitment.',
  'The bar remembers every skip.',
  'Stop scrolling. Start pulling.',
  'You’re one set from less pathetic.',
  'Excuses don’t add reps.',
  'Dead hang your pride.',
  'Consistency eats talent alive.',
  'That rest day turned into a rest month.',
  'Pull or stay average.',
  'Your future self is tired of waiting.',
  'Band-assisted ego. Bodyweight truth.',
  'Show up or shut up.',
  'The floor misses your feet. Leave it.',
  'No pump. No progress. No pity.',
  'You don’t need motivation. You need reps.',
  'Weak today is a choice.',
  'Hang there and earn it.',
  'Your last PR is collecting dust.',
  'Comfort is the real opponent.',
  'Less talk. More chin-ups.',
  'The bar doesn’t care how you feel.',
  'Skipped sets build skipped results.',
  'Grip the bar like you mean it.',
  'Discipline > dopamine.',
  'You came soft. Leave harder.',
  'One more set. No debate.',
  'Your form’s fine. Your volume isn’t.',
  'Progress is allergic to quitting.',
  'Be the person who always shows.',
  'Lats don’t grow on vibes.',
  'That “later” is why you’re stuck.',
  'Earn the burn.',
  'Pull-ups don’t ghost you. You ghost them.',
  'Strength is a receipt. Pay up.',
  'Stop babysitting your comfort zone.',
  'Hang. Pull. Repeat. Become.',
  'You’re closer than your excuses admit.',
  'Make gravity regret meeting you.',
  'The session starts when the whining stops.',
  'No hero set. Just honest work.',
  'Your streak dies when you flinch.',
  'Be boringly consistent. Win quietly.',
  'Hands on bar. Brain off mute.',
  'Today’s weakness is optional.',
  'Leave a few more reps than yesterday.',
  'The bar is the only mirror that doesn’t lie.',
  'Train hard or stay story.',
];

interface LaunchHeroProps {
  onEnter: () => void;
}

export function LaunchHero({ onEnter }: LaunchHeroProps) {
  const line = useMemo(
    () => ROASTS[Math.floor(Math.random() * ROASTS.length)]!,
    [],
  );
  const [pressed, setPressed] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden overscroll-none px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="flex min-h-0 flex-1 flex-col justify-center py-4">
        <p className="mb-3 shrink-0 text-sm font-medium text-zinc-500">
          Before you touch the bar…
        </p>
        <h1 className="max-w-[14ch] text-[clamp(1.85rem,7.2vh,2.75rem)] font-bold leading-[1.05] tracking-tight text-balance text-zinc-50">
          {line}
        </h1>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-3 pb-1">
        <button
          type="button"
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onClick={onEnter}
          className={`flex size-[min(9rem,28vmin)] touch-manipulation flex-col items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-[0_0_48px_rgba(16,185,129,0.35)] transition duration-150 active:scale-95 ${
            pressed ? 'scale-95' : 'scale-100'
          }`}
          aria-label="Let's go — open Train Hard"
        >
          <ArrowUpRight className="mb-1 h-6 w-6" strokeWidth={2.5} />
          <span className="text-lg font-bold tracking-tight">Let&apos;s go</span>
        </button>
        <p className="text-xs text-zinc-600">Tap in. No mercy set.</p>
      </div>
    </div>
  );
}
