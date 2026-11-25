/**
 * DOSYA DEPOSU — yazılabilir veri katmanı (DATA_SOURCE=local).
 *
 * Katalog verisi ve site ayarları, derleme klasörünün DIŞINDAKİ bir klasörde JSON dosyaları olarak
 * tutulur (DATA_DIR). Klasör ilk açılışta boşsa, depoyla gelen başlangıç verisi
 * (src/data/catalog/*.json) oraya kopyalanır. Böylece yeniden derleme/yükleme panelden girilen
 * bilgileri silmez.
 *
 * MySQL'e geçişte bu dosyanın eşdeğeri `mysql-store.js` yazılır ve AYNI yöntemleri sunar
 * (bkz. docs/YONETIM-PANELI.md → “Depo arayüzü”). Panel ve site yalnızca bu yöntemleri tanır.
 *
 * Kurallar (doğrulama, benzersiz adres, ülke adı değişince ürünlerin güncellenmesi vb.)
 * burada DEĞİL, src/lib/admin/service.js içindedir; depo yalnızca okur/yazar.
 */
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';

const FILES = {
  products: 'products.json',
  categories: 'categories.json',
  countries: 'countries.json',
  collections: 'collections.json',
  settings: 'settings.json',
};

const byName = (a, b) => a.name.localeCompare(b.name, 'tr');

/**
 * @param {{ dataDir: string, seed: { products: any[], categories: any[], countries: any[], collections: any[] } }} opts
 */
export function createFileStore({ dataDir, seed }) {
  /** @type {null | Record<string, any>} */
  let state = null;
  let loading = null;
  let revision = 0;
  // Yazmalar sıraya alınır: aynı anda gelen iki kayıt birbirinin üzerine yazmaz.
  let queue = Promise.resolve();

  async function readOrSeed(key) {
    const file = path.join(dataDir, FILES[key]);
    try {
      return JSON.parse(await readFile(file, 'utf8'));
    } catch (e) {
      if (e.code !== 'ENOENT') throw new Error(`${FILES[key]} okunamadı: ${e.message}`);
      const initial = key === 'settings' ? {} : structuredClone(seed[key] ?? []);
      await writeAtomic(file, initial);
      return initial;
    }
  }

  async function writeAtomic(file, data) {
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmp, JSON.stringify(data, null, 1) + '\n', 'utf8');
    await rename(tmp, file);
  }

  async function load() {
    if (state) return state;
    loading ??= (async () => {
      await mkdir(dataDir, { recursive: true });
      const entries = await Promise.all(Object.keys(FILES).map(async (k) => [k, await readOrSeed(k)]));
      state = Object.fromEntries(entries);
      loading = null;
      return state;
    })();
    return loading;
  }

  /** Değişiklik uygula: fn mevcut durumu alır, değişen anahtarları döndürür ({ products: [...] }). */
  function mutate(fn) {
    const run = queue.then(async () => {
      const current = await load();
      const changes = fn(current);
      for (const [key, value] of Object.entries(changes)) {
        await writeAtomic(path.join(dataDir, FILES[key]), value);
      }
      state = { ...current, ...changes };
      revision++;
    });
    queue = run.catch(() => {});
    return run;
  }

  return {
    source: 'local',

    /** Bütün veri tek seferde (salt okunur kabul edin; değiştirmeyin). `revision` her yazmada artar. */
    async getSnapshot() {
      const s = await load();
      return { ...s, revision };
    },

    async putProduct(product) {
      await mutate(({ products }) => {
        const i = products.findIndex((p) => p.id === product.id);
        const next = [...products];
        if (i === -1) next.push(product); else next[i] = product;
        return { products: next };
      });
    },
    async removeProduct(id) {
      await mutate(({ products }) => ({ products: products.filter((p) => p.id !== id) }));
    },

    /** Ülke ekle/güncelle. `previousSlug` verilirse o kayıt yerine yazılır (ad/slug değişikliği). */
    async putCountry(country, previousSlug = country.slug) {
      await mutate(({ countries }) => ({
        countries: [...countries.filter((c) => c.slug !== previousSlug && c.slug !== country.slug), country].sort(byName),
      }));
    },
    async removeCountry(slug) {
      await mutate(({ countries }) => ({ countries: countries.filter((c) => c.slug !== slug) }));
    },

    /** Var olan kategoriyi günceller (kategori ekleme/silme panelde yoktur). */
    async putCategory(category) {
      await mutate(({ categories }) => ({
        categories: categories.map((c) => (c.path === category.path ? category : c)),
      }));
    },

    async putCollection(collection) {
      await mutate(({ collections }) => {
        const i = collections.findIndex((c) => c.handle === collection.handle);
        const next = [...collections];
        if (i === -1) next.push(collection); else next[i] = collection;
        return { collections: next };
      });
    },
    async removeCollection(handle) {
      await mutate(({ collections }) => ({ collections: collections.filter((c) => c.handle !== handle) }));
    },

    /** Ayarların tamamını yazar (yalnızca dolu alanlar; bkz. settings-schema.js). */
    async putSettings(settings) {
      await mutate(() => ({ settings }));
    },
  };
}
