// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';

// SITE_URL yalnızca canonical, Open Graph ve sitemap mutlak adresleri için kullanılır.
// Gerçek alan adı belli olunca .env içinde ayarlanır.
const SITE_URL = process.env.SITE_URL || 'http://localhost:5500';
const siteOrigin = new URL(SITE_URL);
// Ters vekil arkasında X-Forwarded-* başlıklarına yalnızca izin verilen alan adı için güvenilir.
// Yerel geliştirmede gerekmez.
const allowedDomains = /^(localhost|127\.0\.0\.1)$/.test(siteOrigin.hostname)
  ? []
  : [{ hostname: siteOrigin.hostname, protocol: siteOrigin.protocol.replace(':', '') }];

export default defineConfig({
  site: SITE_URL,
  // Ürün/kategori/arama sayfaları istek anında sunucuda oluşturulur.
  // Bilgi sayfaları kendi dosyalarında `export const prerender = true` ile statik üretilir.
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'never',
  server: { port: 5500, host: '127.0.0.1' },
  security: { checkOrigin: true, allowedDomains },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
  // Oturum (session) henüz kullanılmıyor; yönetim paneli girişi geldiğinde ele alınacak.
  session: false,
  env: {
    // Bütün değişkenler `access: 'secret'` ile tanımlıdır: Astro bunları derlemeye gömmez, sunucu
    // ÇALIŞMA ANINDA ortamdan okur (veri kaynağı ve indeksleme ayarı yeniden derleme gerektirmez).
    // Bu, hepsinin gizli olduğu anlamına gelmez; gerçekten gizli olanlar .env.example'da belirtilmiştir.
    // Not: derlenmiş sunucu .env dosyasını okumaz; değerler barındırma ortamının değişkenlerinden verilmelidir.
    schema: {
      SITE_URL: envField.string({ context: 'server', access: 'secret', default: 'http://localhost:5500' }),
      DATA_SOURCE: envField.enum({ context: 'server', access: 'secret', values: ['local'], default: 'local' }),
      SITE_INDEXING: envField.enum({ context: 'server', access: 'secret', values: ['off', 'on'], default: 'off' }),
      SOLD_PRODUCTS_VISIBILITY: envField.enum({ context: 'server', access: 'secret', values: ['visible', 'unlisted', 'hidden'], default: 'visible' }),
    },
  },
});
