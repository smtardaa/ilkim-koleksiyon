// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// Gerçek domain bilinmediği için uydurulmaz. SITE_URL tanımlıysa canonical,
// Open Graph URL'leri ve sitemap üretilir; tanımlı değilse bunlar atlanır.
const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const site = env.SITE_URL || undefined;

// Yerel önizleme her zaman http://localhost:5500 adresinde açılır. Port
// doluysa Vite başka bir porta kaymaz; hata vererek durur (strictPort).
const PORT = 5500;

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  server: { port: PORT, host: 'localhost' },
  vite: {
    server: { strictPort: true },
    preview: { strictPort: true },
  },
  integrations: site
    ? [sitemap({ filter: (page) => !page.includes('/sepet') })]
    : [],
});
