/**
 * Sepet arayüzü. Bileşenler doğrudan bu modülü kullanır; arka plandaki
 * adaptör (şimdilik localStorage demo sepeti) değiştirilebilir.
 * Her değişiklikte window üzerinde "cart:change" olayı yayınlanır.
 */
import { localCartAdapter, CART_STORAGE_KEY } from './local-adapter.js';

const adapter = localCartAdapter;

function emit(lines) {
  window.dispatchEvent(new CustomEvent('cart:change', { detail: { lines } }));
  return lines;
}

export const cart = {
  checkoutAvailable: adapter.checkoutAvailable,
  getLines: () => adapter.getLines(),
  add: async (item, qty) => emit(await adapter.add(item, qty)),
  update: async (id, qty) => emit(await adapter.update(id, qty)),
  remove: async (id) => emit(await adapter.remove(id)),
  clear: async () => emit(await adapter.clear()),
};

export function countItems(lines) {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function subtotal(lines) {
  return lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
}

/** Başka sekmede yapılan değişiklikleri de yansıt. */
window.addEventListener('storage', async (e) => {
  if (e.key === CART_STORAGE_KEY) emit(await adapter.getLines());
});
