/**
 * Optional synthesized ambience. No downloaded audio, trackers, or autoplay.
 * Call start() directly from a click/tap; stop() when leaving the editor.
 * The sounds are stylized placeholders rather than field recordings.
 */
export const AMBIENCE_PRESETS = Object.freeze({
  forest: Object.freeze({ label: 'Forest', wind: 0.045, filter: 420, birds: true, birdRate: 6 }),
  jungle: Object.freeze({ label: 'Jungle', wind: 0.04, filter: 700, birds: true, birdRate: 3.5 }),
  desert: Object.freeze({ label: 'Desert', wind: 0.075, filter: 240, birds: false }),
  highrise: Object.freeze({ label: 'High-rise apartment', wind: 0.05, filter: 180, birds: false }),
  ground: Object.freeze({ label: 'Ground floor', wind: 0.035, filter: 320, birds: true, birdRate: 10 })
});

export class AtmosphereAudio {
  constructor() {
    this.context = null;
    this.master = null;
    this.source = null;
    this.timer = null;
    this.volume = 0.35;
    this.preset = null;
    this.generation = 0;
  }

  /** Returns true when sound is running. Start must follow a user gesture. */
  async start(name = 'forest') {
    const preset = AMBIENCE_PRESETS[name];
    if (!preset) throw new RangeError('Unknown atmosphere preset.');
    const generation = ++this.generation;
    this.stopNodes();
    const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Audio) return false;
    if (!this.context || this.context.state === 'closed') this.context = new Audio();
    const c = this.context;
    // Browser autoplay policy may reject or keep the context suspended.
    if (c.state === 'suspended') await c.resume();
    if (generation !== this.generation || c.state !== 'running') return false;
    this.preset = name;
    const buffer = c.createBuffer(1, c.sampleRate * 3, c.sampleRate);
    const samples = buffer.getChannelData(0);
    let previous = 0;
    for (let i = 0; i < samples.length; i++) {
      previous = .96 * previous + .04 * (Math.random() * 2 - 1);
      samples[i] = previous;
    }
    const source = c.createBufferSource(); source.buffer = buffer; source.loop = true;
    const filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = preset.filter;
    const wind = c.createGain(); wind.gain.value = preset.wind;
    this.master = c.createGain(); this.master.gain.value = this.volume;
    source.connect(filter); filter.connect(wind); wind.connect(this.master); this.master.connect(c.destination);
    source.start(); this.source = source;
    if (preset.birds) this.scheduleBird(preset, generation);
    return true;
  }

  scheduleBird(preset, generation) {
    this.timer = setTimeout(() => {
      if (generation !== this.generation || !this.context || !this.master) return;
      const c = this.context;
      // A short, soft chirp with no sample downloads.
      const chirp = c.createOscillator(), gain = c.createGain(), t = c.currentTime;
      chirp.type = 'sine';
      const base = 1350 + Math.random() * 1300;
      chirp.frequency.setValueAtTime(base, t);
      chirp.frequency.exponentialRampToValueAtTime(base * 1.3, t + .09);
      chirp.frequency.exponentialRampToValueAtTime(base * .95, t + .2);
      gain.gain.setValueAtTime(.0001, t);
      gain.gain.exponentialRampToValueAtTime(.012, t + .025);
      gain.gain.exponentialRampToValueAtTime(.0001, t + .22);
      chirp.connect(gain); gain.connect(this.master); chirp.start(t); chirp.stop(t + .23);
      this.scheduleBird(preset, generation);
    }, (preset.birdRate * (.5 + Math.random())) * 1000);
  }

  setVolume(value) {
    if (!Number.isFinite(value)) throw new TypeError('Volume must be a number.');
    this.volume = Math.max(0, Math.min(1, value));
    if (this.master && this.context) this.master.gain.setTargetAtTime(this.volume, this.context.currentTime, .03);
  }

  stopNodes() {
    clearTimeout(this.timer); this.timer = null;
    if (this.source) { this.source.stop(); this.source.disconnect(); this.source = null; }
    if (this.master) { this.master.disconnect(); this.master = null; }
    this.preset = null;
  }

  stop() { ++this.generation; this.stopNodes(); }

  /** Releases the audio device; subsequent start() makes a new context. */
  async dispose() {
    this.stop();
    const context = this.context; this.context = null;
    if (context && context.state !== 'closed') await context.close();
  }
}
