/**
 * Ürün yapılandırılmış verisi (schema.org/Product). Yalnızca sayfada
 * görünen gerçek alanlar kullanılır; puan veya yorum eklenmez.
 * Mutlak URL gerektiren alanlar yalnızca SITE_URL tanımlıysa eklenir.
 */
import { productUrl } from './catalog.js';
import { getCategory } from '../config/categories.js';

export function productJsonLd(product, site) {
  const abs = (path) => (site ? new URL(path, site).href : undefined);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.summary,
    sku: product.id,
    image: site ? product.images.map((i) => abs(i.url)) : undefined,
    category: getCategory(product.category)?.name,
    offers: {
      '@type': 'Offer',
      price: product.price.amount.toFixed(2),
      priceCurrency: product.price.currencyCode,
      availability: product.availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      itemCondition: 'https://schema.org/UsedCondition',
      url: abs(productUrl(product)),
    },
  };
}
