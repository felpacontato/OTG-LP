import test from 'node:test';
import assert from 'node:assert/strict';

async function loadTracking() {
  return import(`../src/tracking.js?test=${crypto.randomUUID()}`);
}

function installBrowserMocks({ storage = createStorage() } = {}) {
  const fbqCalls = [];
  const gtagCalls = [];
  globalThis.window = {
    location: { href: 'https://example.test/' },
    sessionStorage: storage,
    fbq: (...args) => fbqCalls.push(args),
    gtag: (...args) => gtagCalls.push(args),
  };
  globalThis.document = {
    title: 'OTG test',
    getElementById: () => null,
    createElement: () => ({}),
    head: { appendChild: () => undefined },
  };
  return { fbqCalls, gtagCalls };
}

function createStorage() {
  const map = new Map();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
    removeItem: (key) => map.delete(key),
    key: (index) => [...map.keys()][index],
    get length() {
      return map.size;
    },
  };
}

test('PageView fires once during the same document load', async () => {
  const { trackPageView } = await loadTracking();
  const { fbqCalls, gtagCalls } = installBrowserMocks();

  assert.equal(trackPageView(), true);
  assert.equal(trackPageView(), false);
  assert.equal(fbqCalls.filter((call) => call[1] === 'PageView').length, 1);
  assert.equal(gtagCalls.filter((call) => call[1] === 'page_view').length, 1);
});

test('a fresh document load allows another PageView', async () => {
  const first = await loadTracking();
  const firstMocks = installBrowserMocks();
  first.trackPageView();

  const second = await loadTracking();
  const secondMocks = installBrowserMocks();
  assert.equal(second.trackPageView(), true);
  assert.equal(firstMocks.gtagCalls.filter((call) => call[1] === 'page_view').length, 1);
  assert.equal(secondMocks.gtagCalls.filter((call) => call[1] === 'page_view').length, 1);
});

test('begin_checkout fires once', async () => {
  const { trackBeginCheckout } = await loadTracking();
  const { fbqCalls, gtagCalls } = installBrowserMocks();

  assert.equal(trackBeginCheckout(), true);
  assert.equal(trackBeginCheckout(), false);
  assert.equal(fbqCalls.filter((call) => call[1] === 'InitiateCheckout').length, 1);
  assert.equal(gtagCalls.filter((call) => call[1] === 'begin_checkout').length, 1);
});

test('Purchase validates payload and deduplicates by validationId', async () => {
  const { trackPurchase } = await loadTracking();
  const { fbqCalls, gtagCalls } = installBrowserMocks();

  assert.equal(trackPurchase({ validationId: '', amount: 97, currency: 'BRL' }), false);
  assert.equal(trackPurchase({ validationId: 'PIX-A', amount: Number.NaN, currency: 'BRL' }), false);
  assert.equal(trackPurchase({ validationId: 'PIX-A', amount: 97, currency: 'USD' }), false);
  assert.equal(trackPurchase({ validationId: 'PIX-A', amount: 97, currency: 'BRL' }), true);
  assert.equal(trackPurchase({ validationId: 'PIX-A', amount: 97, currency: 'BRL' }), false);
  assert.equal(trackPurchase({ validationId: 'PIX-B', amount: 120, currency: 'BRL' }), true);

  const purchases = fbqCalls.filter((call) => call[1] === 'Purchase');
  assert.equal(purchases.length, 2);
  assert.equal(purchases[0][2].value, 97);
  assert.equal(purchases[0][2].currency, 'BRL');
  assert.equal(gtagCalls.find((call) => call[1] === 'purchase')[2].transaction_id, 'PIX-A');
});

test('deduplication works when sessionStorage is blocked', async () => {
  const { trackBeginCheckout, trackPurchase } = await loadTracking();
  const blockedStorage = {
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
  };
  const { fbqCalls } = installBrowserMocks({ storage: blockedStorage });

  assert.equal(trackBeginCheckout(), true);
  assert.equal(trackBeginCheckout(), false);
  assert.equal(trackPurchase({ validationId: 'PIX-C', amount: 97, currency: 'BRL' }), true);
  assert.equal(trackPurchase({ validationId: 'PIX-C', amount: 97, currency: 'BRL' }), false);
  assert.equal(fbqCalls.filter((call) => call[1] === 'InitiateCheckout').length, 1);
  assert.equal(fbqCalls.filter((call) => call[1] === 'Purchase').length, 1);
});
