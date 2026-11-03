/**
 * POST /api/checkout — ödeme başlatma.
 * 1) Satırlar sunucuda güncel fiyat/stokla yeniden doğrulanır.
 * 2) Demo modunda ödeme/sipariş OLUŞTURULMAZ; { demo: true } döner.
 * 3) Shopify modunda Storefront Cart API ile sepet oluşturulur, checkoutUrl döner.
 *    Ödeme Shopify Checkout'ta (Shopify'da etkinleştirilen PayTR vb. yöntemle) alınır.
 */
import { validateLines } from '../../lib/cart-server.js';
import { getProvider } from '../../lib/catalog.js';

export const prerender = false;

export async function POST({ request, clientAddress }) {
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, message: 'Geçersiz istek.' }, 400); }
  try {
    const validation = await validateLines(body?.lines ?? []);
    const blocked = validation.lines.filter((l) => !l.ok || l.quantity !== l.requested);
    if (!validation.lines.length) return json({ ok: false, message: 'Sepet boş.' }, 400);
    if (blocked.length) {
      return json({ ok: false, validation, message: 'Sepetteki bazı ürünlerin stok veya adet durumu değişti. Lütfen sepeti kontrol edin.' }, 409);
    }
    const provider = await getProvider();
    let buyerIp;
    try { buyerIp = clientAddress; } catch { buyerIp = undefined; }
    const result = await provider.createCheckout(validation.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })), { buyerIp });
    if (result.demo) return json({ ok: false, demo: true, message: result.message });
    if (!result.ok) return json({ ok: false, message: result.message ?? 'Ödeme başlatılamadı.' }, 422);
    return json({ ok: true, checkoutUrl: result.checkoutUrl, warnings: result.warnings ?? [] });
  } catch (err) {
    console.error('[ödeme] hata', err?.kind ?? '', err?.message ?? err, err?.details ?? '');
    return json({ ok: false, message: 'Ödeme servisine şu anda ulaşılamıyor. Sipariş oluşturulmadı.' }, 503);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}
