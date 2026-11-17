// Web Audio API Emergency Siren & Alarm Synthesizer

let activeOscillator: OscillatorNode | null = null;
let activeAudioCtx: AudioContext | null = null;

// Short alert beep for the 15-second countdown timer
export function playWarningBeep() {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // Pitch A5

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.16);

    setTimeout(() => {
      try {
        if (ctx.state !== 'closed') ctx.close();
      } catch {}
    }, 250);
  } catch (err) {
    console.warn('[Audio] Beep failed:', err);
  }
}

// Continuous loud emergency siren when patient does not respond
export function playEmergencySiren(durationSeconds = 30) {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    // Stop any existing siren
    stopEmergencySiren();

    const ctx = new AudioCtx();
    activeAudioCtx = ctx;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';

    const now = ctx.currentTime;
    // Multi-cycle siren wail (750Hz to 1350Hz)
    for (let t = 0; t < durationSeconds; t += 0.5) {
      osc.frequency.setValueAtTime(750, now + t);
      osc.frequency.exponentialRampToValueAtTime(1350, now + t + 0.25);
      osc.frequency.exponentialRampToValueAtTime(750, now + t + 0.5);
    }

    // Audible alarm volume
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.setValueAtTime(0.4, now + durationSeconds - 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSeconds);

    activeOscillator = osc;

    osc.onended = () => {
      stopEmergencySiren();
    };
  } catch (err) {
    console.warn('[Audio] Could not synthesize siren:', err);
  }
}

export function stopEmergencySiren() {
  try {
    if (activeOscillator) {
      activeOscillator.stop();
      activeOscillator.disconnect();
      activeOscillator = null;
    }
    if (activeAudioCtx && activeAudioCtx.state !== 'closed') {
      activeAudioCtx.close();
      activeAudioCtx = null;
    }
  } catch {
    // Ignore cleanup errors
  }
}
