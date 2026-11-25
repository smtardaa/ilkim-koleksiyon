/**
 * robots.txt — dinamik.
 * İndeksleme kapalıyken: tarama ENGELLENMEZ (Disallow: / kullanılmaz), çünkü engellenen sayfanın
 * noindex etiketi okunamaz. İndeksten uzak tutma işi sayfalardaki noindex meta etiketi ve
 * X-Robots-Tag başlığıyla yapılır. Sitemap satırı yalnızca indeksleme açıkken eklenir.
 */
import { indexingEnabled, absoluteUrl } from '../config/site.js';

export const prerender = false;

export function GET() {
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
  ];
  if (indexingEnabled) lines.push(`Sitemap: ${absoluteUrl('/sitemap.xml')}`);
  else lines.push('# İndeksleme kapalı (önizleme/staging): sayfalar noindex döner. Yayına geçiş: README → SEO.');
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
