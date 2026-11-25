/**
 * Yönetim paneli: depo, iş kuralları, Doldurulacaklar formu ve giriş güvenliği.
 * Depo testleri geçici bir klasörde çalışır; proje verisine dokunmaz.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { createFileStore } from '../src/lib/store/file-store.js';
import { buildProduct, parseMoney, textToHtml, saveCountry, deleteCountry, saveCategory, saveCollection, deleteCollection, productToForm } from '../src/lib/admin/service.js';
import { applyGroupForm, settingsProgress, parseHours, SETTINGS_FIELDS } from '../src/lib/admin/settings-schema.js';
import { hashPassword, verifyPassword, createSession, readSession, csrfToken, verifyCsrf, createLoginLimiter } from '../src/lib/admin/auth.js';

const read = (p) => JSON.parse(readFileSync(new URL(`../src/data/catalog/${p}`, import.meta.url), 'utf8'));
const seed = { products: [], categories: read('categories.json'), countries: read('countries.json'), collections: read('collections.json') };

async function tempStore() {
  const dir = await mkdtemp(path.join(tmpdir(), 'ik-store-'));
  return { dir, store: createFileStore({ dataDir: dir, seed }), cleanup: () => rm(dir, { recursive: true, force: true }) };
}

const baseForm = { title: 'Almanya 5 Mark 1936', price: '4.800', status: 'in_stock', published: '1', category: 'yabanci-madeni-paralar', country: 'almanya', collections: [] };

describe('Dosya deposu', () => {
  test('ilk açılışta başlangıç verisini kopyalar ve yazmalar kalıcıdır', async () => {
    const { dir, store, cleanup } = await tempStore();
    try {
      const s1 = await store.getSnapshot();
      assert.equal(s1.categories.length, 12);
      assert.deepEqual(s1.products, []);
      assert.deepEqual(s1.settings, {});
      const built = buildProduct(baseForm, s1, {});
      await store.putProduct(built.product);
      const s2 = await store.getSnapshot();
      assert.equal(s2.products.length, 1);
      assert.ok(s2.revision > s1.revision, 'her yazmada revision artar');
      // Yeni bir depo örneği aynı klasörden okuyunca veri yerinde
      const again = await createFileStore({ dataDir: dir, seed }).getSnapshot();
      assert.equal(again.products[0].title, 'Almanya 5 Mark 1936');
      assert.equal(JSON.parse(await readFile(path.join(dir, 'products.json'), 'utf8')).length, 1);
    } finally { await cleanup(); }
  });

  test('aynı anda gelen yazmalar birbirini ezmez', async () => {
    const { store, cleanup } = await tempStore();
    try {
      const snap = await store.getSnapshot();
      await Promise.all([1, 2, 3, 4, 5].map((i) => store.putProduct({ ...buildProduct({ ...baseForm, title: `Ürün ${i}` }, snap, {}).product, id: `x${i}` })));
      assert.equal((await store.getSnapshot()).products.length, 5);
    } finally { await cleanup(); }
  });
});

describe('Ürün kuralları', () => {
  const snap = { ...seed, products: [] };

  test('fiyat Türkçe yazımla okunur', () => {
    assert.equal(parseMoney('1.250,50'), 1250.5);
    assert.equal(parseMoney('4.800'), 4800);
    assert.equal(parseMoney('1250.5'), 1250.5);
    assert.equal(parseMoney('₺ 900'), 900);
    assert.equal(parseMoney('abc'), null);
    assert.equal(parseMoney(''), null);
  });

  test('geçerli form ortak ürün modelini üretir (ülke yolu, adres, durum)', () => {
    const r = buildProduct({ ...baseForm, sku: 'IK-0001', denominationValue: '5', denominationUnit: 'Mark', yearFrom: '1936', metal: 'Gümüş' }, snap, {});
    assert.ok(r.ok);
    const p = r.product;
    assert.deepEqual(p.categoryPaths, ['yabanci-madeni-paralar', 'yabanci-madeni-paralar/almanya']);
    assert.equal(p.primaryCategory, 'yabanci-madeni-paralar/almanya');
    assert.equal(p.handle, 'almanya-5-mark-1936');
    assert.equal(p.price.amount, 4800);
    assert.equal(p.specs.countrySlug, 'almanya');
    assert.equal(p.specs.denomination.label, '5 Mark');
    assert.equal(p.availability.availableForSale, true);
    assert.equal(p.published, true);
  });

  test('zorunlu alanlar ve yabancı kategoride ülke denetlenir', () => {
    const r = buildProduct({ title: '', price: 'x', category: 'yabanci-kagit-paralar' }, snap, {});
    assert.equal(r.ok, false);
    assert.ok(r.errors.title && r.errors.price && r.errors.country);
    const tc = buildProduct({ title: 'Gümüş 1 Lira', price: '100', category: 'tc-madeni-paralar' }, snap, {});
    assert.ok(tc.ok, 'T.C. kategorisinde ülke zorunlu değil');
    assert.deepEqual(tc.product.categoryPaths, ['tc-madeni-paralar']);
  });

  test('ürün kodu ve adres benzersizdir; düzenlemede adres korunur', () => {
    const first = buildProduct({ ...baseForm, sku: 'IK-1' }, snap, {}).product;
    const s = { ...snap, products: [first] };
    assert.equal(buildProduct({ ...baseForm, sku: 'ik-1' }, s, {}).errors.sku, 'Bu ürün kodu başka bir üründe kullanılıyor.');
    const second = buildProduct(baseForm, s, {}).product;
    assert.equal(second.handle, 'almanya-5-mark-1936-2');
    const edited = buildProduct({ ...baseForm, title: 'Yeni ad', sku: 'IK-1' }, s, { existing: first }).product;
    assert.equal(edited.handle, first.handle);
    assert.equal(edited.id, first.id);
    assert.equal(edited.createdAt, first.createdAt);
  });

  test('açıklama güvenli HTML olur; forma geri dönüş kayıpsız', () => {
    assert.equal(textToHtml('a <b>\nb\n\nc'), '<p>a &lt;b&gt;<br>b</p><p>c</p>');
    const p = buildProduct({ ...baseForm, description: 'Satır 1\n\nSatır 2', published: '' }, snap, {}).product;
    assert.equal(p.published, false);
    const f = productToForm(p);
    assert.equal(f.description, 'Satır 1\n\nSatır 2');
    assert.equal(f.country, 'almanya');
    assert.equal(f.category, 'yabanci-madeni-paralar');
  });
});

describe('Ülke, kategori, seçki', () => {
  test('ülke eklenir, aynısı reddedilir, ad değişince ürünler taşınır, kullanılan ülke silinmez', async () => {
    const { store, cleanup } = await tempStore();
    try {
      assert.equal((await saveCountry(store, { name: 'Almanya' })).ok, false);
      const add = await saveCountry(store, { name: 'Yeni Ülke' });
      assert.ok(add.ok);
      assert.ok((await store.getSnapshot()).countries.some((c) => c.slug === 'yeni-ulke'));
      const snap = await store.getSnapshot();
      await store.putProduct(buildProduct({ ...baseForm, country: 'yeni-ulke' }, snap, {}).product);
      assert.equal((await deleteCountry(store, 'yeni-ulke')).ok, false);
      assert.ok((await saveCountry(store, { previousSlug: 'yeni-ulke', name: 'Başka Ülke' })).ok);
      const after = await store.getSnapshot();
      assert.equal(after.products[0].specs.country, 'Başka Ülke');
      assert.deepEqual(after.products[0].categoryPaths, ['yabanci-madeni-paralar', 'yabanci-madeni-paralar/baska-ulke']);
      assert.ok(!after.countries.some((c) => c.slug === 'yeni-ulke'));
    } finally { await cleanup(); }
  });

  test('kategori güncellenir; geçersiz görsel adresi reddedilir', async () => {
    const { store, cleanup } = await tempStore();
    try {
      const bad = await saveCategory(store, { path: 'saat', title: 'Saat', sort: '11', imageSrc: 'javascript:alert(1)' });
      assert.equal(bad.ok, false);
      const ok = await saveCategory(store, { path: 'saat', title: 'Saatler', sort: '11', description: 'Cep ve kol saatleri', imageSrc: 'https://ornek.test/a.jpg' });
      assert.ok(ok.ok);
      const c = (await store.getSnapshot()).categories.find((x) => x.path === 'saat');
      assert.equal(c.title, 'Saatler');
      assert.equal(c.image.src, 'https://ornek.test/a.jpg');
      assert.equal((await store.getSnapshot()).categories.length, 12);
    } finally { await cleanup(); }
  });

  test('seçki oluşturulur, üyeleri atanır, silinince ürünlerden çıkar', async () => {
    const { store, cleanup } = await tempStore();
    try {
      const snap = await store.getSnapshot();
      const p = buildProduct(baseForm, snap, {}).product;
      await store.putProduct(p);
      const r = await saveCollection(store, { title: 'Nadir Banknotlar', description: '', members: [p.id] });
      assert.ok(r.ok);
      assert.equal(r.collection.handle, 'nadir-banknotlar');
      assert.deepEqual((await store.getSnapshot()).products[0].collections, ['nadir-banknotlar']);
      assert.ok((await deleteCollection(store, 'nadir-banknotlar')).ok);
      assert.deepEqual((await store.getSnapshot()).products[0].collections, []);
    } finally { await cleanup(); }
  });
});

describe('Doldurulacaklar', () => {
  const formOf = (o) => (k) => o[k] ?? '';

  test('geçerli değerler temizlenip kaydedilir, boşlar atılır', () => {
    const r = applyGroupForm('iletisim', formOf({ 'contact.whatsapp': '+90 555 000 00 00', 'contact.email': 'a@b.co', 'contact.openingHours': 'Pazartesi–Cuma: 10:00–18:00\nCumartesi: 11:00–16:00' }), {});
    assert.ok(r.ok);
    assert.equal(r.settings.contact.whatsapp, '905550000000');
    assert.equal(r.settings.contact.phone, undefined);
    assert.deepEqual(r.settings.contact.openingHours, [{ days: 'Pazartesi–Cuma', hours: '10:00–18:00' }, { days: 'Cumartesi', hours: '11:00–16:00' }]);
  });

  test('hatalı değer reddedilir ve girilen değer geri verilir', () => {
    const r = applyGroupForm('iletisim', formOf({ 'contact.whatsapp': '0555', 'contact.email': 'yok' }), {});
    assert.equal(r.ok, false);
    assert.ok(r.errors['contact.whatsapp'] && r.errors['contact.email']);
    assert.equal(r.values['contact.whatsapp'], '0555');
  });

  test('bir bölümü kaydetmek diğer bölümleri silmez; ilerleme sayılır', () => {
    const a = applyGroupForm('firma', formOf({ 'legal.companyTitle': 'Örnek Ltd.' }), {}).settings;
    const b = applyGroupForm('iletisim', formOf({ 'contact.whatsapp': '905550000000' }), a).settings;
    assert.equal(b.legal.companyTitle, 'Örnek Ltd.');
    const req = SETTINGS_FIELDS.filter((f) => f.required).length;
    assert.deepEqual(settingsProgress(b), { total: req, done: 2, missing: req - 2 });
    assert.deepEqual(parseHours('Pazar: Kapalı'), [{ days: 'Pazar', hours: 'Kapalı' }]);
  });
});

describe('Giriş güvenliği', () => {
  const secret = 'x'.repeat(40);

  test('parola özeti doğrulanır, yanlış parola ve bozuk özet reddedilir', () => {
    const h = hashPassword('çok-gizli-parola-123');
    assert.match(h, /^scrypt:16384:8:1:/);
    assert.ok(!h.includes('$'));
    assert.equal(verifyPassword('çok-gizli-parola-123', h), true);
    assert.equal(verifyPassword('yanlis', h), false);
    assert.equal(verifyPassword('x', 'bozuk'), false);
  });

  test('oturum imzası ve süresi denetlenir; CSRF oturuma bağlıdır', () => {
    const { token } = createSession(secret, 'yonetici', 1000);
    const s = readSession(secret, token, 2000);
    assert.equal(s.username, 'yonetici');
    assert.equal(readSession(secret, token, 1000 + 9 * 3600_000), null, 'süresi dolan oturum');
    assert.equal(readSession('y'.repeat(40), token, 2000), null, 'başka anahtar');
    assert.equal(readSession(secret, token.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A')), 2000), null, 'değiştirilmiş imza');
    const t = csrfToken(secret, s.sid);
    assert.equal(verifyCsrf(secret, s.sid, t), true);
    assert.equal(verifyCsrf(secret, 'baska', t), false);
    assert.equal(verifyCsrf(secret, s.sid, ''), false);
  });

  test('5 hatalı denemeden sonra giriş beklemeye alınır', () => {
    const l = createLoginLimiter({ max: 5, windowMs: 60_000 });
    for (let i = 0; i < 4; i++) l.fail('ip', 0);
    assert.equal(l.blockedFor('ip', 0), 0);
    l.fail('ip', 0);
    assert.equal(l.blockedFor('ip', 0), 1);
    assert.equal(l.blockedFor('ip', 61_000), 0);
  });
});
