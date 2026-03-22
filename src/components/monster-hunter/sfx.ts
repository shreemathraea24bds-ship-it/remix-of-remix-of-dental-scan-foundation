/**
 * SFX Soundboard — Web Audio API synthesized sound effects
 * No external audio files needed; all generated procedurally.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** Monster hit — a wet "squish" */
export function sfxMonsterHit() {
  try {
    const c = getCtx();
    const t = c.currentTime;
    // Noise burst + filter sweep
    const osc = c.createOscillator();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.1);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.connect(filter).connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  } catch {}
}

/** Monster defeated — bright "poof" + coin jingle */
export function sfxMonsterDefeated() {
  try {
    const c = getCtx();
    const t = c.currentTime;
    // Poof
    const osc1 = c.createOscillator();
    const g1 = c.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(600, t);
    osc1.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
    g1.gain.setValueAtTime(0.3, t);
    g1.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc1.connect(g1).connect(c.destination);
    osc1.start(t);
    osc1.stop(t + 0.15);

    // Coin jingle — two quick tones
    [0.15, 0.25].forEach((delay, i) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(i === 0 ? 1200 : 1600, t + delay);
      g.gain.setValueAtTime(0.2, t + delay);
      g.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.12);
      osc.connect(g).connect(c.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.12);
    });
  } catch {}
}

/** Brushing too hard — low "Red Alert" hum */
export function sfxWarningHum() {
  try {
    const c = getCtx();
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, t);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.setValueAtTime(0.25, t + 0.15);
    gain.gain.setValueAtTime(0.15, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  } catch {}
}

/** Power-up — rising "sheene" lightsaber ignite */
export function sfxPowerUp() {
  try {
    const c = getCtx();
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(2000, t + 0.4);
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  } catch {}
}

/** Timer ending — triumphant swell (major chord arpeggio) */
export function sfxVictoryFanfare() {
  try {
    const c = getCtx();
    const t = c.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "triangle";
      const start = t + i * 0.12;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.01, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.6);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.6);
    });
  } catch {}
}

/** Block mode — grinding gear */
export function sfxBlockMode() {
  try {
    const c = getCtx();
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.3);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  } catch {}
}

/** Mimic spawn — eerie descending tone */
export function sfxMimicSpawn() {
  try {
    const c = getCtx();
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.4);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  } catch {}
}

/** Sector clear — short positive chime */
export function sfxSectorClear() {
  try {
    const c = getCtx();
    const t = c.currentTime;
    [880, 1100].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      const start = t + i * 0.08;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.15);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.15);
    });
  } catch {}
}
