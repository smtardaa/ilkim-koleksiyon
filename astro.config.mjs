// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';

// SITE_URL yalnızca canonical, Open Graph ve sitemap mutlak adresleri için kullanılır.
// Gerçek alan adı belli olunca .env içinde ayarlanır.
const SITE_URL = process.env.SITE_URL || 'http://localhost:5500';
const siteOrigin = new URL(SITE_URL);
// Ters vekil arkasında X-Forwarded-* başlıklarına yalnızca izin verilen alan adı için güvenilir.
// Yerel geliştirmede gerekmez.
// Bu liste yönetim panelindeki form gönderimleri için de gereklidir: Astro, adresi listede olmayan
// isteklerde kökeni “localhost” sayar ve formu “Cross-site POST” diye reddeder.
// Alan adının www'li ve www'siz biçimi birlikte eklenir (ziyaretçi hangisiyle gelirse gelsin panel çalışsın).
const isLocal = /^(localhost|127\.0\.0\.1)$/.test(siteOrigin.hostname);
const bareHost = siteOrigin.hostname.replace(/^www\./, '');
const allowedDomains = isLocal
  ? [{ hostname: 'localhost' }, { hostname: '127.0.0.1' }]
  : [bareHost, `www.${bareHost}`].map((hostname) => ({ hostname, protocol: siteOrigin.protocol.replace(':', '') }));

export default defineConfig({
  site: SITE_URL,
  // Ürün/kategori/arama sayfaları istek anında sunucuda oluşturulur.
  // Bilgi sayfaları kendi dosyalarında `export const prerender = true` ile statik üretilir.
  output: 'server',
  // İstek gövdesi sınırı: ürün başına en fazla 12 görsel × 15 MB (src/lib/admin/images.js)
  adapter: node({ mode: 'standalone', bodySizeLimit: 200 * 1024 * 1024 }),
  trailingSlash: 'never',
  server: { port: 5500, host: '127.0.0.1' },
  security: { checkOrigin: true, allowedDomains },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
  // Astro oturumu kullanılmaz: yönetim paneli girişi imzalı, durumsuz bir çerezle yapılır (src/lib/admin/auth.js).
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
      // Panelden girilen veri ve yüklenen görseller: derleme klasörünün DIŞINDA kalıcı klasörler.
      DATA_DIR: envField.string({ context: 'server', access: 'secret', default: './storage/veri' }),
      UPLOADS_DIR: envField.string({ context: 'server', access: 'secret', default: './storage/gorseller' }),
      // Yönetim paneli girişi (GİZLİ). Üçü de tanımlı değilse panel kapalı kalır.
      // Parola özeti ve anahtar `npm run admin:parola` ile üretilir.
      ADMIN_USERNAME: envField.string({ context: 'server', access: 'secret', optional: true }),
      ADMIN_PASSWORD_HASH: envField.string({ context: 'server', access: 'secret', optional: true }),
      SESSION_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
