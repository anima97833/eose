/**
 * 灵动岛智能语音播报服务 (Island Audio Service)
 * 默认音色：【晓伊 (Xiaoyi)】—— 甜美、日常、轻快的青春自然女声，彻底告别机械生硬的播音腔！
 * 
 * 双轨高保真架构：
 * 1. 优先尝试云端免 Key 24kHz 神经网络高清音流 (zh-CN-XiaoyiNeural)
 * 2. 弱网/离线秒级无缝降级为本地 Web Speech API（自动匹配系统晓伊/婷婷/瑶瑶甜美音色，提调微调消除生硬感）
 * 3. 支持用户接入自定义 OpenAI/Edge-TTS 接口
 */

const ISLAND_SOUND_KEY = 'cloudfly_island_sound_enabled';
const CUSTOM_TTS_ENDPOINT_KEY = 'cloudfly_custom_tts_endpoint';

// 免费高品质晓伊 Edge-TTS 镜像接口（无需 Key，纯净直连，支持 CORS）
const DEFAULT_XIAOYI_TTS_URL = 'https://libretts.is-an.org/api/tts';
const DEFAULT_VOICE = 'zh-CN-XiaoyiNeural'; // 晓伊 - 甜美日常女声

let currentAudio: HTMLAudioElement | null = null;
let currentAbortController: AbortController | null = null;

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
 * 获取自定义的 TTS 接口地址
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
 * 配置自定义 TTS 接口地址
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

  if (currentAbortController) {
    try {
      currentAbortController.abort();
    } catch {
      // ignore
    }
    currentAbortController = null;
  }

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
 * 播报灵动岛提示语（默认采用“晓伊”甜美日常女声）
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

  // 1. 如果用户自行配置了专属云端接口
  if (customEndpoint) {
    try {
      callbacks?.onStart?.();
      const res = await fetch(customEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: speechText,
          voice: DEFAULT_VOICE,
          speed: 1.05,
          pitch: '0',
          style: 'chat',
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        await playAudioBlob(blob, callbacks, speechText);
        return;
      }
    } catch (err) {
      console.warn('[IslandAudio] 自定义云端接口失败，尝试公共晓伊接口:', err);
    }
  }

  // 2. 默认云端高清「晓伊」甜美神经网络流（带 2.6s 超时熔断保护）
  const controller = new AbortController();
  currentAbortController = controller;
  const timeoutId = setTimeout(() => controller.abort(), 2600);

  try {
    const targetUrl = `${DEFAULT_XIAOYI_TTS_URL}?t=${encodeURIComponent(speechText)}&v=${DEFAULT_VOICE}&r=5&p=0`;
    const res = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const blob = await res.blob();
      await playAudioBlob(blob, callbacks, speechText);
      return;
    }
  } catch (err) {
    // 超时或断网，瞬间降级为本地引擎
    clearTimeout(timeoutId);
  }

  // 3. 兜底极速引擎：浏览器本地 Web Speech API（调校为晓伊/婷婷同款甜美音阶）
  speakViaWebSpeech(speechText, callbacks);
}

/**
 * 播放音频 Blob
 */
async function playAudioBlob(
  blob: Blob,
  callbacks?: { onStart?: () => void; onEnd?: () => void },
  fallbackText?: string
): Promise<void> {
  try {
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    currentAudio = audio;

    audio.onplay = () => {
      callbacks?.onStart?.();
    };

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      callbacks?.onEnd?.();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      if (fallbackText) {
        speakViaWebSpeech(fallbackText, callbacks);
      } else {
        callbacks?.onEnd?.();
      }
    };

    await audio.play();
  } catch (err) {
    console.warn('[IslandAudio] 音频播放受限或失败，降级本地朗读:', err);
    if (fallbackText) {
      speakViaWebSpeech(fallbackText, callbacks);
    } else {
      callbacks?.onEnd?.();
    }
  }
}

/**
 * 本地 Web Speech API 朗读实现：专项调优为【晓伊/甜美年轻女声】听感
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
    // 语速略轻快、音调上提 1.12 倍，声音立刻变得甜美、年轻、有灵气，消除沉闷感！
    utterance.rate = 1.04;
    utterance.pitch = 1.12;

    const voices = window.speechSynthesis.getVoices();

    // 优先匹配晓伊 (Xiaoyi)，其次匹配苹果婷婷 (Ting-Ting)、瑶瑶 (Yaoyao) 等甜美少女音
    const sweetVoice =
      voices.find(
        (v) =>
          v.lang.includes('zh') &&
          (v.name.includes('Xiaoyi') ||
            v.name.includes('晓伊') ||
            v.name.includes('Ting-Ting') ||
            v.name.includes('Sinji') ||
            v.name.includes('Yaoyao') ||
            v.name.includes('Mei-Jia'))
      ) ||
      voices.find(
        (v) =>
          v.lang.includes('zh') &&
          (v.name.includes('Yunxi') || v.name.includes('Natural'))
      ) ||
      voices.find((v) => v.lang.includes('zh') || v.lang.includes('cmn'));

    if (sweetVoice) {
      utterance.voice = sweetVoice;
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
