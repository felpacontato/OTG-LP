export function initTracking({ metaPixelId, ga4Id }) {
  if (metaPixelId && !window.fbq) {
    window.fbq = (...args) => {
      window.fbq.queue = window.fbq.queue || [];
      window.fbq.queue.push(args);
    };
    window.fbq('init', metaPixelId);
    window.fbq('track', 'PageView');
  }

  if (ga4Id && !window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args) => window.dataLayer.push(args);
    window.gtag('js', new Date());
    window.gtag('config', ga4Id);
  }
}

export function trackEvent(name, payload = {}) {
  window.fbq?.('trackCustom', name, payload);
  window.gtag?.('event', name, payload);

  if (!window.fbq && !window.gtag) {
    console.info('[tracking:debug]', name, payload);
  }
}
