// Plays the mechanical keyboard key-press sound effect (public/key-press.wav).
// Decoded once into a Web Audio buffer so rapid clicks can overlap without the
// restart lag a single <audio> element would have.

let audioCtx: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
let loading: Promise<void> | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  return audioCtx;
}

function load(ctx: AudioContext): Promise<void> {
  if (!loading) {
    loading = fetch("/key-press.wav")
      .then((res) => res.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((decoded) => {
        buffer = decoded;
      })
      .catch(() => {
        // Swallow errors — a missing sound effect shouldn't break navigation.
        loading = null;
      });
  }
  return loading;
}

// Warm the decode cache (call on mount) so the first click isn't silent.
export function preloadKeySound() {
  const ctx = getCtx();
  if (ctx && !buffer) void load(ctx);
}

export function playKeySound() {
  const ctx = getCtx();
  if (!ctx) return;
  // Browsers suspend the context until a user gesture; clicks qualify.
  if (ctx.state === "suspended") void ctx.resume();

  if (!buffer) {
    // Kick off decoding; this click is silent, subsequent ones will play.
    void load(ctx);
    return;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = 0.6;
  source.connect(gain).connect(ctx.destination);
  source.start(0);
}
