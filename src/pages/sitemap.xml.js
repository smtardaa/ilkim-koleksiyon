/**
 * sitemap.xml — dinamik site haritası dizini.
 * Ürün, kategori ve seçki adresleri istek anında aynı veri sağlayıcısından üretilir;
 * Shopify'a eklenen yeni ürün, katalog önbelleği yenilendiğinde (en geç CATALOG_CACHE_TTL_SECONDS)
 * veya webhook geldiğinde haritaya otomatik girer. Elle düzenleme gerekmez.
 */
import { absoluteUrl } from '../config/site.js';

export const prerender = false;

export function GET() {
  const parts = ['/sitemap-sayfalar.xml', '/sitemap-kategoriler.xml', '/sitemap-urunler.xml'];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${parts.map((p) => `  <sitemap><loc>${absoluteUrl(p)}</loc></sitemap>`).join('\n')}
</sitemapindex>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
