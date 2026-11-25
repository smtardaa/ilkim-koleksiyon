/**
 * YEREL SAĞLAYICI — sitenin okuma arayüzü.
 * Veriyi depodan (src/lib/store → DATA_DIR içindeki JSON dosyaları) okur ve ortak modelle sunar.
 * Panelden yapılan her kayıt depo `revision` değerini artırır; türetilmiş listeler o anda yeniden kurulur,
 * böylece değişiklik yeniden derleme gerekmeden sitede görünür.
 *
 * MySQL'e geçişte bu dosya değişmez: depo (`getStore()`) MySQL deposunu döndürür.
 */
import { getStore } from '../store/index.js';
import { inCategory } from '../search/engine.js';
import { localCandidates } from '../home-sections.js';

/** @typedef {import('../types.js').Product} Product */

let cache = { revision: -1 };

/** Ana kategoriler + ülke seçimi olan kategorilerin ülke alt sayfaları (ülke listesinden; ürün yokken de çalışır). */
function derive(snapshot) {
  if (cache.revision === snapshot.revision) return cache;
  // Yayından kaldırılmış ürünler sitede hiçbir yerde görünmez.
  const products = snapshot.products.filter((p) => p.published !== false);
  const countIn = (path) => products.filter((p) => inCategory(p, path)).length;
  const countries = snapshot.countries;
  const categories = [
    ...snapshot.categories.map((c) => ({ ...c, productCount: countIn(c.path) })),
    ...snapshot.categories.filter((c) => c.countries).flatMap((c) => countries.map((k, i) => ({
      path: `${c.path}/${k.slug}`,
      title: k.name,
      parent: c.path,
      description: `${c.title} — ${k.name}.`,
      sort: i,
      countrySlug: k.slug,
      productCount: countIn(`${c.path}/${k.slug}`),
    }))),
  ];
  const collections = snapshot.collections.map((c) => ({ ...c, productCount: products.filter((p) => p.collections?.includes(c.handle)).length }));
  cache = {
    revision: snapshot.revision,
    products,
    countries,
    categories,
    collections,
    byHandle: new Map(products.map((p) => [p.handle, p])),
  };
  return cache;
}

const data = async () => derive(await getStore().getSnapshot());

export const localProvider = {
  source: 'local',

  async getAllProducts() {
    return (await data()).products;
  },
  async getProductByHandle(handle) {
    return (await data()).byHandle.get(handle) ?? null;
  },
  async getCategories() {
    return (await data()).categories;
  },
  async getCountries() {
    return (await data()).countries;
  },
  async getCollections() {
    return (await data()).collections;
  },
  /** Ana sayfa slider adayları: bölüm başına yalnızca istenen kadar ürün. */
  async getHomeSections(requests) {
    const { products, categories, collections } = await data();
    return Object.fromEntries(requests.map((r) => {
      const meta = r.type === 'category'
        ? categories.find((c) => c.path === r.key)
        : collections.find((c) => c.handle === r.key);
      return [r.id, { title: meta?.title ?? null, description: meta?.description ?? null, products: localCandidates(products, r) }];
    }));
  },
  async health() {
    return { ok: true, products: (await data()).products.length };
  },
};
