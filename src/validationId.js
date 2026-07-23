export function createValidationId() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `PIX-${token}`;
}

export function buildWhatsAppUrl(baseUrl, { validationId, amount }) {
  if (!baseUrl) return '';
  const url = new URL(baseUrl);
  const message = [
    'Olá! Enviei meu comprovante para solicitar acesso ao Grupo VIP.',
    '',
    `Código de validação: ${validationId}`,
    `Valor identificado: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}`,
  ].join('\n');

  url.searchParams.set('text', message);
  return url.toString();
}
