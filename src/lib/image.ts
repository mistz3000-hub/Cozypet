/** Browser resize/EXIF removal. D29 shelter photos may upload to private Storage after real login. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export type ImageError = 'type' | 'size' | 'decode';

export function validateImageFile(file: File): ImageError | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'type';
  if (file.size > MAX_IMAGE_BYTES) return 'size';
  return null;
}

export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('read'));
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('decode'));
    img.src = src;
  });
}

/** ตรวจว่าถอดรหัสรูปได้ */
export async function canDecode(src: string): Promise<boolean> {
  try {
    await loadImage(src);
    return true;
  } catch {
    return false;
  }
}

/** ย่อรูปผ่าน canvas เหลือด้านยาวสุด 640px เป็น JPEG 0.7 (ช่วยลบ EXIF/ตำแหน่ง) */
export async function resizeToJpeg(src: string, maxSide = 640, quality = 0.7): Promise<string> {
  const img = await loadImage(src);
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
}
