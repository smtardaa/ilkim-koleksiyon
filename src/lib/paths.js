/**
 * Site içi yolları Astro'nun `base` ayarına göre üretir. GitHub Pages'te site
 * /ilkim-koleksiyon/ alt yolunda yayınlandığı için köke göre yazılmış yollar
 * ("/magaza/") doğrudan kullanılmamalı; her zaman url("/magaza/") kullanılır.
 *
 * Fonksiyon idempotenttir: base önekini zaten taşıyan bir yolu değiştirmez.
 * Tam adresler (https://…, mailto:, tel:) ve yalnızca #/? ile başlayanlar
 * olduğu gibi döner.
 */
const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');

export function url(path = '/') {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  if (BASE && (path === BASE || path.startsWith(`${BASE}/`))) return path;
  return `${BASE}${path}`;
}

export const basePath = BASE || '/';
