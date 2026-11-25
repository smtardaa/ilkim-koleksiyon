/**
 * Ortak istek işleme:
 * - Panelden kaydedilen ayar/kategori değişikliklerini siteye uygular (src/lib/runtime.js).
 * - /yonetim altını giriş yapmamış ziyaretçiye kapatır.
 * - İndeksleme kapalıyken (önizleme/staging) her yanıta `X-Robots-Tag: noindex`.
 * - Önbellek politikası ve temel güvenlik başlıkları.
 */
import { defineMiddleware } from 'astro:middleware';
import { indexingEnabled } from './config/site.js';
import { syncRuntime } from './lib/runtime.js';
import { admin, adminConfigured } from './lib/admin/config.js';
import { readSession, csrfToken, COOKIE_NAME } from './lib/admin/auth.js';

const PRIVATE_PATHS = [/^\/api\//, /^\/arama/, /^\/yonetim(\/|$)/];
const ADMIN_PATH = /^\/yonetim(\/|$)/;
const ADMIN_PUBLIC = new Set(['/yonetim/giris']);

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
  const path = ctx.url.pathname;
  const legacy = LEGACY_CATEGORY_REDIRECTS.find(([re]) => re.test(path));
  if (legacy) return ctx.redirect(legacy[1], 301);

  const isAdmin = ADMIN_PATH.test(path);
  if (isAdmin) {
    const session = adminConfigured ? readSession(admin.secret, ctx.cookies.get(COOKIE_NAME)?.value) : null;
    if (session) ctx.locals.admin = { username: session.username, sid: session.sid, csrf: csrfToken(admin.secret, session.sid) };
    else if (!ADMIN_PUBLIC.has(path)) {
      if (ctx.request.method === 'GET') {
        const back = path === '/yonetim' ? '' : `?sonra=${encodeURIComponent(path)}`;
        return ctx.redirect(`/yonetim/giris${back}`, 303);
      }
      return new Response(JSON.stringify({ ok: false, error: 'Oturum süresi doldu. Lütfen yeniden giriş yapın.' }), {
        status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }
  }

  // Ayar/kategori değişikliklerini uygula. Depo okunamazsa sayfalar kendi hata ekranını gösterir.
  try { await syncRuntime(); } catch (e) { console.error('[runtime]', e?.message ?? e); }

  const res = await next();
  const h = res.headers;

  if (isAdmin) h.set('X-Robots-Tag', 'noindex, nofollow');
  else if (!indexingEnabled) h.set('X-Robots-Tag', 'noindex, follow');
  else if (PRIVATE_PATHS.some((r) => r.test(path))) h.set('X-Robots-Tag', 'noindex, follow');

  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('X-Frame-Options', isAdmin ? 'DENY' : 'SAMEORIGIN');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  const type = h.get('Content-Type') ?? '';
  if (isAdmin) {
    h.set('Cache-Control', 'no-store');
  } else if (!h.has('Cache-Control')) {
    if (PRIVATE_PATHS.some((r) => r.test(path)) || res.status >= 400) {
      h.set('Cache-Control', 'no-store');
    } else if (type.includes('text/html') || type.includes('xml')) {
      // Panelden yapılan değişiklik bir sonraki açılışta görünsün: tarayıcı ve CDN her seferinde sunucuya sorar
      // (eski sayfayı “bayat ama hızlı” gösterme yok). Sayfalar sunucuda hızlı üretildiği için yük düşüktür.
      h.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
  return res;
});
