const BANK_PATTERNS = [
  ['Nubank', /\bnu\s?bank\b|\bnu pagamentos\b/i],
  ['Itaú', /\bitau\b|\bitaú\b/i],
  ['Bradesco', /\bbradesco\b/i],
  ['Santander', /\bsantander\b/i],
  ['Caixa', /\bcaixa(?: economica| econômica)?\b/i],
  ['Banco do Brasil', /\bbanco do brasil\b|\bbb\b/i],
  ['Inter', /\bbanco inter\b|\binter\b/i],
  ['C6 Bank', /\bc6(?: bank)?\b/i],
  ['Mercado Pago', /\bmercado pago\b/i],
  ['PicPay', /\bpicpay\b/i],
  ['Stone', /\bstone\b/i],
  ['PagBank', /\bpagbank\b|\bpagseguro\b/i],
  ['Neon', /\bbanco neon\b|\bneon\b/i],
  ['BTG Pactual', /\bbtg(?: pactual)?\b/i],
];

const PIX_MARKERS = [
  /\bpix\b/i,
  /comprovante\s+(?:de\s+)?(?:pix|transferencia|transferência|pagamento)/i,
  /transferencia\s+(?:via\s+)?pix/i,
  /transferência\s+(?:via\s+)?pix/i,
  /pagamento\s+(?:via\s+)?pix/i,
];

const POSITIVE_AMOUNT_TERMS = [
  'valor do pix',
  'valor da transferencia',
  'valor da transferência',
  'valor transferido',
  'valor enviado',
  'valor pago',
  'pagamento realizado',
  'total enviado',
  'total pago',
  'valor',
  'total',
];

const NEGATIVE_AMOUNT_TERMS = [
  'saldo',
  'saldo disponivel',
  'saldo disponível',
  'limite',
  'tarifa',
  'taxa',
  'juros',
  'cashback',
  'agendamento',
  'valor anterior',
];

export function validatePixText(text, minAmount, ocrConfidence = 0, minOcrConfidence = 55) {
  const normalized = normalizeText(text);
  const institution = findInstitution(normalized);
  const hasPixMarker = PIX_MARKERS.some((pattern) => pattern.test(normalized));
  const currency = detectCurrency(normalized);
  const amountAnalysis = extractPixAmount(normalized);
  const amount = amountAnalysis.amount;
  const readable = normalized.replace(/\s/g, '').length >= 18 && ocrConfidence >= 20;
  const validAmount = amount !== null && amount >= minAmount;
  const ruleScore = buildRuleScore({ hasPixMarker, institution, currency, amount, amountAnalysis });
  const effectiveConfidence = Math.round(ocrConfidence * 0.65 + ruleScore * 0.35);

  let status = 'unrecognized';
  if (!readable || !hasPixMarker || amount === null || currency !== 'BRL') {
    status = 'unrecognized';
  } else if (amountAnalysis.ambiguous || effectiveConfidence < minOcrConfidence) {
    status = 'low_confidence';
  } else if (!validAmount) {
    status = 'below_minimum';
  } else {
    status = 'approved';
  }

  return {
    status,
    approved: status === 'approved',
    institution,
    amount,
    currency,
    ocrConfidence: clamp(Math.round(ocrConfidence), 0, 100),
    ruleScore,
    effectiveConfidence: clamp(effectiveConfidence, 0, 100),
    readable,
    hasPixMarker,
    validAmount,
    ambiguousAmount: amountAnalysis.ambiguous,
    reasons: buildReasons({
      status,
      institution,
      amount,
      currency,
      ocrConfidence,
      effectiveConfidence,
      minAmount,
      amountAnalysis,
    }),
  };
}

export function extractPixAmount(text) {
  const candidates = [];
  const regex = /(?:r\$|brl)?\s*(\d{1,3}(?:\.\d{3})*,\d{2}|\d+[,.]\d{2})/gi;

  for (const match of text.matchAll(regex)) {
    const amount = parseBrazilianAmount(match[1]);
    if (!Number.isFinite(amount) || amount <= 0) continue;

    const start = Math.max(0, match.index - 70);
    const end = Math.min(text.length, match.index + match[0].length + 70);
    const context = text.slice(start, end);
    const lowerContext = context.toLowerCase();
    let contextScore = /r\$|brl/i.test(match[0]) ? 25 : 5;

    for (const term of POSITIVE_AMOUNT_TERMS) {
      if (lowerContext.includes(normalizeText(term))) contextScore += term === 'valor' || term === 'total' ? 8 : 22;
    }
    for (const term of NEGATIVE_AMOUNT_TERMS) {
      if (lowerContext.includes(normalizeText(term))) contextScore -= 35;
    }
    if (/pix/i.test(context)) contextScore += 18;

    candidates.push({ amount, contextScore, context: context.trim(), negativeContext: hasNegativeAmountTerm(lowerContext) });
  }

  if (!candidates.length) return { amount: null, ambiguous: false, candidates: [] };

  const ranked = [...candidates].sort((a, b) => b.contextScore - a.contextScore || a.amount - b.amount);
  const best = ranked[0];
  const second = ranked[1];
  const ambiguous = Boolean(
    second &&
      second.amount !== best.amount &&
      !second.negativeContext &&
      Math.abs(second.contextScore - best.contextScore) <= 10,
  );

  return { amount: best.amount, ambiguous, candidates: ranked };
}

function hasNegativeAmountTerm(context) {
  return NEGATIVE_AMOUNT_TERMS.some((term) => context.includes(normalizeText(term)));
}

export function parseBrazilianAmount(raw) {
  const cleaned = String(raw).replace(/\s/g, '');
  if (cleaned.includes(',')) return Number(cleaned.replace(/\./g, '').replace(',', '.'));
  return Number(cleaned);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function findInstitution(text) {
  return BANK_PATTERNS.find(([, pattern]) => pattern.test(text))?.[0] || null;
}

function detectCurrency(text) {
  return /r\s?\$|\bbrl\b|\breais\b|\breal\b/i.test(text) ? 'BRL' : null;
}

function buildRuleScore({ hasPixMarker, institution, currency, amount, amountAnalysis }) {
  let score = 0;
  if (hasPixMarker) score += 35;
  if (amount !== null) score += 20;
  if (currency === 'BRL') score += 20;
  if (institution) score += 15;
  if (amountAnalysis.candidates[0]?.contextScore >= 35) score += 10;
  if (amountAnalysis.ambiguous) score -= 30;
  return clamp(score, 0, 100);
}

function buildReasons({ status, institution, amount, currency, ocrConfidence, effectiveConfidence, minAmount, amountAnalysis }) {
  const reasons = [];
  reasons.push(institution ? `Instituição provável: ${institution}.` : 'Instituição não identificada.');
  reasons.push(amount !== null ? `Valor identificado: ${formatCurrency(amount)}.` : 'Valor principal não identificado.');
  reasons.push(currency ? `Moeda identificada: ${currency}.` : 'Moeda não identificada com segurança.');
  reasons.push(`Confiança do OCR: ${Math.round(ocrConfidence)}%.`);
  reasons.push(`Confiança combinada: ${effectiveConfidence}%.`);

  if (amountAnalysis.ambiguous) reasons.push('Foram encontrados valores concorrentes; envie um recorte mais claro do comprovante.');
  if (status === 'below_minimum') reasons.push(`O valor mínimo exigido é ${formatCurrency(minAmount)}.`);
  if (status === 'approved') reasons.push('O valor identificado atende ao mínimo da oferta.');
  if (status === 'unrecognized') reasons.push('A imagem não apresentou evidências suficientes de um comprovante Pix legível.');

  return reasons;
}

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
