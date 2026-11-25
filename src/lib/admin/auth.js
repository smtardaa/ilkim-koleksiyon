/**
 * YÖNETİM PANELİ GİRİŞİ — ek paket gerektirmez (node:crypto).
 *
 * - Parola özeti: scrypt, biçim `scrypt:N:r:p:tuz:özet` (base64url). `$` içermez; .env ve hosting
 *   panellerinde güvenle yazılır. Üretmek için: `npm run admin:parola`.
 * - Oturum: imzalı, durumsuz çerez (HMAC-SHA256). Sunucuda oturum tablosu gerekmez; SESSION_SECRET
 *   değiştirilirse bütün oturumlar geçersiz olur.
 * - CSRF: her formda oturuma bağlı bir anahtar (HMAC) taşınır ve POST'ta doğrulanır.
 * - Giriş denemesi sınırı: aynı adresten 15 dakikada 5 hatalı deneme → 15 dakika bekleme.
 */
import { scryptSync, randomBytes, createHmac, timingSafeEqual } from 'node:crypto';

const b64 = (buf) => Buffer.from(buf).toString('base64url');
const SESSION_HOURS = 8;
export const COOKIE_NAME = 'ik_yonetim';
export const COOKIE_PATH = '/yonetim';

export function hashPassword(password, { N = 16384, r = 8, p = 1 } = {}) {
  const salt = randomBytes(16);
  const hash = scryptSync(String(password).normalize('NFC'), salt, 32, { N, r, p });
  return `scrypt:${N}:${r}:${p}:${b64(salt)}:${b64(hash)}`;
}

export function verifyPassword(password, stored) {
  const parts = String(stored ?? '').split(':');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, N, r, p, salt, hash] = parts;
  try {
    const expected = Buffer.from(hash, 'base64url');
    const actual = scryptSync(String(password).normalize('NFC'), Buffer.from(salt, 'base64url'), expected.length,
      { N: Number(N), r: Number(r), p: Number(p), maxmem: 256 * 1024 * 1024 });
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/** Uzunluk farkını sızdırmadan metin karşılaştırma */
export function safeEqual(a, b) {
  const x = createHmac('sha256', 'cmp').update(String(a)).digest();
  const y = createHmac('sha256', 'cmp').update(String(b)).digest();
  return timingSafeEqual(x, y);
}

const sign = (secret, data) => createHmac('sha256', secret).update(data).digest('base64url');

export function createSession(secret, username, now = Date.now()) {
  const payload = b64(JSON.stringify({ u: username, sid: b64(randomBytes(12)), exp: now + SESSION_HOURS * 3600_000 }));
  return { token: `${payload}.${sign(secret, payload)}`, maxAge: SESSION_HOURS * 3600 };
}

/** @returns {{ username: string, sid: string } | null} */
export function readSession(secret, token, now = Date.now()) {
  if (!secret || !token || typeof token !== 'string') return null;
  const [payload, mac] = token.split('.');
  if (!payload || !mac || !safeEqual(mac, sign(secret, payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data.exp !== 'number' || data.exp < now) return null;
    return { username: data.u, sid: data.sid };
  } catch {
    return null;
  }
}

export const csrfToken = (secret, sid) => sign(secret, `csrf:${sid}`).slice(0, 32);
export const verifyCsrf = (secret, sid, token) => typeof token === 'string' && token.length > 0 && safeEqual(token, csrfToken(secret, sid));

/** Bellek içi deneme sınırı (tek süreçli Node uygulaması için yeterli) */
export function createLoginLimiter({ max = 5, windowMs = 15 * 60_000 } = {}) {
  const hits = new Map();
  const prune = (now) => { for (const [k, v] of hits) if (v.until < now) hits.delete(k); };
  return {
    /** Kalan bekleme süresi (dk) veya 0 */
    blockedFor(key, now = Date.now()) {
      prune(now);
      const h = hits.get(key);
      return h && h.count >= max ? Math.ceil((h.until - now) / 60_000) : 0;
    },
    fail(key, now = Date.now()) {
      const h = hits.get(key);
      if (!h || h.until < now) hits.set(key, { count: 1, until: now + windowMs });
      else { h.count++; h.until = now + windowMs; }
    },
    reset(key) { hits.delete(key); },
  };
}
