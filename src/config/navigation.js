/**
 * Menü bağlantıları. Kategori listesi TEK kaynaktan gelir:
 * src/data/catalog/categories.json (ad, sıra, görsel). Header, mobil menü,
 * kategori kartları, kategori butonları ve ana sayfa bölümleri bu listeyi kullanır.
 */
import categories from '../data/catalog/categories.json' with { type: 'json' };

/** Ana kategoriler, verilen sırayla: [{ path, title, description, image, countries }] */
export const topCategories = [...categories]
  .filter((c) => !c.parent)
  .sort((a, b) => a.sort - b.sort);

export const mainNav = [
  { href: '/urunler', label: 'Katalog' },
  { href: '/kategori', label: 'Kategoriler', dropdown: true },
  { href: '/yeni-gelenler', label: 'Yeni Gelenler' },
  { href: '/koleksiyon-rehberi', label: 'Koleksiyon Rehberi' },
  { href: '/iletisim', label: 'İletişim' },
];

export const footerNav = {
  magaza: [
    { href: '/urunler', label: 'Tüm ürünler' },
    { href: '/yeni-gelenler', label: 'Yeni gelenler' },
    { href: '/koleksiyonlar/sertifikali-paralar', label: 'Sertifikalı paralar' },
    { href: '/kategori', label: 'Bütün kategoriler' },
  ],
  bilgi: [
    { href: '/koleksiyon-rehberi', label: 'Koleksiyon rehberi' },
    { href: '/sss', label: 'Sıkça sorulan sorular' },
    { href: '/hakkimizda', label: 'Hakkımızda' },
    { href: '/iletisim', label: 'İletişim' },
  ],
  yasal: [
    { href: '/bilgi/kargo-ve-teslimat', label: 'Kargo ve teslimat' },
    { href: '/bilgi/iade-ve-cayma', label: 'İade ve cayma hakkı' },
    { href: '/bilgi/gizlilik-ve-kvkk', label: 'Gizlilik ve KVKK' },
    { href: '/bilgi/cerez-politikasi', label: 'Çerez politikası' },
  ],
};
