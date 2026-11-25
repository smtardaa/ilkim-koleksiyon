/** GET /api/health — veri kaynağı kontrolü (izleme için). Gizli bilgi döndürmez. */
import { getProvider } from '../../lib/catalog.js';
import { dataSource, indexingEnabled } from '../../config/site.js';

export const prerender = false;

export async function GET() {
  try {
    const provider = await getProvider();
    const h = await provider.health();
    return Response.json({ ok: true, source: dataSource, indexing: indexingEnabled, ...h }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return Response.json({ ok: false, source: dataSource, error: err?.kind ?? 'error', message: err?.message ?? 'Bağlantı hatası' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
