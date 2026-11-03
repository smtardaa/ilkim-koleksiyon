import { urlset } from '../lib/sitemap.js';
export const prerender = false;
// Yalnızca indekslenebilir statik sayfalar (iskelet halindeki yasal sayfalar tamamlanınca eklenmeli)
export function GET() {
  return urlset(['/', '/urunler', '/kategori', '/koleksiyonlar', '/yeni-gelenler', '/hakkimizda', '/iletisim', '/koleksiyon-rehberi', '/sss'].map((loc) => ({ loc })));
}
