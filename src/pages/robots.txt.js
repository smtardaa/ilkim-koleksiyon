/**
 * robots.txt. Demo modunda (PUBLIC_ALLOW_INDEXING != "true") tüm sayfalar
 * zaten <meta name="robots" content="noindex"> taşır; tarayıcıların bu
 * etiketi görebilmesi için burada tarama engellenmez.
 */
import { url } from '../lib/paths.js';

export function GET({ site }) {
  const allow = import.meta.env.PUBLIC_ALLOW_INDEXING === 'true';
  const lines = ['User-agent: *'];
  if (allow) {
    lines.push('Allow: /', `Disallow: ${url('/sepet/')}`);
    if (site) lines.push(`Sitemap: ${new URL(url('/sitemap-index.xml'), site).href}`);
  } else {
    lines.push('# Demo: sayfalar noindex meta etiketiyle indekslemeye kapalıdır.', 'Allow: /');
  }
  return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
