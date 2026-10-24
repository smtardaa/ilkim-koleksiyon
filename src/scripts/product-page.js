/**
 * Ürün sayfası: sepete ekleme ve teklif formu (demo).
 */
import { cart } from './cart/store.js';
import { url } from '../lib/paths.js';

export function initProductPage(root) {
  const item = JSON.parse(root.dataset.cartItem);
  const addBtn = root.querySelector('[data-add-to-cart]');
  const status = root.querySelector('[data-add-status]');

  addBtn?.addEventListener('click', async () => {
    const lines = await cart.getLines();
    const existing = lines.find((l) => l.id === item.id);
    if (existing && item.maxQuantity !== null && existing.quantity >= item.maxQuantity) {
      status.textContent = `Stoktaki adetin tamamı (${item.maxQuantity}) zaten sepetinizde.`;
      return;
    }
    await cart.add(item, 1);
    status.innerHTML = `Sepete eklendi. <a href="${url('/sepet/')}">Sepete git</a>`;
  });

  // Teklif formu: hiçbir veri gönderilmez veya saklanmaz.
  const dialog = root.querySelector('[data-offer-dialog]');
  if (!dialog) return;
  const form = dialog.querySelector('[data-offer-form]');
  const result = dialog.querySelector('[data-offer-result]');
  const error = dialog.querySelector('[data-offer-error]');
  const opener = root.querySelector('[data-offer-open]');

  opener.addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    result.hidden = true;
    error.hidden = true;
    dialog.showModal();
  });

  dialog.querySelectorAll('[data-offer-close]').forEach((b) => b.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('close', () => opener.focus());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const invalid = [...form.elements].find((el) => el.required && !el.value.trim());
    if (invalid || Number(form.elements.amount.value) <= 0) {
      error.hidden = false;
      (invalid ?? form.elements.amount).focus();
      return;
    }
    form.reset();
    form.hidden = true;
    result.hidden = false;
    result.focus();
  });
}
