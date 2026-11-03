/** GET /api/health — veri sağlayıcısı bağlantı kontrolü (izleme için). Gizli bilgi döndürmez. */
import { getProvider } from '../../lib/catalog.js';
import { storeMode, indexingEnabled } from '../../config/site.js';

export const prerender = false;

export async function GET() {
  try {
    const provider = await getProvider();
    const h = await provider.health();
    return Response.json({ ok: true, mode: storeMode, indexing: indexingEnabled, ...h }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return Response.json({ ok: false, mode: storeMode, error: err?.kind ?? 'error', message: err?.message ?? 'Bağlantı hatası' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
