const OFFER = {
  item_id: 'grupo-vip-bet',
  item_name: 'Grupo VIP de Dicas em Bet',
};

const SESSION_PREFIX = 'otg_tracking:';

export function initTracking({ metaPixelId, ga4Id }) {
  if (metaPixelId) initializeMetaPixel(metaPixelId);
  if (ga4Id) initializeGa4(ga4Id);
}

export function trackPageView() {
  trackOnce('page_view', () => {
    window.fbq?.('track', 'PageView');
    window.gtag?.('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
    });
    debug('page_view');
  });
}

export function trackBeginCheckout() {
  trackOnce('begin_checkout', () => {
    window.fbq?.('track', 'InitiateCheckout', {
      content_name: OFFER.item_name,
      content_category: 'grupo_vip',
      currency: 'BRL',
    });
    window.gtag?.('event', 'begin_checkout', {
      currency: 'BRL',
      items: [OFFER],
    });
    debug('begin_checkout');
  });
}

export function trackPurchase({ validationId, amount, currency }) {
  if (!validationId || !Number.isFinite(amount) || currency !== 'BRL') return;
  trackOnce(`purchase:${validationId}`, () => {
    window.fbq?.('track', 'Purchase', {
      value: amount,
      currency,
      content_name: OFFER.item_name,
      content_category: 'grupo_vip',
      payment_method: 'pix',
    });
    window.gtag?.('event', 'purchase', {
      transaction_id: validationId,
      value: amount,
      currency,
      items: [{ ...OFFER, price: amount, quantity: 1 }],
    });
    debug('purchase', { validationId, amount, currency });
  });
}

export function resetTrackingForTests() {
  if (typeof sessionStorage === 'undefined') return;
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith(SESSION_PREFIX))
    .forEach((key) => sessionStorage.removeItem(key));
}

function initializeMetaPixel(pixelId) {
  if (window.__otgMetaPixelId === pixelId) return;

  if (!window.fbq) {
    const fbq = function (...args) {
      fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = fbq;
  }

  if (!document.getElementById('meta-pixel-script')) {
    const script = document.createElement('script');
    script.id = 'meta-pixel-script';
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }

  window.fbq('init', pixelId);
  window.__otgMetaPixelId = pixelId;
}

function initializeGa4(measurementId) {
  if (window.__otgGa4Id === measurementId) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function (...args) {
    window.dataLayer.push(args);
  };

  if (!document.getElementById('ga4-script')) {
    const script = document.createElement('script');
    script.id = 'ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });
  window.__otgGa4Id = measurementId;
}

function trackOnce(key, callback) {
  const storageKey = `${SESSION_PREFIX}${key}`;
  if (safeSessionGet(storageKey)) return false;
  safeSessionSet(storageKey, '1');
  callback();
  return true;
}

function safeSessionGet(key) {
  try {
    return window.sessionStorage?.getItem(key);
  } catch {
    return null;
  }
}

function safeSessionSet(key, value) {
  try {
    window.sessionStorage?.setItem(key, value);
  } catch {
    // Browsers can block storage. In that case the event is still sent once per mounted flow.
  }
}

function debug(name, payload = {}) {
  if (!window.fbq && !window.gtag) console.info('[tracking:debug]', name, payload);
}
