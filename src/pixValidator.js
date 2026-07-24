import Tesseract from 'tesseract.js';

export { extractPixAmount, formatCurrency, parseBrazilianAmount, validatePixText } from './pixRules.js';

export async function runReceiptOcr(file, onProgress, options = {}) {
  const { timeoutMs = 30000, signal } = options;
  let worker;
  let timeoutId;
  let abortHandler;

  try {
    worker = await Tesseract.createWorker('por+eng', 1, {
      logger: (message) => {
        if (message.status === 'recognizing text') {
          onProgress?.(Math.round(message.progress * 100));
        }
      },
    });

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new OcrError('timeout', 'A leitura demorou mais que o esperado.')), timeoutMs);
    });

    const abortPromise = new Promise((_, reject) => {
      if (!signal) return;
      abortHandler = () => reject(new OcrError('aborted', 'A leitura foi cancelada.'));
      if (signal.aborted) abortHandler();
      else signal.addEventListener('abort', abortHandler, { once: true });
    });

    const result = await Promise.race([worker.recognize(file), timeoutPromise, abortPromise]);
    return {
      text: result.data.text || '',
      confidence: clamp(Math.round(result.data.confidence || 0), 0, 100),
    };
  } finally {
    clearTimeout(timeoutId);
    if (signal && abortHandler) signal.removeEventListener('abort', abortHandler);
    await worker?.terminate().catch(() => undefined);
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export class OcrError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'OcrError';
    this.code = code;
  }
}
