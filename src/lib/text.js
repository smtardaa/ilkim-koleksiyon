/**
 * Türkçe metin karşılaştırma yardımcıları. Hem build sırasında hem de
 * tarayıcıda (arama/filtre) aynı kurallarla çalışır.
 */
const FOLD = { ı: 'i', ş: 's', ğ: 'g', ü: 'u', ö: 'o', ç: 'c', â: 'a', î: 'i', û: 'u' };

/** "İSTANBUL", "istanbul" ve "Istanbul" aynı sonuca indirgenir. */
export function normalizeTr(value) {
  return String(value ?? '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[ışğüöçâîû]/g, (ch) => FOLD[ch])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function compareTr(a, b) {
  return String(a).localeCompare(String(b), 'tr-TR');
}
