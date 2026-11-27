/* Super Science: sound effects.
 * Every sound is generated in code with the Web Audio API: no audio files,
 * nothing to download. All sounds are original, simple synth tones.
 *
 * Use from anywhere:  SFX.playXP()  SFX.playCorrect()  SFX.playWrong()
 *                     SFX.playLevelUp()  SFX.playStreak()
 *
 * Rules:
 *   - Browsers only allow audio after a tap/click, so audio starts on the first one.
 *   - Quiet by default (VOLUME below).
 *   - Never two sounds on top of each other: sounds asked for at (almost) the same
 *     time play only the most important one, and a less important sound won't
 *     interrupt a more important one that's still playing.
 *   - Mute choice is saved. If the device asks for reduced motion, we start muted.
 */
(function () {
  const VOLUME = 0.18;              // overall loudness, 0 to 1. Kept low so nothing is startling.
  const STORAGE_KEY = "superscience.sound";
  const BATCH_MS = 40;              // sounds requested within this window count as "together"

  // Higher number = more important.
  const PRIORITY = { xp: 1, streak: 2, wrong: 3, correct: 3, levelUp: 5 };

  let ctx = null, master = null;
  let pending = null, timer = null, current = null;
  const log = []; // last sounds played (handy for testing)

  /* ---------- Mute setting (saved) ---------- */
  function prefersReducedMotion() {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  }
  function loadMuted() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "on") return false;
      if (saved === "off") return true;
    } catch (e) { /* storage blocked */ }
    return prefersReducedMotion(); // no saved choice yet
  }
  let muted = loadMuted();

  function setMuted(value) {
    muted = !!value;
    try { localStorage.setItem(STORAGE_KEY, muted ? "off" : "on"); } catch (e) { /* storage blocked: still works this visit */ }
    if (muted && current) { stop(current); current = null; }
    renderButton();
  }

  /* ---------- Audio engine ---------- */
  function ensureContext() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC();
        // A gentle limiter so stacked notes can never get loud.
        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = -12;
        limiter.ratio.value = 12;
        master = ctx.createGain();
        master.gain.value = VOLUME;
        master.connect(limiter);
        limiter.connect(ctx.destination);
      } catch (e) { ctx = null; return null; }
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  // Phones block audio until a tap: start/resume audio on any tap, click or key.
  // (Kept listening because phones can suspend audio again when the app goes to the background.)
  ["pointerdown", "touchend", "keydown"].forEach((type) => {
    document.addEventListener(type, () => { if (!ctx || ctx.state !== "running") ensureContext(); }, { capture: true, passive: true });
  });

  /* ---------- Building blocks ---------- */
  // One note: a tone that fades in fast and dies away. Optional slide to freqEnd.
  function note(c, out, { t, freq, freqEnd, dur, type = "sine", gain = 0.5, attack = 0.005, detune = 0 }) {
    const osc = c.createOscillator();
    const env = c.createGain();
    osc.type = type;
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur * 0.9);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(env);
    env.connect(out);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /* ---------- The sounds. Each returns its length in seconds. ---------- */
  const SOUNDS = {
    // Short bright "ding" with a quick rising pitch (~0.15 s)
    xp(c, out, t) {
      note(c, out, { t, freq: 880, freqEnd: 1480, dur: 0.26, type: "triangle", gain: 0.55 });
      note(c, out, { t, freq: 1760, freqEnd: 2960, dur: 0.16, type: "sine", gain: 0.15 });
      return 0.26;
    },

    // Two-note chime, a fifth then up to the octave (~0.4 s)
    correct(c, out, t) {
      note(c, out, { t, freq: 783.99, dur: 0.22, type: "triangle", gain: 0.5 });          // G5
      note(c, out, { t: t + 0.11, freq: 1046.5, dur: 0.3, type: "triangle", gain: 0.55 }); // C6
      note(c, out, { t: t + 0.11, freq: 2093, dur: 0.18, type: "sine", gain: 0.1 });       // soft shimmer
      return 0.41;
    },

    // Soft, low "bonk": a short falling sine through a low-pass filter (~0.25 s)
    wrong(c, out, t) {
      const soft = c.createBiquadFilter();
      soft.type = "lowpass";
      soft.frequency.value = 700;
      soft.connect(out);
      note(c, soft, { t, freq: 240, freqEnd: 150, dur: 0.24, type: "sine", gain: 0.6, attack: 0.008 });
      note(c, soft, { t, freq: 120, freqEnd: 90, dur: 0.2, type: "triangle", gain: 0.25, attack: 0.008 });
      return 0.25;
    },

    // Rising power-up sweep ending in a punchy major chord (~1.05 s)
    levelUp(c, out, t) {
      const SWEEP = 0.55;
      // Sweep: a buzzy tone gliding up while a filter opens, so it "charges up".
      const filter = c.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.value = 6;
      filter.frequency.setValueAtTime(500, t);
      filter.frequency.exponentialRampToValueAtTime(5000, t + SWEEP);
      filter.connect(out);
      for (const detune of [-8, 8]) {
        const osc = c.createOscillator();
        const env = c.createGain();
        osc.type = "sawtooth";
        osc.detune.value = detune;
        osc.frequency.setValueAtTime(130.81, t);                               // C3
        osc.frequency.exponentialRampToValueAtTime(1046.5, t + SWEEP);         // up to C6
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(0.18, t + 0.08);
        env.gain.setValueAtTime(0.18, t + SWEEP - 0.06);
        env.gain.exponentialRampToValueAtTime(0.0001, t + SWEEP + 0.04);
        osc.connect(env);
        env.connect(filter);
        osc.start(t);
        osc.stop(t + SWEEP + 0.06);
      }
      // Punchy chord: C major (C5 E5 G5 C6) with a low thump underneath.
      const hit = t + SWEEP;
      note(c, out, { t: hit, freq: 110, freqEnd: 55, dur: 0.25, type: "sine", gain: 0.7, attack: 0.004 });
      for (const [freq, gain] of [[523.25, 0.32], [659.25, 0.28], [783.99, 0.28], [1046.5, 0.3]]) {
        note(c, out, { t: hit, freq, dur: 0.8, type: "triangle", gain, attack: 0.006, detune: -4 });
        note(c, out, { t: hit, freq, dur: 0.45, type: "square", gain: gain * 0.12, attack: 0.006, detune: 5 });
      }
      return SWEEP + 0.8;
    },

    // Quick sparkle: four tiny high notes running upward (~0.35 s)
    streak(c, out, t) {
      [1318.5, 1568, 2093, 2637].forEach((freq, i) => {
        note(c, out, { t: t + i * 0.045, freq, dur: 0.18, type: "sine", gain: 0.5 });
      });
      return 0.35;
    },
  };

  /* ---------- Playing, with the "no overlap" rule ---------- */
  function request(name) {
    if (muted || !SOUNDS[name]) return;
    if (!pending || PRIORITY[name] > PRIORITY[pending]) pending = name;
    if (!timer) timer = setTimeout(flush, BATCH_MS);
  }

  function stop(sound) {
    try {
      sound.out.gain.setTargetAtTime(0, ctx.currentTime, 0.015);
      setTimeout(() => sound.out.disconnect(), 150);
    } catch (e) { /* already gone */ }
  }

  function flush() {
    timer = null;
    const name = pending;
    pending = null;
    if (!name || muted) return;
    const c = ensureContext();
    if (!c) return;
    const now = c.currentTime;

    if (current && current.endsAt > now) {
      if (PRIORITY[name] < PRIORITY[current.name]) return; // don't cut off something more important
      stop(current);                                       // replace it instead of playing on top
    }
    const out = c.createGain();
    out.connect(master);
    const length = SOUNDS[name](c, out, now + 0.01);
    current = { name, out, endsAt: now + 0.01 + length };
    log.push(name);
    if (log.length > 30) log.shift();
  }

  /* ---------- Speaker button in the header ---------- */
  // Every button with data-sound-toggle (header icon, sidebar item) shows the same state.
  // data-sound-toggle="label" shows words as well as the icon.
  function renderButton() {
    document.querySelectorAll("[data-sound-toggle]").forEach((b) => {
      if (b.dataset.soundToggle === "label") {
        b.innerHTML = `<span class="sb-ico" aria-hidden="true">${muted ? "🔇" : "🔊"}</span>Sound: ${muted ? "off" : "on"}`;
      } else b.textContent = muted ? "🔇" : "🔊";
      b.setAttribute("aria-label", muted ? "Sound is off. Turn sound on" : "Sound is on. Turn sound off");
      b.setAttribute("aria-pressed", String(!muted));
      b.title = muted ? "Sound off" : "Sound on";
    });
  }
  function setupButton() {
    document.addEventListener("click", (e) => {
      if (!e.target.closest("[data-sound-toggle]")) return;
      setMuted(!muted);
      if (!muted) { ensureContext(); request("xp"); } // little ding so you know it's on
    });
    renderButton();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setupButton);
  else setupButton();

  /* ---------- Public functions ---------- */
  window.SFX = {
    playXP: () => request("xp"),
    playCorrect: () => request("correct"),
    playWrong: () => request("wrong"),
    playLevelUp: () => request("levelUp"),
    playStreak: () => request("streak"),
    isMuted: () => muted,
    setMuted,
    toggle: () => setMuted(!muted),
    refreshButtons: () => renderButton(), // call after adding a new [data-sound-toggle] button
    _debug: { log, sounds: SOUNDS, priority: PRIORITY, get context() { return ctx; } },
  };
})();
