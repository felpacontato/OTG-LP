import Tesseract from 'tesseract.js';

const BANK_PATTERNS = [
  'nubank',
  'itau',
  'itaú',
  'bradesco',
  'santander',
  'caixa',
  'banco do brasil',
  'inter',
  'c6',
  'mercado pago',
  'picpay',
  'stone',
  'pagseguro',
];

const PIX_MARKERS = ['pix', 'comprovante', 'transferencia', 'transferência', 'pagamento'];

export async function runReceiptOcr(file, onProgress) {
  const result = await Tesseract.recognize(file, 'por+eng', {
    logger: (message) => {
      if (message.status === 'recognizing text') {
        onProgress?.(Math.round(message.progress * 100));
      }
    },
  });

  return {
    text: result.data.text,
    confidence: Math.round(result.data.confidence),
  };
}

export function validatePixText(text, minAmount) {
  const normalized = normalize(text);
  const amount = extractAmount(normalized);
  const bank = BANK_PATTERNS.find((pattern) => normalized.includes(pattern));
  const hasPixMarker = PIX_MARKERS.some((marker) => normalized.includes(marker));
  const validAmount = amount !== null && amount >= minAmount;
  const score = buildConfidenceScore({ amount, bank, hasPixMarker, validAmount });

  return {
    amount,
    bank: bank ? toTitle(bank) : null,
    hasPixMarker,
    validAmount,
    approved: hasPixMarker && validAmount && score >= 65,
    score,
    reasons: buildReasons({ amount, bank, hasPixMarker, validAmount, minAmount }),
  };
}

function normalize(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function extractAmount(text) {
  const candidates = [...text.matchAll(/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2})/g)]
    .map((match) => Number(match[1].replace(/\./g, '').replace(',', '.')))
    .filter((value) => Number.isFinite(value));

  if (!candidates.length) return null;
  return Math.max(...candidates);
}

function buildConfidenceScore({ amount, bank, hasPixMarker, validAmount }) {
  let score = 0;
  if (hasPixMarker) score += 35;
  if (amount !== null) score += 25;
  if (validAmount) score += 25;
  if (bank) score += 15;
  return Math.min(score, 100);
}

function buildReasons({ amount, bank, hasPixMarker, validAmount, minAmount }) {
  const reasons = [];
  reasons.push(hasPixMarker ? 'Termos Pix encontrados no comprovante.' : 'Não encontrei termos claros de Pix.');
  reasons.push(amount !== null ? `Valor identificado: R$ ${amount.toFixed(2)}.` : 'Valor não identificado.');
  reasons.push(validAmount ? `Valor mínimo de R$ ${minAmount.toFixed(2)} atingido.` : `Valor abaixo de R$ ${minAmount.toFixed(2)} ou ausente.`);
  reasons.push(bank ? `Banco provável: ${toTitle(bank)}.` : 'Banco não identificado com confiança.');
  return reasons;
}

function toTitle(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
