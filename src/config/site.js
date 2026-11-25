/**
 * Site çalışma ayarları. Ortam değişkenleri `astro.config.mjs` içindeki
 * şemadan (astro:env) okunur; burada türetilmiş kararlar tek yerde toplanır.
 */
import {
  SITE_URL,
  DATA_SOURCE,
  SITE_INDEXING,
  SOLD_PRODUCTS_VISIBILITY,
  DATA_DIR,
  UPLOADS_DIR,
} from 'astro:env/server';

export const siteUrl = SITE_URL.replace(/\/+$/, '');
/** Veri kaynağı: 'local' (DATA_DIR içindeki JSON dosyaları). İleride 'mysql' eklenecek. */
export const dataSource = DATA_SOURCE;
/** Panel verisinin ve yüklenen görsellerin kalıcı klasörleri */
export const dataDir = DATA_DIR;
export const uploadsDir = UPLOADS_DIR;

/**
 * İndeksleme yalnızca İKİ koşul birlikte sağlanınca açılır:
 *  1. SITE_INDEXING=on (yayına geçiş ayarı)
 *  2. SITE_URL gerçek bir https alan adı (localhost/önizleme değil)
 * Aksi halde her sayfa `noindex` döner (meta + X-Robots-Tag).
 */
const isRealDomain = /^https:\/\//.test(siteUrl)
  && !/localhost|127\.0\.0\.1|\.local\b|staging|preview|vercel\.app|netlify\.app|pages\.dev/i.test(siteUrl);
export const indexingEnabled = SITE_INDEXING === 'on' && isRealDomain;
export const indexingBlockReason = indexingEnabled
  ? null
  : [
      SITE_INDEXING !== 'on' && 'SITE_INDEXING=off',
      !isRealDomain && 'gerçek alan adı tanımlı değil',
    ].filter(Boolean).join(', ');

/**
 * Satılmış ürünlerin görünürlüğü (tek ayar):
 *  - 'visible'  : listelerde “Satıldı” etiketiyle görünür, ürün sayfası açık, iletişim düğmesi kapalı.
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
    'İlkim Koleksiyon kataloğu — T.C. ve yabancı madeni ve kâğıt paralar, hatıra paralar, Osmanlı paraları, nümismatik malzeme, gümüş takı, vintage obje, efemera, madalya ve saat.',
  defaultOgImage: '/brand/og-default.jpg',
  pageSize: 24,
};

/**
 * Ziyaretçiye gönderilen bağlantılar için kök adres: SITE_URL gerçek bir https alan adıysa o,
 * değilse isteğin geldiği adres. Böylece canlı ortamda localhost bağlantısı gönderilmez.
 * @param {URL} requestUrl
 */
export function publicOrigin(requestUrl) {
  return isRealDomain ? siteUrl : requestUrl.origin;
}

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//.test(path)) return path;
  return siteUrl + (path.startsWith('/') ? path : `/${path}`);
}
