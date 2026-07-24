// Lightweight Web Audio synth. No external sound files required.

type Ctx = AudioContext | null;
let ctx: Ctx = null;
let enabled = true;

function getCtx(): Ctx {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function setSoundsEnabled(v: boolean) {
  enabled = v;
}

function tone(
  freqs: number[],
  duration = 0.12,
  type: OscillatorType = "sine",
  volume = 0.12,
  stagger = 0,
) {
  if (!enabled) return;
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  const start = ac.currentTime;
  freqs.forEach((f, i) => {
    const t = start + i * stagger;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  });
}

export const sounds = {
  move: () => tone([340, 460], 0.08, "triangle", 0.1, 0.02),
  capture: () => tone([180, 90, 60], 0.18, "sawtooth", 0.14, 0.03),
  check: () => tone([660, 880, 1108], 0.22, "square", 0.09, 0.05),
  checkmate: () => tone([880, 660, 440, 220, 110], 0.6, "sine", 0.16, 0.09),
  select: () => tone([520], 0.04, "sine", 0.05),
  gameStart: () => tone([440, 660, 880], 0.18, "triangle", 0.08, 0.06),
};