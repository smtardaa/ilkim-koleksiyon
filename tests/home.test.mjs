// Ana sayfa kategori bölümleri testleri — `npm test`
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { homeSliders } from '../src/config/home.js';
import { sectionRequests, localCandidates, pickProducts, buildHomeSections, prioritize, isAvailable } from '../src/lib/home-sections.js';
import { inCategory } from '../src/lib/search/engine.js';
import { fixtureProducts } from './fixtures/products.mjs';

const categories = JSON.parse(readFileSync(new URL('../src/data/catalog/categories.json', import.meta.url), 'utf8'));
const urls = { categoryUrl: (p) => `/kategori/${p}`, collectionUrl: (h) => `/koleksiyonlar/${h}` };
const fetchFrom = (products) => Object.fromEntries(sectionRequests(homeSliders).map((r) => {
  const meta = categories.find((c) => c.path === r.key);
  return [r.id, { title: meta?.title ?? null, description: meta?.description ?? null, products: localCandidates(products, r) }];
}));
const build = (products, extra = {}) => buildHomeSections({ config: homeSliders, fetched: fetchFrom(products), urls, ...extra });
const mk = (id, o = {}) => ({ id, title: id, order: 0, collections: [], categoryPaths: [], availability: { status: 'in_stock' }, ...o });

describe('yapılandırma', () => {
  test('her ana kategori için, kategori sırasıyla bir bölüm; en fazla 10 ürün', () => {
    const sorted = [...categories].sort((a, b) => a.sort - b.sort);
    assert.deepEqual(homeSliders.sections.map((s) => s.source.path), sorted.map((c) => c.path));
    assert.equal(homeSliders.defaultLimit, 10);
  });
});

describe('boş katalog', () => {
  test('bütün bölümler başlık ve “Tümünü Gör” bağlantısıyla kalır, ürün yok', () => {
    const sections = build([]);
    assert.equal(sections.length, categories.length);
    for (const s of sections) {
      assert.ok(s.title);
      assert.equal(s.href, `/kategori/${s.id}`);
      assert.equal(s.products.length, 0);
    }
  });
});

describe('ürün eklendiğinde (test verisi)', () => {
  const sections = build(fixtureProducts);
  const byId = new Map(sections.map((s) => [s.id, s]));
  test('ürünler doğru bölümde, bölüm içinde tekrar yok, en fazla 10', () => {
    for (const s of sections) {
      assert.ok(s.products.length <= 10);
      assert.equal(new Set(s.products.map((p) => p.id)).size, s.products.length);
      for (const p of s.products) assert.ok(inCategory(p, s.id), `${s.id}: ${p.title}`);
    }
    assert.deepEqual(byId.get('tc-kagit-paralar').products.map((p) => p.id), ['t1']);
    assert.deepEqual(byId.get('yabanci-kagit-paralar').products.map((p) => p.id), ['t3']);
    assert.equal(byId.get('efemera').products.length, 0);
  });
  test('satılmış ürün görünürlüğü kapalıysa bölüme girmez', () => {
    const out = build(fixtureProducts, { soldVisibility: 'unlisted' });
    assert.ok(out.every((s) => s.products.every((p) => p.availability.status !== 'sold')));
    assert.equal(out.find((s) => s.id === 'saat').products.length, 0);
  });
});

describe('seçim kuralları', () => {
  test('az ürün varsa olan gösterilir, çoğaltılmaz', () => {
    assert.deepEqual(pickProducts([mk('a'), mk('b'), mk('a')], { limit: 10 }).map((p) => p.id), ['a', 'b']);
  });
  test('öncelik: stokta → stokta yok → satılmış; grup içi sıra korunur', () => {
    const list = [mk('s', { availability: { status: 'sold' } }), mk('x'), mk('o', { availability: { status: 'out_of_stock' } }), mk('y')];
    assert.deepEqual(prioritize(list).map((p) => p.id), ['x', 'y', 'o', 's']);
    assert.deepEqual(list.map(isAvailable), [false, true, false, true]);
  });
  test('yeterli yeni ürün varsa görülmüşler alınmaz; yoksa onlarla tamamlanır', () => {
    const c = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => mk(id));
    assert.deepEqual(pickProducts(c, { limit: 10, seen: new Set(['a']), preferUniqueMin: 5 }).map((p) => p.id), ['b', 'c', 'd', 'e', 'f']);
    assert.deepEqual(pickProducts(c, { limit: 10, seen: new Set(['a', 'b', 'c']), preferUniqueMin: 5 }).map((p) => p.id), ['d', 'e', 'f', 'a', 'b', 'c']);
  });
});
