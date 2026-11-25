/**
 * Katalog servisi — sayfaların tek giriş noktası.
 * Sağlayıcı veriyi depodan (src/lib/store → getStore) okur. Depo bugün DATA_DIR içindeki
 * JSON dosyalarıdır; MySQL'e geçişte yalnızca depo değişir (bkz. docs/YONETIM-PANELI.md).
 */
import { dataSource, soldVisibility } from '../config/site.js';
import { runQuery, inCategory, sortProducts } from './search/engine.js';

/** @typedef {import('./types.js').Product} Product */
/** @typedef {import('./types.js').Category} Category */

let providerPromise;
export function getProvider() {
  providerPromise ??= ({
    local: () => import('./providers/local.js').then((m) => m.localProvider),
  }[dataSource] ?? (() => Promise.reject(new Error(`Bilinmeyen veri kaynağı: ${dataSource}`))))();
  return providerPromise;
}

/** Tam katalog + kategori/seçki dizinleri */
export async function loadCatalog() {
  const provider = await getProvider();
  const [products, categories, collections, countries] = await Promise.all([
    provider.getAllProducts(),
    provider.getCategories(),
    provider.getCollections(),
    provider.getCountries(),
  ]);
  const catMap = new Map(categories.map((c) => [c.path, c]));
  const collMap = new Map(collections.map((c) => [c.handle, c]));
  const categoryTitles = (path) => {
    const out = [];
    const parts = path.split('/');
    for (let i = 1; i <= parts.length; i++) {
      const c = catMap.get(parts.slice(0, i).join('/'));
      if (c) out.push(c.title);
    }
    return out;
  };
  return { provider, products, categories, collections, countries, catMap, collMap, categoryTitles };
}

/** Listelerde gösterilecek ürünler (satılmış ürün görünürlük ayarına göre) */
export function listable(products) {
  return soldVisibility === 'visible' ? products : products.filter((p) => p.availability.status !== 'sold');
}

/** Ürün sayfası erişilebilir mi? */
export function productPageVisible(p) {
  return !(p.availability.status === 'sold' && soldVisibility === 'hidden');
}

export function search(catalog, state, opts = {}) {
  return runQuery(catalog.products, state, {
    categoryTitles: catalog.categoryTitles,
    soldVisibility,
    ...opts,
  });
}

/** Kategori yolu için kırıntılar: [{title, href}] */
export function categoryTrail(catalog, path) {
  const out = [];
  if (!path) return out;
  const parts = path.split('/');
  for (let i = 1; i <= parts.length; i++) {
    const p = parts.slice(0, i).join('/');
    const c = catalog.catMap.get(p);
    if (c) out.push({ title: c.title, href: categoryUrl(p) });
  }
  return out;
}

export function childCategories(catalog, path, { nonEmpty = true } = {}) {
  return catalog.categories
    .filter((c) => c.parent === (path ?? null) && (!nonEmpty || c.productCount > 0))
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.title.localeCompare(b.title, 'tr', { numeric: true }));
}

export function relatedProducts(catalog, product, limit = 8) {
  const pool = listable(catalog.products).filter((p) => p.id !== product.id && p.availability.status !== 'sold');
  const scored = pool.map((p) => {
    let s = 0;
    if (product.primaryCategory && p.primaryCategory === product.primaryCategory) s += 5;
    else if (product.primaryCategory && p.categoryPaths.some((c) => product.primaryCategory.startsWith(c.split('/')[0]))) s += 2;
    if (product.specs.country && p.specs.country === product.specs.country) s += 2;
    if (product.specs.emission && p.specs.emission === product.specs.emission) s += 2;
    if (product.specs.ruler && p.specs.ruler === product.specs.ruler) s += 2;
    if (p.collections.some((c) => product.collections.includes(c))) s += 1;
    return { p, s };
  }).filter((x) => x.s > 0);
  scored.sort((a, b) => b.s - a.s || b.p.order - a.p.order);
  return scored.slice(0, limit).map((x) => x.p);
}

export function newestProducts(catalog, limit = 12, filter = () => true) {
  return sortProducts(listable(catalog.products).filter((p) => p.availability.status === 'in_stock' && filter(p)), 'yeni').slice(0, limit);
}

export const productUrl = (p) => `/urun/${encodeURIComponent(p.handle)}`;
export const categoryUrl = (path) => `/kategori/${path}`;
export const collectionUrl = (handle) => `/koleksiyonlar/${handle}`;
export { inCategory };
