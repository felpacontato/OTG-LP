export const CONFIG = {
  minPixAmount: Number(import.meta.env.VITE_MIN_PIX_AMOUNT || 97),
  whatsappUrl:
    import.meta.env.VITE_WHATSAPP_URL ||
    'https://wa.me/5500000000000?text=Pix%20validado%20-%20quero%20entrar%20no%20Grupo%20VIP',
  metaPixelId: import.meta.env.VITE_META_PIXEL_ID || '',
  ga4Id: import.meta.env.VITE_GA4_ID || '',
};

export const SUPPORTED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
