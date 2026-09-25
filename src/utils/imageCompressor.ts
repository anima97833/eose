/**
 * 客户端图片强制压缩与优化工具
 * 针对轻拟物 Web 系统的 IndexedDB 与离线沙盒存储设计
 * 
 * 作用：
 * 1. 解决手机相机原图（4MB ~ 12MB）直接转 Base64 导致 IndexedDB 迅速膨胀、内存 OOM 闪退问题；
 * 2. 将原图等比缩小至合理尺寸（默认最长边 1280px），并使用 WebP（或高质量 JPEG）编码；
 * 3. 平均将图片体积缩减 80% ~ 95%（例如 6MB 压缩为 150KB），大幅提升离线读写与备份还原速度。
 */

export interface ImageCompressOptions {
  /** 最长边最大像素，默认 1280px */
  maxDimension?: number;
  /** 最大宽度（可选，若设置则优先遵循） */
  maxWidth?: number;
  /** 最大高度（可选，若设置则优先遵循） */
  maxHeight?: number;
  /** 压缩质量 0.1 ~ 1.0，默认 0.82 */
  quality?: number;
  /** 输出 MIME 类型，默认优先 'image/webp'，不支持时自动降级 'image/jpeg' */
  mimeType?: 'image/webp' | 'image/jpeg' | 'image/png';
  /** 小于此字节数时跳过压缩直接读取原图（默认 50KB） */
  skipIfSmallerThanBytes?: number;
}

/**
 * 格式化字节大小显示
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 将 File/Blob 读取并压缩为高质量轻量 Base64 Data URL
 */
export async function compressImageFile(
  file: File | Blob,
  options: ImageCompressOptions = {}
): Promise<string> {
  const {
    maxDimension = 1280,
    maxWidth,
    maxHeight,
    quality = 0.82,
    mimeType = 'image/webp',
    skipIfSmallerThanBytes = 50 * 1024, // 50KB 以下不折腾
  } = options;

  // 1. 如果不是图片或为 SVG 矢量图，直接以纯文本/原始格式读取
  if (file.type === 'image/svg+xml' || (file.type && !file.type.startsWith('image/'))) {
    return readRawFileAsDataURL(file);
  }

  // 2. 如果文件原本就已经非常小（< 50KB），且不是超大分辨率，直接读取避免二次压缩损耗
  if (file.size > 0 && file.size <= skipIfSmallerThanBytes && file.type === 'image/webp') {
    return readRawFileAsDataURL(file);
  }

  try {
    const rawDataUrl = await readRawFileAsDataURL(file);
    return await compressImageBase64(rawDataUrl, {
      maxDimension,
      maxWidth,
      maxHeight,
      quality,
      mimeType,
      originalSize: file.size,
    });
  } catch (err) {
    console.warn('[ImageCompressor] 压缩异常，安全降级为原图读取:', err);
    return readRawFileAsDataURL(file);
  }
}

/**
 * 将已有的 Base64 或图片链接通过 Canvas 压缩重编码
 */
export async function compressImageBase64(
  src: string,
  options: ImageCompressOptions & { originalSize?: number } = {}
): Promise<string> {
  const {
    maxDimension = 1280,
    maxWidth,
    maxHeight,
    quality = 0.82,
    mimeType = 'image/webp',
    originalSize,
  } = options;

  // 如果是 SVG Base64，跳过
  if (src.startsWith('data:image/svg+xml')) {
    return src;
  }

  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let originW = img.naturalWidth || img.width;
        let originH = img.naturalHeight || img.height;

        if (originW === 0 || originH === 0) {
          resolve(src);
          return;
        }

        // 计算等比例缩放后的尺寸
        let targetW = originW;
        let targetH = originH;

        const limitW = maxWidth || maxDimension;
        const limitH = maxHeight || maxDimension;

        if (targetW > limitW || targetH > limitH) {
          const ratioW = limitW / targetW;
          const ratioH = limitH / targetH;
          const scale = Math.min(ratioW, ratioH);
          targetW = Math.round(targetW * scale);
          targetH = Math.round(targetH * scale);
        }

        // 创建离屏 Canvas
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(src);
          return;
        }

        // 平滑高质量缩放绘制
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 如果输出 JPEG 且原图有透明通道，先铺一层白底防止黑边
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetW, targetH);
        }

        ctx.drawImage(img, 0, 0, targetW, targetH);

        // 优先使用 WebP 导出
        let compressedDataUrl = canvas.toDataURL(mimeType, quality);

        // 浏览器不支持 WebP 导出时的回退（部分旧 Safari 导出的还是 png）
        if (mimeType === 'image/webp' && !compressedDataUrl.startsWith('data:image/webp')) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // 打印压缩收益日志
        if ((import.meta as any).env?.DEV) {
          const origBytes = originalSize || Math.round((src.length * 3) / 4);
          const compBytes = Math.round((compressedDataUrl.length * 3) / 4);
          const savedPercent = origBytes > 0 ? (((origBytes - compBytes) / origBytes) * 100).toFixed(1) : '0';
          console.log(
            `%c[ImageCompressor] 尺寸: ${originW}x${originH} -> ${targetW}x${targetH} | 体积: ${formatBytes(
              origBytes
            )} -> ${formatBytes(compBytes)} (节省 ${savedPercent}%)`,
            'color: #059669; font-weight: bold;'
          );
        }

        resolve(compressedDataUrl);
      } catch (err) {
        console.warn('[ImageCompressor] Canvas 导出失败，返回原始源:', err);
        resolve(src);
      }
    };

    img.onerror = (e) => {
      console.warn('[ImageCompressor] 图片加载解码失败，返回原数据:', e);
      resolve(src);
    };

    img.src = src;
  });
}

/**
 * 原始文件读取兜底函数
 */
function readRawFileAsDataURL(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
