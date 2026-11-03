import { loadCatalog, categoryUrl, collectionUrl } from '../lib/catalog.js';
import { urlset, sitemapError } from '../lib/sitemap.js';
export const prerender = false;
// Boş kategoriler noindex olduğu için haritaya girmez
export async function GET() {
  try {
    const c = await loadCatalog();
    return urlset([
      ...c.categories.filter((x) => x.productCount > 0).map((x) => ({ loc: categoryUrl(x.path) })),
      ...c.collections.filter((x) => x.productCount > 0).map((x) => ({ loc: collectionUrl(x.handle) })),
    ]);
  } catch (e) {
    console.error('[sitemap] kategori', e?.message ?? e);
    return sitemapError();
  }
}
