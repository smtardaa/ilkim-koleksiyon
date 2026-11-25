/** Panel sayfalarındaki POST istekleri için ortak yardımcılar. */
import { admin } from './config.js';
import { verifyCsrf } from './auth.js';

/**
 * Oturumu ve CSRF anahtarını doğrular, form verisini döndürür.
 * @returns {Promise<{ ok: true, form: FormData } | { ok: false, status: number, error: string }>}
 */
export async function readAdminForm(ctx) {
  const session = ctx.locals.admin;
  if (!session) return { ok: false, status: 401, error: 'Oturum süresi doldu. Lütfen yeniden giriş yapın.' };
  let form;
  try { form = await ctx.request.formData(); } catch { return { ok: false, status: 400, error: 'Form okunamadı.' }; }
  if (!verifyCsrf(admin.secret, session.sid, form.get('_csrf'))) {
    return { ok: false, status: 403, error: 'Güvenlik doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin.' };
  }
  return { ok: true, form };
}

/** FormData → düz nesne (aynı addan birden çok değer varsa dizi) */
export function formToObject(form, arrays = []) {
  const out = {};
  for (const key of new Set(form.keys())) {
    if (key === '_csrf' || key.startsWith('yeniGorsel')) continue;
    out[key] = arrays.includes(key) ? form.getAll(key).map(String) : String(form.get(key) ?? '');
  }
  for (const k of arrays) out[k] ??= [];
  return out;
}

/** Başarı mesajı ile aynı sayfaya dön (yenilemede form tekrar gönderilmez) */
export const redirectWith = (ctx, path, message, anchor = '') =>
  ctx.redirect(`${path}?tamam=${encodeURIComponent(message)}${anchor ? `#${anchor}` : ''}`, 303);
