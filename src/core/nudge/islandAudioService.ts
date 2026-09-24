/**
 * 灵动岛智能语音播报服务 (Island Audio Service)
 * 支持双轨驱动：
 * 1. 默认高保真本地真人级语音 (Web Speech API - 微软晓晓/云希/Siri/谷歌离线高品质自然人声，零延迟零配置)
 * 2. 支持接入自定义 Edge-TTS 云端服务 (如基于 wangwangit/tts 部署的 Cloudflare Worker /v1/audio/speech 接口)
 */

const ISLAND_SOUND_KEY = 'cloudfly_island_sound_enabled';
const CUSTOM_TTS_ENDPOINT_KEY = 'cloudfly_custom_tts_endpoint';

let currentAudio: HTMLAudioElement | null = null;

/**
 * 检查灵动岛语音播报是否开启（默认开启）
 */
export function isIslandSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const val = localStorage.getItem(ISLAND_SOUND_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

/**
 * 切换/设置灵动岛语音播报开关
 */
export function setIslandSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(ISLAND_SOUND_KEY, enabled ? 'true' : 'false');
    if (!enabled) {
      stopIslandAudio();
    }
  } catch (err) {
    console.warn('[IslandAudio] 保存语音开关失败:', err);
  }
}

/**
 * 获取自定义的 Edge-TTS Worker 接口地址 (如 https://your-worker.workers.dev/v1/audio/speech)
 */
export function getCustomTtsEndpoint(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(CUSTOM_TTS_ENDPOINT_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * 配置自定义 Edge-TTS Worker 接口地址
 */
export function setCustomTtsEndpoint(endpoint: string): void {
  try {
    localStorage.setItem(CUSTOM_TTS_ENDPOINT_KEY, endpoint.trim());
  } catch (err) {
    console.warn('[IslandAudio] 保存自定义TTS地址失败:', err);
  }
}

/**
 * 停止当前正在播放的音频/朗读
 */
export function stopIslandAudio(): void {
  if (typeof window === 'undefined') return;

  // 停止云端音频播放
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }

  // 停止本地朗读
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

/**
 * 精简与净化朗读文本，使其读起来更加顺畅自然
 */
function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/[【】\[\]]/g, '')
    .replace(/《(.*?)》/g, '$1')
    .replace(/“|”|"/g, '')
    .trim();
}

/**
 * 播报灵动岛提示语
 */
export async function speakIslandMessage(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
  }
): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!isIslandSoundEnabled()) return;

  stopIslandAudio();

  const speechText = cleanTextForSpeech(text);
  if (!speechText) return;

  const customEndpoint = getCustomTtsEndpoint();

  // 1. 如果用户配置了自定义 Edge-TTS (例如 wangwangit/tts Worker 部署地址)
  if (customEndpoint) {
    try {
      callbacks?.onStart?.();
      const res = await fetch(customEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: speechText,
          voice: 'zh-CN-XiaoxiaoNeural',
          speed: 1.0,
          pitch: '0',
          style: 'general',
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        currentAudio = audio;

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          currentAudio = null;
          callbacks?.onEnd?.();
        };

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          currentAudio = null;
          // 降级为本地 Web Speech
          speakViaWebSpeech(speechText, callbacks);
        };

        await audio.play();
        return;
      }
    } catch (err) {
      console.warn('[IslandAudio] 云端 Edge-TTS 调用失败，自动降级为本地引擎:', err);
    }
  }

  // 2. 默认主力引擎：浏览器内置高保真 Web Speech API
  speakViaWebSpeech(speechText, callbacks);
}

/**
 * 本地 Web Speech API 朗读实现（零延迟、断网可用、原生自然人声）
 */
function speakViaWebSpeech(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
  }
): void {
  if (!('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1.05; // 稍微轻快生动
    utterance.pitch = 1.0;

    // 优先匹配高质量中文自然发声人（如微软晓晓、云希、苹果婷婷、谷歌普通话等）
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice =
      voices.find(
        (v) =>
          v.lang.includes('zh') &&
          (v.name.includes('Xiaoxiao') ||
            v.name.includes('Yunxi') ||
            v.name.includes('Natural') ||
            v.name.includes('Ting-Ting') ||
            v.name.includes('Sinji') ||
            v.name.includes('Huihui') ||
            v.name.includes('Yaoyao'))
      ) ||
      voices.find((v) => v.lang.includes('zh') || v.lang.includes('cmn'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      callbacks?.onStart?.();
    };

    utterance.onend = () => {
      callbacks?.onEnd?.();
    };

    utterance.onerror = () => {
      callbacks?.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[IslandAudio] 本地语音朗读异常:', err);
    callbacks?.onEnd?.();
  }
}
