/**
 * Cocolang Sound Engine
 * All sounds generated via Web Audio API — no audio files needed.
 */

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!_ctx || _ctx.state === "closed") {
      _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (_ctx.state === "suspended") {
      _ctx.resume();
    }
    return _ctx;
  } catch {
    return null;
  }
}

interface Note {
  freq: number;
  t: number;           // start time offset (seconds from now)
  dur: number;         // duration (seconds)
  vol?: number;        // gain 0–1, default 0.4
  type?: OscillatorType; // default 'sine'
}

function playNotes(notes: Note[], masterVol = 0.55): void {
  const ctx = getCtx();
  if (!ctx) return;

  const master = ctx.createGain();
  master.gain.value = masterVol;
  master.connect(ctx.destination);

  notes.forEach(({ freq, t, dur, vol = 0.4, type = "sine" }) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(master);
    osc.type = type;
    osc.frequency.value = freq;

    const now = ctx.currentTime;
    const attack = Math.min(0.03, dur * 0.2);
    g.gain.setValueAtTime(0, now + t);
    g.gain.linearRampToValueAtTime(vol, now + t + attack);
    g.gain.setValueAtTime(vol, now + t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.001, now + t + dur);
    osc.start(now + t);
    osc.stop(now + t + dur + 0.01);
  });
}

// ─── Individual Sound Functions ────────────────────────────────────────────────

/**
 * Welcome sound — warm ascending pentatonic (G-B-D-G-B).
 * Plays when user visits the site for the first time today.
 */
export function playWelcomeSound(): void {
  playNotes([
    { freq: 392.0,  t: 0.00, dur: 0.50, vol: 0.28 }, // G4
    { freq: 493.88, t: 0.13, dur: 0.50, vol: 0.28 }, // B4
    { freq: 587.33, t: 0.26, dur: 0.50, vol: 0.28 }, // D5
    { freq: 783.99, t: 0.39, dur: 0.60, vol: 0.28 }, // G5
    { freq: 987.77, t: 0.52, dur: 0.75, vol: 0.22 }, // B5
  ], 0.6);
}

/**
 * Task complete — triumphant C major arpeggio + resolution chord.
 * Played when any task is submitted successfully.
 */
export function playTaskCompleteSound(): void {
  playNotes([
    { freq: 523.25,  t: 0.00, dur: 0.28, vol: 0.45 }, // C5
    { freq: 659.25,  t: 0.11, dur: 0.28, vol: 0.45 }, // E5
    { freq: 783.99,  t: 0.22, dur: 0.28, vol: 0.45 }, // G5
    { freq: 1046.50, t: 0.33, dur: 0.70, vol: 0.50 }, // C6 — hold
    { freq: 783.99,  t: 0.38, dur: 0.60, vol: 0.18 }, // G5 harmony
  ]);
}

/**
 * Streak milestone fanfare — epic trumpet-like motif (G-G-G-E-G-C).
 * Played when streak reaches 7, 14, or 30 days.
 */
export function playStreakMilestoneSound(): void {
  playNotes([
    { freq: 392.00,  t: 0.00, dur: 0.14, vol: 0.55, type: "triangle" }, // G4
    { freq: 392.00,  t: 0.16, dur: 0.14, vol: 0.55, type: "triangle" }, // G4
    { freq: 392.00,  t: 0.32, dur: 0.14, vol: 0.55, type: "triangle" }, // G4
    { freq: 659.25,  t: 0.47, dur: 0.26, vol: 0.55, type: "triangle" }, // E5
    { freq: 392.00,  t: 0.75, dur: 0.14, vol: 0.55, type: "triangle" }, // G4
    { freq: 783.99,  t: 0.90, dur: 0.16, vol: 0.60, type: "triangle" }, // G5
    { freq: 1046.50, t: 1.07, dur: 0.70, vol: 0.60, type: "triangle" }, // C6 finale
  ], 0.65);
}

/**
 * Quiz correct — quick bright two-note "ding".
 */
export function playQuizCorrectSound(): void {
  playNotes([
    { freq: 880.00,  t: 0.00, dur: 0.12, vol: 0.50 }, // A5
    { freq: 1174.66, t: 0.12, dur: 0.25, vol: 0.50 }, // D6
  ]);
}

/**
 * Quiz wrong — descending sawtooth "bloop" (buzzy, game-like).
 */
export function playQuizWrongSound(): void {
  playNotes([
    { freq: 311.13, t: 0.00, dur: 0.18, vol: 0.40, type: "sawtooth" }, // Eb4
    { freq: 207.65, t: 0.16, dur: 0.38, vol: 0.30, type: "sawtooth" }, // Ab3
  ]);
}

/**
 * XP earned — quick coin-like two-note rise.
 * Can play when XP is awarded in the UI.
 */
export function playXpSound(): void {
  playNotes([
    { freq: 1318.51, t: 0.00, dur: 0.10, vol: 0.35 }, // E6
    { freq: 1567.98, t: 0.09, dur: 0.20, vol: 0.35 }, // G6
  ]);
}

/**
 * Subtle UI click — very short micro-feedback sound.
 */
export function playClickSound(): void {
  playNotes([
    { freq: 800, t: 0, dur: 0.04, vol: 0.12 },
  ]);
}

/**
 * Streak at risk warning — low descending pulse.
 * Can be used when streak is about to expire.
 */
export function playStreakWarningSound(): void {
  playNotes([
    { freq: 440.00, t: 0.00, dur: 0.18, vol: 0.35, type: "triangle" }, // A4
    { freq: 349.23, t: 0.22, dur: 0.18, vol: 0.35, type: "triangle" }, // F4
    { freq: 293.66, t: 0.44, dur: 0.30, vol: 0.30, type: "triangle" }, // D4
  ]);
}
