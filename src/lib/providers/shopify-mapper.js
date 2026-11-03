/**
 * Shopify Storefront yanıtını ortak ürün modeline çevirir.
 * Metafield eşlemesi (namespace: ilkim) — ayrıntı: docs/SHOPIFY-KURULUM.md
 */
import { buildSpecs } from '../specs.js';

const KINDS = new Set(['banknot', 'madeni', 'set', 'malzeme', 'madalya', 'obje', 'pul', 'antika']);

function mfMap(list) {
  const m = {};
  for (const f of list ?? []) if (f && f.value != null && f.value !== '') m[f.key] = f.value;
  return m;
}

/** Koleksiyonları kategori (ilkim.collection_type = "kategori") ve seçki ("secki") olarak ayırır. */
export function mapShopifyCollections(nodes) {
  const categories = [];
  const collections = [];
  for (const n of nodes) {
    const type = n.collectionType?.value;
    const path = n.categoryPath?.value?.trim().replace(/^\/+|\/+$/g, '');
    if (type === 'kategori' && path) {
      const parts = path.split('/');
      categories.push({
        path,
        handle: n.handle,
        title: n.title,
        parent: parts.length > 1 ? parts.slice(0, -1).join('/') : null,
        description: n.description || null,
        productCount: 0,
      });
    } else if (type === 'secki') {
      collections.push({ handle: n.handle, title: n.title, description: n.description || null, rule: null, productCount: 0 });
    }
  }
  return { categories, collections };
}

/** @returns {import('../types.js').Product} */
export function mapShopifyProduct(n, { order = 0 } = {}) {
  const v = n.variants?.nodes?.[0] ?? null;
  const mf = mfMap(n.metafields);
  const saleStatus = mf.sale_status === 'sold' ? 'sold' : null;
  const status = saleStatus === 'sold' ? 'sold' : v?.availableForSale ? 'in_stock' : 'out_of_stock';
  const colls = n.collections?.nodes ?? [];
  const categoryPaths = colls
    .filter((c) => c.collectionType?.value === 'kategori' && c.categoryPath?.value)
    .map((c) => c.categoryPath.value.trim().replace(/^\/+|\/+$/g, ''));
  const seckiler = colls.filter((c) => c.collectionType?.value === 'secki');
  const primaryCategory = [...categoryPaths].sort((a, b) => b.split('/').length - a.split('/').length)[0] ?? null;
  const kind = KINDS.has(mf.kind) ? mf.kind : null;

  return {
    id: n.id,
    variantId: v?.id ?? n.id,
    handle: n.handle,
    title: n.title,
    summary: (n.description ?? '').replace(/\s+/g, ' ').trim().slice(0, 300),
    descriptionHtml: n.descriptionHtml || null,
    sku: v?.sku || null,
    categoryPaths,
    primaryCategory,
    collections: seckiler.map((c) => c.handle),
    collectionTitles: seckiler.map((c) => c.title),
    price: { amount: Number(v?.price?.amount ?? 0), currencyCode: v?.price?.currencyCode ?? 'TRY' },
    compareAtPrice: v?.compareAtPrice ? { amount: Number(v.compareAtPrice.amount), currencyCode: v.compareAtPrice.currencyCode } : null,
    availability: {
      status,
      availableForSale: status === 'in_stock',
      quantity: typeof v?.quantityAvailable === 'number' ? v.quantityAvailable : null,
    },
    images: (n.images?.nodes ?? []).map((img, i) => ({
      src: img.large,
      srcSmall: img.small,
      width: img.width ?? 1200,
      height: img.height ?? 1200,
      alt: img.altText || `${n.title} — görsel ${i + 1}`,
    })),
    specs: buildSpecs({
      kind,
      country: mf.country,
      yearFrom: mf.year_from,
      yearTo: mf.year_to,
      calendar: mf.calendar,
      yearText: mf.year_text,
      denominationValue: mf.denomination_value,
      denominationUnit: mf.denomination_unit,
      emission: mf.emission,
      ruler: mf.ruler,
      period: mf.period,
      condition: mf.condition,
      catalogNumber: mf.catalog_number,
      certService: mf.cert_service,
      certGrade: mf.cert_grade,
      certNumber: mf.cert_number,
      metal: mf.metal,
    }),
    createdAt: n.publishedAt ?? n.createdAt ?? null,
    updatedAt: n.updatedAt ?? null,
    order,
    seoTitle: n.seo?.title || null,
    seoDescription: n.seo?.description || null,
    deliveryNote: mf.delivery_note ?? null,
    source: null,
    demoScenario: null,
  };
}
