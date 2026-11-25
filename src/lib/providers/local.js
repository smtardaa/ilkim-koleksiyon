/**
 * YEREL DOSYA SAĞLAYICISI
 * Katalog verisini src/data/catalog/*.json dosyalarından okur ve ortak modelle sunar.
 *
 * Gelecekteki yönetim paneli (Node.js 24 + MySQL) için yalnızca bu dosyanın eşdeğeri
 * olan bir `mysql.js` sağlayıcısı yazılması yeterlidir; sayfalar ve bileşenler
 * yalnızca aşağıdaki yöntemleri tanır (bkz. docs/YONETIM-PANELI.md).
 */
import products from '../../data/catalog/products.json' with { type: 'json' };
import categoryData from '../../data/catalog/categories.json' with { type: 'json' };
import countries from '../../data/catalog/countries.json' with { type: 'json' };
import collectionData from '../../data/catalog/collections.json' with { type: 'json' };
import { inCategory } from '../search/engine.js';
import { localCandidates } from '../home-sections.js';

/** @typedef {import('../types.js').Product} Product */

const countIn = (path) => products.filter((p) => inCategory(p, path)).length;

/**
 * Ana kategoriler + ülke seçimi olan kategorilerin ülke alt sayfaları.
 * Ülke sayfaları ürün kayıtlarından değil, bağımsız ülke listesinden üretilir;
 * böylece ürün yokken de çalışırlar.
 */
const categories = [
  ...categoryData.map((c) => ({ ...c, productCount: countIn(c.path) })),
  ...categoryData.filter((c) => c.countries).flatMap((c) => countries.map((k, i) => ({
    path: `${c.path}/${k.slug}`,
    title: k.name,
    parent: c.path,
    description: `${c.title} — ${k.name}.`,
    sort: i,
    countrySlug: k.slug,
    productCount: countIn(`${c.path}/${k.slug}`),
  }))),
];
const collections = collectionData.map((c) => ({ ...c, productCount: products.filter((p) => p.collections?.includes(c.handle)).length }));
const byHandle = new Map(products.map((p) => [p.handle, p]));

export const localProvider = {
  source: 'local',

  async getAllProducts() {
    return products;
  },
  async getProductByHandle(handle) {
    return byHandle.get(handle) ?? null;
  },
  async getCategories() {
    return categories;
  },
  async getCountries() {
    return countries;
  },
  async getCollections() {
    return collections;
  },
  /** Ana sayfa slider adayları: bölüm başına yalnızca istenen kadar ürün. */
  async getHomeSections(requests) {
    return Object.fromEntries(requests.map((r) => {
      const meta = r.type === 'category'
        ? categories.find((c) => c.path === r.key)
        : collections.find((c) => c.handle === r.key);
      return [r.id, { title: meta?.title ?? null, description: meta?.description ?? null, products: localCandidates(products, r) }];
    }));
  },
  async health() {
    return { ok: true, products: products.length };
  },
};
