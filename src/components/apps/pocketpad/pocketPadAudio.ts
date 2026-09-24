/**
 * Pocket Pad - Web Audio API High-Fidelity Synthesizer & Drum Machine Engine
 * 纯原生 Web Audio API 电音声学引擎：零外部素材依赖，超低延迟物理建模与采样算法
 */

export type SoundpackId = 'cyber' | 'lofi' | 'arcade';

export interface PadDefinition {
  id: number; // 0 ~ 15
  name: string;
  category: 'kick' | 'snare' | 'clap' | 'hat' | 'bass' | 'chord' | 'lead' | 'fx' | 'vocal';
  color: string; // Neon accent hex
  keyLabel: string; // Keyboard hotkey
}

export const PAD_DEFINITIONS: Record<SoundpackId, PadDefinition[]> = {
  cyber: [
    // Row 1: Drums
    { id: 0, name: '808 KICK', category: 'kick', color: '#ff3366', keyLabel: '1' },
    { id: 1, name: 'EDM SNARE', category: 'snare', color: '#ff5533', keyLabel: '2' },
    { id: 2, name: 'TRAP CLAP', category: 'clap', color: '#ffaa00', keyLabel: '3' },
    { id: 3, name: 'CLOSED HAT', category: 'hat', color: '#ffd000', keyLabel: '4' },
    // Row 2: Bass & Stabs
    { id: 4, name: 'OPEN HAT', category: 'hat', color: '#e6ff00', keyLabel: 'Q' },
    { id: 5, name: '808 GLIDE', category: 'bass', color: '#a200ff', keyLabel: 'W' },
    { id: 6, name: 'STAB C-MIN', category: 'chord', color: '#6600ff', keyLabel: 'E' },
    { id: 7, name: 'STAB EB', category: 'chord', color: '#3366ff', keyLabel: 'R' },
    // Row 3: Leads & Melodies
    { id: 8, name: 'LASER FX', category: 'fx', color: '#00ccff', keyLabel: 'A' },
    { id: 9, name: 'PLUCK G4', category: 'lead', color: '#00ffcc', keyLabel: 'S' },
    { id: 10, name: 'PLUCK BB4', category: 'lead', color: '#00ff88', keyLabel: 'D' },
    { id: 11, name: 'LEAD C5', category: 'lead', color: '#33ff33', keyLabel: 'F' },
    // Row 4: Risers & FX
    { id: 12, name: 'RISER UP', category: 'fx', color: '#ff00aa', keyLabel: 'Z' },
    { id: 13, name: 'SUB DROP', category: 'fx', color: '#ff0055', keyLabel: 'X' },
    { id: 14, name: 'VOCAL CHOP', category: 'vocal', color: '#ff00ff', keyLabel: 'C' },
    { id: 15, name: 'CRASH CYMBAL', category: 'hat', color: '#ffffff', keyLabel: 'V' },
  ],
  lofi: [
    { id: 0, name: 'LO-FI KICK', category: 'kick', color: '#d97736', keyLabel: '1' },
    { id: 1, name: 'RIMSHOT', category: 'snare', color: '#e09853', keyLabel: '2' },
    { id: 2, name: 'VINYL CLAP', category: 'clap', color: '#dfb15b', keyLabel: '3' },
    { id: 3, name: 'TAPE HAT', category: 'hat', color: '#c4cb67', keyLabel: '4' },

    { id: 4, name: 'OPEN SHAKER', category: 'hat', color: '#9bc472', keyLabel: 'Q' },
    { id: 5, name: 'WARM SUB', category: 'bass', color: '#60a3bc', keyLabel: 'W' },
    { id: 6, name: 'RHODES Cmaj7', category: 'chord', color: '#4a69bd', keyLabel: 'E' },
    { id: 7, name: 'RHODES Am7', category: 'chord', color: '#6a89cc', keyLabel: 'R' },

    { id: 8, name: 'KALIMBA 1', category: 'lead', color: '#82ccdd', keyLabel: 'A' },
    { id: 9, name: 'KALIMBA 2', category: 'lead', color: '#78e08f', keyLabel: 'S' },
    { id: 10, name: 'CHILL BELL', category: 'lead', color: '#38ada9', keyLabel: 'D' },
    { id: 11, name: 'VOCAL AYY', category: 'vocal', color: '#b8e994', keyLabel: 'F' },

    { id: 12, name: 'TAPE STOP', category: 'fx', color: '#e55039', keyLabel: 'Z' },
    { id: 13, name: 'VINYL HISS', category: 'fx', color: '#f6b93b', keyLabel: 'X' },
    { id: 14, name: 'RAIN DROP', category: 'fx', color: '#4a69bd', keyLabel: 'C' },
    { id: 15, name: 'CHILL CRASH', category: 'hat', color: '#f8c291', keyLabel: 'V' },
  ],
  arcade: [
    { id: 0, name: 'SQUARE KICK', category: 'kick', color: '#00ffcc', keyLabel: '1' },
    { id: 1, name: 'NOISE SNARE', category: 'snare', color: '#00e1d9', keyLabel: '2' },
    { id: 2, name: 'COIN PING', category: 'fx', color: '#ffd700', keyLabel: '3' },
    { id: 3, name: 'PULSE HAT', category: 'hat', color: '#ffb703', keyLabel: '4' },

    { id: 4, name: 'OPEN NOISE', category: 'hat', color: '#fb8500', keyLabel: 'Q' },
    { id: 5, name: '8BIT BASS', category: 'bass', color: '#7209b7', keyLabel: 'W' },
    { id: 6, name: 'POWER UP', category: 'fx', color: '#4361ee', keyLabel: 'E' },
    { id: 7, name: '1-UP CHIME', category: 'fx', color: '#4cc9f0', keyLabel: 'R' },

    { id: 8, name: 'LASER GUN', category: 'fx', color: '#f72585', keyLabel: 'A' },
    { id: 9, name: 'JUMP SOUND', category: 'fx', color: '#b5179e', keyLabel: 'S' },
    { id: 10, name: 'ARP LEAD 1', category: 'lead', color: '#3a0ca3', keyLabel: 'D' },
    { id: 11, name: 'ARP LEAD 2', category: 'lead', color: '#4895ef', keyLabel: 'F' },

    { id: 12, name: 'WARP PIPE', category: 'fx', color: '#2ec4b6', keyLabel: 'Z' },
    { id: 13, name: 'HIT HURT', category: 'fx', color: '#e71d36', keyLabel: 'X' },
    { id: 14, name: 'EXPLOSION', category: 'fx', color: '#ff9f1c', keyLabel: 'C' },
    { id: 15, name: 'VICTORY JINGLE', category: 'lead', color: '#ffffff', keyLabel: 'V' },
  ],
};

export const DEFAULT_PAD_STEPS: Record<SoundpackId, Record<number, number[]>> = {
  cyber: {
    0: [0, 4, 8, 12],       // 808 Kick (经典 4 拍重低音铺底)
    1: [4, 12],             // EDM Snare
    2: [4, 12],             // Trap Clap
    3: [0, 2, 4, 6, 8, 10, 12, 14], // Closed Hat (8分音符连续金属擦片)
    4: [2, 6, 10, 14],      // Open Hat (反拍开擦)
    5: [0, 6, 10],          // 808 Glide Bass (律动低音贝斯)
    6: [2, 8, 14],          // Stab C-Min (电音冲刺刺音)
    7: [3, 11],             // Stab Eb
    8: [6, 14],             // Laser FX (周期扫射)
    9: [2, 5, 8, 11, 14],   // Pluck G4 (切分琶音主音)
    10: [1, 7, 13],         // Pluck Bb4
    11: [0, 6, 12],         // Lead C5 (副歌主音)
    12: [0],                // Riser Up (每节蓄力起音)
    13: [0],                // Sub Drop (重击炸裂)
    14: [6, 14],            // Vocal Chop (人声切片副旋律)
    15: [0],                // Crash Cymbal (重音首拍)
  },
  lofi: {
    0: [0, 6, 10],          // Lo-Fi Kick (摇摆 Boom-Bap)
    1: [4, 12],             // Rimshot
    2: [4, 12],             // Vinyl Clap
    3: [0, 2, 4, 6, 8, 10, 12, 14], // Tape Hat
    4: [2, 6, 10, 14],      // Open Shaker
    5: [0, 6, 10],          // Warm Sub
    6: [0, 8],              // Rhodes Cmaj7 (电钢琴铺底)
    7: [4, 12],             // Rhodes Am7
    8: [2, 5, 8, 11],       // Kalimba 1 (灵动拇指琴)
    9: [3, 7, 13],          // Kalimba 2
    10: [0, 10],            // Chill Bell
    11: [6, 14],            // Vocal Ayy
    12: [14],               // Tape Stop
    13: [0, 4, 8, 12],      // Vinyl Hiss
    14: [1, 5, 9, 13],      // Rain Drop
    15: [0],                // Chill Crash
  },
  arcade: {
    0: [0, 4, 8, 12],       // Square Kick
    1: [4, 12],             // Noise Snare
    2: [2, 10],             // Coin Ping (金币叮叮声)
    3: [0, 2, 4, 6, 8, 10, 12, 14], // Pulse Hat
    4: [6, 14],             // Open Noise
    5: [0, 3, 6, 10],       // 8Bit Bass
    6: [0, 8],              // Power Up
    7: [12],                // 1-Up Chime
    8: [2, 8, 14],          // Laser Gun
    9: [5, 13],             // Jump Sound
    10: [0, 2, 4, 6, 8, 10, 12, 14], // Arp Lead 1
    11: [1, 3, 5, 7, 9, 11, 13, 15], // Arp Lead 2
    12: [0],                // Warp Pipe
    13: [8],                // Hit Hurt
    14: [0],                // Explosion
    15: [0, 8],             // Victory Jingle
  },
};

class PocketPadAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterFilter: BiquadFilterNode | null = null;
  private distortionNode: WaveShaperNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  // Master Control States
  private _volume: number = 0.85;
  private _filterCutoff: number = 18000; // 200 ~ 20000 Hz
  private _drive: boolean = false;

  // Loop Sequencer States
  private isLoopRunning: boolean = false;
  private loopTimerId: number | null = null;
  private currentStep: number = 0;
  private bpm: number = 124;
  private loopPack: SoundpackId = 'cyber';
  private activeLoopPads: Set<number> = new Set();
  private onStepCallback: ((step: number, triggeredPads: number[]) => void) | null = null;

  constructor() {
    // Lazy initialize on first interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Chain: nodes -> MasterFilter -> Distortion -> MasterGain -> destination
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this._volume, this.ctx.currentTime);

      this.masterFilter = this.ctx.createBiquadFilter();
      this.masterFilter.type = 'lowpass';
      this.masterFilter.frequency.setValueAtTime(this._filterCutoff, this.ctx.currentTime);

      this.distortionNode = this.ctx.createWaveShaper();
      this.setDrive(this._drive);

      this.masterFilter.connect(this.distortionNode);
      this.distortionNode.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Create 2s white noise buffer for snares, hats, claps, risers
      this.createNoiseBuffer();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  private makeDistortionCurve(amount: number = 20): Float32Array {
    const k = typeof amount === 'number' ? amount : 20;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  public setVolume(val: number) {
    this._volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this._volume, this.ctx.currentTime, 0.02);
    }
  }

  public setFilterCutoff(hz: number) {
    this._filterCutoff = Math.max(200, Math.min(20000, hz));
    if (this.masterFilter && this.ctx) {
      this.masterFilter.frequency.setTargetAtTime(this._filterCutoff, this.ctx.currentTime, 0.02);
    }
  }

  public setDrive(enable: boolean) {
    this._drive = enable;
    if (this.distortionNode) {
      this.distortionNode.curve = enable ? (this.makeDistortionCurve(35) as any) : null;
    }
  }

  public setBpm(val: number) {
    this.bpm = Math.max(60, Math.min(180, Math.round(val)));
  }

  public getBpm(): number {
    return this.bpm;
  }

  // ================= 触发打击垫声音 =================
  public triggerPad(padId: number, pack: SoundpackId) {
    this.initContext();
    if (!this.ctx || !this.masterFilter) return;

    const t = this.ctx.currentTime;

    switch (pack) {
      case 'cyber':
        this.playCyberPad(padId, t);
        break;
      case 'lofi':
        this.playLofiPad(padId, t);
        break;
      case 'arcade':
        this.playArcadePad(padId, t);
        break;
    }
  }

  // ------------------ Cyber EDM / Synthwave ------------------
  private playCyberPad(id: number, t: number) {
    if (!this.ctx || !this.masterFilter) return;

    switch (id) {
      // 0: 808 Sub Kick (重低音轰鸣底鼓)
      case 0: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        // 瞬间从 160Hz 弯音下拉到 44Hz -> 32Hz
        osc.frequency.setValueAtTime(175, t);
        osc.frequency.exponentialRampToValueAtTime(52, t + 0.055);
        osc.frequency.exponentialRampToValueAtTime(36, t + 0.38);

        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

        // Click transient
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(450, t);
        clickOsc.frequency.exponentialRampToValueAtTime(40, t + 0.018);
        clickGain.gain.setValueAtTime(0.6, t);
        clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

        clickOsc.connect(clickGain);
        clickGain.connect(this.masterFilter);
        clickOsc.start(t);
        clickOsc.stop(t + 0.03);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.45);
        break;
      }

      // 1: EDM Snare (清脆双层电音军鼓)
      case 1: {
        // Body
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);
        oscGain.gain.setValueAtTime(0.8, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(oscGain);
        oscGain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.12);

        // White Noise Snare tail
        if (this.noiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(1000, t);

          const noiseGain = this.ctx.createGain();
          noiseGain.gain.setValueAtTime(0.9, t);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(this.masterFilter);
          noise.start(t);
          noise.stop(t + 0.25);
        }
        break;
      }

      // 2: Trap Clap (微延迟多重拍手)
      case 2: {
        if (!this.noiseBuffer) return;
        const delays = [0, 0.012, 0.025];
        delays.forEach((delay, idx) => {
          const noise = this.ctx!.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const bandpass = this.ctx!.createBiquadFilter();
          bandpass.type = 'bandpass';
          bandpass.frequency.setValueAtTime(1200, t + delay);
          bandpass.Q.setValueAtTime(2.5, t + delay);

          const gain = this.ctx!.createGain();
          const amp = idx === 2 ? 0.9 : 0.45;
          gain.gain.setValueAtTime(amp, t + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.18);

          noise.connect(bandpass);
          bandpass.connect(gain);
          gain.connect(this.masterFilter!);
          noise.start(t + delay);
          noise.stop(t + delay + 0.2);
        });
        break;
      }

      // 3: Closed Hi-Hat (金属闭擦)
      case 3: {
        if (!this.noiseBuffer) return;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(8500, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.65, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterFilter);
        noise.start(t);
        noise.stop(t + 0.06);
        break;
      }

      // 4: Open Hi-Hat (开擦)
      case 4: {
        if (!this.noiseBuffer) return;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(6500, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterFilter);
        noise.start(t);
        noise.stop(t + 0.4);
        break;
      }

      // 5: 808 Glide Bass (滑音重低音)
      case 5: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        // Lowpass to give it deep warm body
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(320, t);

        osc.frequency.setValueAtTime(65.41, t); // C2
        osc.frequency.exponentialRampToValueAtTime(43.65, t + 0.28); // F1

        gain.gain.setValueAtTime(0.85, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

        osc.connect(lp);
        lp.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.7);
        break;
      }

      // 6: Synth Stab C-min (C小调电音冲刺刺音)
      case 6: {
        this.playSawChord([261.63, 311.13, 392.0], t, 0.25);
        break;
      }

      // 7: Synth Stab Eb (降E主音刺音)
      case 7: {
        this.playSawChord([311.13, 392.0, 466.16], t, 0.28);
        break;
      }

      // 8: Laser FX (复古激光扫射)
      case 8: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.16);

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      }

      // 9: Pluck G4
      case 9: {
        this.playPluckNote(392.0, t);
        break;
      }

      // 10: Pluck Bb4
      case 10: {
        this.playPluckNote(466.16, t);
        break;
      }

      // 11: Lead C5
      case 11: {
        this.playLeadNote(523.25, t);
        break;
      }

      // 12: Riser Up (扫频升音)
      case 12: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(2200, t + 1.1);

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0.7, t + 0.95);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.15);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 1.2);
        break;
      }

      // 13: Sub Drop (下坠爆破低音炸弹)
      case 13: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(130, t);
        osc.frequency.exponentialRampToValueAtTime(28, t + 0.6);

        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.75);
        break;
      }

      // 14: Vocal Chop Formant (人声共鸣切片)
      case 14: {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(293.66, t); // D4

        const form1 = this.ctx.createBiquadFilter();
        form1.type = 'bandpass';
        form1.frequency.setValueAtTime(750, t);
        form1.Q.setValueAtTime(5, t);

        const form2 = this.ctx.createBiquadFilter();
        form2.type = 'bandpass';
        form2.frequency.setValueAtTime(1400, t);
        form2.Q.setValueAtTime(6, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.75, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc.connect(form1);
        osc.connect(form2);
        form1.connect(gain);
        form2.connect(gain);
        gain.connect(this.masterFilter);

        osc.start(t);
        osc.stop(t + 0.3);
        break;
      }

      // 15: Crash Cymbal (重音爆鸣碎镲)
      case 15: {
        if (!this.noiseBuffer) return;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(4500, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.85, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterFilter);
        noise.start(t);
        noise.stop(t + 1.25);
        break;
      }
    }
  }

  // ------------------ Lo-Fi Chill / HipHop ------------------
  private playLofiPad(id: number, t: number) {
    if (!this.ctx || !this.masterFilter) return;

    switch (id) {
      // 0: Lo-Fi Muffled Kick
      case 0: {
        const osc = this.ctx.createOscillator();
        const lp = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(220, t); // Warm & muffled

        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(lp);
        lp.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.38);
        break;
      }

      // 1: Rimshot
      case 1: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(480, t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.035);

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.06);
        break;
      }

      // 2: Vinyl Clap
      case 2: {
        if (!this.noiseBuffer) return;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(950, t);
        filter.Q.setValueAtTime(1.5, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.65, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterFilter);
        noise.start(t);
        noise.stop(t + 0.18);
        break;
      }

      // 3: Tape Hat
      case 3: {
        if (!this.noiseBuffer) return;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(6000, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterFilter);
        noise.start(t);
        noise.stop(t + 0.05);
        break;
      }

      // 4: Open Shaker
      case 4: {
        if (!this.noiseBuffer) return;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(4500, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterFilter);
        noise.start(t);
        noise.stop(t + 0.2);
        break;
      }

      // 5: Warm Sub
      case 5: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(55, t); // A1

        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.65);
        break;
      }

      // 6: Rhodes Cmaj7 (温暖电钢琴)
      case 6: {
        this.playRhodesChord([261.63, 329.63, 392.0, 493.88], t);
        break;
      }

      // 7: Rhodes Am7
      case 7: {
        this.playRhodesChord([220.0, 261.63, 329.63, 392.0], t);
        break;
      }

      // 8: Kalimba 1
      case 8: {
        this.playKalimba(523.25, t);
        break;
      }

      // 9: Kalimba 2
      case 9: {
        this.playKalimba(659.25, t);
        break;
      }

      // 10: Chill Bell
      case 10: {
        this.playKalimba(783.99, t);
        break;
      }

      // 11: Vocal Ayy
      case 11: {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(329.63, t);

        const form = this.ctx.createBiquadFilter();
        form.type = 'bandpass';
        form.frequency.setValueAtTime(800, t);
        form.Q.setValueAtTime(4, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.65, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(form);
        form.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.32);
        break;
      }

      // 12: Tape Stop FX (卡带刹车声)
      case 12: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.35);

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.4);
        break;
      }

      // 13: Vinyl Hiss
      case 13: {
        if (!this.noiseBuffer) return;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2500, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterFilter);
        noise.start(t);
        noise.stop(t + 0.85);
        break;
      }

      // 14: Rain Drop
      case 14: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1600, t);
        osc.frequency.exponentialRampToValueAtTime(450, t + 0.08);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      }

      // 15: Chill Crash
      case 15: {
        if (!this.noiseBuffer) return;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(4000, t); // Soft high roll-off

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterFilter);
        noise.start(t);
        noise.stop(t + 0.95);
        break;
      }
    }
  }

  // ------------------ 8-Bit Retro Arcade ------------------
  private playArcadePad(id: number, t: number) {
    if (!this.ctx || !this.masterFilter) return;

    switch (id) {
      // 0: Square Kick
      case 0: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + 0.09);

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
      }

      // 1: Noise Snare
      case 1: {
        if (!this.noiseBuffer) return;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        noise.connect(gain);
        gain.connect(this.masterFilter);
        noise.start(t);
        noise.stop(t + 0.12);
        break;
      }

      // 2: Coin Ping (金币叮声)
      case 2: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, t); // B5
        osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.5);
        break;
      }

      // 3: Pulse Hat
      case 3: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(2200, t);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.04);
        break;
      }

      // 4: Open Noise
      case 4: {
        if (!this.noiseBuffer) return;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        noise.connect(gain);
        gain.connect(this.masterFilter);
        noise.start(t);
        noise.stop(t + 0.3);
        break;
      }

      // 5: 8-Bit Bass
      case 5: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(82.41, t); // E2

        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.4);
        break;
      }

      // 6: Power Up Arp
      case 6: {
        const freqs = [330, 392, 659, 523, 587, 784];
        freqs.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, t + idx * 0.04);
          gain.gain.setValueAtTime(0.3, t + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.06);

          osc.connect(gain);
          gain.connect(this.masterFilter!);
          osc.start(t + idx * 0.04);
          osc.stop(t + idx * 0.04 + 0.07);
        });
        break;
      }

      // 7: 1-Up Chime
      case 7: {
        const notes = [330, 392, 659, 523, 587, 784];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        notes.forEach((freq, idx) => {
          osc.frequency.setValueAtTime(freq, t + idx * 0.05);
        });
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.5);
        break;
      }

      // 8: Laser Gun
      case 8: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);

        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
      }

      // 9: Jump Sound
      case 9: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.14);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.18);
        break;
      }

      // 10: Arp Lead 1
      case 10: {
        this.playSquareNote(440, t);
        break;
      }

      // 11: Arp Lead 2
      case 11: {
        this.playSquareNote(659.25, t);
        break;
      }

      // 12: Warp Pipe
      case 12: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);

        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      }

      // 13: Hit Hurt
      case 13: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.linearRampToValueAtTime(40, t + 0.08);

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(gain);
        gain.connect(this.masterFilter);
        osc.start(t);
        osc.stop(t + 0.12);
        break;
      }

      // 14: Explosion
      case 14: {
        if (!this.noiseBuffer) return;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, t);
        filter.frequency.linearRampToValueAtTime(60, t + 0.3);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.85, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterFilter);
        noise.start(t);
        noise.stop(t + 0.45);
        break;
      }

      // 15: Victory Jingle
      case 15: {
        const fanfare = [523.25, 659.25, 783.99, 1046.5];
        fanfare.forEach((f, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(f, t + idx * 0.08);
          gain.gain.setValueAtTime(0.4, t + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.15);

          osc.connect(gain);
          gain.connect(this.masterFilter!);
          osc.start(t + idx * 0.08);
          osc.stop(t + idx * 0.08 + 0.18);
        });
        break;
      }
    }
  }

  // ================= 辅助合成函数 =================
  private playSawChord(freqs: number[], t: number, duration = 0.25) {
    if (!this.ctx || !this.masterFilter) return;

    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      // Lowpass envelope sweep
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, t);
      filter.frequency.linearRampToValueAtTime(3200, t + 0.02);
      filter.frequency.exponentialRampToValueAtTime(600, t + duration);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterFilter!);

      osc.start(t);
      osc.stop(t + duration + 0.05);
    });
  }

  private playPluckNote(freq: number, t: number) {
    if (!this.ctx || !this.masterFilter) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4500, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.2);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterFilter);

    osc.start(t);
    osc.stop(t + 0.28);
  }

  private playLeadNote(freq: number, t: number) {
    if (!this.ctx || !this.masterFilter) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.masterFilter);

    osc.start(t);
    osc.stop(t + 0.38);
  }

  private playRhodesChord(freqs: number[], t: number) {
    if (!this.ctx || !this.masterFilter) return;

    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

      osc.connect(gain);
      gain.connect(this.masterFilter!);

      osc.start(t);
      osc.stop(t + 0.7);
    });
  }

  private playKalimba(freq: number, t: number) {
    if (!this.ctx || !this.masterFilter) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.masterFilter);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  private playSquareNote(freq: number, t: number) {
    if (!this.ctx || !this.masterFilter) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.masterFilter);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  // ================= Loop 交互循环机 =================
  public startLoop(pack: SoundpackId, onStep?: (step: number, triggeredPads: number[]) => void) {
    this.initContext();
    this.stopLoop();

    this.isLoopRunning = true;
    this.loopPack = pack;
    if (onStep) this.onStepCallback = onStep;
    this.currentStep = 0;

    const stepIntervalMs = (60 / this.bpm / 4) * 1000; // 16分音符

    this.loopTimerId = window.setInterval(() => {
      if (!this.isLoopRunning) return;

      const step = this.currentStep;
      // 执行所有当前处于激活循环状态的按键
      const triggered = this.executeLoopStep(step, this.loopPack);
      this.onStepCallback?.(step, triggered);

      this.currentStep = (this.currentStep + 1) % 16;
    }, stepIntervalMs);
  }

  public stopLoop() {
    this.isLoopRunning = false;
    if (this.loopTimerId !== null) {
      clearInterval(this.loopTimerId);
      this.loopTimerId = null;
    }
    this.currentStep = 0;
  }

  public isLooping(): boolean {
    return this.isLoopRunning;
  }

  /**
   * 切换单个按键的 Loop 循环状态
   * @returns true: 当前已加入循环; false: 当前已解除循环
   */
  public togglePadLoop(
    padId: number,
    pack: SoundpackId,
    onStep?: (step: number, triggeredPads: number[]) => void
  ): boolean {
    this.initContext();
    this.loopPack = pack;
    if (onStep) this.onStepCallback = onStep;

    if (this.activeLoopPads.has(padId)) {
      this.activeLoopPads.delete(padId);
      // 如果没有任何按键在 loop 了，停止循环
      if (this.activeLoopPads.size === 0) {
        this.stopLoop();
      }
      return false;
    } else {
      this.activeLoopPads.add(padId);
      // 立即发出一击，给手指即时听觉反馈
      this.triggerPad(padId, pack);
      // 开启主时钟
      if (!this.isLoopRunning) {
        this.startLoop(pack, onStep);
      }
      return true;
    }
  }

  /**
   * 一键清空所有循环按键 (全部静音)
   */
  public clearAllLoops() {
    this.activeLoopPads.clear();
    this.stopLoop();
  }

  /**
   * 获取当前处于 Loop 状态的按键 ID 列表
   */
  public getActiveLoops(): number[] {
    return Array.from(this.activeLoopPads);
  }

  public isPadLooping(padId: number): boolean {
    return this.activeLoopPads.has(padId);
  }

  /**
   * 预设一键开启底鼓+擦片基础律动
   */
  public activateDefaultRhythm(pack: SoundpackId, onStep?: (step: number, triggeredPads: number[]) => void) {
    this.initContext();
    this.activeLoopPads.clear();
    this.activeLoopPads.add(0); // Kick
    this.activeLoopPads.add(1); // Snare
    this.activeLoopPads.add(3); // Hat
    this.startLoop(pack, onStep);
  }

  private executeLoopStep(step: number, pack: SoundpackId): number[] {
    if (!this.ctx) return [];
    const triggered: number[] = [];

    // 检查所有已加入 Loop 循环挂起的按键
    for (const padId of this.activeLoopPads) {
      const steps = DEFAULT_PAD_STEPS[pack]?.[padId];
      if (steps && steps.includes(step)) {
        this.triggerPad(padId, pack);
        triggered.push(padId);
      }
    }

    return triggered;
  }
}

export const pocketAudio = new PocketPadAudioEngine();
