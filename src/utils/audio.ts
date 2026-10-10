let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx) sharedCtx = new Ctx();
  return sharedCtx;
}

/** Distinct two-tone chime when rest timer completes. */
export async function playTimerChime(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return;
    }
  }

  const now = ctx.currentTime;
  const tones = [
    { freq: 880, start: 0, dur: 0.12 },
    { freq: 1174.66, start: 0.14, dur: 0.18 },
    { freq: 1318.51, start: 0.34, dur: 0.22 },
  ];

  for (const tone of tones) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = tone.freq;
    gain.gain.setValueAtTime(0.0001, now + tone.start);
    gain.gain.exponentialRampToValueAtTime(0.22, now + tone.start + 0.02);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + tone.start + tone.dur,
    );
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + tone.start);
    osc.stop(now + tone.start + tone.dur + 0.02);
  }
}
