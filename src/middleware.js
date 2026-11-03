/**
 * Ortak yanıt başlıkları:
 * - İndeksleme kapalıyken (demo/staging) her yanıta `X-Robots-Tag: noindex`.
 * - Önbellek politikası (CDN önündeyken geçerlidir; ayrıntı README → “Güncelleme ve önbellek”).
 * - Temel güvenlik başlıkları.
 */
import { defineMiddleware } from 'astro:middleware';
import { indexingEnabled, storeMode } from './config/site.js';

const PRIVATE_PATHS = [/^\/sepet/, /^\/favoriler/, /^\/api\//, /^\/arama/];

export const onRequest = defineMiddleware(async (ctx, next) => {
  const res = await next();
  const path = ctx.url.pathname;
  const h = res.headers;

  if (!indexingEnabled) h.set('X-Robots-Tag', 'noindex, follow');
  else if (PRIVATE_PATHS.some((r) => r.test(path))) h.set('X-Robots-Tag', 'noindex, follow');

  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('X-Frame-Options', 'SAMEORIGIN');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  const type = h.get('Content-Type') ?? '';
  if (!h.has('Cache-Control')) {
    if (PRIVATE_PATHS.some((r) => r.test(path)) || res.status >= 400) {
      h.set('Cache-Control', 'no-store');
    } else if (type.includes('text/html') || type.includes('xml')) {
      // Shopify modunda CDN 60 sn taze tutar, 5 dk boyunca arka planda yenilerken eskiyi sunar.
      // Demo modunda veri dağıtımla değiştiği için kısa tutulur.
      h.set('Cache-Control', storeMode === 'shopify'
        ? 'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
        : 'public, max-age=0, s-maxage=300');
    }
  }
  return res;
});
