/**
 * Demo sepeti: veriyi yalnızca bu tarayıcının localStorage alanında tutar.
 * Hiçbir sunucuya gönderilmez, sipariş oluşturmaz.
 *
 * Shopify entegrasyonunda aynı arayüzü uygulayan bir shopify-adapter.js
 * yazılacak (cartCreate, cartLinesAdd, cartLinesUpdate, cartLinesRemove;
 * ödeme için Shopify'ın döndürdüğü checkoutUrl).
 */
const KEY = 'ilkim-koleksiyon:demo-cart:v1';

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(lines) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Gizli sekme vb. durumlarda depolama kapalı olabilir; sepet oturumda kalır.
  }
  return lines;
}

export const localCartAdapter = {
  name: 'local-demo',
  checkoutAvailable: false,

  async getLines() {
    return read();
  },

  /** @param {{id:string, handle:string, title:string, url:string, price:number, currencyCode:string, image:string, imageAlt:string, maxQuantity:number|null}} item */
  async add(item, quantity = 1) {
    const lines = read();
    const existing = lines.find((l) => l.id === item.id);
    const limit = item.maxQuantity ?? Infinity;
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, limit);
    } else {
      lines.push({ ...item, quantity: Math.min(quantity, limit) });
    }
    return write(lines);
  },

  async update(id, quantity) {
    const lines = read();
    const line = lines.find((l) => l.id === id);
    if (!line) return lines;
    const limit = line.maxQuantity ?? Infinity;
    line.quantity = Math.max(1, Math.min(quantity, limit));
    return write(lines);
  },

  async remove(id) {
    return write(read().filter((l) => l.id !== id));
  },

  async clear() {
    return write([]);
  },
};

export const CART_STORAGE_KEY = KEY;
