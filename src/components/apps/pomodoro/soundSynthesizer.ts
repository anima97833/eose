// 纯前端 Web Audio 算法声音合成器（无需下载任何外部音频文件，零依赖离线可用）

let audioCtx: AudioContext | null = null;
let currentNoiseSource: AudioNode | null = null;
let currentNoiseGain: GainNode | null = null;
let clockTimerId: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. 阶段结束空灵风铃音
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

    // 同步触发物理触觉马达振动提醒
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 80, 50, 100]);
    }
  } catch (err) {
    console.error('Audio chime error:', err);
  }
}

// 2. 拟物按键触感微点击音
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

// 3. 停止当前白噪音伴奏
export function stopAmbientNoise(): void {
  if (clockTimerId !== null) {
    window.clearInterval(clockTimerId);
    clockTimerId = null;
  }

  if (currentNoiseGain && audioCtx) {
    try {
      const now = audioCtx.currentTime;
      currentNoiseGain.gain.linearRampToValueAtTime(0.001, now + 0.3);
      setTimeout(() => {
        if (currentNoiseSource) {
          (currentNoiseSource as any).stop?.();
          currentNoiseSource.disconnect();
          currentNoiseSource = null;
        }
        currentNoiseGain = null;
      }, 350);
    } catch {
      currentNoiseGain = null;
      currentNoiseSource = null;
    }
  }
}

// 4. 播放沉浸式白噪音 ('rain' | 'clock' | 'cafe' | 'off')
export function startAmbientNoise(type: 'rain' | 'clock' | 'cafe' | 'off'): void {
  stopAmbientNoise();
  if (type === 'off') return;

  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 2;
    const now = ctx.currentTime;

    if (type === 'rain') {
      // 粉红噪音滤波模拟春雨
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 1.2);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      currentNoiseSource = whiteNoise;
      currentNoiseGain = gain;
    } else if (type === 'cafe') {
      // 咖啡馆低频暖白噪音
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.08;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(1.2, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 1.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      currentNoiseSource = noise;
      currentNoiseGain = gain;
    } else if (type === 'clock') {
      // 经典机械钟表滴答声（每秒脉冲）
      const playTick = () => {
        try {
          const tickNow = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, tickNow);
          osc.frequency.exponentialRampToValueAtTime(300, tickNow + 0.015);

          gain.gain.setValueAtTime(0.06, tickNow);
          gain.gain.exponentialRampToValueAtTime(0.0001, tickNow + 0.02);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(tickNow);
          osc.stop(tickNow + 0.025);
        } catch {
          // ignore
        }
      };

      playTick();
      clockTimerId = window.setInterval(playTick, 1000);
    }
  } catch (err) {
    console.error('Ambient noise error:', err);
  }
}
