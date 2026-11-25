/**
 * YALNIZCA TEST VERİSİ — sitede gösterilmez, katalog dosyalarına eklenmez.
 * Arama motoru ve ana sayfa seçim testleri için küçük, sahte kayıtlar.
 */
const make = (o) => {
  const status = o.status ?? 'in_stock';
  return {
    id: o.handle, handle: o.handle, title: o.title, summary: '', descriptionHtml: null, sku: o.sku ?? null,
    categoryPaths: o.categoryPaths, primaryCategory: o.categoryPaths.at(-1), collections: o.collections ?? [],
    price: { amount: o.price, currencyCode: 'TRY' }, compareAtPrice: null,
    availability: { status, availableForSale: status === 'in_stock', quantity: 1 },
    images: [], createdAt: null, order: o.order ?? 0, seoTitle: null, seoDescription: null, deliveryNote: null,
    specs: {
      kind: o.kind ?? null, country: o.country ?? null, countrySlug: o.countrySlug ?? null,
      yearFrom: o.year ?? null, yearTo: null, calendar: o.year ? (o.calendar ?? 'miladi') : null, yearText: o.year ? String(o.year) : null,
      denomination: o.denomination ?? null, emission: o.emission ?? null,
      ruler: null, rulerSlug: null, period: null, periodSlug: null, condition: null,
      catalogNumber: o.catalogNumber ?? null, certification: o.certification ?? null,
      metal: o.metal ?? null, metalSlug: o.metalSlug ?? null,
    },
  };
};

const lira = (v) => ({ value: v, unit: 'Lira', unitSlug: 'lira', label: `${v} Lira` });

export const fixtureProducts = [
  make({ handle: 't1', title: '5. Emisyon 5 Lira', sku: 'IK-0001', categoryPaths: ['tc-kagit-paralar'], price: 1200, kind: 'banknot', country: 'Türkiye', countrySlug: 'turkiye', year: 1952, emission: 5, denomination: lira(5), catalogNumber: 'Pick P-155a', order: 6 }),
  make({ handle: 't2', title: 'Gümüş 1 Lira 1947', sku: 'IK-0002', categoryPaths: ['tc-madeni-paralar'], price: 3400, kind: 'madeni', country: 'Türkiye', countrySlug: 'turkiye', year: 1947, metal: 'Gümüş', metalSlug: 'gumus', denomination: lira(1), order: 5 }),
  make({ handle: 't3', title: 'Almanya 1000 Mark 1910', categoryPaths: ['yabanci-kagit-paralar', 'yabanci-kagit-paralar/almanya'], price: 900, kind: 'banknot', country: 'Almanya', countrySlug: 'almanya', year: 1910, denomination: { value: 1000, unit: 'Mark', unitSlug: 'mark', label: '1000 Mark' }, order: 4 }),
  make({ handle: 't4', title: 'Almanya 5 Mark Gümüş', categoryPaths: ['yabanci-madeni-paralar', 'yabanci-madeni-paralar/almanya'], price: 4800, kind: 'madeni', country: 'Almanya', countrySlug: 'almanya', year: 1936, metal: 'Gümüş', metalSlug: 'gumus', denomination: { value: 5, unit: 'Mark', unitSlug: 'mark', label: '5 Mark' }, order: 3 }),
  make({ handle: 't5', title: 'II. Abdülhamid 20 Kuruş', categoryPaths: ['osmanli-paralari'], price: 2500, kind: 'madeni', country: 'Osmanlı', countrySlug: 'osmanli', year: 1293, calendar: 'hicri', order: 2 }),
  make({ handle: 't6', title: 'Cep Saati', categoryPaths: ['saat'], price: 7000, status: 'sold', order: 1 }),
];
