/**
 * Sepet sayfası: satırları çizer, adet değiştirme ve kaldırma.
 * Ödeme düğmesi demo modunda devre dışıdır (bkz. cart/store.js).
 */
import { cart, subtotal } from './cart/store.js';
import { formatPrice } from '../lib/format.js';

export function initCartPage(root, template) {
  const list = root.querySelector('[data-cart-lines]');
  const empty = root.querySelector('[data-cart-empty]');
  const filled = root.querySelector('[data-cart-filled]');
  const loading = root.querySelector('[data-cart-loading]');
  const subtotalEl = root.querySelector('[data-subtotal]');
  const totalEl = root.querySelector('[data-total]');
  const live = root.querySelector('[data-cart-live]');

  function renderLine(line) {
    const node = template.content.firstElementChild.cloneNode(true);
    const qtyId = `qty-${line.id}`;
    node.dataset.id = line.id;
    node.querySelectorAll('[data-link]').forEach((a) => (a.href = line.url));
    node.querySelector('[data-title]').textContent = line.title;
    const img = node.querySelector('[data-img]');
    img.src = line.image;
    node.querySelector('[data-unit]').textContent = `Birim fiyat: ${formatPrice(line.price, line.currencyCode)}`;

    const label = node.querySelector('[data-qty-label]');
    const input = node.querySelector('[data-qty]');
    const dec = node.querySelector('[data-dec]');
    const inc = node.querySelector('[data-inc]');
    const max = line.maxQuantity ?? 99;
    label.id = `${qtyId}-label`;
    input.id = qtyId;
    input.setAttribute('aria-labelledby', `${qtyId}-label`);
    input.setAttribute('aria-describedby', `${qtyId}-max`);
    input.max = String(max);
    input.value = String(line.quantity);
    dec.setAttribute('aria-label', `${line.title} adedini azalt`);
    inc.setAttribute('aria-label', `${line.title} adedini artır`);
    dec.disabled = line.quantity <= 1;
    inc.disabled = line.quantity >= max;
    const maxEl = node.querySelector('[data-max]');
    maxEl.id = `${qtyId}-max`;
    maxEl.textContent = max === 1 ? 'Tek adet mevcut' : `En fazla ${max} adet`;

    node.querySelector('[data-line-total]').textContent = formatPrice(line.price * line.quantity, line.currencyCode);
    const remove = node.querySelector('[data-remove]');
    remove.setAttribute('aria-label', `${line.title} ürününü sepetten kaldır`);

    const setQty = async (q, focusSel) => {
      const lines = await cart.update(line.id, q);
      const updated = lines.find((l) => l.id === line.id);
      live.textContent = `${line.title}: ${updated.quantity} adet`;
      restoreFocus(line.id, focusSel);
    };
    dec.addEventListener('click', () => setQty(line.quantity - 1, '[data-dec]'));
    inc.addEventListener('click', () => setQty(line.quantity + 1, '[data-inc]'));
    input.addEventListener('change', () => setQty(parseInt(input.value, 10) || 1, '[data-qty]'));
    remove.addEventListener('click', async () => {
      const next = list.querySelector(`[data-id="${CSS.escape(line.id)}"]`)?.nextElementSibling?.dataset.id;
      await cart.remove(line.id);
      live.textContent = `${line.title} sepetten kaldırıldı.`;
      const target = next && list.querySelector(`[data-id="${CSS.escape(next)}"] [data-remove]`);
      (target ?? root.querySelector('[data-cart-empty] a, [data-remove]') ?? document.querySelector('h1'))?.focus();
    });
    return node;
  }

  function restoreFocus(id, selector) {
    const el = list.querySelector(`[data-id="${CSS.escape(id)}"] ${selector}`);
    if (el && !el.disabled) el.focus();
    else list.querySelector(`[data-id="${CSS.escape(id)}"] [data-qty]`)?.focus();
  }

  function render(lines) {
    loading.hidden = true;
    empty.hidden = lines.length > 0;
    filled.hidden = lines.length === 0;
    list.replaceChildren(...lines.map(renderLine));
    const currency = lines[0]?.currencyCode ?? 'TRY';
    const sum = formatPrice(subtotal(lines), currency);
    subtotalEl.textContent = sum;
    totalEl.textContent = sum;
  }

  window.addEventListener('cart:change', (e) => render(e.detail.lines));
  cart.getLines().then(render);
}
