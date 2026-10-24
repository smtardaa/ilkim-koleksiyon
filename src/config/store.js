/**
 * Mağazaya özel ayarlar. Aynı altyapı başka bir işletmede kullanılacaksa bu
 * dosya (ve o mağazanın .env değerleri) ayrı tutulur; ortak kod değişmez.
 *
 * `null` olan alanlar işletmeden bilgi gelene kadar bilerek boş bırakıldı.
 * Arayüz bu alanları "henüz eklenmedi" olarak gösterir; uydurma değer yazılmaz.
 */
export const store = {
  id: 'ilkim-koleksiyon',
  name: 'İlkim Koleksiyon',
  wordmark: 'ilkim koleksiyon',
  locale: 'tr-TR',
  currency: 'TRY',

  /** Demo modunda örnek içerik uyarıları gösterilir ve ödeme kapalıdır. */
  isDemo: true,

  contact: {
    address: null, // Örn. "Mahalle, Cadde No, İlçe / İl"
    mapUrl: null, // İşletmenin kendi harita bağlantısı
    hours: null, // Örn. [{ days: 'Pazartesi – Cumartesi', time: '10.00 – 19.00' }]
    phone: null, // Görünen biçim, örn. "+90 5xx xxx xx xx"
    whatsapp: null, // Yalnızca rakam, ülke koduyla: "905xxxxxxxxx"
    email: null,
  },

  social: {
    instagram: null,
    facebook: null,
    youtube: null,
    x: null,
  },

  /** İşletmeye özel politika metinleri. Bilgi gelene kadar boş. */
  policies: {
    shipping: null,
    returns: null,
    authenticity: null,
    warranty: null,
  },

  about: {
    story: null, // İşletmenin kendi anlatımı
    foundedYear: null,
  },
};

export const hasContactInfo = Object.values(store.contact).some(Boolean);

export function whatsappLink(text) {
  if (!store.contact.whatsapp) return null;
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${store.contact.whatsapp}${q}`;
}

export const socialLabels = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  x: 'X',
};
