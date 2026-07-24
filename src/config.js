const env = import.meta.env || {};

const readNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const CONFIG = {
  minPixAmount: readNumber(env.VITE_MIN_PIX_AMOUNT, 97),
  minOcrConfidence: readNumber(env.VITE_MIN_OCR_CONFIDENCE, 55),
  maxUploadBytes: readNumber(env.VITE_MAX_UPLOAD_BYTES, 4 * 1024 * 1024),
  ocrTimeoutMs: readNumber(env.VITE_OCR_TIMEOUT_MS, 30000),
  whatsappUrl: String(env.VITE_WHATSAPP_URL || '').trim(),
  metaPixelId: String(env.VITE_META_PIXEL_ID || '').trim(),
  ga4Id: String(env.VITE_GA4_ID || '').trim(),
};

export const SUPPORTED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const SUPPORTED_FILE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
