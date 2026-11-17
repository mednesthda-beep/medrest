// Web Audio API Emergency Siren & Alarm Synthesizer

let activeOscillator: OscillatorNode | null = null;
let activeAudioCtx: AudioContext | null = null;

export function playEmergencySiren(durationSeconds = 6) {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    // Stop any existing siren
    stopEmergencySiren();

    const ctx = new AudioCtx();
    activeAudioCtx = ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';

    const now = ctx.currentTime;
    // Multi-cycle ambulance / siren wail (800Hz to 1250Hz)
    for (let t = 0; t < durationSeconds; t += 0.5) {
      osc.frequency.setValueAtTime(800, now + t);
      osc.frequency.exponentialRampToValueAtTime(1300, now + t + 0.25);
      osc.frequency.exponentialRampToValueAtTime(800, now + t + 0.5);
    }

    // Set audible alarm volume with fade-out
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
