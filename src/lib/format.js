import { store } from '../config/store.js';
import { getCondition } from '../config/conditions.js';

const priceFormatters = new Map();

/** 12500 → "₺12.500" ; kuruşlu tutarlarda "₺12.500,50" */
export function formatPrice(amount, currencyCode = store.currency) {
  if (!priceFormatters.has(currencyCode)) {
    priceFormatters.set(
      currencyCode,
      new Intl.NumberFormat(store.locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    );
  }
  return priceFormatters.get(currencyCode).format(amount);
}

const dateFormatter = new Intl.DateTimeFormat(store.locale, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** "2026-10-12" → "12 Ekim 2026" */
export function formatDate(iso) {
  return dateFormatter.format(new Date(iso));
}

export function conditionText(code) {
  const c = getCondition(code);
  return c ? `${c.label} (${c.short})` : 'Belirtilmemiş';
}

export function stockText(product) {
  if (!product.availableForSale) return 'Satıldı';
  if (product.quantityAvailable === 1) return 'Stokta · tek adet';
  return 'Stokta';
}

export function yearText(product) {
  return product.yearLabel ?? (product.year ? String(product.year) : 'Belirtilmedi');
}
