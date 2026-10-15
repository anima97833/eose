/**
 * 图像处理工具：支持自动去纯白/近白底色（Chroma Keying），转为透明 PNG DataURL
 */
export async function removeWhiteBackground(imageUrl: string, tolerance: number = 238): Promise<string> {
  if (!imageUrl) return '';
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // 扫描每个像素
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // 当 R, G, B 均超过白底阈值时，将其变透明
          if (r >= tolerance && g >= tolerance && b >= tolerance) {
            // 平滑羽化边缘
            const avg = (r + g + b) / 3;
            if (avg > 250) {
              data[i + 3] = 0;
            } else {
              // 半透明渐变过渡
              data[i + 3] = Math.max(0, Math.round((255 - avg) * 15));
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Canvas removeWhiteBackground fallback to original URL', err);
        resolve(imageUrl);
      }
    };
    img.onerror = () => {
      resolve(imageUrl);
    };
    img.src = imageUrl;
  });
}

/**
 * 将 File 对象转换为 Base64 DataURL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
