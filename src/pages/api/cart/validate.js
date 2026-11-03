/**
 * POST /api/cart/validate — sepet satırlarını güncel fiyat ve stokla doğrular.
 * Gövde: { lines: [{ variantId, quantity }] }
 */
import { validateLines } from '../../../lib/cart-server.js';

export const prerender = false;

export async function POST({ request }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Geçersiz istek gövdesi.' }, 400); }
  try {
    return json(await validateLines(body?.lines ?? []));
  } catch (err) {
    console.error('[sepet] doğrulama hatası', err?.message ?? err);
    return json({ error: 'Fiyat ve stok şu anda doğrulanamadı.' }, 503);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}
