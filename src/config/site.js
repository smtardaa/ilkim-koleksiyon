/**
 * Site çalışma ayarları. Ortam değişkenleri `astro.config.mjs` içindeki
 * şemadan (astro:env) okunur; burada türetilmiş kararlar tek yerde toplanır.
 */
import {
  SITE_URL,
  STORE_MODE,
  SITE_INDEXING,
  SOLD_PRODUCTS_VISIBILITY,
} from 'astro:env/server';

export const siteUrl = SITE_URL.replace(/\/+$/, '');
export const storeMode = STORE_MODE; // 'demo' | 'shopify'
export const isDemo = storeMode === 'demo';

/**
 * İndeksleme yalnızca ÜÇ koşul birlikte sağlanınca açılır:
 *  1. SITE_INDEXING=on (yayına geçiş ayarı)
 *  2. STORE_MODE=shopify (gerçek envanter)
 *  3. SITE_URL gerçek bir https alan adı (localhost/önizleme değil)
 * Aksi halde her sayfa `noindex` döner (meta + X-Robots-Tag).
 */
const isRealDomain = /^https:\/\//.test(siteUrl)
  && !/localhost|127\.0\.0\.1|\.local\b|staging|preview|vercel\.app|netlify\.app|pages\.dev/i.test(siteUrl);
export const indexingEnabled = SITE_INDEXING === 'on' && storeMode === 'shopify' && isRealDomain;
export const indexingBlockReason = indexingEnabled
  ? null
  : [
      SITE_INDEXING !== 'on' && 'SITE_INDEXING=off',
      storeMode !== 'shopify' && 'demo envanter',
      !isRealDomain && 'gerçek alan adı tanımlı değil',
    ].filter(Boolean).join(', ');

/**
 * Satılmış ürünlerin görünürlüğü (tek ayar):
 *  - 'visible'  : listelerde “Satıldı” etiketiyle görünür, ürün sayfası açık, satın alma kapalı.
 *  - 'unlisted' : listelerden ve aramadan çıkar, ürün sayfası doğrudan bağlantıyla açık kalır.
 *  - 'hidden'   : ürün sayfası da 404 döner (önerilmez; SEO değeri kaybolur).
 */
export const soldVisibility = SOLD_PRODUCTS_VISIBILITY;

export const site = {
  name: 'İlkim Koleksiyon',
  shortName: 'İlkim',
  locale: 'tr_TR',
  lang: 'tr',
  currency: 'TRY',
  defaultDescription:
    'İlkim Koleksiyon — T.C. ve Osmanlı kâğıt paraları, madeni paralar, hatıra paraları, yabancı paralar ve koleksiyon malzemeleri.',
  defaultOgImage: '/brand/og-default.jpg',
  demoNotice: 'Demo — ürünler ve fiyatlar örnek envanterden alınmıştır.',
  pageSize: 24,
};

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//.test(path)) return path;
  return siteUrl + (path.startsWith('/') ? path : `/${path}`);
}
