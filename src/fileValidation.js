import { SUPPORTED_FILE_EXTENSIONS, SUPPORTED_FILE_TYPES } from './config.js';

const SIGNATURES = {
  'image/jpeg': (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  'image/png': (bytes) =>
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a,
  'image/webp': (bytes) =>
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50,
};

export function validateSelectedFile(file, maxBytes) {
  if (!file) return { valid: false, code: 'missing', message: 'Selecione uma imagem do comprovante.' };
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { valid: false, code: 'empty', message: 'O arquivo está vazio ou não pôde ser lido.' };
  }
  if (file.size > maxBytes) {
    return {
      valid: false,
      code: 'too_large',
      message: `A imagem deve ter no máximo ${formatBytes(maxBytes)}.`,
    };
  }
  if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
    return { valid: false, code: 'unsupported_type', message: 'Envie uma imagem PNG, JPG ou WebP.' };
  }

  const extension = getExtension(file.name || '');
  if (!SUPPORTED_FILE_EXTENSIONS.includes(extension)) {
    return { valid: false, code: 'unsupported_extension', message: 'A extensão do arquivo não é aceita.' };
  }

  return { valid: true };
}

export async function validateFileSignature(file) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const detectedType = detectImageType(bytes);

  if (!detectedType || detectedType !== file.type) {
    return {
      valid: false,
      code: 'signature_mismatch',
      message: 'O conteúdo do arquivo não corresponde ao formato informado.',
    };
  }

  return { valid: true, detectedType };
}

export function detectImageType(bytes) {
  for (const [type, matches] of Object.entries(SIGNATURES)) {
    if (matches(bytes)) return type;
  }
  return null;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function getExtension(filename) {
  const dot = filename.lastIndexOf('.');
  return dot >= 0 ? filename.slice(dot).toLowerCase() : '';
}
