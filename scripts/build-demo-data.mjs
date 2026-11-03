/**
 * DEMO ENVANTER DÖNÜŞTÜRÜCÜ
 * ------------------------------------------------------------------
 * eskiparamarket.com'dan düşük hızla alınmış ham kayıtları (demo-kaynak/)
 * ortak ürün modeline çevirir → src/data/demo/{products,categories,collections}.json
 *
 * İlkeler:
 *  - Teknik özellikler yalnızca kaynak ürün başlığından/kategorisinden açıkça
 *    okunabiliyorsa doldurulur; okunamayan alan null kalır.
 *  - Uzun kaynak metinleri kopyalanmaz; kısa açıklama özelliklerden üretilir.
 *  - Kaynak sitenin iletişim/kurumsal/kargo metinleri alınmaz.
 *  - Kaynak kategori ilişkilerindeki açık hatalar belgelenmiş kurallarla düzeltilir
 *    (bkz. CORRECTIONS ve docs/DEMO-ENVANTER.md).
 *
 * Kullanım: node scripts/build-demo-data.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { buildSpecs } from '../src/lib/specs.js';
import { slugify, titleCaseTr } from '../src/lib/slug.js';
import { fold } from '../src/lib/search/normalize.js';

const SRC = 'demo-kaynak';
const crawlCats = JSON.parse(readFileSync(`${SRC}/kategori-taramasi.json`, 'utf8'));
const rawProducts = JSON.parse(readFileSync(`${SRC}/urun-taramasi.json`, 'utf8'));
const imgManifest = JSON.parse(readFileSync(`${SRC}/gorsel-indirme.json`, 'utf8'));
const imgMeta = existsSync(`${SRC}/gorsel-olculeri.json`) ? JSON.parse(readFileSync(`${SRC}/gorsel-olculeri.json`, 'utf8')) : {};

// ---------------------------------------------------------------------------
// 1) Kategori eşlemesi: kaynak yol → İlkim yolu
// ---------------------------------------------------------------------------
const TOP = {
  't-c-kagit-paralar': { path: 'tc-kagit-paralar', title: 'T.C. Kâğıt Paraları', sort: 1, kind: 'banknot', description: 'Türkiye Cumhuriyeti banknotları; emisyonlara ve nominal değerlere göre.' },
  't-c-madeni-paralar': { path: 'tc-madeni-paralar', title: 'T.C. Madeni Paraları', sort: 2, kind: 'madeni', description: 'Cumhuriyet dönemi tedavül paraları ve setleri; dönemlere göre.' },
  't-c-hatira-paralar': { path: 'tc-hatira-paralari', title: 'T.C. Hatıra Paraları', sort: 3, kind: 'madeni', description: 'Hatıra amaçlı basılmış madeni paralar ve setler.' },
  'osmanli-paralari': { path: 'osmanli-paralari', title: 'Osmanlı Paraları', sort: 4, description: 'Osmanlı dönemi kâğıt paraları ve sikkeleri; hükümdarlara göre.' },
  'yabanci-paralar': { path: 'yabanci-paralar', title: 'Yabancı Paralar', sort: 5, description: 'Dünya banknotları ve paraları; ülkelere göre.' },
};
// Kaynakta üst seviye olup İlkim'de bir grup altına alınanlar
const REGROUP = {
  pul: 'pul-ve-koleksiyon-malzemeleri/pul',
  'koleksiyon-malzeme': 'pul-ve-koleksiyon-malzemeleri/koleksiyon-malzemeleri',
  'fantazi-paralar': 'antika-ve-diger/fantazi-paralar',
};
// Kaynakta kategori olmayan ama İlkim yapısında bulunan gruplar (ürün doğrulanamazsa boş kalır)
const EXTRA_CATEGORIES = [
  { path: 'pul-ve-koleksiyon-malzemeleri', title: 'Pul ve Koleksiyon Malzemeleri', sort: 6, description: 'Pullar ile albüm, föy, kapsül ve katalog gibi koleksiyon malzemeleri.' },
  { path: 'madalya-ve-objeler', title: 'Madalya ve Objeler', sort: 7, description: 'Madalya, nişan ve numizmatik objeler.' },
  { path: 'antika-ve-diger', title: 'Antika ve Diğer Koleksiyon Ürünleri', sort: 8, description: 'Antika parçalar ve diğer koleksiyon ürünleri.' },
  { path: 'antika-ve-diger/antika', title: 'Antika', sort: 1, description: 'Antika koleksiyon parçaları.' },
];
// Pazarlama listeleri — kategori değil, ürün işareti olarak tutulur
const FLAG_CATS = { 'yeni-urunler': 'newInSource', 'firsat-urunu': 'dealInSource' };
// Seçkiye (koleksiyona) dönüştürülenler — ürün çoğaltılmaz
const COLLECTION_CATS = { 'sertifikali-paralar': 'sertifikali-paralar' };

const cleanSeg = (s) => s.replace(/-(\d)$/, '').replace(/-\d$/, ''); // “100-lira-2” → “100-lira”, “abhazya-1” → “abhazya”

// Ülke alt kategorilerinde kaynak adres parçası bazen ülke adıyla uyuşmuyor
// (ör. “guney-osetya” adresli kategori “Güney Vietnam” adını taşıyor). İlkim'de adres ülke adından üretilir.
const foreignSlug = new Map();
{
  const seen = new Set();
  for (const [src, v] of Object.entries(crawlCats)) {
    const parts = src.split('/');
    if (parts[0] !== 'yabanci-paralar' || parts.length !== 2) continue;
    let slug = slugify((v.name ?? parts[1]).replace(/ /g, ' ')) || cleanSeg(parts[1]);
    while (seen.has(slug)) slug += '-2';
    seen.add(slug);
    foreignSlug.set(src, slug);
  }
}

function mapPath(src) {
  if (FLAG_CATS[src] || COLLECTION_CATS[src]) return null;
  if (foreignSlug.has(src)) return `yabanci-paralar/${foreignSlug.get(src)}`;
  if (REGROUP[src]) return REGROUP[src];
  const parts = src.split('/');
  if (parts[0] === 'koleksiyon-malzeme') return `pul-ve-koleksiyon-malzemeleri/koleksiyon-malzemeleri/${parts.slice(1).map(cleanSeg).join('/')}`;
  const top = TOP[parts[0]];
  if (!top) return null;
  return [top.path, ...parts.slice(1).map(cleanSeg)].join('/');
}

function cleanCatTitle(srcPath, raw) {
  const t = (raw ?? '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const top = TOP[srcPath];
  if (top) return top.title;
  if (srcPath === 'pul') return 'Pul';
  if (srcPath === 'koleksiyon-malzeme') return 'Koleksiyon Malzemeleri';
  if (srcPath === 'fantazi-paralar') return 'Fantazi Paralar';
  let x = t
    .replace(/(\d)\.?\s*Emisyon/i, '$1. Emisyon')
    .replace(/^(I{1,3}|IV|V|VI)\.\s*/, '$1. ')
    .replace(/\s*-\s*/g, '–')
    .replace(/\s*\(\s*/g, ' (').replace(/\s*\)/g, ')');
  if (x === x.toLocaleUpperCase('tr-TR')) x = titleCaseTr(x).replace(/\bYtl\b/g, 'YTL');
  x = x.replace(/–Dönemi/, ' Dönemi').replace(/(\d{4})–(\d{4})/, '$1–$2');
  return x;
}

const categories = new Map();
for (const c of EXTRA_CATEGORIES) categories.set(c.path, { ...c, parent: c.path.includes('/') ? c.path.split('/').slice(0, -1).join('/') : null, sourceUrl: null });
for (const [src, v] of Object.entries(crawlCats)) {
  const path = mapPath(src);
  if (!path) continue;
  const parts = path.split('/');
  const topInfo = TOP[src.split('/')[0]];
  categories.set(path, {
    path,
    title: cleanCatTitle(src, v.name),
    parent: parts.length > 1 ? parts.slice(0, -1).join('/') : null,
    description: topInfo && parts.length === 1 ? topInfo.description : null,
    sort: topInfo && parts.length === 1 ? topInfo.sort : 0,
    sourceUrl: `https://eskiparamarket.com/${src}`,
  });
}
// Ara kategori eksikse (ör. koleksiyon-malzemeleri altı) oluştur
for (const c of [...categories.values()]) {
  let p = c.parent;
  while (p && !categories.has(p)) {
    const parts = p.split('/');
    categories.set(p, { path: p, title: titleCaseTr(parts.at(-1).replace(/-/g, ' ')), parent: parts.length > 1 ? parts.slice(0, -1).join('/') : null, description: null, sort: 0, sourceUrl: null });
    p = categories.get(p).parent;
  }
}
// Özel başlık düzeltmeleri
const TITLE_FIX = {
  'tc-hatira-paralari/bronz-princ-hatira-paralar': 'Bronz ve Pirinç Hatıra Paraları',
  'tc-hatira-paralari/gumus-hatira-paralar': 'Gümüş Hatıra Paraları',
  'tc-hatira-paralari/tedavul-hatira-paralar': 'Tedavül Hatıra Paraları',
  'tc-hatira-paralari/bimetal-nikel-aluminyum': 'Bimetal, Nikel ve Alüminyum',
  'tc-madeni-paralar/2004-ve-sonrasi-donem': '2004 ve Sonrası Dönem',
  'osmanli-paralari/osmanli-madeni-paralari/iv-murat': 'IV. Murad',
  'osmanli-paralari/osmanli-madeni-paralari/v-mehmed-resad': 'V. Mehmed Reşad',
  'osmanli-paralari/osmanli-madeni-paralari/vi-mehmed-vahdeddin': 'VI. Mehmed Vahdeddin',
  'osmanli-paralari/osmanli-madeni-paralari/ii-abdulhamid': 'II. Abdülhamid',
  'osmanli-paralari/osmanli-kagit-paralari/ii-abdulhamid': 'II. Abdülhamid',
  'osmanli-paralari/osmanli-kagit-paralari': 'Osmanlı Kâğıt Paraları',
  'osmanli-paralari/osmanli-madeni-paralari': 'Osmanlı Madeni Paraları',
};
for (const [p, t] of Object.entries(TITLE_FIX)) if (categories.has(p)) categories.get(p).title = t;

// ---------------------------------------------------------------------------
// 2) Ürün → kaynak kategori üyelikleri
// ---------------------------------------------------------------------------
const membership = new Map(); // sourceId → Set(srcPath)
const listingInfo = new Map();
for (const [src, v] of Object.entries(crawlCats)) {
  for (const p of v.products) {
    if (!membership.has(p.id)) membership.set(p.id, new Set());
    membership.get(p.id).add(src);
    if (!listingInfo.has(p.id)) listingInfo.set(p.id, p);
  }
}

// Ülke adı sözlüğü (yabancı alt kategorilerinden)
const countryByPath = new Map();
for (const c of categories.values()) if (c.parent === 'yabanci-paralar') countryByPath.set(c.path, c.title);
const countryIndex = [...countryByPath.entries()].map(([path, title]) => ({ path, title, key: fold(title.replace(/\(.*?\)/g, '')).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim() }))
  .sort((a, b) => b.key.length - a.key.length);

// ---------------------------------------------------------------------------
// 3) Başlık ayrıştırma
// ---------------------------------------------------------------------------
const UNIT_STOP = new Set(['GÜMÜŞ', 'GÖZLÜ', 'TÜRK', 'ATA', 'SAYFA', 'KÜLTÜR', 'YILI', 'ÖMER', 'Lİ', 'KONDİSYON', 'PİK', 'YIL', 'SERİ', 'TERTİP', 'EMİSYON', 'ADET', 'LİRADAN', 'KADAR', 'NO', 'DARPHANE', 'HATIRA', 'MÜTHİŞ', 'BİR', 'SETİ', 'SET']);
const OTTOMAN_RULERS = [
  { re: /ABD[ÜU]LMEC[İI]D/i, name: 'Abdülmecid' },
  { re: /ABD[ÜU]LAZ[İI]Z/i, name: 'Abdülaziz' },
  { re: /II\.?\s*ABD[ÜU]LHAM[İI][DT]/i, name: 'II. Abdülhamid' },
  { re: /(?:V\.?\s*)?MEHME[DT]\s*RE[ŞS]A[DT]/i, name: 'V. Mehmed Reşad' },
  { re: /VAHDEDD[İI]N/i, name: 'VI. Mehmed Vahdeddin' },
];
const METALS = [
  [/G[ÜU]M[ÜU][ŞS]/i, 'Gümüş'], [/\bALTIN\b/i, 'Altın'], [/\bBRONZ\b/i, 'Bronz'],
  [/N[İI]KEL/i, 'Nikel'], [/P[İI]R[İI]N[ÇC]|PR[İI]N[ÇC]/i, 'Pirinç'], [/B[İI]METAL/i, 'Bimetal'], [/BAKIR/i, 'Bakır'],
];

function parseNumber(s) {
  let t = s.replace(/\s+/g, '');
  if (/^\d+\s*(1\/2|½)$/.test(s.replace(/\s+/g, ' ').trim()) || /½|1\/2/.test(t)) {
    const base = parseInt(t, 10);
    return (Number.isFinite(base) && !/^(1\/2|½)/.test(t) ? base : 0) + 0.5;
  }
  if (/^\d{1,3}([.,]\d{3})+$/.test(t)) return Number(t.replace(/[.,]/g, ''));
  if (/^\d+,\d{1,2}$/.test(t)) return Number(t.replace(',', '.'));
  if (/^\d+\.\d{1,2}$/.test(t)) return Number(t);
  return Number(t.replace(/[^\d]/g, ''));
}

function unitLabel(words) {
  const w = words.join(' ').toLocaleUpperCase('tr-TR');
  if (/^YEN[İI] T[ÜU]RK L[İI]RASI/.test(w) || w === 'YTL') return 'YTL';
  return titleCaseTr(words.join(' '));
}

function parseTitle(rawTitle) {
  const T = rawTitle.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const U = T.toLocaleUpperCase('tr-TR');
  const out = {};

  const em = U.match(/(\d)\s*[.,]?\s*EM[İI]SYON/);
  if (em) out.emission = Number(em[1]);
  const tertip = U.match(/(\d)\s*[.,]?\s*TERT[İI]P/);
  if (tertip) out.tertip = Number(tertip[1]);

  // Katalog numarası (Pick) — “PİK P-173a”, “P#104/B”, “PİK PS532a”, “PİK P-S/1073”, “PİK P/64”
  const pick = U.match(/P[İI]K\s*(?:P(?![A-ZİI]{2})\s*[-#.,/]*\s*)?((?:S\s*[-/]?\s*)?R?\d+(?:\s*[/-]?\s*[A-ZİI](?![A-ZİI]))?)/)
    || U.match(/\bP\s*[#-]\s*((?:S\s*[-/]?\s*)?R?\d+(?:\s*[/-]?\s*[A-ZİI](?![A-ZİI]))?)/)
    || U.match(/\bPKARE\s*(R?\d+[A-Z]?)/);
  if (pick) {
    const core = pick[1].replace(/[\s/-]/g, '').replace(/İ/g, 'I');
    const m2 = core.match(/^(S?)(R?)(\d+)([A-Z]?)$/);
    out.catalogNumber = m2 ? `Pick P-${m2[1]}${m2[2]}${m2[3]}${m2[4].toLowerCase()}` : `Pick P-${core}`;
  }
  const km = U.match(/\bKM\s*#?\s*(\d+(?:\.\d+)?)/);
  if (km) out.catalogNumber = (out.catalogNumber ? out.catalogNumber + ' · ' : '') + `KM# ${km[1]}`;

  // Sertifika
  const cert = U.match(/\b(PMG|NGC|PCGS|ANACS)\s*(\d{1,2})\b/);
  if (cert) { out.certService = cert[1]; out.certGrade = Number(cert[2]); }
  if (/SERT[İI]F[İI]KALI/.test(U)) out.hasCertificateWord = true;

  // Kondisyon (kaynağın 10'luk ölçeği)
  const cond = U.match(/KOND[İI]SYON\s*:?\s*(?:KOND[İI]SYON\s*)?(\d{1,2})\s*\/\s*(\d{1,2}(?:[.,]\d)?)/);
  if (cond) out.condition = `${cond[1]}/${cond[2].replace('.', ',')}`;
  else if (/\bÇ[İI]L\s*\/\s*Ç[İI]LALTI\b/.test(U)) out.condition = 'Çil / çilaltı';
  else if (/\bÇT\b/.test(U)) out.condition = 'Çok temiz (ÇT)';
  else if (/\bÇ[İI]L\b/.test(U)) out.condition = 'Çil';
  if (out.condition && /^\d/.test(out.condition)) out.conditionScale = '10 üzerinden (kaynak satıcı ölçeği)';

  // Metal
  for (const [re, name] of METALS) if (re.test(U)) { out.metal = name; break; }
  if (/POL[İI]MER/.test(U)) out.polymer = true;

  // Hükümdar
  for (const r of OTTOMAN_RULERS) if (r.re.test(U)) { out.ruler = r.name; break; }

  // Nominal değer: emisyon/tertip/yıl/katalog ifadeleri çıkarıldıktan sonra ilk “sayı + birim”
  let D = U
    .replace(/\d\s*[.,]?\s*EM[İI]SYON/g, ' ')
    .replace(/\d\s*[.,]?\s*TERT[İI]P/g, ' ')
    .replace(/P[İI]K\s*(?:P\s*[-#.]?\s*)?R?\d+\S*/g, ' ')
    .replace(/\bP\s*[#-]\s*R?\d+\S*/g, ' ')
    .replace(/KOND[İI]SYON.*$/g, ' ')
    .replace(/YIL\s*\d{4}(\s*\/\s*\d{2,4})?/g, ' ')
    .replace(/\b1[123]\d\d\s*\/\s*\d{1,2}\b/g, ' ')
    .replace(/\(.*?\)/g, ' ');
  const re = /(\d[\d.,]*(?:\s+(?:1\/2|½))?|½|1\/2)\s*([A-ZÇĞİÖŞÜÂ]+(?:\s+[A-ZÇĞİÖŞÜÂ]+){0,2})/g;
  let m;
  while ((m = re.exec(D))) {
    const words = m[2].split(' ');
    if (UNIT_STOP.has(words[0])) continue;
    // Yıl gibi duran sayı (ör. “1937 ATA 1 LİRA”) ancak ardından para birimi olmayan bir kelime geliyorsa atlanır;
    // “2000 Yen”, “2000 Francs” nominal değer kabul edilir (UNIT_STOP listesi).
    if (/^(1[89]\d\d|20[0-3]\d),$/.test(m[1])) continue; // “2023, DARPHANE …”
    let unitWords = [words[0]];
    if (/^YEN[İI]$/.test(words[0]) && words[1] === 'TÜRK') unitWords = ['YENİ', 'TÜRK', 'LİRASI'];
    else if (/^(NUEVOS|CONVERTİPLE|CONVERTIPLE|SOLES)$/.test(words[0]) && words[1] && !UNIT_STOP.has(words[1])) unitWords = [words[0], words[1]];
    out.denominationValue = parseNumber(m[1]);
    out.denominationUnit = unitLabel(unitWords);
    break;
  }
  if (out.denominationUnit === 'Lira' && out.emission === 8) out.denominationUnit = 'YTL';

  // Yıl (nominal değer olarak kullanılan sayı yıl sayılmaz)
  const isOttoman = OTTOMAN_RULERS.some((r) => r.re.test(U));
  const hijri = U.match(/\b(1[123]\d\d)\s*\/\s*(\d{1,2})\b/);
  const rumi = U.match(/\b(1[23]\d\d)\s*\((\d{4})\)/);
  const range = U.match(/\b(1[89]\d\d|20[0-3]\d)\s*[/-]\s*(\d{4}|\d{2})\b/);
  const explicitYears = [...U.matchAll(/YIL\s*(\d{4})/g)].map((x) => Number(x[1]));
  const singles = [...U.matchAll(/(?:YIL\s*|^|\s)(1[89]\d\d|20[0-3]\d)(?=\s|$|,|\/)/g)].map((x) => Number(x[1]))
    .filter((y) => y !== out.denominationValue || explicitYears.includes(y));
  if (hijri && isOttoman) {
    out.calendar = 'hicri';
    out.yearFrom = Number(hijri[1]);
    out.yearText = `${hijri[1]}/${hijri[2]}`;
  } else if (rumi) {
    out.yearFrom = Number(rumi[2]);
    out.yearText = `${rumi[1]} (${rumi[2]})`;
  } else {
    let done = false;
    if (range) {
      const a = Number(range[1]);
      const b = range[2].length === 2 ? Number(String(a).slice(0, 2) + range[2]) : Number(range[2]);
      if (b > a && b - a < 60) { out.yearFrom = a; out.yearTo = b; out.yearText = `${a}–${b}`; done = true; }
    }
    if (!done && singles.length) out.yearFrom = singles[0];
  }

  if (/\bSET\b|K[İI]T[İI]NDE|\bSET[İI]\b/.test(U)) out.isSet = true;
  if (/FANTAZ[İI]/.test(U)) out.fantasy = true;
  if (/ALB[ÜU]M/.test(U)) out.supply = 'album';
  return out;
}

// ---------------------------------------------------------------------------
// 4) Kaynak kategori düzeltmeleri (belgelenmiş)
// ---------------------------------------------------------------------------
const corrections = [];
function correctCategories(sid, title, parsed, paths) {
  let out = [...paths];
  const drop = (pred, reason) => {
    const before = out.length;
    out = out.filter((p) => !pred(p));
    if (out.length !== before) corrections.push({ sourceId: sid, title, reason });
  };
  // Hicrî tarihli Osmanlı sikkeleri T.C. kategorilerinden çıkarılır
  if (parsed.calendar === 'hicri') drop((p) => p.startsWith('tc-'), 'Osmanlı sikkesi (hicrî tarih + hükümdar adı) T.C. kategorilerinden çıkarıldı');
  // Fantazi paralar T.C. hatıra parası değildir
  if (parsed.fantasy) drop((p) => p.startsWith('tc-'), 'Fantazi para T.C. hatıra kategorisinden çıkarıldı');
  // Malzeme kategorisindeki para ürünleri (ör. gümüş 1 Lira) malzemeden çıkarılır
  if (!parsed.supply && parsed.denominationValue) drop((p) => p.startsWith('pul-ve-koleksiyon-malzemeleri'), 'Para ürünü koleksiyon malzemeleri kategorisinden çıkarıldı');
  // Malzeme (albüm) ürünleri para kategorilerinden çıkarılır
  if (parsed.supply) drop((p) => !p.startsWith('pul-ve-koleksiyon-malzemeleri'), 'Koleksiyon malzemesi para kategorilerinden çıkarıldı');
  return out;
}

// ---------------------------------------------------------------------------
// 5) Ürünleri üret
// ---------------------------------------------------------------------------
const products = [];
const failures = [];
const usedHandles = new Set();
const NAME_FIX = [
  [/\bPik\b/g, 'Pick'], [/\bPmg\s*(?=\d)/g, 'PMG '], [/\bPmg\b/g, 'PMG'], [/\bNgc\b/g, 'NGC'], [/\bPcgs\b/g, 'PCGS'], [/\bYtl\b/g, 'YTL'],
  [/\bT\.c\b\.?/gi, 'T.C.'], [/\bIi\b/g, 'II'], [/\bIii\b/g, 'III'], [/\bIv\b/g, 'IV'], [/\bVi\b/g, 'VI'], [/\bKm\b/g, 'KM'],
  [/\bP-(\d)/g, 'P-$1'], [/\bP#/g, 'P#'], [/\bÇt\b/g, 'ÇT'], [/\bAbd(?![\p{L}])/gu, 'ABD'], [/\bUsa\b/g, 'USA'], [/\bFao\b/g, 'FAO'],
  [/(\d)\s*,\s*Emisyon/g, '$1. Emisyon'], [/(\d)\s+Emisyon/g, '$1. Emisyon'], [/(\d)\s*,?\s*Tertip/g, '$1. Tertip'], [/(\d)tertip/gi, '$1. Tertip'],
];
function displayTitle(t) {
  let x = t.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  x = x.replace(/\b(I{1,3}|IV|VI?)\.(?=\p{L})/gu, '$1. ');
  if (x === x.toLocaleUpperCase('tr-TR') || /[A-ZÇĞİÖŞÜ]{4,}/.test(x)) x = titleCaseTr(x);
  for (const [re, rep] of NAME_FIX) x = x.replace(re, rep);
  x = x.replace(/\bP-(\d+)([a-z])?/gi, (m, d, l) => `P-${d}${l ? l.toLowerCase() : ''}`);
  return x.replace(/\s+([,.])/g, '$1').replace(/\s{2,}/g, ' ');
}

function imageSide(url, i) {
  const f = decodeURIComponent(url.split('/').pop() ?? '').toLocaleUpperCase('tr-TR');
  if (/ARKA|BACK|REV/.test(f)) return 'arka yüz';
  if (/(^|[-_ ])(ÖN|ON|FRONT|OBV)([-_ .]|$)/.test(f)) return 'ön yüz';
  return null;
}

for (const r of rawProducts) {
  const sid = r.sourceId;
  if (r.httpStatus !== 200 || !sid || !r.name) {
    failures.push({ url: r.sourceUrl, status: r.httpStatus, reason: 'Ürün sayfası alınamadı veya ayrıştırılamadı' });
    continue;
  }
  const srcCats = [...(membership.get(sid) ?? [])];
  const parsed = parseTitle(r.name);
  let catPaths = [...new Set(srcCats.map(mapPath).filter(Boolean))];
  catPaths = correctCategories(sid, r.name, parsed, catPaths);

  // Ülke
  let country = null, countrySource = null;
  // Başlık bilinen bir ülke adıyla başlıyorsa ve kaynak başka/çoklu ülke kategorisi verdiyse başlıktaki ülke esas alınır
  const titleKey = fold(r.name).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const titleCountry = countryIndex.find((c) => titleKey.startsWith(c.key + ' '));
  const foreignCats = catPaths.filter((p) => p.startsWith('yabanci-paralar/'));
  // Mevcut ülke kategorilerinden biri başlıkta geçiyorsa (ör. “… Francs (Senegal)”, “Almanya (Federal)”) kaynak ilişki korunur
  const consistent = foreignCats.some((p) => {
    const c = countryIndex.find((x) => x.path === p);
    return c && (titleKey.includes(c.key) || c.key.includes(titleKey.split(' ')[0]));
  });
  if (titleCountry && foreignCats.length && !consistent) {
    const wrong = foreignCats.filter((p) => p !== titleCountry.path);
    if (wrong.length) {
      catPaths = [...catPaths.filter((p) => !wrong.includes(p)), titleCountry.path];
      corrections.push({ sourceId: sid, title: r.name, reason: `Ülke kategorisi başlıktaki ülkeye göre düzeltildi (${wrong.join(', ')} → ${titleCountry.path})` });
    }
  }
  const foreignCat = catPaths.find((p) => p.startsWith('yabanci-paralar/'));
  if (foreignCat) { country = countryByPath.get(foreignCat.split('/').slice(0, 2).join('/')) ?? null; countrySource = 'kategori'; }
  else if (catPaths.includes('yabanci-paralar') || srcCats.includes('yabanci-paralar')) {
    const key = fold(r.name).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    const hit = countryIndex.find((c) => key.startsWith(c.key + ' '));
    if (hit) { country = hit.title; countrySource = 'başlık'; catPaths.push(hit.path); }
  }
  if (catPaths.some((p) => p.startsWith('tc-'))) { country = 'Türkiye'; countrySource = 'kategori'; }
  if (catPaths.some((p) => p.startsWith('osmanli-paralari')) || parsed.calendar === 'hicri') {
    country = 'Osmanlı Devleti'; countrySource = 'kategori';
    if (!catPaths.some((p) => p.startsWith('osmanli-paralari'))) catPaths.push('osmanli-paralari/osmanli-madeni-paralari');
  }
  if (parsed.fantasy) catPaths = [...new Set([...catPaths.filter((p) => !p.startsWith('tc-')), 'antika-ve-diger/fantazi-paralar'])];
  if (!catPaths.length) catPaths = srcCats.includes('fantazi-paralar') ? ['antika-ve-diger/fantazi-paralar'] : [];
  catPaths = [...new Set(catPaths)];

  // Tür
  let kind = null;
  const top = (p) => p.split('/')[0];
  if (parsed.supply || catPaths.some((p) => p.startsWith('pul-ve-koleksiyon-malzemeleri'))) kind = 'malzeme';
  else if (parsed.isSet) kind = 'set';
  else if (catPaths.some((p) => top(p) === 'tc-kagit-paralar' || p.startsWith('osmanli-paralari/osmanli-kagit'))) kind = 'banknot';
  else if (catPaths.some((p) => ['tc-madeni-paralar', 'tc-hatira-paralari'].includes(top(p)) || p.startsWith('osmanli-paralari/osmanli-madeni'))) kind = 'madeni';
  else if (parsed.metal && parsed.metal !== 'Polimer') kind = 'madeni';
  else if (catPaths.some((p) => top(p) === 'yabanci-paralar')) {
    const aspect = imgMeta[`${sid}-0`]?.contentAspect;
    if (parsed.catalogNumber?.startsWith('Pick') || parsed.polymer) kind = 'banknot'; // Pick kataloğu kâğıt para kataloğudur
    else if (aspect && aspect >= 1.3) kind = 'banknot';                               // görsel oranı belirgin dikdörtgen
  }

  // Dönem (T.C. madeni: kategori veya yıl aralığından)
  let period = null;
  const periodCat = catPaths.find((p) => /^tc-madeni-paralar\/(1924|1958|2004)/.test(p));
  if (periodCat) period = categories.get(periodCat)?.title ?? null;
  else if (kind === 'madeni' && country === 'Türkiye' && parsed.yearFrom && parsed.calendar !== 'hicri') {
    period = parsed.yearFrom <= 1957 ? '1924–1957 Dönemi' : parsed.yearFrom <= 2003 ? '1958–2003 Dönemi' : '2004 ve Sonrası Dönem';
  }
  let ruler = parsed.ruler ?? null;
  const rulerCat = catPaths.find((p) => /^osmanli-paralari\/osmanli-(madeni|kagit)-paralari\//.test(p));
  if (!ruler && rulerCat) ruler = categories.get(rulerCat)?.title ?? null;

  // Görseller
  const images = [];
  (r.images ?? []).slice(0, 4).forEach((url, i) => {
    const key = `${sid}-${i}`;
    const ok = imgManifest[key]?.status === 200 && imgMeta[key]?.large;
    if (!ok) { failures.push({ url, status: imgManifest[key]?.status ?? 'indirilmedi', reason: `Görsel alınamadı/işlenemedi (${r.sourceUrl})` }); return; }
    const side = imageSide(url, i);
    images.push({
      src: `/demo/urun/${key}-720.webp`,
      srcSmall: `/demo/urun/${key}-360.webp`,
      width: imgMeta[key].large.width,
      height: imgMeta[key].large.height,
      alt: `${displayTitle(r.name)}${side ? ` — ${side}` : ` — görsel ${i + 1}`}`,
      sourceUrl: url,
    });
  });

  const title = displayTitle(r.name);
  let handle = decodeURIComponent(new URL(r.sourceUrl).pathname.replace(/^\//, '')).toLocaleLowerCase('tr-TR');
  handle = slugify(handle) || `urun-${sid}`;
  while (usedHandles.has(handle)) handle = `${handle}-${sid}`;
  usedHandles.add(handle);

  // Başlıkta birim yoksa (ör. “7. Emisyon 20.000.000”) nominal değer kaynak alt kategorisinin adından okunur
  if (!parsed.denominationUnit) {
    const denomCat = catPaths.find((p) => /^tc-kagit-paralar\/\d-emisyon\/[\d-]+-(lira|ytl)$/.test(p));
    const ct = denomCat && categories.get(denomCat)?.title;
    const dm = ct && ct.match(/^([\d.]+)\s+(Lira|YTL)$/i);
    if (dm && (!parsed.denominationValue || parsed.denominationValue === Number(dm[1].replace(/\./g, '')))) {
      parsed.denominationValue = Number(dm[1].replace(/\./g, ''));
      parsed.denominationUnit = /ytl/i.test(dm[2]) ? 'YTL' : 'Lira';
    }
  }

  const specs = buildSpecs({
    kind,
    country,
    yearFrom: parsed.yearFrom,
    yearTo: parsed.yearTo,
    calendar: parsed.calendar,
    yearText: parsed.yearText,
    denominationValue: parsed.denominationValue,
    denominationUnit: parsed.denominationUnit,
    emission: parsed.emission,
    ruler,
    period,
    condition: parsed.condition,
    conditionScale: parsed.conditionScale,
    catalogNumber: parsed.catalogNumber,
    certService: parsed.certService,
    certGrade: parsed.certGrade,
    metal: parsed.metal,
  });

  const collections = [];
  if (srcCats.includes('sertifikali-paralar') || parsed.certService || parsed.hasCertificateWord) collections.push('sertifikali-paralar');
  if (specs.metal === 'Gümüş') collections.push('gumus-paralar');
  if (kind === 'set') collections.push('para-setleri');
  if (parsed.polymer) collections.push('polimer-banknotlar');

  const price = r.priceValue ?? 0;
  const regular = r.regularValue ?? price;
  products.push({
    id: `demo-${sid}`,
    variantId: `demo-${sid}`,
    handle,
    title,
    summary: buildSummary({ title, specs, parsed, kind }),
    descriptionHtml: null,
    sku: null, // kaynağın kendi stok kodu İlkim ürün kodu olarak gösterilmez (source.model'de saklanır)
    categoryPaths: catPaths,
    primaryCategory: [...catPaths].sort((a, b) => b.split('/').length - a.split('/').length)[0] ?? null,
    collections,
    price: { amount: price, currencyCode: 'TRY' },
    compareAtPrice: regular > price ? { amount: regular, currencyCode: 'TRY' } : null,
    availability: {
      status: r.stockClass === 'in-stock' ? 'in_stock' : 'out_of_stock',
      availableForSale: r.stockClass === 'in-stock',
      quantity: null,
    },
    images,
    specs,
    extra: {
      tertip: parsed.tertip ? `${parsed.tertip}. Tertip` : null,
      material: parsed.polymer ? 'Polimer' : null,
      certificateNote: parsed.hasCertificateWord && !parsed.certService ? 'Kaynak ürün adında “sertifikalı” ifadesi var (belge türü belirtilmemiş).' : null,
      kindSource: kind ? (kind === 'banknot' && !catPaths.some((p) => p.startsWith('tc-') || p.startsWith('osmanli')) && !parsed.catalogNumber && !parsed.polymer ? 'görsel oranı' : 'kategori/başlık') : null,
      countrySource,
    },
    createdAt: null,
    order: Number(sid),
    seoTitle: null,
    seoDescription: null,
    deliveryNote: null,
    source: {
      url: r.sourceUrl,
      fetchedAt: r.fetchedAt,
      sourceId: sid,
      originalTitle: r.name,
      model: r.model ?? null,
      priceText: r.priceText ?? null,
      stockText: r.stockText ?? null,
      categories: srcCats,
      flags: srcCats.filter((c) => FLAG_CATS[c]).map((c) => FLAG_CATS[c]),
    },
    demoScenario: null,
  });
}

function buildSummary({ specs, kind, parsed }) {
  const bits = [];
  const kindTxt = { banknot: 'kâğıt para', madeni: 'madeni para', set: 'para seti', malzeme: 'koleksiyon malzemesi' }[kind] ?? 'koleksiyon parçası';
  const who = specs.country ? `${specs.country} — ` : '';
  bits.push(`${who}${specs.denomination ? specs.denomination.label + ' ' : ''}${kindTxt}.`);
  if (specs.emission) bits.push(`${specs.emission}. emisyon${parsed.tertip ? `, ${parsed.tertip}. tertip` : ''}.`);
  if (specs.ruler) bits.push(`Dönem: ${specs.ruler}.`);
  if (specs.yearText) bits.push(`${specs.calendar === 'hicri' ? 'Hicrî tarih' : 'Yıl'}: ${specs.yearText}.`);
  if (specs.catalogNumber) bits.push(`Katalog: ${specs.catalogNumber}.`);
  if (specs.metal) bits.push(`Metal: ${specs.metal}.`);
  if (specs.certification) bits.push(`Sertifika: ${specs.certification.service}${specs.certification.grade ? ' ' + specs.certification.grade : ''}.`);
  else if (specs.condition) bits.push(`Kondisyon: ${specs.condition.label}.`);
  return bits.join(' ');
}

// ---------------------------------------------------------------------------
// 6) Demo senaryoları (belgelenmiş; satış durumu davranışını göstermek için)
// ---------------------------------------------------------------------------
// Kaynakta bütün ürünler “Stok: Var” durumunda. “Satıldı” ve “Stokta yok”
// davranışlarını gösterebilmek için aşağıdaki kayıtlar AÇIKÇA demo senaryosu olarak
// işaretlenir; ürün sayfasında da bu not gösterilir. Gerçek satış bilgisi değildir.
const SCENARIOS = [
  { match: (p) => /8\. Emisyon 5 YTL|8\. Emisyon 5 Yeni Türk Lirası/i.test(p.title), take: 1, status: 'sold' },
  { match: (p) => p.specs.emission === 5 && p.specs.denomination?.value === 5, take: 1, status: 'sold' },
  { match: (p) => p.specs.country === 'Japonya', take: 1, status: 'out_of_stock' },
];
for (const sc of SCENARIOS) {
  const hits = products.filter((p) => !p.demoScenario && sc.match(p)).slice(0, sc.take);
  for (const p of hits) {
    p.demoScenario = sc.status;
    p.availability = { status: sc.status, availableForSale: false, quantity: 0 };
  }
}

// ---------------------------------------------------------------------------
// 7) Sayımlar, seçkiler, yazım
// ---------------------------------------------------------------------------
const catList = [...categories.values()].map((c) => ({
  ...c,
  productCount: products.filter((p) => p.categoryPaths.some((x) => x === c.path || x.startsWith(c.path + '/'))).length,
}));
catList.sort((a, b) => a.path.localeCompare(b.path));

const COLLECTIONS = [
  { handle: 'sertifikali-paralar', title: 'Sertifikalı Paralar', description: 'Bağımsız derecelendirme kuruluşu (ör. PMG) notu taşıyan veya kaynak adında “sertifikalı” ifadesi bulunan parçalar. Ürünler kendi kategorilerinde de yer alır; seçkide çoğaltılmaz.', rule: 'Kaynakta “Sertifikalı Paralar” listesinde olanlar + başlığında PMG/NGC/PCGS notu veya “sertifikalı” ifadesi geçenler' },
  { handle: 'gumus-paralar', title: 'Gümüş Paralar', description: 'Başlığında gümüş olduğu belirtilen T.C. ve Osmanlı paraları.', rule: 'Başlıkta “gümüş” geçenler' },
  { handle: 'para-setleri', title: 'Para Setleri', description: 'Tedavül ve hatıra para setleri, orijinal kitler.', rule: 'Başlıkta “set”/“kitinde” geçenler' },
  { handle: 'polimer-banknotlar', title: 'Polimer Banknotlar', description: 'Polimer (plastik esaslı) baskı banknotlar.', rule: 'Başlıkta “polimer” geçenler' },
].map((c) => ({ ...c, productCount: products.filter((p) => p.collections.includes(c.handle)).length }));

const collTitle = new Map(COLLECTIONS.map((c) => [c.handle, c.title]));
for (const p of products) p.collectionTitles = p.collections.map((h) => collTitle.get(h)).filter(Boolean);

mkdirSync('src/data/demo', { recursive: true });
writeFileSync('src/data/demo/products.json', JSON.stringify(products));
writeFileSync('src/data/demo/categories.json', JSON.stringify(catList, null, 1));
writeFileSync('src/data/demo/collections.json', JSON.stringify(COLLECTIONS, null, 1));

const report = {
  generatedAt: new Date().toISOString(),
  source: 'https://eskiparamarket.com/',
  sitemapProductUrls: rawProducts.length,
  productsImported: products.length,
  productsFailed: rawProducts.length - products.length,
  productsWithoutImages: products.filter((p) => !p.images.length).map((p) => p.source.url),
  imagesImported: products.reduce((n, p) => n + p.images.length, 0),
  categories: catList.length,
  emptyCategories: catList.filter((c) => c.productCount === 0).map((c) => c.path),
  collections: COLLECTIONS.map((c) => ({ handle: c.handle, count: c.productCount })),
  kinds: products.reduce((m, p) => ((m[p.specs.kind ?? 'bilinmiyor'] = (m[p.specs.kind ?? 'bilinmiyor'] ?? 0) + 1), m), {}),
  specCoverage: Object.fromEntries(['country', 'yearFrom', 'denomination', 'emission', 'ruler', 'period', 'condition', 'catalogNumber', 'certification', 'metal'].map((k) => [k, products.filter((p) => p.specs[k] != null).length])),
  demoScenarios: products.filter((p) => p.demoScenario).map((p) => ({ title: p.title, scenario: p.demoScenario, source: p.source.url })),
  categoryCorrections: corrections,
  failures,
};
writeFileSync(`${SRC}/donusum-raporu.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify({ ...report, categoryCorrections: report.categoryCorrections.length, failures: report.failures.length, productsWithoutImages: report.productsWithoutImages.length, emptyCategories: report.emptyCategories.length }, null, 1));
