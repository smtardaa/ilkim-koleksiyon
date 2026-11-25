/**
 * PANEL İŞ KURALLARI — doğrulama, benzersiz adres, ilişkili kayıtların güncellenmesi.
 * Depoya yalnızca depo arayüzüyle (putProduct, putCountry …) yazar; bu yüzden MySQL deposuna
 * geçildiğinde bu dosya değişmez.
 */
import { buildSpecs } from '../specs.js';
import { slugify } from '../slug.js';

export const STATUS_LABELS = { in_stock: 'Satışta', out_of_stock: 'Stokta yok', sold: 'Satıldı' };
export const KIND_LABELS = {
  madeni: 'Madeni para', banknot: 'Kâğıt para (banknot)', set: 'Set', madalya: 'Madalya / madalyon',
  malzeme: 'Nümismatik malzeme', obje: 'Obje', pul: 'Pul / efemera', antika: 'Antika',
};
export const MAX_IMAGES = 12;

const str = (v) => (v == null ? '' : String(v)).replace(/\r\n/g, '\n').trim();

/** “1.250,50” · “1250.50” · “1250” · “₺1.250” → 1250.5; geçersizse null */
export function parseMoney(input) {
  let s = str(input).replace(/[₺\s]|TL/gi, '');
  if (!s) return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Number(s);
}

export const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Düz metin → güvenli HTML paragraflar (boş satır = yeni paragraf) */
export function textToHtml(text) {
  const t = str(text);
  if (!t) return null;
  return t.split(/\n{2,}/).map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');
}

export function uniqueHandle(base, taken) {
  const root = slugify(base) || 'urun';
  let h = root;
  for (let i = 2; taken.has(h); i++) h = `${root}-${i}`;
  return h;
}

export const newId = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/**
 * Ürün formunu doğrular ve ortak Product modelini üretir (src/lib/types.js).
 * @param {Record<string, any>} f — form alanları (collections: string[])
 * @param {{ products:any[], categories:any[], countries:any[], collections:any[] }} snap
 * @param {{ existing?: any, images: any[], now?: Date }} ctx
 */
export function buildProduct(f, snap, { existing = null, images = [], now = new Date() } = {}) {
  const errors = {};
  const title = str(f.title);
  if (!title) errors.title = 'Ürün adı zorunludur.';
  else if (title.length > 200) errors.title = 'En fazla 200 karakter.';

  const price = parseMoney(f.price);
  if (price == null) errors.price = 'Geçerli bir fiyat girin (ör. 1250 veya 1.250,50).';

  const sku = str(f.sku) || null;
  if (sku && sku.length > 60) errors.sku = 'En fazla 60 karakter.';
  else if (sku && snap.products.some((p) => p.sku?.toLowerCase() === sku.toLowerCase() && p.id !== existing?.id)) {
    errors.sku = 'Bu ürün kodu başka bir üründe kullanılıyor.';
  }

  const status = ['in_stock', 'out_of_stock', 'sold'].includes(f.status) ? f.status : 'in_stock';

  const top = snap.categories.filter((c) => !c.parent);
  const category = top.find((c) => c.path === str(f.category));
  if (!category) errors.category = 'Bir kategori seçin.';

  const countrySlug = str(f.country) || null;
  const country = countrySlug ? snap.countries.find((c) => c.slug === countrySlug) : null;
  if (countrySlug && !country) errors.country = 'Listede olmayan ülke.';
  if (category?.countries && !country) errors.country = 'Bu kategoride ülke seçimi zorunludur.';

  const known = new Set(snap.collections.map((c) => c.handle));
  const collections = [...new Set([].concat(f.collections ?? []).map(str))].filter((h) => known.has(h));

  const summary = str(f.summary);
  if (summary.length > 300) errors.summary = 'En fazla 300 karakter.';
  const description = str(f.description);
  if (description.length > 8000) errors.description = 'En fazla 8000 karakter.';

  for (const [k, label] of [['yearFrom', 'Yıl'], ['yearTo', 'Bitiş yılı'], ['emission', 'Emisyon'], ['certGrade', 'Not']]) {
    if (str(f[k]) && !/^\d+([.,]\d+)?$/.test(str(f[k]))) errors[k] = `${label} yalnızca sayı olmalı.`;
  }
  if (str(f.denominationValue) && !/^\d+([.,]\d+)?$/.test(str(f.denominationValue))) errors.denominationValue = 'Değer yalnızca sayı olmalı.';
  if (str(f.denominationValue) && !str(f.denominationUnit)) errors.denominationUnit = 'Birimi de yazın (ör. Lira, Kuruş, Mark).';

  if (images.length > MAX_IMAGES) errors.images = `En fazla ${MAX_IMAGES} görsel eklenebilir.`;

  if (Object.keys(errors).length) return { ok: false, errors };

  const specs = buildSpecs({
    kind: str(f.kind) || null,
    country: country?.name ?? null,
    yearFrom: str(f.yearFrom), yearTo: str(f.yearTo), calendar: f.calendar, yearText: str(f.yearText),
    denominationValue: str(f.denominationValue), denominationUnit: str(f.denominationUnit),
    emission: str(f.emission), ruler: str(f.ruler), period: str(f.period),
    condition: str(f.condition), conditionScale: str(f.conditionScale),
    catalogNumber: str(f.catalogNumber),
    certService: str(f.certService), certGrade: str(f.certGrade), certNumber: str(f.certNumber),
    metal: str(f.metal),
  });
  if (country) specs.countrySlug = country.slug; // ülke sayfası adresiyle birebir aynı olsun

  const categoryPaths = [category.path, ...(category.countries && country ? [`${category.path}/${country.slug}`] : [])];
  const taken = new Set(snap.products.filter((p) => p.id !== existing?.id).map((p) => p.handle));
  const iso = now.toISOString();

  return {
    ok: true,
    product: {
      id: existing?.id ?? newId(),
      handle: existing?.handle ?? uniqueHandle(title, taken),
      title,
      summary,
      description, // panelde düzenlemek için ham metin
      descriptionHtml: textToHtml(description),
      sku,
      categoryPaths,
      primaryCategory: categoryPaths.at(-1),
      collections,
      price: { amount: price, currencyCode: 'TRY' },
      compareAtPrice: null,
      availability: { status, availableForSale: status === 'in_stock', quantity: null },
      images: images.map((im) => ({ ...im, alt: im.alt || title })),
      specs,
      published: f.published === true || f.published === 'on' || f.published === '1',
      createdAt: existing?.createdAt ?? iso,
      updatedAt: iso,
      order: existing?.order ?? Math.max(0, ...snap.products.map((p) => p.order ?? 0)) + 1,
      seoTitle: str(f.seoTitle) || null,
      seoDescription: str(f.seoDescription) || null,
      deliveryNote: str(f.deliveryNote) || null,
    },
  };
}

/** Ürünü forma geri yüklemek için düz alanlar (düzenleme penceresi) */
export function productToForm(p) {
  const s = p.specs ?? {};
  const top = p.categoryPaths?.[0] ?? '';
  return {
    id: p.id, handle: p.handle, title: p.title, sku: p.sku ?? '', price: String(p.price?.amount ?? ''),
    status: p.availability?.status ?? 'in_stock', published: p.published !== false,
    category: top, country: s.countrySlug ?? '', collections: p.collections ?? [],
    summary: p.summary ?? '', description: p.description ?? '',
    kind: s.kind ?? '', yearFrom: s.yearFrom ?? '', yearTo: s.yearTo ?? '', calendar: s.calendar ?? 'miladi', yearText: s.yearText ?? '',
    denominationValue: s.denomination?.value ?? '', denominationUnit: s.denomination?.unit ?? '',
    emission: s.emission ?? '', ruler: s.ruler ?? '', period: s.period ?? '',
    condition: s.condition?.label ?? '', conditionScale: s.condition?.scale ?? '',
    catalogNumber: s.catalogNumber ?? '', certService: s.certification?.service ?? '', certGrade: s.certification?.grade ?? '',
    certNumber: s.certification?.label ?? '', metal: s.metal ?? '',
    seoTitle: p.seoTitle ?? '', seoDescription: p.seoDescription ?? '', deliveryNote: p.deliveryNote ?? '',
    images: (p.images ?? []).map((im) => ({ src: im.src, srcSmall: im.srcSmall ?? im.src, alt: im.alt ?? '' })),
  };
}

/* ------------------------------------------------------------------ ÜLKE */

/** @returns {{ok:true, country, previousSlug} | {ok:false, error}} */
export function validateCountry(f, countries) {
  const name = str(f.name);
  const previousSlug = str(f.previousSlug) || null;
  if (!name) return { ok: false, error: 'Ülke adı zorunludur.' };
  if (name.length > 80) return { ok: false, error: 'Ülke adı en fazla 80 karakter olmalı.' };
  const slug = slugify(name);
  if (!slug) return { ok: false, error: 'Ülke adından adres üretilemedi; harf içeren bir ad yazın.' };
  const clash = countries.find((c) => (c.slug === slug || c.name.toLocaleLowerCase('tr') === name.toLocaleLowerCase('tr')) && c.slug !== previousSlug);
  if (clash) return { ok: false, error: `“${clash.name}” zaten listede.` };
  if (previousSlug && !countries.some((c) => c.slug === previousSlug)) return { ok: false, error: 'Düzenlenen ülke bulunamadı.' };
  return { ok: true, country: { slug, name }, previousSlug };
}

/** Ülke ekler/yeniden adlandırır; adı değişen ülkenin ürünleri de güncellenir. */
export async function saveCountry(store, f) {
  const snap = await store.getSnapshot();
  const v = validateCountry(f, snap.countries);
  if (!v.ok) return v;
  await store.putCountry(v.country, v.previousSlug ?? v.country.slug);
  if (v.previousSlug) {
    for (const p of snap.products.filter((x) => x.specs?.countrySlug === v.previousSlug)) {
      await store.putProduct({
        ...p,
        categoryPaths: p.categoryPaths.map((c) => c.replace(new RegExp(`/${v.previousSlug}$`), `/${v.country.slug}`)),
        primaryCategory: p.primaryCategory?.replace(new RegExp(`/${v.previousSlug}$`), `/${v.country.slug}`) ?? null,
        specs: { ...p.specs, country: v.country.name, countrySlug: v.country.slug },
      });
    }
  }
  return { ok: true, country: v.country, renamed: Boolean(v.previousSlug) };
}

export async function deleteCountry(store, slug) {
  const snap = await store.getSnapshot();
  const c = snap.countries.find((x) => x.slug === slug);
  if (!c) return { ok: false, error: 'Ülke bulunamadı.' };
  const used = snap.products.filter((p) => p.specs?.countrySlug === slug).length;
  if (used) return { ok: false, error: `“${c.name}” ${used} üründe kullanılıyor; önce o ürünlerin ülkesini değiştirin.` };
  await store.removeCountry(slug);
  return { ok: true, country: c };
}

/* -------------------------------------------------------------- KATEGORİ */

export async function saveCategory(store, f) {
  const snap = await store.getSnapshot();
  const cat = snap.categories.find((c) => c.path === str(f.path) && !c.parent);
  if (!cat) return { ok: false, error: 'Kategori bulunamadı.' };
  const title = str(f.title);
  if (!title || title.length > 80) return { ok: false, error: 'Kategori adı 1–80 karakter olmalı.' };
  const description = str(f.description);
  if (description.length > 400) return { ok: false, error: 'Açıklama en fazla 400 karakter olmalı.' };
  const sort = Number(str(f.sort));
  if (!Number.isInteger(sort) || sort < 0 || sort > 999) return { ok: false, error: 'Sıra 0–999 arasında tam sayı olmalı.' };
  const src = str(f.imageSrc);
  if (src && !/^https:\/\/\S+$/.test(src) && !/^\/medya\/[\w.-]+$/.test(src)) return { ok: false, error: 'Görsel adresi https:// ile başlamalı.' };
  const credit = { author: str(f.creditAuthor), license: str(f.creditLicense), licenseUrl: str(f.creditLicenseUrl), sourceUrl: str(f.creditSourceUrl) };
  for (const u of [credit.licenseUrl, credit.sourceUrl]) if (u && !/^https:\/\/\S+$/.test(u)) return { ok: false, error: 'Lisans ve kaynak bağlantıları https:// ile başlamalı.' };
  const hasCredit = Object.values(credit).some(Boolean);
  await store.putCategory({
    ...cat,
    title,
    description: description || null,
    sort,
    image: src ? { src, alt: '', ...(hasCredit ? { credit } : {}) } : null,
  });
  return { ok: true, category: { ...cat, title } };
}

/* ---------------------------------------------------------------- SEÇKİ */

export async function saveCollection(store, f) {
  const snap = await store.getSnapshot();
  const title = str(f.title);
  if (!title || title.length > 80) return { ok: false, error: 'Seçki adı 1–80 karakter olmalı.' };
  const description = str(f.description);
  if (description.length > 400) return { ok: false, error: 'Açıklama en fazla 400 karakter olmalı.' };
  const handle = str(f.handle);
  const existing = handle ? snap.collections.find((c) => c.handle === handle) : null;
  if (handle && !existing) return { ok: false, error: 'Seçki bulunamadı.' };
  const taken = new Set(snap.collections.map((c) => c.handle));
  const collection = { ...(existing ?? {}), handle: existing?.handle ?? uniqueHandle(title, taken), title, description: description || null };
  await store.putCollection(collection);
  // Seçkideki ürünler (işaretlenen kutular) — yalnızca formda liste gönderildiyse
  if (f.members !== undefined) {
    const members = new Set([].concat(f.members ?? []).map(str));
    for (const p of snap.products) {
      const has = p.collections?.includes(collection.handle);
      const want = members.has(p.id);
      if (has !== want) {
        await store.putProduct({ ...p, collections: want ? [...(p.collections ?? []), collection.handle] : p.collections.filter((h) => h !== collection.handle) });
      }
    }
  }
  return { ok: true, collection };
}

export async function deleteCollection(store, handle) {
  const snap = await store.getSnapshot();
  const c = snap.collections.find((x) => x.handle === handle);
  if (!c) return { ok: false, error: 'Seçki bulunamadı.' };
  for (const p of snap.products.filter((x) => x.collections?.includes(handle))) {
    await store.putProduct({ ...p, collections: p.collections.filter((h) => h !== handle) });
  }
  await store.removeCollection(handle);
  return { ok: true, collection: c };
}

/* ----------------------------------------------------------------- ÜRÜN */

export async function setPublished(store, id, published) {
  const snap = await store.getSnapshot();
  const p = snap.products.find((x) => x.id === id);
  if (!p) return { ok: false, error: 'Ürün bulunamadı.' };
  await store.putProduct({ ...p, published, updatedAt: new Date().toISOString() });
  return { ok: true, product: p };
}

export async function deleteProduct(store, id) {
  const snap = await store.getSnapshot();
  const p = snap.products.find((x) => x.id === id);
  if (!p) return { ok: false, error: 'Ürün bulunamadı.' };
  await store.removeProduct(id);
  return { ok: true, product: p };
}
