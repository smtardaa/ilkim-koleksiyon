/**
 * Ortak yanıt başlıkları:
 * - İndeksleme kapalıyken (önizleme/staging) her yanıta `X-Robots-Tag: noindex`.
 * - Önbellek politikası (CDN önündeyken geçerlidir; ayrıntı README → “Güncelleme ve önbellek”).
 * - Temel güvenlik başlıkları.
 */
import { defineMiddleware } from 'astro:middleware';
import { indexingEnabled } from './config/site.js';

const PRIVATE_PATHS = [/^\/api\//, /^\/arama/];

/**
 * Eski (satış sitesi dönemi) kategori adresleri → yeni katalog kategorileri.
 * Yalnızca gerçek bir karşılığı olanlar yönlendirilir; karşılığı olmayanlar
 * (ör. yabancı paraların eski ülke sayfaları, fantazi paralar) 404 döner.
 */
const LEGACY_CATEGORY_REDIRECTS = [
  [/^\/kategori\/tc-hatira-paralari(\/.*)?$/, '/kategori/tc-hatira-paralar'],
  [/^\/kategori\/tc-kagit-paralar\/.+$/, '/kategori/tc-kagit-paralar'],
  [/^\/kategori\/tc-madeni-paralar\/.+$/, '/kategori/tc-madeni-paralar'],
  [/^\/kategori\/osmanli-paralari\/.+$/, '/kategori/osmanli-paralari'],
  [/^\/kategori\/madalya-ve-objeler(\/.*)?$/, '/kategori/madalya-madalyon'],
  [/^\/kategori\/antika-ve-diger(\/antika)?$/, '/kategori/vintage-objeler'],
  [/^\/kategori\/pul-ve-koleksiyon-malzemeleri\/pul(\/.*)?$/, '/kategori/efemera'],
  [/^\/kategori\/pul-ve-koleksiyon-malzemeleri\/koleksiyon-malzemeleri(\/.*)?$/, '/kategori/numismatik-malzeme'],
  // İkiye bölünen gruplarda tek bir hedef yok: kategori haritasına yönlendirilir.
  [/^\/kategori\/(pul-ve-koleksiyon-malzemeleri|yabanci-paralar)$/, '/kategori'],
];

export const onRequest = defineMiddleware(async (ctx, next) => {
  const legacy = LEGACY_CATEGORY_REDIRECTS.find(([re]) => re.test(ctx.url.pathname));
  if (legacy) return ctx.redirect(legacy[1], 301);
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
      // Yerel veri dağıtımla değişir; yönetim paneli geldiğinde ürün güncellemeleri
      // hızlı yansısın diye CDN süresi kısa tutulur.
      h.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    }
  }
  return res;
});
