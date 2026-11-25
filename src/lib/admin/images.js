/**
 * Ürün görseli yükleme: sharp ile döndürme düzeltmesi, WebP'ye çevirme, büyük (1600px) ve
 * küçük (480px) boyut üretimi. Dosyalar UPLOADS_DIR klasörüne yazılır ve /medya/{ad} adresinden sunulur.
 * MySQL'e geçişte değişmez (veritabanında yalnızca adres tutulur).
 */
import sharp from 'sharp';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const FORMATS = new Set(['jpeg', 'png', 'webp', 'avif', 'heif', 'tiff', 'gif']);
export const MEDIA_NAME = /^[a-z0-9-]+\.webp$/;

/**
 * @param {File} file
 * @param {string} uploadsDir
 * @returns {Promise<{ ok: true, image: {src, srcSmall, width, height, alt} } | { ok: false, error: string }>}
 */
export async function saveUpload(file, uploadsDir) {
  if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) return { ok: false, error: 'Boş dosya.' };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: `“${file.name}” 15 MB'tan büyük.` };
  const buf = Buffer.from(await file.arrayBuffer());
  let meta;
  try { meta = await sharp(buf).metadata(); } catch { return { ok: false, error: `“${file.name}” bir görsel dosyası değil.` }; }
  if (!FORMATS.has(meta.format)) return { ok: false, error: `“${file.name}” desteklenmeyen biçimde (JPEG, PNG, WebP, AVIF, HEIC kabul edilir).` };

  await mkdir(uploadsDir, { recursive: true });
  const base = `${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`;
  const large = await sharp(buf).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const small = await sharp(buf).rotate().resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78 }).toBuffer();
  await writeFile(path.join(uploadsDir, `${base}-b.webp`), large.data);
  await writeFile(path.join(uploadsDir, `${base}-k.webp`), small);
  return {
    ok: true,
    image: { src: `/medya/${base}-b.webp`, srcSmall: `/medya/${base}-k.webp`, width: large.info.width, height: large.info.height, alt: '' },
  };
}

/** Artık kullanılmayan yüklenmiş görsel dosyalarını siler (yalnızca /medya/ altındakiler). */
export async function removeUploads(images, uploadsDir) {
  for (const im of images ?? []) {
    for (const src of [im.src, im.srcSmall]) {
      const name = typeof src === 'string' && src.startsWith('/medya/') ? src.slice(7) : null;
      if (name && MEDIA_NAME.test(name)) await unlink(path.join(uploadsDir, name)).catch(() => {});
    }
  }
}
