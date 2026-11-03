/**
 * DEMO SAĞLAYICISI
 * Yerel demo envanterini (src/data/demo/*.json) ortak modelle sunar.
 * Bu veriler örnek envanterdir; kaynağı docs/DEMO-ENVANTER.md içinde belgelenmiştir.
 * Ödeme: demo ürünler hiçbir ödeme sistemine GÖNDERİLMEZ.
 */
import products from '../../data/demo/products.json';
import categories from '../../data/demo/categories.json';
import collections from '../../data/demo/collections.json';

/** @typedef {import('../types.js').Product} Product */

const byHandle = new Map(products.map((p) => [p.handle, p]));
const byId = new Map(products.map((p) => [p.id, p]));
const byVariant = new Map(products.map((p) => [p.variantId, p]));

export const demoProvider = {
  mode: 'demo',
  label: 'Demo envanter',

  async getAllProducts() {
    return products;
  },
  async getProductByHandle(handle) {
    return byHandle.get(handle) ?? null;
  },
  async getProductsByVariantIds(ids) {
    return ids.map((id) => byVariant.get(id) ?? byId.get(id)).filter(Boolean);
  },
  async getCategories() {
    return categories;
  },
  async getCollections() {
    return collections;
  },
  /**
   * Demo modunda ödeme oluşturulmaz. Sipariş kaydı, ödeme isteği veya
   * sahte “başarılı” sonucu üretilmez.
   */
  async createCheckout() {
    return {
      ok: false,
      demo: true,
      message: 'Bu bir demo mağazadır. Demo ürünler gerçek ödemeye gönderilmez; sipariş oluşturulmadı.',
    };
  },
  async health() {
    return { ok: true, products: products.length };
  },
};
