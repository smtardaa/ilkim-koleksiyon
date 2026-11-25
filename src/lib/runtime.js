/**
 * ÇALIŞMA ANI EŞİTLEMESİ
 * Panelden kaydedilen ayarlar ve kategori düzenlemeleri, yeniden derleme gerekmeden siteye yansısın diye
 * her istekten önce (src/middleware.js) çağrılır. Depo `revision` değişmediyse hiçbir şey yapmaz.
 *
 * - İşletme bilgileri: src/config/business.js nesnesinin üzerine yazılır (varsayılanlar saklanır).
 * - Kategoriler: navigation.js → topCategories ve home.js → homeSliders.sections yerinde güncellenir.
 * Bileşenler bu nesneleri doğrudan içe aktardığı için ayrıca değişiklik gerekmez.
 */
import { business } from '../config/business.js';
import { topCategories } from '../config/navigation.js';
import { homeSliders } from '../config/home.js';
import { getStore } from './store/index.js';
import { SETTINGS_FIELDS, getPath, setPath } from './admin/settings-schema.js';

const defaults = structuredClone(business);
let applied = -1;

export function applySettings(settings) {
  for (const f of SETTINGS_FIELDS) {
    const saved = getPath(settings, f.key);
    setPath(business, f.key, saved ?? structuredClone(getPath(defaults, f.key)));
  }
}

export function applyCategories(categories) {
  const top = categories.filter((c) => !c.parent).sort((a, b) => a.sort - b.sort);
  topCategories.splice(0, topCategories.length, ...top);
  homeSliders.sections.splice(0, homeSliders.sections.length,
    ...top.map((c) => ({ id: c.path, source: { type: 'category', path: c.path }, visible: true })));
}

export async function syncRuntime() {
  const snap = await getStore().getSnapshot();
  if (snap.revision === applied) return snap;
  applySettings(snap.settings ?? {});
  applyCategories(snap.categories);
  applied = snap.revision;
  return snap;
}
