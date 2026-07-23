const ALLOWED_WHATSAPP_HOSTS = new Set(['wa.me', 'api.whatsapp.com', 'www.whatsapp.com']);

export function createValidationId() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `PIX-${token}`;
}

export function buildWhatsAppUrl(baseUrl, { validationId, amount }) {
  if (!baseUrl) return '';

  const url = parseWhatsAppUrl(baseUrl);
  if (!url || !validationId || !Number.isFinite(amount)) return '';

  const message = [
    'Ola! Enviei meu comprovante para solicitar acesso ao Grupo VIP.',
    '',
    `Codigo de validacao: ${validationId}`,
    `Valor identificado: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}`,
  ].join('\n');

  url.searchParams.set('text', message);
  return url.toString();
}

function parseWhatsAppUrl(baseUrl) {
  try {
    const url = new URL(baseUrl);
    if (url.protocol !== 'https:') return null;
    if (!ALLOWED_WHATSAPP_HOSTS.has(url.hostname.toLowerCase())) return null;
    return url;
  } catch {
    return null;
  }
}
