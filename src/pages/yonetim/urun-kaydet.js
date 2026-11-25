/**
 * Ürün ekle/düzenle — ürün penceresindeki form buraya gönderilir (fetch, JSON yanıt).
 * Görseller: `mevcutGorsel` (sıralı, korunacak eski görsellerin adresleri) + `yeniGorsel` dosyaları.
 */
import { getStore } from '../../lib/store/index.js';
import { buildProduct, MAX_IMAGES } from '../../lib/admin/service.js';
import { readAdminForm, formToObject } from '../../lib/admin/request.js';
import { saveUpload, removeUploads } from '../../lib/admin/images.js';
import { uploadsDir } from '../../config/site.js';
import path from 'node:path';

export const prerender = false;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8' },
});

export async function POST(ctx) {
  const r = await readAdminForm(ctx);
  if (!r.ok) return json({ ok: false, error: r.error }, r.status);
  const form = r.form;
  const f = formToObject(form, ['collections', 'mevcutGorsel', 'mevcutAlt']);
  const store = getStore();
  const snap = await store.getSnapshot();
  const existing = f.id ? snap.products.find((p) => p.id === f.id) : null;
  if (f.id && !existing) return json({ ok: false, error: 'Düzenlenen ürün bulunamadı (silinmiş olabilir).' }, 404);

  // Korunan eski görseller, formdaki sırayla
  const old = existing?.images ?? [];
  const kept = f.mevcutGorsel.map((src, i) => {
    const im = old.find((x) => x.src === src);
    return im ? { ...im, alt: String(f.mevcutAlt[i] ?? '').trim().slice(0, 200) } : null;
  }).filter(Boolean);
  const files = form.getAll('yeniGorsel').filter((x) => typeof x === 'object' && x.size > 0);
  if (kept.length + files.length > MAX_IMAGES) {
    return json({ ok: false, errors: { images: `En fazla ${MAX_IMAGES} görsel eklenebilir.` } }, 422);
  }

  // Önce metin alanlarını doğrula (görselleri boşuna işlememek için)
  const dry = buildProduct(f, snap, { existing, images: kept });
  if (!dry.ok) return json({ ok: false, errors: dry.errors }, 422);

  const dir = path.resolve(uploadsDir);
  const added = [];
  for (const file of files) {
    const up = await saveUpload(file, dir);
    if (!up.ok) {
      await removeUploads(added, dir);
      return json({ ok: false, errors: { images: up.error } }, 422);
    }
    added.push(up.image);
  }

  const built = buildProduct(f, snap, { existing, images: [...kept, ...added] });
  if (!built.ok) { await removeUploads(added, dir); return json({ ok: false, errors: built.errors }, 422); }
  await store.putProduct(built.product);
  // Formdan çıkarılan eski görsellerin dosyaları silinir
  await removeUploads(old.filter((im) => !kept.some((k) => k.src === im.src)), dir);

  return json({
    ok: true,
    message: existing ? `“${built.product.title}” güncellendi.` : `“${built.product.title}” eklendi.`,
    redirect: `/yonetim?tamam=${encodeURIComponent(existing ? 'Ürün güncellendi.' : 'Ürün eklendi.')}#urunler`,
  });
}
