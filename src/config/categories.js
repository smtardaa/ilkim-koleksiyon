/**
 * Ana kategoriler. Shopify'da her biri aynı handle ile bir koleksiyona
 * karşılık gelecek şekilde tasarlandı.
 */
export const categories = [
  {
    slug: 'tc-kagit-paralari',
    name: 'T.C. Kâğıt Paraları',
    description: 'Cumhuriyet dönemi emisyonlarından banknotlar.',
    art: 'notes',
  },
  {
    slug: 'tc-madeni-paralari',
    name: 'T.C. Madeni Paraları',
    description: 'Cumhuriyet dönemi tedavül ve hatıra madeni paraları.',
    art: 'coins',
  },
  {
    slug: 'osmanli-paralari',
    name: 'Osmanlı Paraları',
    description: 'Osmanlı dönemine ait sikkeler ve kâğıt paralar.',
    art: 'ottoman',
  },
  {
    slug: 'yabanci-paralar',
    name: 'Yabancı Paralar',
    description: 'Farklı ülke ve dönemlerden banknot ve madeni paralar.',
    art: 'world',
  },
  {
    slug: 'sertifikali-paralar',
    name: 'Sertifikalı Paralar',
    description: 'Bağımsız bir derecelendirme kuruluşunca değerlendirilmiş parçalar.',
    art: 'slab',
  },
  {
    slug: 'diger-koleksiyon-ve-antika',
    name: 'Diğer Koleksiyon ve Antika Ürünler',
    description: 'Madalya, jeton ve para dışındaki koleksiyon parçaları.',
    art: 'antique',
  },
];

/** Ana sayfada beşli ızgarada gösterilenler; altıncısı ayrı bağlantıdır. */
export const primaryCategories = categories.slice(0, 5);
export const secondaryCategory = categories[5];

export function getCategory(slug) {
  return categories.find((c) => c.slug === slug) ?? null;
}

export function categoryUrl(slug) {
  return `/magaza/${slug}/`;
}
