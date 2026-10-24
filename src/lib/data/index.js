import { mockSource } from './mock/source.js';
import { shopifySource } from './shopify/source.js';

const sources = {
  mock: mockSource,
  shopify: shopifySource,
};

/** Build sırasında hangi veri kaynağının kullanılacağını DATA_SOURCE belirler. */
export function getDataSource() {
  const name = import.meta.env.DATA_SOURCE || 'mock';
  const source = sources[name];
  if (!source) throw new Error(`Bilinmeyen veri kaynağı: ${name}`);
  return source;
}
