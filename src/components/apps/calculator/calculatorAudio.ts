/**
 * 计算器 Web Audio API 纯原生高拟真声学引擎
 * 无需外部音频文件，零延迟，完全免网络
 */

export type AudioSwitchMode = 'blue' | 'typewriter' | 'piano' | 'mute';

class CalculatorAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * 播放青轴机械段落音 (双脉冲清脆咔嗒)
   */
  playBlueSwitch() {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2600, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.025);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  /**
   * 播放复古打字机铅字撞击声
   */
  playTypewriter() {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.03);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.045);
  }

  /**
   * 播放打字机“叮~”回车铃声（用于按等于号 = 时）
   */
  playTypewriterBell() {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2093, t); // C7 高频清脆金属泛音

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.7);
  }

  /**
   * 播放电子琴对应音阶 (Do Re Mi Fa Sol La Ti)
   */
  playPianoNote(key: string) {
    const ctx = this.getContext();
    if (!ctx) return;

    // 音阶频率表
    const NOTE_FREQS: Record<string, number> = {
      '1': 261.63, // C4 Do
      '2': 293.66, // D4 Re
      '3': 329.63, // E4 Mi
      '4': 349.23, // F4 Fa
      '5': 392.00, // G4 Sol
      '6': 440.00, // A4 La
      '7': 493.88, // B4 Ti
      '8': 523.25, // C5 高音Do
      '9': 587.33, // D5 高音Re
      '0': 220.00, // A3 低音La
      '+': 330.0,
      '-': 293.7,
      '×': 392.0,
      '÷': 440.0,
      '=': 523.25,
      'C': 196.0,
      '.': 349.2,
      '±': 261.6,
      '%': 370.0,
    };

    const freq = NOTE_FREQS[key] || 300;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    // 优雅衰减的钢琴包络
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.38);
  }

  /**
   * 反应堆游戏：答对得分音
   */
  playSuccessCombo(combo: number) {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreq = Math.min(880, 440 + combo * 35);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  /**
   * 反应堆游戏：答错音
   */
  playFailSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.18);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  /**
   * 按键触发总入口
   */
  playKeySound(key: string, mode: AudioSwitchMode) {
    if (mode === 'mute') return;

    if (mode === 'blue') {
      this.playBlueSwitch();
    } else if (mode === 'typewriter') {
      if (key === '=') {
        this.playTypewriterBell();
      } else {
        this.playTypewriter();
      }
    } else if (mode === 'piano') {
      this.playPianoNote(key);
    }
  }
}

export const calcAudio = new CalculatorAudioEngine();
