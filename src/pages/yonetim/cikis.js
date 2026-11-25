/** Panelden çıkış: oturum çerezini siler. (Yalnızca POST; CSRF ile korunur.) */
import { readAdminForm } from '../../lib/admin/request.js';
import { COOKIE_NAME, COOKIE_PATH } from '../../lib/admin/auth.js';

export const prerender = false;

export async function POST(ctx) {
  const r = await readAdminForm(ctx);
  ctx.cookies.delete(COOKIE_NAME, { path: COOKIE_PATH });
  return ctx.redirect(r.ok ? '/yonetim/giris?cikis' : '/yonetim/giris', 303);
}
