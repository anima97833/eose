// 轻拟物通用基础音效合成器（轻量纯 Web Audio 算法，零外部资源依赖）

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// 1. 拟物按键微点击音
export function playClickSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12);
    }
  } catch {
    // ignore
  }
}

// 2. 达成通关与庆典空灵风铃音
export function playCompletionChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const tones = [
      { freq: 523.25, time: 0, dur: 1.8 },      // C5
      { freq: 659.25, time: 0.15, dur: 2.2 },   // E5
      { freq: 783.99, time: 0.32, dur: 2.5 },   // G5
      { freq: 1046.5, time: 0.48, dur: 3.0 },   // C6
    ];

    tones.forEach((tone) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(tone.freq, now + tone.time);

      gain.gain.setValueAtTime(0, now + tone.time);
      gain.gain.linearRampToValueAtTime(0.18, now + tone.time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.time + tone.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + tone.time);
      osc.stop(now + tone.time + tone.dur);
    });

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 80, 50, 100]);
    }
  } catch (err) {
    console.error('Audio chime error:', err);
  }
}
