// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';

// SITE_URL yalnızca canonical, Open Graph ve sitemap mutlak adresleri için kullanılır.
// Gerçek alan adı belli olunca .env içinde ayarlanır.
const SITE_URL = process.env.SITE_URL || 'http://localhost:5500';

export default defineConfig({
  site: SITE_URL,
  // Ürün/kategori/arama sayfaları istek anında sunucuda oluşturulur.
  // Bilgi sayfaları kendi dosyalarında `export const prerender = true` ile statik üretilir.
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'never',
  server: { port: 5500, host: '127.0.0.1' },
  security: { checkOrigin: true },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
  // Oturum (session) kullanılmıyor: sepet ve favoriler tarayıcıda tutulur.
  session: false,
  image: {
    // Demo görselleri derleme öncesinde scripts/build-demo-images.mjs ile WebP'ye çevrilir.
    // Shopify görselleri Shopify CDN'den width parametresiyle istenir.
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.shopify.com' }],
  },
  env: {
    // Bütün değişkenler `access: 'secret'` ile tanımlıdır: Astro bunları derlemeye gömmez, sunucu
    // ÇALIŞMA ANINDA ortamdan okur (mod, indeksleme ve Shopify ayarı yeniden derleme gerektirmez).
    // Bu, hepsinin gizli olduğu anlamına gelmez; gerçekten gizli olanlar .env.example'da belirtilmiştir.
    // Not: derlenmiş sunucu .env dosyasını okumaz; değerler barındırma ortamının değişkenlerinden verilmelidir.
    schema: {
      SITE_URL: envField.string({ context: 'server', access: 'secret', default: 'http://localhost:5500' }),
      STORE_MODE: envField.enum({ context: 'server', access: 'secret', values: ['demo', 'shopify'], default: 'demo' }),
      SITE_INDEXING: envField.enum({ context: 'server', access: 'secret', values: ['off', 'on'], default: 'off' }),
      SOLD_PRODUCTS_VISIBILITY: envField.enum({ context: 'server', access: 'secret', values: ['visible', 'unlisted', 'hidden'], default: 'visible' }),
      SHOPIFY_STORE_DOMAIN: envField.string({ context: 'server', access: 'secret', optional: true }),
      SHOPIFY_API_VERSION: envField.string({ context: 'server', access: 'secret', default: '2026-10' }),
      SHOPIFY_STOREFRONT_PUBLIC_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      SHOPIFY_STOREFRONT_PRIVATE_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      SHOPIFY_WEBHOOK_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      SHOPIFY_COUNTRY: envField.string({ context: 'server', access: 'secret', default: 'TR' }),
      SHOPIFY_LANGUAGE: envField.string({ context: 'server', access: 'secret', default: 'TR' }),
      CATALOG_CACHE_TTL_SECONDS: envField.number({ context: 'server', access: 'secret', default: 300 }),
      PRODUCT_CACHE_TTL_SECONDS: envField.number({ context: 'server', access: 'secret', default: 60 }),
    },
  },
});
