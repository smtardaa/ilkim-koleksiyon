/**
 * POST /api/webhooks/shopify — Shopify değişiklik bildirimi.
 *
 * Önerilen konular: products/create, products/update, products/delete,
 * collections/create, collections/update, collections/delete, inventory_levels/update.
 *
 * Doğrulama: X-Shopify-Hmac-Sha256 başlığı = base64(HMAC-SHA256(ham gövde, SHOPIFY_WEBHOOK_SECRET)).
 * Doğrulanmayan istek 401 alır. Doğrulanan istekte sunucu belleğindeki katalog önbelleği boşaltılır;
 * bir sonraki istek Shopify'dan güncel veriyi çeker.
 * Not: Çok örnekli/serverless ortamda yalnızca isteği alan örneğin önbelleği boşalır; diğer örnekler en geç
 * CATALOG_CACHE_TTL_SECONDS sonra yenilenir. CDN önbelleği kullanılıyorsa CDN purge ayrıca bağlanmalıdır (README).
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { SHOPIFY_WEBHOOK_SECRET } from 'astro:env/server';
import { invalidate } from '../../../lib/cache.js';

export const prerender = false;

export async function POST({ request }) {
  if (!SHOPIFY_WEBHOOK_SECRET) {
    return new Response('Webhook doğrulama anahtarı tanımlı değil.', { status: 503 });
  }
  const raw = Buffer.from(await request.arrayBuffer());
  const given = request.headers.get('x-shopify-hmac-sha256') ?? '';
  const expected = createHmac('sha256', SHOPIFY_WEBHOOK_SECRET).update(raw).digest('base64');
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return new Response('Geçersiz imza.', { status: 401 });
  }
  const topic = request.headers.get('x-shopify-topic') ?? '';
  invalidate('shopify:');
  console.info(`[webhook] ${topic} alındı; katalog önbelleği boşaltıldı.`);
  return new Response(null, { status: 204 });
}
