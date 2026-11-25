// Katalog veri bütünlüğü testleri — `npm test`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../src/data/catalog/${p}`, import.meta.url), 'utf8'));
const categories = read('categories.json');
const countries = read('countries.json');
const collections = read('collections.json');
const products = read('products.json');

const EXPECTED = [
  'T.C. Madeni Paralar', 'T.C. Kağıt Paralar', 'T.C. Hatıra Paralar', 'Yabancı Madeni Paralar', 'Yabancı Kağıt Paralar',
  'Nümismatik Malzeme', 'Gümüş Takılar', 'Vintage Objeler', 'Efemera', 'Madalya - Madalyon', 'Saat', 'Osmanlı Paraları',
];

test('Ana kategoriler verilen adlarla ve sırayla tanımlı', () => {
  const sorted = [...categories].sort((a, b) => a.sort - b.sort);
  assert.deepEqual(sorted.map((c) => c.title), EXPECTED);
  assert.equal(new Set(categories.map((c) => c.path)).size, categories.length);
  for (const c of categories) assert.match(c.path, /^[a-z0-9-]+$/);
});

test('Her kategorinin görseli ve görsel kaynağı var', () => {
  for (const c of categories) {
    assert.match(c.image.src, /^https:\/\//, c.path);
    assert.ok(c.image.credit?.author && c.image.credit?.license && c.image.credit?.sourceUrl, c.path);
  }
});

test('Ülke seçimi yalnızca iki yabancı para kategorisinde', () => {
  assert.deepEqual(categories.filter((c) => c.countries).map((c) => c.path).sort(), ['yabanci-kagit-paralar', 'yabanci-madeni-paralar']);
});

test('Ülke listesi ürünlerden bağımsız, benzersiz ve sayı taşımıyor', () => {
  assert.ok(countries.length >= 200);
  assert.equal(new Set(countries.map((c) => c.slug)).size, countries.length);
  for (const c of countries) {
    assert.match(c.slug, /^[a-z0-9-]+$/);
    assert.ok(c.name);
    assert.equal(c.productCount, undefined);
  }
});

test('Örnek ürünler temizlendi; Sertifikalı Paralar seçkisi duruyor', () => {
  assert.deepEqual(products, []);
  assert.ok(collections.some((c) => c.handle === 'sertifikali-paralar'));
});
