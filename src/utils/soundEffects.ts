/**
 * Web Audio API procedural sound synthesizer for realistic chess acoustic feedback.
 * Works reliably offline and avoids external audio loading errors.
 */

class ChessAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private musicTimer: number | null = null;
  private musicGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
    const savedMute = localStorage.getItem('chess_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('chess_muted', String(muted));
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public startBackgroundMusic() {
    if (this.isMuted || this.musicTimer !== null) return;
    this.initContext();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(this.volume * 0.045, ctx.currentTime + 1.2);
    gain.connect(ctx.destination);
    this.musicGain = gain;

    const notes = [110, 130.81, 164.81, 196, 164.81, 130.81];
    let index = 0;
    const playNote = () => {
      if (!this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      const oscillator = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(notes[index % notes.length], now);
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.22, now + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
      oscillator.connect(noteGain);
      noteGain.connect(this.musicGain);
      oscillator.start(now);
      oscillator.stop(now + 2.3);
      index += 1;
    };

    playNote();
    this.musicTimer = window.setInterval(playNote, 900);
  }

  public stopBackgroundMusic() {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.musicGain && this.ctx) {
      const gain = this.musicGain;
      gain.gain.cancelScheduledValues(this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);
      window.setTimeout(() => gain.disconnect(), 400);
      this.musicGain = null;
    }
  }

  // Realistic wooden piece placing sound (warm low-pass thump with slight click)
  public playMove() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const master = this.ctx.createGain();
      master.gain.setValueAtTime(this.volume * 0.9, now);
      master.connect(this.ctx.destination);

      // Thud component (wood resonance)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

      oscGain.gain.setValueAtTime(0.7, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(oscGain);
      oscGain.connect(master);
      osc.start(now);
      osc.stop(now + 0.1);

      // Click transient (contact sound)
      const bufferSize = this.ctx.sampleRate * 0.02;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 1200;
      noiseFilter.Q.value = 2;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noise.start(now);
    } catch {
      // Audio context might fail silently
    }
  }

  // Heavy tactile capture sound (wood clack + impact)
  public playCapture() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const master = this.ctx.createGain();
      master.gain.setValueAtTime(this.volume, now);
      master.connect(this.ctx.destination);

      // Impact 1 (striking the opponent piece)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(60, now + 0.12);
      gain1.gain.setValueAtTime(0.8, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc1.connect(gain1);
      gain1.connect(master);
      osc1.start(now);
      osc1.stop(now + 0.14);

      // Impact 2 (landing on the square with slight delay)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(160, now + 0.02);
      osc2.frequency.exponentialRampToValueAtTime(40, now + 0.15);
      gain2.gain.setValueAtTime(0.9, now + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc2.connect(gain2);
      gain2.connect(master);
      osc2.start(now + 0.02);
      osc2.stop(now + 0.17);
    } catch {}
  }

  // Tension chime when King is in check
  public playCheck() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25]; // A4, C#5, E5 arpeggio
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.3 * this.volume, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.4);
      });
    } catch {}
  }

  // Triumphant fanfare when a game is won / checkmate
  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chords = [
        { freq: 523.25, time: 0 },    // C5
        { freq: 659.25, time: 0.1 },  // E5
        { freq: 783.99, time: 0.2 },  // G5
        { freq: 1046.50, time: 0.35 },// C6
      ];

      chords.forEach(({ freq, time }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(0.35 * this.volume, now + time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + 0.65);
      });
    } catch {}
  }

  // Soft UI click with a warm two-note confirmation tone
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const master = this.ctx.createGain();
      master.gain.setValueAtTime(this.volume * 0.22, now);
      master.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      master.connect(this.ctx.destination);

      [740, 988].forEach((frequency, index) => {
        if (!this.ctx) return;
        const start = now + index * 0.035;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.6, start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.09);
        osc.connect(gain);
        gain.connect(master);
        osc.start(start);
        osc.stop(start + 0.1);
      });
    } catch {}
  }

  // Shorter feedback for menu controls, kept separate from chess-piece sounds.
  public playOption() {
    this.playClick();
  }
}

export const soundManager = new ChessAudioEngine();
