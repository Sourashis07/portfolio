// All sounds generated via Web Audio API — no files needed

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function master(gain = 0.18) {
  const c = getCtx();
  const g = c.createGain();
  g.gain.value = gain;
  g.connect(c.destination);
  return g;
}

// ── UI click — short electronic blip ─────────────────────────────────────────
export function playClick() {
  const c = getCtx();
  const out = master(0.15);
  const t = c.currentTime;

  const osc = c.createOscillator();
  const env = c.createGain();
  osc.connect(env); env.connect(out);

  osc.type = 'square';
  osc.frequency.setValueAtTime(880, t);
  osc.frequency.exponentialRampToValueAtTime(220, t + 0.08);

  env.gain.setValueAtTime(0.6, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

  osc.start(t); osc.stop(t + 0.1);
}

// ── Hover — subtle high-freq tick ────────────────────────────────────────────
export function playHover() {
  const c = getCtx();
  const out = master(0.06);
  const t = c.currentTime;

  const osc = c.createOscillator();
  const env = c.createGain();
  osc.connect(env); env.connect(out);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1800, t);
  osc.frequency.exponentialRampToValueAtTime(900, t + 0.04);

  env.gain.setValueAtTime(0.4, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

  osc.start(t); osc.stop(t + 0.05);
}

// ── Nav scroll — whoosh + tone ────────────────────────────────────────────────
export function playNav() {
  const c = getCtx();
  const out = master(0.14);
  const t = c.currentTime;

  // Whoosh (noise burst)
  const bufSize = c.sampleRate * 0.18;
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
  const noise = c.createBufferSource();
  noise.buffer = buf;

  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, t);
  filter.frequency.exponentialRampToValueAtTime(200, t + 0.18);
  filter.Q.value = 1.5;

  const noiseEnv = c.createGain();
  noiseEnv.gain.setValueAtTime(0.5, t);
  noiseEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

  noise.connect(filter); filter.connect(noiseEnv); noiseEnv.connect(out);
  noise.start(t); noise.stop(t + 0.18);

  // Tone sweep
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.connect(env); env.connect(out);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(440, t);
  osc.frequency.exponentialRampToValueAtTime(110, t + 0.2);
  env.gain.setValueAtTime(0.3, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.start(t); osc.stop(t + 0.2);
}

// ── Page transition — deep space warp ────────────────────────────────────────
export function playWarp() {
  const c = getCtx();
  const out = master(0.2);
  const t = c.currentTime;

  // Low rumble
  const osc1 = c.createOscillator();
  const env1 = c.createGain();
  osc1.connect(env1); env1.connect(out);
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(60, t);
  osc1.frequency.exponentialRampToValueAtTime(30, t + 0.6);
  env1.gain.setValueAtTime(0.5, t);
  env1.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  osc1.start(t); osc1.stop(t + 0.6);

  // High sweep
  const osc2 = c.createOscillator();
  const env2 = c.createGain();
  osc2.connect(env2); env2.connect(out);
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(2000, t + 0.05);
  osc2.frequency.exponentialRampToValueAtTime(100, t + 0.5);
  env2.gain.setValueAtTime(0.3, t + 0.05);
  env2.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  osc2.start(t + 0.05); osc2.stop(t + 0.5);

  // Noise burst
  const bufSize = c.sampleRate * 0.3;
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, t);
  const noiseEnv = c.createGain();
  noiseEnv.gain.setValueAtTime(0.4, t);
  noiseEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  noise.connect(filter); filter.connect(noiseEnv); noiseEnv.connect(out);
  noise.start(t); noise.stop(t + 0.3);
}

// ── Success / save — ascending chime ─────────────────────────────────────────
export function playSuccess() {
  const c = getCtx();
  const out = master(0.14);
  const freqs = [523, 659, 784, 1047];
  freqs.forEach((f, i) => {
    const t = c.currentTime + i * 0.08;
    const osc = c.createOscillator();
    const env = c.createGain();
    osc.connect(env); env.connect(out);
    osc.type = 'sine';
    osc.frequency.value = f;
    env.gain.setValueAtTime(0.4, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.start(t); osc.stop(t + 0.25);
  });
}

// ── Error / deny — descending buzz ───────────────────────────────────────────
export function playError() {
  const c = getCtx();
  const out = master(0.16);
  const t = c.currentTime;

  const osc = c.createOscillator();
  const env = c.createGain();
  osc.connect(env); env.connect(out);
  osc.type = 'square';
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);
  env.gain.setValueAtTime(0.5, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc.start(t); osc.stop(t + 0.25);
}

// ── Modal open — eerie resonance ─────────────────────────────────────────────
export function playModalOpen() {
  const c = getCtx();
  const out = master(0.13);
  const t = c.currentTime;

  [220, 277, 330].forEach((f, i) => {
    const osc = c.createOscillator();
    const env = c.createGain();
    osc.connect(env); env.connect(out);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, t + i * 0.04);
    env.gain.setValueAtTime(0.3, t + i * 0.04);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.5 + i * 0.04);
    osc.start(t + i * 0.04); osc.stop(t + 0.55 + i * 0.04);
  });
}

// ── Modal close — reverse resonance ──────────────────────────────────────────
export function playModalClose() {
  const c = getCtx();
  const out = master(0.1);
  const t = c.currentTime;

  const osc = c.createOscillator();
  const env = c.createGain();
  osc.connect(env); env.connect(out);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, t);
  osc.frequency.exponentialRampToValueAtTime(110, t + 0.2);
  env.gain.setValueAtTime(0.3, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.start(t); osc.stop(t + 0.2);
}

// ── Project card switch — sci-fi blip ────────────────────────────────────────
export function playCardSwitch() {
  const c = getCtx();
  const out = master(0.1);
  const t = c.currentTime;

  const osc = c.createOscillator();
  const env = c.createGain();
  osc.connect(env); env.connect(out);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(600, t);
  osc.frequency.exponentialRampToValueAtTime(1200, t + 0.06);
  osc.frequency.exponentialRampToValueAtTime(400, t + 0.12);
  env.gain.setValueAtTime(0.5, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
  osc.start(t); osc.stop(t + 0.14);
}

// ── Delete — dark thud ────────────────────────────────────────────────────────
export function playDelete() {
  const c = getCtx();
  const out = master(0.18);
  const t = c.currentTime;

  const osc = c.createOscillator();
  const env = c.createGain();
  osc.connect(env); env.connect(out);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.18);
  env.gain.setValueAtTime(0.7, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  osc.start(t); osc.stop(t + 0.18);
}
