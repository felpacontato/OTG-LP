import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWhatsAppUrl } from '../src/validationId.js';

test('empty WhatsApp URL returns empty string', () => {
  assert.equal(buildWhatsAppUrl('', { validationId: 'PIX-ABCD1234', amount: 97 }), '');
});

test('invalid WhatsApp URL does not throw and returns empty string', () => {
  assert.equal(buildWhatsAppUrl('not a url', { validationId: 'PIX-ABCD1234', amount: 97 }), '');
});

test('disallowed host is rejected', () => {
  assert.equal(buildWhatsAppUrl('https://example.com/send', { validationId: 'PIX-ABCD1234', amount: 97 }), '');
});

test('non-HTTPS WhatsApp URL is rejected', () => {
  assert.equal(buildWhatsAppUrl('http://wa.me/5511999999999', { validationId: 'PIX-ABCD1234', amount: 97 }), '');
});

test('WhatsApp message includes validation code and formatted amount', () => {
  const built = buildWhatsAppUrl('https://wa.me/5511999999999', {
    validationId: 'PIX-ABCD1234',
    amount: 97,
  });
  const url = new URL(built);
  const message = url.searchParams.get('text');

  assert.equal(url.hostname, 'wa.me');
  assert.match(message, /PIX-ABCD1234/);
  assert.match(message, /R\$\s?97,00/);
});

test('preexisting query params are preserved when adding message', () => {
  const built = buildWhatsAppUrl('https://api.whatsapp.com/send?phone=5511999999999&source=test', {
    validationId: 'PIX-ABCD1234',
    amount: 120.5,
  });
  const url = new URL(built);

  assert.equal(url.hostname, 'api.whatsapp.com');
  assert.equal(url.searchParams.get('phone'), '5511999999999');
  assert.equal(url.searchParams.get('source'), 'test');
  assert.match(url.searchParams.get('text'), /R\$\s?120,50/);
});
