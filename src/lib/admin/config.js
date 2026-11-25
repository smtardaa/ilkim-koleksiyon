/** Panel girişi ayarları (ortam değişkenlerinden, çalışma anında). */
import { ADMIN_USERNAME, ADMIN_PASSWORD_HASH, SESSION_SECRET } from 'astro:env/server';

export const admin = {
  username: ADMIN_USERNAME?.trim() || null,
  passwordHash: ADMIN_PASSWORD_HASH?.trim() || null,
  secret: SESSION_SECRET?.trim() || null,
};

/** Üç değer de tanımlı ve anahtar yeterince uzun mu? Değilse panel kapalıdır. */
export const adminConfigured = Boolean(
  admin.username && admin.passwordHash?.startsWith('scrypt:') && admin.secret && admin.secret.length >= 32,
);

export const adminMissing = [
  !admin.username && 'ADMIN_USERNAME',
  !admin.passwordHash?.startsWith('scrypt:') && 'ADMIN_PASSWORD_HASH',
  !(admin.secret && admin.secret.length >= 32) && 'SESSION_SECRET (en az 32 karakter)',
].filter(Boolean);

import { createLoginLimiter } from './auth.js';
/** Hatalı giriş denemesi sınırı (süreç boyunca bellekte) */
export const loginLimiter = createLoginLimiter();
