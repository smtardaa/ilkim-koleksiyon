// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// Yayın adresi: GitHub Pages proje sitesi https://smtardaa.github.io/ilkim-koleksiyon/
// Özel alan adına geçilirse SITE_URL ve BASE_PATH ortam değişkenleriyle
// değiştirilebilir (ör. SITE_URL=https://www.ornek.com, BASE_PATH=/).
const site = env.SITE_URL || 'https://smtardaa.github.io';
const base = env.BASE_PATH || '/ilkim-koleksiyon';

// Yerel önizleme her zaman 5500 portunda açılır. Port doluysa Vite başka bir
// porta kaymaz; hata vererek durur (strictPort).
const PORT = 5500;

/**
 * `npm run dev` sırasında http://localhost:5500/ adresine gelen isteği site
 * alt yoluna (/ilkim-koleksiyon/) yönlendirir. Yalnızca geliştirme sunucusunu
 * etkiler; build çıktısına girmez. (`astro preview` kendi statik sunucusunu
 * kullandığı için orada adres doğrudan /ilkim-koleksiyon/ ile açılmalıdır.)
 */
function redirectRootToBase() {
  const target = `${base.replace(/\/+$/, '')}/`;
  const handle = (req, res, next) => {
    // Astro'nun base katmanı req.url'den alt yolu siler; ham isteğe bakılır.
    const raw = (req.originalUrl ?? req.url ?? '').split('?')[0];
    if (target !== '/' && (raw === '/' || raw === '/index.html')) {
      res.statusCode = 302;
      res.setHeader('Location', target);
      res.end();
      return;
    }
    next();
  };
  // Astro kendi base katmanını yığının başına ekler; bu katman ondan da önce
  // çalışmalı, yoksa "/" isteği Astro'nun 404 sayfasına düşer.
  const putFirst = (server) => () => server.middlewares.stack.unshift({ route: '', handle });
  return {
    name: 'ilkim:redirect-root-to-base',
    enforce: 'post',
    configureServer: putFirst,
  };
}

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  server: { port: PORT, host: 'localhost' },
  vite: {
    plugins: [redirectRootToBase()],
    server: { strictPort: true },
    preview: { strictPort: true },
  },
  integrations: [sitemap({ filter: (page) => !page.includes('/sepet') })],
});
