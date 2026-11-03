/**
 * Sunucu tarafı sepet doğrulaması.
 * Sepete eklemede ve ödeme öncesinde sağlayıcıdan GÜNCEL fiyat ve stok okunur;
 * tarayıcıdaki fiyat bilgisi hiçbir zaman esas alınmaz.
 */
import { getProvider, productUrl } from './catalog.js';
import { storeMode } from '../config/site.js';
import { formatMoney } from './format.js';

/** Kaynakta adet yayınlanmadığında satır başına üst sınır (mağaza politikası, stok iddiası değildir). */
export const UNKNOWN_QTY_LIMIT = {
  // Demo: kaynak sitede adet gösterilmiyor; her koleksiyon ilanı tekil parça kabul edilir.
  demo: { default: 1, malzeme: 5 },
  // Shopify: quantityAvailable okunamazsa (izin yoksa) bu sınır kullanılır; Shopify Checkout yine de stoğu kontrol eder.
  shopify: { default: 10, malzeme: 10 },
};

export function purchaseLimit(p) {
  if (p.availability.status !== 'in_stock') return 0;
  if (typeof p.availability.quantity === 'number') return Math.max(0, p.availability.quantity);
  const t = UNKNOWN_QTY_LIMIT[storeMode] ?? UNKNOWN_QTY_LIMIT.demo;
  return p.specs.kind === 'malzeme' ? t.malzeme : t.default;
}

/**
 * @param {{variantId:string, quantity:number}[]} lines
 */
export async function validateLines(lines) {
  const clean = (Array.isArray(lines) ? lines : [])
    .filter((l) => l && typeof l.variantId === 'string' && l.variantId.length < 200)
    .slice(0, 100)
    .map((l) => ({ variantId: l.variantId, quantity: Math.max(1, Math.min(999, parseInt(l.quantity, 10) || 1)) }));
  const provider = await getProvider();
  const products = await provider.getProductsByVariantIds(clean.map((l) => l.variantId));
  const byVariant = new Map(products.map((p) => [p.variantId, p]));

  let subtotal = 0;
  let currencyCode = 'TRY';
  const out = clean.map((l) => {
    const p = byVariant.get(l.variantId);
    if (!p) return { variantId: l.variantId, ok: false, removed: true, quantity: 0, message: 'Ürün artık satışta değil veya bulunamadı.' };
    const limit = purchaseLimit(p);
    const status = p.availability.status;
    let quantity = Math.min(l.quantity, limit);
    let message = null;
    if (status === 'sold') message = 'Bu ürün satıldı; satın alınamaz.';
    else if (status !== 'in_stock') message = 'Bu ürün şu anda stokta yok.';
    else if (l.quantity > limit) message = `Bu üründen en fazla ${limit} adet alınabilir; adet güncellendi.`;
    if (status === 'in_stock') { subtotal += p.price.amount * quantity; currencyCode = p.price.currencyCode; }
    return {
      variantId: l.variantId,
      ok: status === 'in_stock' && quantity > 0,
      quantity: status === 'in_stock' ? quantity : 0,
      requested: l.quantity,
      maxQuantity: limit,
      message,
      product: {
        id: p.id,
        handle: p.handle,
        url: productUrl(p),
        title: p.title,
        price: p.price,
        priceText: formatMoney(p.price),
        status,
        image: p.images[0]?.srcSmall ?? p.images[0]?.src ?? null,
        imageAlt: p.images[0]?.alt ?? p.title,
      },
    };
  });
  return {
    mode: storeMode,
    lines: out,
    subtotal: { amount: subtotal, currencyCode },
    subtotalText: formatMoney({ amount: subtotal, currencyCode }),
    checkedAt: new Date().toISOString(),
  };
}
