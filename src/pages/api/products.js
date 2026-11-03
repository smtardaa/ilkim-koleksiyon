/**
 * GET /api/products?ids=a,b,c — favoriler sayfası için ürün özetleri (güncel durumla).
 */
import { loadCatalog, productUrl } from '../../lib/catalog.js';
import { formatMoney, STATUS_LABEL } from '../../lib/format.js';

export const prerender = false;

export async function GET({ url }) {
  const ids = (url.searchParams.get('ids') ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 200);
  try {
    const catalog = await loadCatalog();
    const byId = new Map(catalog.products.map((p) => [p.id, p]));
    const items = ids.map((id) => byId.get(id)).filter(Boolean).map((p) => ({
      id: p.id,
      variantId: p.variantId,
      title: p.title,
      url: productUrl(p),
      priceText: formatMoney(p.price),
      status: p.availability.status,
      statusText: STATUS_LABEL[p.availability.status],
      image: p.images[0]?.srcSmall ?? p.images[0]?.src ?? null,
      meta: [p.specs.country, p.specs.yearText].filter(Boolean).join(' · '),
    }));
    const missing = ids.filter((id) => !byId.has(id));
    return json({ items, missing });
  } catch (err) {
    console.error('[favoriler] hata', err?.message ?? err);
    return json({ error: 'Ürün bilgileri alınamadı.' }, 503);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}
