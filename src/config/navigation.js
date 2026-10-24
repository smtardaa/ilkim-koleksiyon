import { url } from '../lib/paths.js';

export const mainNav = [
  { key: 'home', label: 'Ana Sayfa', href: url('/') },
  { key: 'shop', label: 'Mağaza', href: url('/magaza/') },
  { key: 'collections', label: 'Koleksiyonlar', href: url('/koleksiyonlar/') },
  { key: 'about', label: 'Hakkımızda', href: url('/hakkimizda/') },
  { key: 'faq', label: 'Sık Sorulan Sorular', href: url('/sss/') },
  { key: 'contact', label: 'İletişim', href: url('/iletisim/') },
];
