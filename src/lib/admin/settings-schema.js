/**
 * “DOLDURULACAKLAR” — panelin 2. sayfasındaki alanların tek listesi.
 * Her alan src/config/business.js içindeki bir değere karşılık gelir (`key` = nokta ile yol).
 * Yeni bir işletme bilgisi gerekirse buraya bir satır eklemek yeterlidir; form, kontrol ve
 * “eksik/tamam” sayımı bu listeden üretilir.
 *
 * required: true  → sitede boşluğu görünen, doldurulması beklenen alan (ilerleme sayımına girer)
 * required: false → isteğe bağlı (sayıma girmez)
 */

const RE = {
  whatsapp: /^\d{10,15}$/,
  phone: /^\+\d{10,15}$/,
  email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
  https: /^https:\/\/\S+$/,
  year: /^\d{4}$/,
};

export const SETTINGS_GROUPS = [
  {
    id: 'iletisim',
    title: 'İletişim bilgileri',
    intro: 'WhatsApp numarası girilmeden ürünlerdeki “Satın almak için iletişime geç” düğmesi görünmez.',
    fields: [
      { key: 'contact.whatsapp', label: 'WhatsApp numarası', required: true, type: 'tel', placeholder: '905xxxxxxxxx',
        hint: 'Ülke koduyla, yalnızca rakam. Başında + veya 0 olmadan. Örnek biçim: 905xxxxxxxxx',
        clean: (v) => v.replace(/[\s()+-]/g, ''), check: (v) => RE.whatsapp.test(v) || 'Yalnızca rakam, ülke koduyla 10–15 hane olmalı (ör. 905xxxxxxxxx).' },
      { key: 'contact.phone', label: 'Telefon', required: true, type: 'tel', placeholder: '+90xxxxxxxxxx',
        hint: 'Başında + ve ülke kodu, boşluksuz. Örnek biçim: +90xxxxxxxxxx',
        clean: (v) => v.replace(/[\s()-]/g, ''), check: (v) => RE.phone.test(v) || '+ ile başlamalı ve 10–15 rakam içermeli (ör. +90xxxxxxxxxx).' },
      { key: 'contact.email', label: 'E-posta', required: true, type: 'email', placeholder: 'ornek@alanadi.com',
        check: (v) => RE.email.test(v) || 'Geçerli bir e-posta adresi girin.' },
      { key: 'contact.address', label: 'Açık adres', required: true, type: 'textarea', rows: 2, hint: 'Fiziksel mağaza yoksa boş bırakılabilir.' },
      { key: 'contact.district', label: 'İlçe', required: true },
      { key: 'contact.city', label: 'İl', required: true },
      { key: 'contact.postalCode', label: 'Posta kodu', required: false },
      { key: 'contact.mapUrl', label: 'Harita bağlantısı', required: false, type: 'url', placeholder: 'https://…',
        check: (v) => RE.https.test(v) || 'https:// ile başlayan bir bağlantı girin.' },
      { key: 'contact.openingHours', label: 'Çalışma saatleri', required: true, type: 'hours', rows: 3,
        hint: 'Her satıra bir gün aralığı: “Pazartesi–Cuma: 10:00–18:00”' },
    ],
  },
  {
    id: 'satis',
    title: 'Satış, ödeme ve kargo',
    intro: 'Sıkça sorulan sorular ve kargo/iade sayfaları bu bilgilerle dolar.',
    fields: [
      { key: 'commerce.paymentMethods', label: 'Kabul edilen ödeme yöntemleri', required: true, hint: 'Örnek: Havale/EFT' },
      { key: 'commerce.carriers', label: 'Kargo firması', required: true },
      { key: 'commerce.shippingFee', label: 'Kargo bedeli', required: true, hint: 'Örnek: “… TL, … TL üzeri ücretsiz”' },
      { key: 'commerce.dispatchTime', label: 'Kargoya teslim süresi', required: true, hint: 'Örnek: “1–2 iş günü”' },
      { key: 'commerce.shippingRegions', label: 'Teslimat bölgesi', required: true, hint: 'Örnek: “Türkiye geneli”' },
      { key: 'commerce.packaging', label: 'Paketleme', required: true, type: 'textarea', rows: 2 },
      { key: 'commerce.returnPolicySummary', label: 'İade ve cayma koşulları (özet)', required: true, type: 'textarea', rows: 3 },
      { key: 'commerce.invoiceInfo', label: 'Fatura bilgisi', required: false, hint: 'Örnek: e-Arşiv fatura' },
    ],
  },
  {
    id: 'firma',
    title: 'Firma ve yasal bilgiler',
    intro: 'Mesafeli satış ve KVKK metinlerinde kullanılır.',
    fields: [
      { key: 'legal.companyTitle', label: 'Ticari unvan', required: true },
      { key: 'legal.taxOffice', label: 'Vergi dairesi', required: true },
      { key: 'legal.taxNumber', label: 'Vergi numarası', required: true },
      { key: 'legal.mersisNumber', label: 'MERSİS numarası', required: false },
      { key: 'legal.tradeRegistryNumber', label: 'Ticaret sicil numarası', required: false },
      { key: 'legal.kepAddress', label: 'KEP adresi', required: false },
    ],
  },
  {
    id: 'hakkimizda',
    title: 'Hakkımızda',
    intro: 'Hakkımızda sayfasında gösterilir.',
    fields: [
      { key: 'about.foundedYear', label: 'Kuruluş yılı', required: true, placeholder: 'YYYY',
        check: (v) => RE.year.test(v) || 'Dört haneli bir yıl girin.' },
      { key: 'about.founderNames', label: 'Kurucu / ekip', required: true },
      { key: 'about.storeStory', label: 'Hikâyemiz', required: true, type: 'textarea', rows: 4 },
      { key: 'about.expertise', label: 'Uzmanlık alanı', required: true, type: 'textarea', rows: 2 },
    ],
  },
  {
    id: 'metinler',
    title: 'Bilgi sayfası metinleri',
    intro: 'Bir sayfanın metni girilince o sayfa “iskelet” olmaktan çıkar ve metin olduğu gibi yayınlanır. Yasal metinler hukuki danışmanla hazırlanmalıdır. Paragrafları boş satırla ayırın.',
    fields: [
      { key: 'legalTexts.kargo-ve-teslimat', label: 'Kargo ve teslimat', required: true, type: 'textarea', rows: 6, page: '/bilgi/kargo-ve-teslimat' },
      { key: 'legalTexts.iade-ve-cayma', label: 'İade ve cayma hakkı', required: true, type: 'textarea', rows: 6, page: '/bilgi/iade-ve-cayma' },
      { key: 'legalTexts.gizlilik-ve-kvkk', label: 'Gizlilik ve KVKK aydınlatma metni', required: true, type: 'textarea', rows: 6, page: '/bilgi/gizlilik-ve-kvkk' },
      { key: 'legalTexts.cerez-politikasi', label: 'Çerez politikası', required: false, type: 'textarea', rows: 4, page: '/bilgi/cerez-politikasi',
        hint: 'Boş kalırsa sayfadaki mevcut açıklama gösterilir (site şu an çerez kullanmıyor).' },
    ],
  },
  {
    id: 'sosyal',
    title: 'Sosyal medya hesapları',
    intro: 'İsteğe bağlı. Yalnızca gerçek hesap adresleri girin; alt bilgide ve iletişim sayfasında gösterilir.',
    fields: ['instagram', 'facebook', 'youtube', 'x', 'tiktok'].map((k) => ({
      key: `social.${k}`,
      label: { instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube', x: 'X (Twitter)', tiktok: 'TikTok' }[k],
      required: false, type: 'url', placeholder: 'https://…',
      check: (v) => RE.https.test(v) || 'https:// ile başlayan tam bağlantı girin.',
    })),
  },
];

export const SETTINGS_FIELDS = SETTINGS_GROUPS.flatMap((g) => g.fields.map((f) => ({ ...f, group: g.id })));

/** 'contact.whatsapp' → ['contact', 'whatsapp'] (yalnızca ilk noktadan böler; 'legalTexts.iade-ve-cayma' gibi) */
const split = (key) => { const i = key.indexOf('.'); return [key.slice(0, i), key.slice(i + 1)]; };
export const getPath = (obj, key) => { const [a, b] = split(key); return obj?.[a]?.[b] ?? null; };
export function setPath(obj, key, value) {
  const [a, b] = split(key);
  obj[a] ??= {};
  obj[a][b] = value;
}

/** Çalışma saatleri: metin ↔ [{days, hours}] */
export function parseHours(text) {
  return String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
    const m = l.match(/^(.+?)\s*:\s+(.+)$/);
    return m ? { days: m[1].trim(), hours: m[2].trim() } : { days: l, hours: '' };
  });
}
export const formatHours = (list) => (Array.isArray(list) ? list.map((h) => (h.hours ? `${h.days}: ${h.hours}` : h.days)).join('\n') : '');

/** Alanın form kutusunda gösterilecek metni */
export function displayValue(field, value) {
  if (field.type === 'hours') return formatHours(value);
  return value == null ? '' : String(value);
}

export function isFilled(field, value) {
  if (field.type === 'hours') return Array.isArray(value) && value.length > 0;
  return value != null && String(value).trim() !== '';
}

/**
 * Bir grubun formunu doğrular ve kaydedilecek ayarları üretir.
 * @param {string} groupId
 * @param {(name:string)=>string|null} get — form değerini okur
 * @param {object} current — kayıtlı ayarlar
 * @returns {{ ok: true, settings: object } | { ok: false, errors: Record<string,string>, values: Record<string,string> }}
 */
export function applyGroupForm(groupId, get, current) {
  const group = SETTINGS_GROUPS.find((g) => g.id === groupId);
  if (!group) return { ok: false, errors: { _: 'Bilinmeyen bölüm.' }, values: {} };
  const next = structuredClone(current ?? {});
  const errors = {};
  const values = {};
  for (const f of group.fields) {
    const raw = String(get(f.key) ?? '').replace(/\r\n/g, '\n').trim();
    values[f.key] = raw;
    const max = f.type === 'textarea' ? 20000 : 300;
    if (raw.length > max) { errors[f.key] = `En fazla ${max} karakter.`; continue; }
    if (!raw) { setPath(next, f.key, null); continue; }
    if (f.type === 'hours') { setPath(next, f.key, parseHours(raw)); continue; }
    const v = f.clean ? f.clean(raw) : raw;
    const res = f.check ? f.check(v) : true;
    if (res !== true) { errors[f.key] = res; continue; }
    setPath(next, f.key, v);
  }
  if (Object.keys(errors).length) return { ok: false, errors, values };
  return { ok: true, settings: prune(next) };
}

/** Boş (null) değerleri atar; depoda yalnızca dolu alanlar kalır. */
function prune(obj) {
  const out = {};
  for (const [a, inner] of Object.entries(obj)) {
    for (const [b, v] of Object.entries(inner ?? {})) {
      if (v == null || (Array.isArray(v) && !v.length)) continue;
      (out[a] ??= {})[b] = v;
    }
  }
  return out;
}

/** Eksik/tamam özeti */
export function settingsProgress(settings) {
  const req = SETTINGS_FIELDS.filter((f) => f.required);
  const done = req.filter((f) => isFilled(f, getPath(settings, f.key)));
  return { total: req.length, done: done.length, missing: req.length - done.length };
}
