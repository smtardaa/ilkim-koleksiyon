/**
 * SHOPIFY SAĞLAYICISI — Storefront API (GraphQL)
 * ------------------------------------------------------------------
 * - Bütün istekler SUNUCUDA yapılır; token'lar tarayıcıya gönderilmez.
 * - Tercih edilen kimlik: SHOPIFY_STOREFRONT_PRIVATE_TOKEN (Headless kanalı, gizli).
 *   Yoksa SHOPIFY_STOREFRONT_PUBLIC_TOKEN kullanılır.
 * - Bağlantı/erişim hatasında demo veriye DÜŞÜLMEZ; `ShopifyError` fırlatılır ve
 *   sayfa “mağaza verisine ulaşılamıyor” durumunu 503 ile gösterir.
 * - Alan eşlemesi: docs/SHOPIFY-KURULUM.md
 */
import {
  SHOPIFY_STORE_DOMAIN,
  SHOPIFY_API_VERSION,
  SHOPIFY_STOREFRONT_PUBLIC_TOKEN,
  SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
  SHOPIFY_COUNTRY,
  SHOPIFY_LANGUAGE,
  CATALOG_CACHE_TTL_SECONDS,
  PRODUCT_CACHE_TTL_SECONDS,
} from 'astro:env/server';
import { cached } from '../cache.js';
import { mapShopifyProduct, mapShopifyCollections } from './shopify-mapper.js';

export class ShopifyError extends Error {
  /** @param {'config'|'network'|'http'|'graphql'|'user'} kind */
  constructor(kind, message, details) {
    super(message);
    this.name = 'ShopifyError';
    this.kind = kind;
    this.details = details;
  }
}

export const METAFIELD_KEYS = [
  'kind', 'country', 'year_from', 'year_to', 'calendar', 'year_text',
  'denomination_value', 'denomination_unit', 'emission', 'ruler', 'period',
  'condition', 'catalog_number', 'cert_service', 'cert_grade', 'cert_number',
  'metal', 'sale_status', 'delivery_note',
];
const MF_IDENTIFIERS = METAFIELD_KEYS.map((k) => `{namespace: "ilkim", key: "${k}"}`).join(', ');

const PRODUCT_FIELDS = /* GraphQL */ `
  fragment ProductFields on Product {
    id handle title description descriptionHtml productType vendor tags
    createdAt publishedAt updatedAt
    seo { title description }
    images(first: 12) {
      nodes {
        altText width height
        large: url(transform: { maxWidth: 1400, preferredContentType: WEBP })
        small: url(transform: { maxWidth: 600, preferredContentType: WEBP })
      }
    }
    variants(first: 1) {
      nodes {
        id sku availableForSale quantityAvailable
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
      }
    }
    collections(first: 20) {
      nodes {
        handle title
        categoryPath: metafield(namespace: "ilkim", key: "category_path") { value }
        collectionType: metafield(namespace: "ilkim", key: "collection_type") { value }
      }
    }
    metafields(identifiers: [${MF_IDENTIFIERS}]) { key value type }
  }
`;

function config() {
  const domain = SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const token = SHOPIFY_STOREFRONT_PRIVATE_TOKEN || SHOPIFY_STOREFRONT_PUBLIC_TOKEN;
  if (!domain || !token) {
    throw new ShopifyError('config', 'Shopify bağlantı bilgileri eksik: SHOPIFY_STORE_DOMAIN ve bir Storefront token gerekli.');
  }
  if (!/^[a-z0-9-]+\.myshopify\.com$/i.test(domain) && !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
    throw new ShopifyError('config', 'SHOPIFY_STORE_DOMAIN geçersiz görünüyor (ör. magaza-adi.myshopify.com).');
  }
  return { domain, token, isPrivate: !!SHOPIFY_STOREFRONT_PRIVATE_TOKEN };
}

/**
 * @param {string} query
 * @param {Record<string, unknown>} [variables]
 * @param {{ buyerIp?: string }} [opts]
 */
export async function storefront(query, variables = {}, opts = {}) {
  const { domain, token, isPrivate } = config();
  const url = `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (isPrivate) {
    headers['Shopify-Storefront-Private-Token'] = token;
    if (opts.buyerIp) headers['Shopify-Storefront-Buyer-IP'] = opts.buyerIp;
  } else {
    headers['X-Shopify-Storefront-Access-Token'] = token;
  }
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    throw new ShopifyError('network', 'Shopify Storefront API isteği başarısız oldu (ağ/zaman aşımı).', String(err));
  }
  if (!res.ok) {
    throw new ShopifyError('http', `Shopify Storefront API HTTP ${res.status} döndürdü.`, await res.text().catch(() => ''));
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new ShopifyError('graphql', 'Shopify Storefront API sorgu hatası.', json.errors.map((e) => e.message).join(' | '));
  }
  return json.data;
}

const ctx = () => ({ country: SHOPIFY_COUNTRY, language: SHOPIFY_LANGUAGE });

async function fetchCatalog() {
  const q = /* GraphQL */ `
    ${PRODUCT_FIELDS}
    query Catalog($cursor: String, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
      products(first: 250, after: $cursor, sortKey: CREATED_AT, reverse: true) {
        pageInfo { hasNextPage endCursor }
        nodes { ...ProductFields }
      }
    }`;
  const all = [];
  let cursor = null;
  for (let i = 0; i < 80; i++) { // en fazla 20.000 ürün; üzeri için README'deki ölçek notuna bakın
    const data = await storefront(q, { cursor, ...ctx() });
    all.push(...data.products.nodes);
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }
  const { categories } = await getCollectionsData();
  return all.map((n, i) => mapShopifyProduct(n, { order: all.length - i, categories }));
}

async function getCollectionsData() {
  return cached('shopify:collections', CATALOG_CACHE_TTL_SECONDS, async () => {
    const q = /* GraphQL */ `
      query Collections($cursor: String) {
        collections(first: 250, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes {
            handle title description
            categoryPath: metafield(namespace: "ilkim", key: "category_path") { value }
            collectionType: metafield(namespace: "ilkim", key: "collection_type") { value }
          }
        }
      }`;
    const nodes = [];
    let cursor = null;
    for (let i = 0; i < 20; i++) {
      const data = await storefront(q, { cursor });
      nodes.push(...data.collections.nodes);
      if (!data.collections.pageInfo.hasNextPage) break;
      cursor = data.collections.pageInfo.endCursor;
    }
    return mapShopifyCollections(nodes);
  });
}

export const shopifyProvider = {
  mode: 'shopify',
  label: 'Shopify Storefront API',

  /** Tam katalog — arama/filtre/sitemap için. TTL: CATALOG_CACHE_TTL_SECONDS (varsayılan 300 sn). */
  async getAllProducts() {
    return cached('shopify:catalog', CATALOG_CACHE_TTL_SECONDS, fetchCatalog);
  },

  /** Ürün sayfası — kısa TTL: PRODUCT_CACHE_TTL_SECONDS (varsayılan 60 sn). */
  async getProductByHandle(handle) {
    return cached(`shopify:product:${handle}`, PRODUCT_CACHE_TTL_SECONDS, async () => {
      const q = /* GraphQL */ `
        ${PRODUCT_FIELDS}
        query Product($handle: String!, $country: CountryCode, $language: LanguageCode)
        @inContext(country: $country, language: $language) {
          product(handle: $handle) { ...ProductFields }
        }`;
      const data = await storefront(q, { handle, ...ctx() });
      if (!data.product) return null;
      const { categories } = await getCollectionsData();
      return mapShopifyProduct(data.product, { order: 0, categories });
    });
  },

  /** Sepet doğrulaması — ÖNBELLEKSİZ, güncel fiyat ve stok. */
  async getProductsByVariantIds(ids) {
    const valid = ids.filter((id) => /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(id)).slice(0, 100);
    if (!valid.length) return [];
    const q = /* GraphQL */ `
      ${PRODUCT_FIELDS}
      query Variants($ids: [ID!]!, $country: CountryCode, $language: LanguageCode)
      @inContext(country: $country, language: $language) {
        nodes(ids: $ids) { ... on ProductVariant { id product { ...ProductFields } } }
      }`;
    const data = await storefront(q, { ids: valid, ...ctx() });
    const { categories } = await getCollectionsData();
    return data.nodes.filter(Boolean).map((n) => mapShopifyProduct(n.product, { order: 0, categories }));
  },

  async getCategories() {
    const [{ categories }, products] = await Promise.all([getCollectionsData(), this.getAllProducts()]);
    return categories.map((c) => ({
      ...c,
      productCount: products.filter((p) => p.categoryPaths.some((x) => x === c.path || x.startsWith(c.path + '/'))).length,
    }));
  },

  async getCollections() {
    const [{ collections }, products] = await Promise.all([getCollectionsData(), this.getAllProducts()]);
    return collections.map((c) => ({ ...c, productCount: products.filter((p) => p.collections.includes(c.handle)).length }));
  },

  /**
   * Storefront Cart API ile sepet oluşturur ve Shopify Checkout adresini döndürür.
   * Ödeme (PayTR dahil) Shopify Checkout'ta, Shopify'da etkinleştirilen ödeme yöntemiyle alınır.
   * @param {import('../types.js').CartLineInput[]} lines
   */
  async createCheckout(lines, { buyerIp } = {}) {
    const q = /* GraphQL */ `
      mutation CartCreate($input: CartInput!, $country: CountryCode, $language: LanguageCode)
      @inContext(country: $country, language: $language) {
        cartCreate(input: $input) {
          cart { id checkoutUrl totalQuantity cost { totalAmount { amount currencyCode } } }
          userErrors { field message code }
          warnings { code message target }
        }
      }`;
    const input = {
      lines: lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity })),
      buyerIdentity: { countryCode: SHOPIFY_COUNTRY },
    };
    const data = await storefront(q, { input, ...ctx() }, { buyerIp });
    const r = data.cartCreate;
    if (r.userErrors?.length) {
      return { ok: false, message: r.userErrors.map((e) => e.message).join(' '), errors: r.userErrors };
    }
    if (!r.cart?.checkoutUrl) return { ok: false, message: 'Shopify sepet adresi döndürmedi.' };
    return { ok: true, checkoutUrl: r.cart.checkoutUrl, warnings: r.warnings ?? [] };
  },

  async health() {
    const data = await storefront(`{ shop { name } }`);
    return { ok: true, shop: data.shop?.name };
  },
};
