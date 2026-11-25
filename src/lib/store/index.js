/**
 * Depo seçimi — site ve yönetim paneli veriyi YALNIZCA buradan alır.
 *
 * DATA_SOURCE=local → dosya deposu (DATA_DIR klasöründeki JSON dosyaları).
 * MySQL'e geçiş: `mysql-store.js` yazılır (aynı yöntemler), aşağıdaki haritaya eklenir,
 * astro.config.mjs → DATA_SOURCE değerlerine 'mysql' eklenir. Panel ve sayfalar değişmez.
 */
import path from 'node:path';
import { dataSource, dataDir } from '../../config/site.js';
import products from '../../data/catalog/products.json' with { type: 'json' };
import categories from '../../data/catalog/categories.json' with { type: 'json' };
import countries from '../../data/catalog/countries.json' with { type: 'json' };
import collections from '../../data/catalog/collections.json' with { type: 'json' };
import { createFileStore } from './file-store.js';

let store;

/** @returns {ReturnType<typeof createFileStore>} */
export function getStore() {
  if (store) return store;
  const factories = {
    local: () => createFileStore({
      dataDir: path.resolve(dataDir),
      seed: { products, categories, countries, collections },
    }),
    // mysql: () => createMysqlStore({ host: DB_HOST, ... }),
  };
  const make = factories[dataSource];
  if (!make) throw new Error(`Bilinmeyen veri kaynağı: ${dataSource}`);
  store = make();
  return store;
}
