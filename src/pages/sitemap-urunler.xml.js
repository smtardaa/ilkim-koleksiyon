import { loadCatalog, productUrl, productPageVisible } from '../lib/catalog.js';
import { urlset, sitemapError } from '../lib/sitemap.js';
export const prerender = false;
// Satılmış ama yayında kalan ürünler de (görünürlük ayarı izin veriyorsa) haritada kalır.
export async function GET() {
  try {
    const c = await loadCatalog();
    return urlset(c.products.filter(productPageVisible).map((p) => ({
      loc: productUrl(p),
      lastmod: p.updatedAt ?? null,
      images: p.images.map((i) => ({ loc: i.src })),
    })));
  } catch (e) {
    console.error('[sitemap] ürün', e?.message ?? e);
    return sitemapError();
  }
}
