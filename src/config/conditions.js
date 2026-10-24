/**
 * Kondisyon ölçeği. Türkiye'deki koleksiyon piyasasında yaygın kullanılan
 * kısaltmalar ve yaklaşık uluslararası karşılıkları. Kesin eşleşme
 * kuruluştan kuruluşa değişebilir; işletme kendi kullandığı ölçeği
 * onaylamalı ve gerekirse bu listeyi güncellemelidir.
 */
export const conditionScale = [
  {
    code: 'cil',
    label: 'Çil',
    short: 'ÇİL',
    intl: 'UNC',
    summary: 'Tedavül görmemiş; kullanım izi taşımaz.',
  },
  {
    code: 'cil-alti',
    label: 'Çil altı',
    short: 'ÇA',
    intl: 'AU',
    summary: 'Çok hafif kullanım izi; yüzey büyük ölçüde korunmuş.',
  },
  {
    code: 'cok-cok-temiz',
    label: 'Çok çok temiz',
    short: 'ÇÇT',
    intl: 'XF / EF',
    summary: 'Hafif kullanım izleri; ayrıntılar net.',
  },
  {
    code: 'cok-temiz',
    label: 'Çok temiz',
    short: 'ÇT',
    intl: 'VF',
    summary: 'Orta düzey kullanım; ana ayrıntılar okunur.',
  },
  {
    code: 'temiz',
    label: 'Temiz',
    short: 'T',
    intl: 'F',
    summary: 'Belirgin kullanım izleri; tasarım seçilebilir.',
  },
  {
    code: 'orta',
    label: 'Orta',
    short: 'O',
    intl: 'VG / G',
    summary: 'Yoğun kullanım; aşınma, kat izi veya yıpranma fazla.',
  },
];

export function getCondition(code) {
  return conditionScale.find((c) => c.code === code) ?? null;
}
