/** Panelden yüklenen ürün görsellerini UPLOADS_DIR klasöründen sunar. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { uploadsDir } from '../../config/site.js';
import { MEDIA_NAME } from '../../lib/admin/images.js';

export const prerender = false;

export async function GET({ params }) {
  const name = params.name ?? '';
  if (!MEDIA_NAME.test(name)) return new Response('Bulunamadı', { status: 404 });
  try {
    const data = await readFile(path.join(path.resolve(uploadsDir), name));
    return new Response(data, {
      headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  } catch {
    return new Response('Bulunamadı', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }
}
