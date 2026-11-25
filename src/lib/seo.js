/**
 * Yapılandırılmış veri (JSON-LD) üreticileri.
 * - Sahte puan/yorum/sertifika/adres eklenmez.
 * - Organization'a yalnızca dolu işletme alanları girer.
 * - Product/Offer fiyat ve stok değeri sayfada gösterilen güncel değerle aynıdır.
 */
import { business, filled, emailUrl } from '../config/business.js';
import { site, absoluteUrl } from '../config/site.js';
import { productUrl } from './catalog.js';

export function organizationLd() {
  const c = business.contact;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': absoluteUrl('/#organization'),
    name: business.brandName,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/brand/amblem-512.webp'),
  };
  if (filled(business.legal.companyTitle)) ld.legalName = business.legal.companyTitle;
  if (filled(c.phone)) ld.telephone = c.phone;
  if (emailUrl()) ld.email = c.email;
  if (filled(c.address) && filled(c.city)) {
    ld.address = {
      '@type': 'PostalAddress',
      streetAddress: c.address,
      addressLocality: c.district ?? undefined,
      addressRegion: c.city,
      postalCode: c.postalCode ?? undefined,
      addressCountry: 'TR',
    };
  }
  const same = Object.values(business.social).filter((u) => filled(u) && /^https:\/\//.test(u));
  if (same.length) ld.sameAs = same;
  return ld;
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    name: site.name,
    url: absoluteUrl('/'),
    inLanguage: 'tr-TR',
    publisher: { '@id': absoluteUrl('/#organization') },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: absoluteUrl('/arama?q={search_term_string}') },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** @param {{title:string, href:string}[]} items — ana sayfadan itibaren */
export function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.title,
      ...(it.href ? { item: absoluteUrl(it.href) } : {}),
    })),
  };
}

/** @param {import('./types.js').Product} p */
export function productLd(p, { categoryName } = {}) {
  const availability = p.availability.status === 'in_stock'
    ? 'https://schema.org/InStock'
    : p.availability.status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/OutOfStock';
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': absoluteUrl(productUrl(p) + '#product'),
    name: p.title,
    url: absoluteUrl(productUrl(p)),
    image: p.images.map((i) => absoluteUrl(i.src)).slice(0, 6),
    description: p.seoDescription || p.summary || undefined,
    sku: p.sku || undefined,
    category: categoryName || undefined,
    // Katalog fiyatı sayfada gösterilen fiyattır; satın alma WhatsApp üzerinden yapılır.
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(productUrl(p)),
      priceCurrency: p.price.currencyCode,
      price: p.price.amount.toFixed(2),
      availability,
      seller: { '@id': absoluteUrl('/#organization') },
    },
  };
  // itemCondition bilinçli olarak eklenmez: numizmatik kondisyon (ör. 10/10, PMG 58)
  // schema.org New/Used ayrımına güvenilir biçimde eşlenemez.
  return ld;
}

/** Boş listede şema üretilmez (null döner; Seo bileşeni boş değerleri atlar). */
export function itemListLd(products, name) {
  if (!products?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: absoluteUrl(productUrl(p)) })),
  };
}
