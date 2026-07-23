import test from 'node:test';
import assert from 'node:assert/strict';
import { extractPixAmount, parseBrazilianAmount, validatePixText } from '../src/pixRules.js';
import { detectImageType, validateSelectedFile } from '../src/fileValidation.js';

const receipt = (value, extra = '') => `
  Comprovante de transferência Pix
  Nubank
  Valor do Pix: R$ ${value}
  Pagamento realizado com sucesso
  ${extra}
`;

test('parses Brazilian money', () => {
  assert.equal(parseBrazilianAmount('1.234,56'), 1234.56);
  assert.equal(parseBrazilianAmount('97,00'), 97);
});

test('approves Pix at the minimum', () => {
  const result = validatePixText(receipt('97,00'), 97, 92, 55);
  assert.equal(result.status, 'approved');
  assert.equal(result.amount, 97);
  assert.equal(result.currency, 'BRL');
});

test('rejects Pix below the minimum', () => {
  const result = validatePixText(receipt('96,99'), 97, 92, 55);
  assert.equal(result.status, 'below_minimum');
});

test('does not choose a high account balance over the Pix value', () => {
  const result = validatePixText(receipt('10,00', 'Saldo disponível: R$ 5.000,00'), 97, 92, 55);
  assert.equal(result.amount, 10);
  assert.equal(result.status, 'below_minimum');
});

test('marks competing equally plausible amounts as ambiguous', () => {
  const analysis = extractPixAmount('Pix realizado. Valor: R$ 97,00. Total pago: R$ 120,00.');
  assert.equal(analysis.ambiguous, true);
});

test('rejects text without Pix evidence', () => {
  const result = validatePixText('Nota fiscal. Valor R$ 500,00. Nubank.', 97, 95, 55);
  assert.equal(result.status, 'unrecognized');
});

test('requires explicit BRL evidence', () => {
  const result = validatePixText('Comprovante Pix Nubank valor 97,00', 97, 95, 55);
  assert.equal(result.currency, null);
  assert.equal(result.status, 'unrecognized');
});

test('validates file metadata', () => {
  assert.equal(validateSelectedFile({ name: 'pix.png', type: 'image/png', size: 100 }, 1000).valid, true);
  assert.equal(validateSelectedFile({ name: 'pix.png', type: 'image/png', size: 2000 }, 1000).code, 'too_large');
  assert.equal(validateSelectedFile({ name: 'pix.pdf', type: 'application/pdf', size: 100 }, 1000).code, 'unsupported_type');
});

test('detects supported image signatures', () => {
  assert.equal(detectImageType(Uint8Array.from([0xff, 0xd8, 0xff, 0x00])), 'image/jpeg');
  assert.equal(detectImageType(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'image/png');
  assert.equal(
    detectImageType(Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])),
    'image/webp',
  );
});
