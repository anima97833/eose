import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

let audioContext: AudioContext | null = null;

/**
 * 播放清脆的超市收银台/条码枪扫码“哔！”声
 */
export function playScannerBeep(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioContext || audioContext.state === 'suspended') {
      audioContext = new AudioCtx();
    }

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    // 典型工业扫码枪频率：1800Hz
    osc.frequency.setValueAtTime(1800, audioContext.currentTime);

    gain.gain.setValueAtTime(0.18, audioContext.currentTime);
    // 快速淡出，持续 75ms
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.075);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + 0.08);

    // 触觉轻微震动反馈
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(35);
    }
  } catch (err) {
    console.warn('[ScannerEngine] 播放音效失败:', err);
  }
}

/**
 * 创建针对纸质图书条形码优化的专业 ZXing 解码器
 * 针对中国大陆常见的 EAN-13, EAN-8, CODE-128, UPC 进行格式聚焦
 */
export function createZXingReader(): BrowserMultiFormatReader {
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_128,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
  ]);
  hints.set(DecodeHintType.TRY_HARDER, true);
  return new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 100 });
}

/**
 * 从本地选择的图片文件中解码条形码
 */
export async function decodeBarcodeFromFile(file: File): Promise<string | null> {
  const reader = createZXingReader();
  const blobUrl = URL.createObjectURL(file);
  try {
    const result = await reader.decodeFromImageUrl(blobUrl);
    return result ? result.getText() : null;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

/**
 * 初始化摄像头视频流
 */
export async function startCameraStream(videoEl: HTMLVideoElement): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: 'environment' }, // 优先后置主摄像头
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  });

  videoEl.srcObject = stream;
  await videoEl.play();
  return stream;
}

/**
 * 停止摄像头视频流
 */
export function stopCameraStream(stream: MediaStream | null): void {
  if (!stream) return;
  try {
    stream.getTracks().forEach((track) => track.stop());
  } catch (err) {
    console.warn('[ScannerEngine] 停止摄像头失败:', err);
  }
}

/**
 * 清洗规范化 13 位 ISBN 码（去除横杠与空格）
 */
export function normalizeISBN(raw: string): string {
  const cleaned = raw.replace(/[-\s]/g, '').trim();
  // 实体图书条形码通常为 13 位 EAN (978... 或 979...)
  return cleaned;
}
