/**
 * DEMO ÜRÜN VERİSİ — GERÇEK PARÇALARA DAYALI, ANCAK STOK DEĞİL.
 *
 * Her ürün, kamuya açık bir koleksiyon kaydındaki (müze, merkez bankası
 * veya Wikimedia Commons) gerçek bir parçaya dayanır. Ad, ülke, dönem, yıl,
 * malzeme, ölçü, katalog ve sertifika bilgileri yalnızca o kayıtta yazanlardan
 * alındı; kayıtta olmayan bilgi (ör. kondisyon) boş bırakıldı.
 *
 * Bu parçalar İlkim Koleksiyon'un stoğunda DEĞİLDİR. Fiyat, adet ve satış
 * durumu tasarım demosu için örnektir; kaynaklarda fiyat bilgisi yoktur.
 *
 * Görseller /public/urun-gorselleri altındadır; her görselin lisansı ve
 * kaynağı `credit` alanında kayıtlıdır. Bilgiler 24 Ekim 2026'da kontrol edildi.
 */

import { url } from '../../paths.js';

const CHECKED = '2026-10-24';
// Yerel görseller public/ altında; yayın alt yoluna (base) göre adreslenir.
const IMG = url('/urun-gorselleri/');

const LICENSES = {
  cc0: { name: 'CC0 1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  ccby4: { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  ccbysa3: { name: 'CC BY-SA 3.0', url: 'https://creativecommons.org/licenses/by-sa/3.0/' },
  ccbysa4: { name: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  pd: { name: 'Kamu malı (Public domain)', url: null },
  tcmb: {
    name: 'TCMB banknot çoğaltma koşulları',
    url: 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Banknotlar/Banknotlarla+ilgili+Genel+Bilgiler/Banknotlarin+Cogaltilmasi',
  },
};

const RESIZED = 'Yeniden boyutlandırıldı ve JPEG olarak kaydedildi; kırpma veya renk düzeltmesi yapılmadı.';

/** Görsel kaydı. `label` galeride gösterilir, `alt` ekran okuyucular içindir. */
function img(file, width, height, label, alt, credit) {
  return { url: IMG + file, width, height, label, alt, credit };
}

const defaults = {
  kind: 'single',
  collections: [],
  series: null,
  yearLabel: null,
  denomination: null,
  material: null,
  dimensions: null,
  weight: null,
  catalogNumbers: [],
  condition: null,
  conditionNote: null,
  defects: [],
  certificate: null,
  offerEnabled: false,
  quantityAvailable: 1,
  availableForSale: true,
  isSample: true,
};

function product(p) {
  return {
    ...defaults,
    ...p,
    id: `demo-${p.handle}`,
    price: { amount: p.price, currencyCode: 'TRY', isExample: true },
  };
}

/* --- Kaynak tanımları ------------------------------------------------------ */

const tcmbCredit = (pageUrl) => ({
  author: 'Türkiye Cumhuriyet Merkez Bankası',
  license: LICENSES.tcmb,
  sourceUrl: pageUrl,
  sourceLabel: 'TCMB – Emisyon Grupları',
  note: '“ÖRNEKTİR GEÇMEZ” ibaresi TCMB’nin özgün görselinde bulunuyor; görsel değiştirilmeden kullanıldı. Çözünürlük 72 dpi sınırının altında.',
});

const mnir = (record, inv) => ({
  author: 'Muzeul Național de Istorie a României (MNIR)',
  license: LICENSES.ccbysa4,
  sourceUrl: `https://www.europeana.eu/item${record}`,
  sourceLabel: `Europeana / MNIR, envanter ${inv}`,
  note: RESIZED + ' Özgün TIFF/JPEG dosyasından dönüştürüldü.',
});

const kenom = (record, inv) => ({
  author: 'Landesamt für Denkmalpflege und Archäologie Sachsen-Anhalt – Landesmuseum für Vorgeschichte',
  license: LICENSES.cc0,
  sourceUrl: `https://www.kenom.de/id/record_DE-MUS-805310_kenom_${record}`,
  sourceLabel: `KENOM, envanter ${inv}`,
  note: RESIZED,
});

const commons = (file, author, license) => ({
  author,
  license,
  sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`,
  sourceLabel: 'Wikimedia Commons',
  note: RESIZED,
});

/* --- Ürünler --------------------------------------------------------------- */

const E1 = 'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Banknotlar/Cumhuriyet+Donemi+Banknotlari/Emisyon+Gruplari/1.+Emisyon+Grubu/';

export const products = [
  // --- T.C. Kâğıt Paraları ---------------------------------------------------
  product({
    handle: '1-emisyon-1-turk-lirasi',
    title: '1. Emisyon 1 Türk Lirası (I. Tertip)',
    summary: '5 Aralık 1927’de tedavüle çıkan, zeytuni yeşil renkli 1 Türk Lirası banknot.',
    description: [
      'Cumhuriyet’in ilk banknot serisi olan 1. Emisyon’un 1 Türk Lirası kupürü. Ön yüzde Meclis Binası, Ankara Kalesi ve karasabanla çift süren bir köylü, arka yüzde Eski Başbakanlık Binası yer alır.',
      'TCMB kaydına göre İngiltere’de basılmış, 25.04.1939’da tedavülden çekilmiştir. İmza: Mustafa Abdülhalik Renda, Maliye Bakanı.',
    ],
    images: [img('tc-e1-1-lira-on.jpg', 317, 170, 'Ön yüz', '1. Emisyon 1 Türk Lirası banknotun ön yüzü; üzerinde ÖRNEKTİR GEÇMEZ ibaresi', tcmbCredit(E1 + 'Emisyon1'))],
    imageNote: 'TCMB’nin bu tertip için yayımladığı ön yüz görseli. Arka yüzün aynı parçaya ait olduğu doğrulanamadığı için eklenmedi.',
    price: 2400,
    category: 'tc-kagit-paralari',
    collections: ['seckin-parcalar'],
    country: 'Türkiye',
    period: 'Erken Cumhuriyet (1923–1950)',
    series: '1. Emisyon, I. Tertip',
    year: 1927,
    yearLabel: '1927 (tedavüle çıkış)',
    denomination: '1 Türk Lirası',
    material: 'Kâğıt',
    dimensions: '90 × 166 mm',
    offerEnabled: true,
    source: { label: 'TCMB – 1. Emisyon Grubu, 1 TL I. Tertip', url: E1 + 'Emisyon1', checkedAt: CHECKED },
    createdAt: '2026-10-21',
  }),
  product({
    handle: '1-emisyon-5-turk-lirasi',
    title: '1. Emisyon 5 Türk Lirası (I. Tertip)',
    summary: 'Ön yüzünde Ankara Kalesi, bozkurt ve Meclis Binası bulunan, koyu mavi 5 Türk Lirası banknot.',
    description: [
      '1. Emisyon’un 5 Türk Lirası kupürü. Ön yüzde Ankara Kalesi, bir bozkurt ve Meclis Binası, arka yüzde Ankara’dan bir köprü görünümü vardır.',
      'TCMB kaydına göre 05.12.1927’de tedavüle çıkmış, 15.10.1937’de tedavülden çekilmiştir.',
    ],
    images: [img('tc-e1-5-lira-on.jpg', 310, 170, 'Ön yüz', '1. Emisyon 5 Türk Lirası banknotun ön yüzü; üzerinde ÖRNEKTİR GEÇMEZ ibaresi', tcmbCredit(E1 + 'Emisyon2'))],
    imageNote: 'TCMB’nin bu tertip için yayımladığı ön yüz görseli. Arka yüzün aynı parçaya ait olduğu doğrulanamadığı için eklenmedi.',
    price: 6800,
    category: 'tc-kagit-paralari',
    country: 'Türkiye',
    period: 'Erken Cumhuriyet (1923–1950)',
    series: '1. Emisyon, I. Tertip',
    year: 1927,
    yearLabel: '1927 (tedavüle çıkış)',
    denomination: '5 Türk Lirası',
    material: 'Kâğıt',
    dimensions: '94 × 170 mm',
    source: { label: 'TCMB – 1. Emisyon Grubu, 5 TL I. Tertip', url: E1 + 'Emisyon2', checkedAt: CHECKED },
    createdAt: '2026-10-19',
  }),
  product({
    handle: '1-emisyon-10-turk-lirasi',
    title: '1. Emisyon 10 Türk Lirası (I. Tertip)',
    summary: 'Ön yüzünde Ankara Kalesi ve bozkurt bulunan, eflatun renkli 10 Türk Lirası banknot.',
    description: [
      '1. Emisyon’un 10 Türk Lirası kupürü. Ön yüzde Ankara Kalesi ve bir bozkurt, arka yüzde Ankara Kalesi’nden bir görünüm yer alır.',
      'TCMB kaydına göre 05.12.1927’de tedavüle çıkmış, 16.05.1938’de tedavülden çekilmiştir.',
    ],
    images: [img('tc-e1-10-lira-on.jpg', 297, 170, 'Ön yüz', '1. Emisyon 10 Türk Lirası banknotun ön yüzü; üzerinde ÖRNEKTİR GEÇMEZ ibaresi', tcmbCredit(E1 + 'Emisyon3'))],
    imageNote: 'TCMB’nin bu tertip için yayımladığı ön yüz görseli. Arka yüzün aynı parçaya ait olduğu doğrulanamadığı için eklenmedi.',
    price: 9500,
    category: 'tc-kagit-paralari',
    country: 'Türkiye',
    period: 'Erken Cumhuriyet (1923–1950)',
    series: '1. Emisyon, I. Tertip',
    year: 1927,
    yearLabel: '1927 (tedavüle çıkış)',
    denomination: '10 Türk Lirası',
    material: 'Kâğıt',
    dimensions: '99 × 175 mm',
    availableForSale: false,
    quantityAvailable: 0,
    source: { label: 'TCMB – 1. Emisyon Grubu, 10 TL I. Tertip', url: E1 + 'Emisyon3', checkedAt: CHECKED },
    createdAt: '2026-10-08',
  }),

  // --- T.C. Madeni Paraları --------------------------------------------------
  product({
    handle: '100-para-1926',
    title: '100 Para (1926)',
    summary: 'Cumhuriyet’in ilk yıllarına ait pirinç 100 para; müze kaydına göre 1926.',
    description: [
      'İsveç’teki Dalarnas Müzesi koleksiyonunda bulunan 100 para. Müze kaydında “100 Para 1926 Turkiet” olarak tanımlanır ve malzemesi pirinç (mässing) olarak verilir.',
      'Fotoğraflarda ölçek için cetvel kullanılmıştır; iki fotoğraf da aynı müze nesnesine (DM 25183) aittir.',
    ],
    images: [
      img('tc-100-para-1926-a.jpg', 808, 1200, 'Yüz 1', '100 para madeni paranın bir yüzü, altında santimetre cetveli', {
        author: 'Dalarnas museum',
        license: LICENSES.ccby4,
        sourceUrl: 'https://digitaltmuseum.se/021028689367',
        sourceLabel: 'DigitaltMuseum, DM 25183',
        note: RESIZED,
      }),
      img('tc-100-para-1926-b.jpg', 862, 1200, 'Yüz 2', '100 para madeni paranın diğer yüzü, altında santimetre cetveli', {
        author: 'Dalarnas museum',
        license: LICENSES.ccby4,
        sourceUrl: 'https://digitaltmuseum.se/021028689367',
        sourceLabel: 'DigitaltMuseum, DM 25183',
        note: RESIZED,
      }),
    ],
    price: 650,
    category: 'tc-madeni-paralari',
    country: 'Türkiye',
    period: 'Erken Cumhuriyet (1923–1950)',
    year: 1926,
    yearLabel: '1926 (müze kaydı)',
    denomination: '100 Para',
    material: 'Pirinç',
    source: { label: 'Dalarnas museum – DigitaltMuseum kaydı DM 25183', url: 'https://digitaltmuseum.se/021028689367', checkedAt: CHECKED },
    createdAt: '2026-10-22',
  }),
  product({
    handle: '10-lira-1986',
    title: '10 Lira (1986)',
    summary: 'Atatürk portreli, alüminyum 10 lira; iki yüzü tek fotoğrafta.',
    description: [
      'Ön yüzünde Mustafa Kemal Atatürk portresi ve “TÜRKİYE CUMHURİYETİ” yazısı, arka yüzünde başak ve defne dalı arasında değer ve yıl bulunan 10 lira.',
      'Görsel kaynağındaki açıklamaya göre basım yılı 1986, malzemesi alüminyumdur. Fotoğraf aynı paranın iki yüzünü yan yana gösterir.',
    ],
    images: [
      img('tc-10-lira-1986.jpg', 1600, 821, 'Ön ve arka yüz', '1986 tarihli 10 lira: solda Atatürk portreli ön yüz, sağda 10 LİRA yazılı arka yüz', commons('10 Lira (Turkey).jpg', 'AKS.9955', LICENSES.ccbysa4)),
    ],
    price: 120,
    quantityAvailable: 4,
    category: 'tc-madeni-paralari',
    collections: ['seckin-parcalar'],
    country: 'Türkiye',
    period: 'Cumhuriyet (1980 sonrası)',
    year: 1986,
    denomination: '10 Lira',
    material: 'Alüminyum',
    source: { label: 'Wikimedia Commons – 10 Lira (Turkey).jpg', url: 'https://commons.wikimedia.org/wiki/File:10_Lira_(Turkey).jpg', checkedAt: CHECKED },
    createdAt: '2026-10-20',
  }),
  product({
    handle: '1-lira-1972',
    title: '1 Lira (1972)',
    summary: 'Başak ve defne dalı arasında değer ve yıl bulunan 1 lira.',
    description: [
      'Mannheim’daki TECHNOSEUM koleksiyonunda bulunan 1 lira. Fotoğrafta 1972 tarihi okunuyor.',
      'Kaynakta paranın yalnızca bu yüzünün fotoğrafı yayımlanmış; diğer yüz başka bir parçanın fotoğrafıyla tamamlanmadı.',
    ],
    images: [
      img('tc-1-lira-1972.jpg', 400, 400, 'Arka yüz', '1972 tarihli 1 lira madeni paranın değer ve yıl yazılı yüzü', {
        author: 'TECHNOSEUM – Landesmuseum für Technik und Arbeit, Mannheim',
        license: LICENSES.cc0,
        sourceUrl: 'https://www.europeana.eu/item/249/item_IXZHIPR55GHRWYCZOJTHITHQGH6UV4PU',
        sourceLabel: 'Europeana / TECHNOSEUM, envanter EVZ:2013/0077-501',
        note: 'Europeana önizleme dosyası (400 px); kaynakta daha büyük dosya erişilebilir değildi.',
      }),
    ],
    imageNote: 'Kaynakta yalnızca tek yüz fotoğrafı bulunuyor.',
    price: 90,
    quantityAvailable: 6,
    category: 'tc-madeni-paralari',
    country: 'Türkiye',
    period: 'Cumhuriyet (1950–1980)',
    year: 1972,
    denomination: '1 Lira',
    source: { label: 'TECHNOSEUM – EVZ:2013/0077-501 (Europeana)', url: 'https://www.europeana.eu/item/249/item_IXZHIPR55GHRWYCZOJTHITHQGH6UV4PU', checkedAt: CHECKED },
    createdAt: '2026-10-12',
  }),

  // --- Osmanlı Paraları ------------------------------------------------------
  product({
    handle: 'iii-mustafa-2-zolota-1768',
    title: 'III. Mustafa Dönemi 2 Zolota (1768)',
    summary: 'Kataloğu KM #324 olarak verilen, 42 mm çaplı büyük boy Osmanlı zolotası.',
    description: [
      'Romanya Ulusal Tarih Müzesi koleksiyonundaki 2 zolota. Müze kaydı paranın III. Mustafa dönemine ait olduğunu, 1768 tarihini ve billon malzemeyi belirtir.',
      'Kayda göre bir yüzde üç, diğer yüzde dört satırlık yazı bulunur; darp yeri ve yıl alt bölümdedir. Kenar düzdür, yüzlerin yönü 12 saattir.',
    ],
    images: [
      img('osm-2-zolota-1768-a.jpg', 1200, 1200, 'Darp yeri ve yıl bulunan yüz', '2 zolotanın darp yeri ve 1171 cülus yılı yazılı yüzü', mnir('/953/Culturalia_b1667dcf_c9d3_4353_8d31_fa0fb20cc740', '28430')),
      img('osm-2-zolota-1768-b.jpg', 1200, 1200, 'Diğer yüz', '2 zolotanın sultanın unvanlarını taşıyan diğer yüzü', mnir('/953/Culturalia_b1667dcf_c9d3_4353_8d31_fa0fb20cc740', '28430')),
    ],
    price: 18500,
    category: 'osmanli-paralari',
    collections: ['seckin-parcalar'],
    country: 'Osmanlı İmparatorluğu',
    period: 'Osmanlı – III. Mustafa (1757–1774)',
    year: 1768,
    denomination: '2 Zolota',
    material: 'Billon',
    dimensions: 'Çap 42,12 mm',
    weight: '27,90 g',
    catalogNumbers: [
      { system: 'KM', value: '324' },
      { system: 'Davenport', value: '326' },
    ],
    offerEnabled: true,
    source: { label: 'MNIR – envanter 28430 (Europeana)', url: 'https://www.europeana.eu/item/953/Culturalia_b1667dcf_c9d3_4353_8d31_fa0fb20cc740', checkedAt: CHECKED },
    createdAt: '2026-10-23',
  }),
  product({
    handle: 'abdulmecid-5-kurus-1848',
    title: 'Abdülmecid Dönemi 5 Kuruş (1848)',
    summary: 'Tuğralı, tırtıklı kenarlı gümüş 5 kuruş; KM #673.',
    description: [
      'Romanya Ulusal Tarih Müzesi koleksiyonundaki gümüş 5 kuruş. Kayda göre bir yüzde, sağında gül bulunan tuğra ve altında emisyon yılı; diğer yüzde darp yeri ile sultanın tahta çıkış yılını içeren yazı vardır.',
      'Kenar tırtıklıdır, yüzlerin yönü 12 saattir.',
    ],
    images: [
      img('osm-5-kurus-1848-a.jpg', 1200, 1200, 'Tuğralı yüz', '5 kuruşun gül motifli tuğra yüzü', mnir('/953/Culturalia_56faa6eb_1fd2_4e36_a09f_fcc4a16776b6', '88341')),
      img('osm-5-kurus-1848-b.jpg', 1200, 1200, 'Yazılı yüz', '5 kuruşun darp yeri yazılı diğer yüzü', mnir('/953/Culturalia_56faa6eb_1fd2_4e36_a09f_fcc4a16776b6', '88341')),
    ],
    price: 4200,
    category: 'osmanli-paralari',
    country: 'Osmanlı İmparatorluğu',
    period: 'Osmanlı – Abdülmecid (1839–1861)',
    year: 1848,
    denomination: '5 Kuruş',
    material: 'Gümüş',
    dimensions: 'Çap 23,66 mm',
    weight: '5,82 g',
    catalogNumbers: [{ system: 'KM', value: '673' }],
    source: { label: 'MNIR – envanter 88341 (Europeana)', url: 'https://www.europeana.eu/item/953/Culturalia_56faa6eb_1fd2_4e36_a09f_fcc4a16776b6', checkedAt: CHECKED },
    createdAt: '2026-10-17',
  }),
  product({
    handle: 'kurus-1187-kostantiniyye',
    title: 'Gümüş Kuruş, H. 1187 Kostantiniyye',
    summary: 'Tuğralı, “duribe fi Kostantiniye 1187” yazılı gümüş kuruş; iki yüzü tek fotoğrafta.',
    description: [
      'Sibiu’daki Brukenthal Ulusal Müzesi’nde bulunan gümüş kuruş. Kayda göre bir yüzde tuğra ve “azze nasruhu duribe fi Kostantiniye 1187”, diğer yüzde “Sultanü’l-berreyn ve Hakanü’l-bahreyn es-Sultan bin es-Sultan” yazısı bulunur.',
      '1187 yılı, I. Abdülhamid’in tahta çıktığı hicri yıldır. Müze kaydı parayı 18. yüzyıla tarihler.',
    ],
    images: [
      img('osm-kurus-1187.jpg', 1200, 600, 'İki yüz', 'Osmanlı gümüş kuruşu: solda tuğralı yüz, sağda yazılı yüz', {
        author: 'Muzeul Național Brukenthal',
        license: LICENSES.ccbysa4,
        sourceUrl: 'https://www.europeana.eu/item/2048047/Clasate_81b182fd1724417a9618be13b9350626',
        sourceLabel: 'Europeana / CIMEC Clasate, envanter T 5533',
        note: 'Kaynaktaki dosya olduğu gibi kullanıldı.',
      }),
    ],
    price: 7900,
    category: 'osmanli-paralari',
    country: 'Osmanlı İmparatorluğu',
    period: 'Osmanlı – I. Abdülhamid (1774–1789)',
    year: 1774,
    yearLabel: 'H. 1187 cülus · 18. yüzyıl',
    denomination: 'Kuruş',
    material: 'Gümüş',
    dimensions: 'Çap 39 mm',
    weight: '17,51 g',
    offerEnabled: true,
    source: { label: 'Brukenthal Ulusal Müzesi – T 5533 (CIMEC Clasate)', url: 'https://clasate.cimec.ro/detaliu.asp?k=81b182fd1724417a9618be13b9350626', checkedAt: CHECKED },
    createdAt: '2026-10-14',
  }),
  product({
    handle: 'abdulmecid-2-kurus-1255',
    title: 'Abdülmecid Dönemi 2 Kuruş (H. 1255 / 9)',
    summary: 'Tuğranın altında 9. saltanat yılı bulunan gümüş 2 kuruş; delikli.',
    description: [
      'Saksonya-Anhalt Arkeoloji Müzesi’ndeki gümüş 2 kuruş. Kayda göre ön yüzde tuğra ve altında saltanat yılı “9 sene”, arka yüzde dört satırda “azze nasruhu duribe fi Kostantiniye 1255” yazısı bulunur.',
      'Müze kaydı parayı 1847 yılına tarihler. Fotoğraflarda parada bir delik açıkça görülüyor.',
    ],
    images: [
      img('osm-2-kurus-1255-a.jpg', 1197, 1200, 'Ön yüz', '2 kuruşun tuğralı ön yüzü, altta delik', kenom('322582', '8938:118:8')),
      img('osm-2-kurus-1255-b.jpg', 1198, 1200, 'Arka yüz', '2 kuruşun darp yeri ve 1255 yılı yazılı arka yüzü', kenom('322582', '8938:118:8')),
    ],
    price: 1600,
    category: 'osmanli-paralari',
    country: 'Osmanlı İmparatorluğu',
    period: 'Osmanlı – Abdülmecid (1839–1861)',
    year: 1847,
    yearLabel: 'H. 1255 / 9 · 1847',
    denomination: '2 Kuruş',
    material: 'Gümüş',
    dimensions: 'Çap 18,31 mm',
    weight: '2,27 g',
    defects: ['Delikli (fotoğrafta görülüyor)'],
    source: { label: 'KENOM – record_DE-MUS-805310_kenom_322582', url: 'https://www.kenom.de/id/record_DE-MUS-805310_kenom_322582', checkedAt: CHECKED },
    createdAt: '2026-10-10',
  }),

  // --- Yabancı Paralar -------------------------------------------------------
  product({
    handle: 'saksonya-taler-1763',
    title: 'Saksonya Taleri (1763)',
    summary: 'Friedrich August büstlü, Polonya-Litvanya ve Saksonya armalı gümüş taler.',
    description: [
      'Ön yüzde sağa dönük Friedrich August büstü ve “D.G.FRID:AUGUST.REX.POL…” yazısı; arka yüzde Polonya-Litvanya ile Saksonya armaları, taç ve “X. EINE FEINE MARCK” ibaresi bulunur. Kenarı yaprak desenlidir.',
      'Bilgiler Saksonya-Anhalt Arkeoloji Müzesi’nin KENOM kaydından alınmıştır.',
    ],
    images: [
      img('yab-saksonya-taler-1763-a.jpg', 1200, 1176, 'Ön yüz', '1763 tarihli Saksonya talerinin Friedrich August büstlü ön yüzü', kenom('215660', '8938:00100:76')),
      img('yab-saksonya-taler-1763-b.jpg', 1200, 1173, 'Arka yüz', '1763 tarihli Saksonya talerinin armalı arka yüzü', kenom('215660', '8938:00100:76')),
    ],
    price: 14500,
    category: 'yabanci-paralar',
    collections: ['seckin-parcalar'],
    country: 'Saksonya (Kutsal Roma İmparatorluğu)',
    period: '18. yüzyıl',
    year: 1763,
    denomination: 'Taler',
    material: 'Gümüş',
    dimensions: 'Çap 41,91 mm',
    weight: '27,58 g',
    offerEnabled: true,
    source: { label: 'KENOM – record_DE-MUS-805310_kenom_215660', url: 'https://www.kenom.de/id/record_DE-MUS-805310_kenom_215660', checkedAt: CHECKED },
    createdAt: '2026-10-18',
  }),
  product({
    handle: 'saksonya-taler-1655',
    title: 'Saksonya Taleri, I. Johann Georg (1655)',
    summary: 'Kılıçlı ve zırhlı I. Johann Georg tasvirli, 21 alanlı armaya sahip taler.',
    description: [
      'Ön yüzde zırhlı ve seçim kılıcıyla I. Johann Georg’un bel hizası tasviri, önünde tüylü miğfer; arka yüzde 21 alanlı arma ve üzerinde sekiz miğfer bulunur.',
      'Bilgiler Saksonya-Anhalt Arkeoloji Müzesi’nin KENOM kaydından alınmıştır. Kayıtta malzeme ayrıca belirtilmediği için burada da yazılmadı.',
    ],
    images: [
      img('yab-saksonya-taler-1655-a.jpg', 1196, 1200, 'Ön yüz', '1655 tarihli talerin I. Johann Georg tasvirli ön yüzü', kenom('215477', '8938:00100:19')),
      img('yab-saksonya-taler-1655-b.jpg', 1195, 1200, 'Arka yüz', '1655 tarihli talerin armalı arka yüzü', kenom('215477', '8938:00100:19')),
    ],
    price: 16800,
    category: 'yabanci-paralar',
    country: 'Saksonya (Kutsal Roma İmparatorluğu)',
    period: '17. yüzyıl',
    year: 1655,
    denomination: 'Taler',
    dimensions: 'Çap 46,53 mm',
    weight: '26,90 g',
    source: { label: 'KENOM – record_DE-MUS-805310_kenom_215477', url: 'https://www.kenom.de/id/record_DE-MUS-805310_kenom_215477', checkedAt: CHECKED },
    createdAt: '2026-10-06',
  }),
  product({
    handle: 'fransa-yarim-frank-1808',
    title: 'Fransa ½ Frank, I. Napolyon (1808)',
    summary: 'Defne çelenkli Napolyon başlı, K darphane işaretli gümüş yarım frank.',
    description: [
      'Ön yüzde defne çelenkli I. Napolyon başı ve “NAPOLEON EMPEREUR”, arka yüzde “REPUBLIQUE FRANÇAISE”, dallar arasında “DEMI FRANC”, 1808 yılı ve K darphane işareti bulunur.',
      'Müze kaydında “Fundmünze” (buluntu sikke) olarak geçer.',
    ],
    images: [
      img('yab-fransa-yarim-frank-1808-a.jpg', 1200, 1199, 'Ön yüz', '1808 tarihli yarım frankın Napolyon başlı ön yüzü', kenom('322542', '8938:107:7')),
      img('yab-fransa-yarim-frank-1808-b.jpg', 1200, 1196, 'Arka yüz', '1808 tarihli yarım frankın DEMI FRANC yazılı arka yüzü', kenom('322542', '8938:107:7')),
    ],
    price: 2900,
    category: 'yabanci-paralar',
    country: 'Fransa',
    period: 'I. Fransız İmparatorluğu (1804–1814)',
    year: 1808,
    denomination: '½ Frank',
    material: 'Gümüş',
    dimensions: 'Çap 18,01 mm',
    weight: '2,49 g',
    source: { label: 'KENOM – record_DE-MUS-805310_kenom_322542', url: 'https://www.kenom.de/id/record_DE-MUS-805310_kenom_322542', checkedAt: CHECKED },
    createdAt: '2026-10-03',
  }),

  // --- Sertifikalı Paralar ---------------------------------------------------
  product({
    handle: 'pcgs-ms63-morgan-dolar-1904-o',
    title: 'ABD Morgan Doları 1904-O, PCGS MS63',
    summary: 'PCGS kapsülünde, MS63 dereceli 1904 tarihli “O” darphane işaretli Morgan doları.',
    description: [
      '1904 tarihli, “O” darphane işaretli Morgan doları. Para, PCGS’nin mühürlü kapsülü içindedir; derece ve sertifika numarası kapsül etiketinden okunmuştur.',
      'Fotoğraf yalnızca kapsülün ön yüzünü gösterir.',
    ],
    images: [img('sert-1904-o-pcgs.jpg', 721, 952, 'Kapsül, ön yüz', 'PCGS kapsülünde 1904-O Morgan doları; etikette MS63 ve sertifika numarası', commons('PCGS certified 1904-O MS 63.jpg', 'Bruxton', LICENSES.pd))],
    imageNote: 'Kaynakta yalnızca kapsülün ön yüzü fotoğraflanmış.',
    price: 4900,
    category: 'sertifikali-paralar',
    collections: ['seckin-parcalar'],
    country: 'ABD',
    period: '20. yüzyıl başı',
    year: 1904,
    yearLabel: '1904 (O darphane işareti)',
    denomination: '1 Dolar (Morgan)',
    certificate: { issuer: 'PCGS', grade: 'MS63', gradeLabel: 'Mint State 63', number: '2472863', verifyUrl: null },
    conditionNote: 'Derece, kapsül etiketindeki PCGS değerlendirmesidir.',
    source: { label: 'Wikimedia Commons – PCGS certified 1904-O MS 63.jpg', url: 'https://commons.wikimedia.org/wiki/File:PCGS_certified_1904-O_MS_63.jpg', checkedAt: CHECKED },
    createdAt: '2026-10-16',
  }),
  product({
    handle: 'ngc-ms63-peace-dolar-1922',
    title: 'ABD Peace Doları 1922, NGC MS 63',
    summary: '“Great Montana Collection” etiketli NGC kapsülünde, MS 63 dereceli 1922 Peace doları.',
    description: [
      '1922 tarihli Peace doları, NGC (Numismatic Guaranty Corporation) kapsülü içindedir. Etikette “Great Montana Collection”, MS 63 derecesi ve sertifika numarası yazılıdır.',
      'Fotoğraf yalnızca kapsülün ön yüzünü gösterir.',
    ],
    images: [img('sert-1922-ngc.jpg', 900, 1240, 'Kapsül, ön yüz', 'NGC kapsülünde 1922 Peace doları; etikette MS 63', commons('1922 Peace dollar from the Great Montana Collection graded and slabbed by NGC.jpg', 'Bruxton', LICENSES.cc0))],
    imageNote: 'Kaynakta yalnızca kapsülün ön yüzü fotoğraflanmış.',
    price: 3900,
    category: 'sertifikali-paralar',
    country: 'ABD',
    period: '20. yüzyıl başı',
    year: 1922,
    denomination: '1 Dolar (Peace)',
    certificate: { issuer: 'NGC', grade: 'MS 63', gradeLabel: 'Mint State 63', number: '1961816-121', verifyUrl: null },
    conditionNote: 'Derece, kapsül etiketindeki NGC değerlendirmesidir.',
    offerEnabled: true,
    source: { label: 'Wikimedia Commons – 1922 Peace dollar … slabbed by NGC.jpg', url: 'https://commons.wikimedia.org/wiki/File:1922_Peace_dollar_from_the_Great_Montana_Collection_graded_and_slabbed_by_NGC.jpg', checkedAt: CHECKED },
    createdAt: '2026-10-11',
  }),
  product({
    handle: 'ngc-ms64-morgan-dolar-1884-o',
    title: 'ABD Morgan Doları 1884-O, NGC MS 64',
    summary: '“Fitzgerald Collection” etiketli NGC kapsülünde, MS 64 dereceli 1884-O Morgan doları.',
    description: [
      '1884 tarihli, “O” darphane işaretli Morgan doları. NGC kapsül etiketinde “Fitzgerald Collection”, “Fitzgerald’s Nevada Club Reno Hoard”, MS 64 derecesi ve sertifika numarası yazılıdır.',
      'Fotoğraf yalnızca kapsülün ön yüzünü gösterir.',
    ],
    images: [img('sert-1884-o-ngc.jpg', 900, 1240, 'Kapsül, ön yüz', 'NGC kapsülünde 1884-O Morgan doları; etikette MS 64', commons('NGC slabbed Morgan dollar from the Fitzgerald collection.jpg', 'Bruxton', LICENSES.pd))],
    imageNote: 'Kaynakta yalnızca kapsülün ön yüzü fotoğraflanmış.',
    price: 5600,
    availableForSale: false,
    quantityAvailable: 0,
    category: 'sertifikali-paralar',
    country: 'ABD',
    period: '19. yüzyıl',
    year: 1884,
    yearLabel: '1884 (O darphane işareti)',
    denomination: '1 Dolar (Morgan)',
    certificate: { issuer: 'NGC', grade: 'MS 64', gradeLabel: 'Mint State 64', number: '1834420-037', verifyUrl: null },
    conditionNote: 'Derece, kapsül etiketindeki NGC değerlendirmesidir.',
    source: { label: 'Wikimedia Commons – NGC slabbed Morgan dollar from the Fitzgerald collection.jpg', url: 'https://commons.wikimedia.org/wiki/File:NGC_slabbed_Morgan_dollar_from_the_Fitzgerald_collection.jpg', checkedAt: CHECKED },
    createdAt: '2026-09-29',
  }),

  // --- Diğer Koleksiyon ve Antika ------------------------------------------
  product({
    handle: 'ayasofya-restorasyonu-madalyasi-1849',
    title: 'Ayasofya Restorasyonu Madalyası (1849)',
    summary: 'Abdülmecid döneminde Fossati’nin yaptığı restorasyon için basılmış gümüş madalya.',
    description: [
      'Her iki yüzünde Ayasofya’nın iç mekânı tasvir edilir. Alt bölümdeki Fransızca yazıya göre yapı Justinianus tarafından 532–537’de inşa edilmiş, 1453’te camiye dönüştürülmüş ve Sultan Abdülmecid döneminde 1847–1849 arasında G. Fossati tarafından restore edilmiştir.',
      'Gravür: Jacques Wiener (Brüksel). Bilgiler Romanya Ulusal Tarih Müzesi kaydından alınmıştır.',
    ],
    images: [
      img('diger-ayasofya-1849-a.jpg', 1200, 1200, 'Yüz 1', 'Ayasofya iç mekânını gösteren madalyanın bir yüzü', mnir('/951/Culturalia_a2dff2b5_56e2_46cc_9dda_8384fd7206e9', '317879')),
      img('diger-ayasofya-1849-b.jpg', 1200, 1200, 'Yüz 2', 'Ayasofya iç mekânını gösteren madalyanın diğer yüzü', mnir('/951/Culturalia_a2dff2b5_56e2_46cc_9dda_8384fd7206e9', '317879')),
    ],
    price: 24000,
    category: 'diger-koleksiyon-ve-antika',
    collections: ['seckin-parcalar'],
    country: 'Osmanlı İmparatorluğu',
    period: 'Osmanlı – Abdülmecid (1839–1861)',
    year: 1849,
    denomination: 'Madalya',
    material: 'Gümüş',
    dimensions: 'Çap 59,56 mm',
    weight: '107,20 g',
    offerEnabled: true,
    source: { label: 'MNIR – envanter 317879 (Europeana)', url: 'https://www.europeana.eu/item/951/Culturalia_a2dff2b5_56e2_46cc_9dda_8384fd7206e9', checkedAt: CHECKED },
    createdAt: '2026-10-15',
  }),
  product({
    handle: 'abdulmecid-islahat-madalyasi-1850',
    title: '“Régénération de l’Empire d’Osman” Madalyası (1850)',
    summary: 'Abdülmecid’in reformları için basılmış, 100 mm çaplı bakır madalya.',
    description: [
      'Bir yüzde ışınlı tuğranın altında Osmanlı armaları ve “RÉGÉNÉRATION DE L’EMPIRE D’OSMAN PAR ABDUL-MEDJID” yazısı; kenarda reform ilkelerinin yazılı olduğu altı kartuş bulunur.',
      'Diğer yüzde dalgalı denizden yükselen, üzerinde iki minareli cami bulunan bir kale, “L’EMPIRE SUBSISTERA DIEU LE VEUT” yazısı ve 1850 yılı yer alır. Gravür: Laurent J. Hart (Brüksel).',
    ],
    images: [
      img('diger-abdulmecid-1850-a.jpg', 1200, 1197, 'Kale tasvirli yüz', '1850 tarihli madalyanın denizden yükselen kale tasvirli yüzü', mnir('/951/Culturalia_7e57e6fe_4cff_4b23_a236_aa9a3e927225', '323293')),
      img('diger-abdulmecid-1850-b.jpg', 1200, 1190, 'Tuğralı yüz', '1850 tarihli madalyanın tuğra ve armalı yüzü', mnir('/951/Culturalia_7e57e6fe_4cff_4b23_a236_aa9a3e927225', '323293')),
    ],
    price: 32000,
    category: 'diger-koleksiyon-ve-antika',
    country: 'Osmanlı İmparatorluğu',
    period: 'Osmanlı – Abdülmecid (1839–1861)',
    year: 1850,
    denomination: 'Madalya',
    material: 'Bakır',
    dimensions: 'Çap 99,99 mm',
    weight: '523,96 g',
    source: { label: 'MNIR – envanter 323293 (Europeana)', url: 'https://www.europeana.eu/item/951/Culturalia_7e57e6fe_4cff_4b23_a236_aa9a3e927225', checkedAt: CHECKED },
    createdAt: '2026-10-05',
  }),
  product({
    handle: 'osmanli-askeri-madalyasi-abdulmecid',
    title: 'Osmanlı Askerî Madalyası, Abdülmecid Tuğralı',
    summary: 'Bir yüzünde bayraklı iki asker bulunan, askılı bronz askerî madalya.',
    description: [
      'Bir yüzde defne çelengi içinde Abdülmecid tuğrası, üzerinde çapraz iki top ve yedi yıldız; diğer yüzde bayrak tutan iki Osmanlı askeri, üstte hilal ve Osmanlıca yazı bulunur. Kenar tırtıklıdır.',
      'Müze kaydına göre madalya muhtemelen Kırım Savaşı (1853–1856) sırasında veya sonrasında yapılmıştır. Kayıtta tuğranın madalya üzerinde hatalı işlenmiş olabileceği de belirtilir.',
    ],
    images: [
      img('diger-askeri-madalya-a.jpg', 1137, 1200, 'Askerli yüz', 'Bayrak tutan iki Osmanlı askerini gösteren madalya yüzü', mnir('/951/Culturalia_2199cb5b_5d12_4fa3_a4b2_ca1e76b89f58', '325397')),
      img('diger-askeri-madalya-b.jpg', 1148, 1200, 'Tuğralı yüz', 'Defne çelengi içinde tuğra ve çapraz topları gösteren madalya yüzü', mnir('/951/Culturalia_2199cb5b_5d12_4fa3_a4b2_ca1e76b89f58', '325397')),
    ],
    price: 5400,
    category: 'diger-koleksiyon-ve-antika',
    country: 'Osmanlı İmparatorluğu',
    period: 'Osmanlı – Abdülmecid (1839–1861)',
    year: null,
    yearLabel: '19. yüzyıl (müze kaydı)',
    denomination: 'Askerî madalya',
    material: 'Bronz',
    dimensions: 'Çap 33,5 mm',
    weight: '13,05 g',
    source: { label: 'MNIR – envanter 325397 (Europeana)', url: 'https://www.europeana.eu/item/951/Culturalia_2199cb5b_5d12_4fa3_a4b2_ca1e76b89f58', checkedAt: CHECKED },
    createdAt: '2026-10-02',
  }),
  product({
    handle: 'trakya-manevrasi-hatirasi-1937',
    title: 'Trakya I. Ordu Manevrası Hatırası (1937)',
    summary: '20 Ağustos 1937 tarihli, “K. Atatürk” imzalı hatıra madalyonu.',
    description: [
      'Bir yüzde “TRAKYA I. ORDU MANEVRASI HATIRASI”, ortada “K. Atatürk” imzası ve “20 – VIII – 1937” tarihi bulunur.',
      'Görsel kaynağına göre parça, süvari astsubayı Rıza Eratalay’a aittir. Malzeme kaynakta belirtilmemiştir.',
    ],
    images: [
      img('diger-trakya-1937-a.jpg', 723, 763, 'Yüz 1', 'TRAKYA I. ORDU MANEVRASI HATIRASI yazılı, Atatürk imzalı ve 1937 tarihli yüz', commons('1937 Thrace Military Manouvres Momento Side-1.jpg', 'Ertly', LICENSES.ccbysa3)),
      img('diger-trakya-1937-b.jpg', 786, 706, 'Yüz 2', '1937 Trakya manevrası hatıra madalyonunun diğer yüzü', commons('1937 Thrace Military Manouvres Momento Side-2.jpg', 'Ertly', LICENSES.ccbysa3)),
    ],
    price: 2750,
    category: 'diger-koleksiyon-ve-antika',
    country: 'Türkiye',
    period: 'Erken Cumhuriyet (1923–1950)',
    year: 1937,
    yearLabel: '20 Ağustos 1937',
    denomination: 'Hatıra madalyonu',
    offerEnabled: true,
    source: { label: 'Wikimedia Commons – 1937 Thrace Military Manouvres Momento', url: 'https://commons.wikimedia.org/wiki/File:1937_Thrace_Military_Manouvres_Momento_Side-1.jpg', checkedAt: CHECKED },
    createdAt: '2026-10-13',
  }),

  // --- Koleksiyon paketi -----------------------------------------------------
  product({
    kind: 'set',
    handle: 'osmanli-gumus-sus-parasi-uclusu',
    title: 'Osmanlı Gümüş Süs Parası Üçlüsü',
    summary: 'Askı takılarak süs olarak kullanılmış, Kostantiniyye darplı üç gümüş Osmanlı parası.',
    description: [
      'Osmanlı döneminde Kostantiniyye’de basılmış, sonradan askı eklenerek Suriye’de süs parası olarak kullanılmış üç gümüş para. Paralarda “Kostantiniyye’de basıldı” ibaresi okunur.',
      'Müze kaydına göre paralardan birinin yılı H. 1293 (1876–1877), birininki H. 1327 (1909–1910); üçüncüsünün yılı okunamıyor. Pakette üç paranın tamamı birlikte yer alır.',
    ],
    images: [
      img('set-osmanli-sus-parasi.jpg', 1500, 818, 'Üç parça birlikte', 'Askılı üç Osmanlı gümüş parası yan yana', {
        author: 'Wereldmuseum (Nationaal Museum van Wereldculturen)',
        license: LICENSES.cc0,
        sourceUrl: 'https://hdl.handle.net/20.500.11840/103089',
        sourceLabel: 'Wereldmuseum, TM-3317-91',
        note: 'Kaynaktaki dosya olduğu gibi kullanıldı.',
      }),
    ],
    imageNote: 'Kaynakta paraların yalnızca bu yüzleri fotoğraflanmış.',
    price: 8700,
    category: 'osmanli-paralari',
    country: 'Osmanlı İmparatorluğu',
    period: 'Osmanlı – 19. yüzyıl sonu / 20. yüzyıl başı',
    year: 1876,
    yearLabel: 'H. 1293 – H. 1327',
    material: 'Gümüş',
    pieceCount: 3,
    setItems: [
      { title: 'Gümüş para, askılı', year: 'H. 1293 (1876–1877)', period: 'Osmanlı', note: 'Kostantiniyye darbı' },
      { title: 'Gümüş para, askılı', year: 'H. 1327 (1909–1910)', period: 'Osmanlı', note: 'Kostantiniyye darbı' },
      { title: 'Gümüş para, askılı', year: null, period: 'Osmanlı', note: 'Kostantiniyye darbı' },
    ],
    defects: ['Paralara sonradan askı eklenmiş (süs parası olarak kullanım)'],
    offerEnabled: true,
    source: { label: 'Wereldmuseum – TM-3317-91 (Europeana)', url: 'https://www.europeana.eu/item/2048221/europeana_fashion_103089', checkedAt: CHECKED },
    createdAt: '2026-10-09',
  }),
];

/** Kategori kartlarında kullanılacak görsel: kategorideki bir ürünün gerçek fotoğrafı. */
export const categoryImages = {
  'tc-kagit-paralari': '1-emisyon-5-turk-lirasi',
  'tc-madeni-paralari': '10-lira-1986',
  'osmanli-paralari': 'abdulmecid-5-kurus-1848',
  'yabanci-paralar': 'saksonya-taler-1763',
  'sertifikali-paralar': 'ngc-ms63-peace-dolar-1922',
  'diger-koleksiyon-ve-antika': 'ayasofya-restorasyonu-madalyasi-1849',
};
