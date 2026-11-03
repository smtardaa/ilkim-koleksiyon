/**
 * Basit süreli (TTL) bellek önbelleği.
 * - Her sunucu örneğinin kendi belleğindedir; çok örnekli/serverless ortamda
 *   güncelleme gecikmesi en fazla TTL kadardır.
 * - Eşzamanlı istekler aynı yüklemeyi paylaşır (tek uçuş).
 * - Hata önbelleğe alınmaz.
 * - Shopify webhook'u geldiğinde `invalidateAll()` ile boşaltılır.
 */
const store = new Map();

export async function cached(key, ttlSeconds, loader) {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) return hit.promise;
  const promise = loader();
  store.set(key, { promise, expires: now + ttlSeconds * 1000 });
  try {
    return await promise;
  } catch (err) {
    store.delete(key);
    throw err;
  }
}

export function invalidate(prefix = '') {
  for (const k of store.keys()) if (k.startsWith(prefix)) store.delete(k);
}
export const invalidateAll = () => invalidate('');

export function cacheInfo() {
  return [...store.entries()].map(([key, v]) => ({ key, expiresInSeconds: Math.max(0, Math.round((v.expires - Date.now()) / 1000)) }));
}
