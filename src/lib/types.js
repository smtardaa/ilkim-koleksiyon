/**
 * ORTAK VERİ MODELİ (JSDoc)
 * Veri sağlayıcıları (şu an yerel dosya; ileride MySQL) bu biçimde ürün döndürür;
 * bütün arayüz bileşenleri yalnızca bu modeli tanır.
 *
 * @typedef {{ amount: number, currencyCode: string }} Money
 *
 * @typedef {Object} ProductImage
 * @property {string} src        — büyük görsel (galeri/büyütme)
 * @property {string} [srcSmall] — liste kartı için küçük görsel
 * @property {number} width
 * @property {number} height
 * @property {string} alt
 *
 * @typedef {Object} Availability
 * @property {'in_stock'|'out_of_stock'|'sold'} status
 *   - in_stock: satın alınabilir
 *   - out_of_stock: stok yok (tekrar gelebilir; satıldığı bilinmiyor)
 *   - sold: açıkça “satıldı” olarak işaretlenmiş tekil ürün 
 * @property {boolean} availableForSale
 * @property {number|null} quantity — bilinmiyorsa null
 *
 * @typedef {Object} ProductSpecs  — bilinmeyen alanlar null; tahmin edilmez
 * @property {'banknot'|'madeni'|'set'|'malzeme'|'madalya'|'obje'|'pul'|'antika'|null} kind
 * @property {string|null} country
 * @property {string|null} countrySlug
 * @property {number|null} yearFrom
 * @property {number|null} yearTo
 * @property {'miladi'|'hicri'|null} calendar — yıl hangi takvime göre yazıldı
 * @property {string|null} yearText — ürün üzerindeki/kaynaktaki yazımıyla
 * @property {{value:number, unit:string, unitSlug:string, label:string}|null} denomination
 * @property {number|null} emission — T.C. banknot emisyonu
 * @property {string|null} ruler — hükümdar (Osmanlı)
 * @property {string|null} rulerSlug
 * @property {string|null} period — dönem (ör. “1924–1957 Dönemi”)
 * @property {string|null} periodSlug
 * @property {{label:string, slug:string, scale:string|null}|null} condition
 * @property {string|null} catalogNumber — ör. “Pick P-173a”
 * @property {{service:string, grade:number|null, label:string|null}|null} certification
 * @property {string|null} metal
 * @property {string|null} metalSlug
 *
 * @typedef {Object} Product
 * @property {string} id           — sağlayıcıya özgü kimlik
 * @property {string} handle       — URL parçası (/urun/{handle})
 * @property {string} title
 * @property {string} summary      — kısa açıklama (düz metin)
 * @property {string|null} descriptionHtml
 * @property {string|null} sku       — ürün kodu (WhatsApp mesajında kullanılır)
 * @property {string[]} categoryPaths    — ör. ["tc-kagit-paralar/6-emisyon/5-lira"]
 * @property {string|null} primaryCategory
 * @property {string[]} collections      — seçki tanıtıcıları (çoğaltma olmadan ilişki)
 * @property {string[]} [collectionTitles]
 * @property {Money} price
 * @property {Money|null} compareAtPrice
 * @property {Availability} availability
 * @property {ProductImage[]} images
 * @property {ProductSpecs} specs
 * @property {string|null} createdAt  — ISO; bilinmiyorsa null
 * @property {number} order           — yeni→eski sıralama yedeği (büyük = yeni)
 * @property {string|null} seoTitle
 * @property {string|null} seoDescription
 * @property {string|null} deliveryNote — ürün özel teslimat notu
 *
 * @typedef {Object} Category
 * @property {string} path      — “tc-kagit-paralar/6-emisyon”
 * @property {string} title
 * @property {string|null} parent
 * @property {string|null} description
 * @property {number} productCount — alt kategoriler dahil
 * @property {boolean} [countries]  — ülke seçimi olan kategori (yabancı paralar)
 * @property {string} [countrySlug]   — ülke alt sayfası ise ülke tanıtıcısı
 * @property {{src:string, alt:string, credit:object}} [image] — kategori kartı görseli
 *
 * @typedef {Object} Country
 * @property {string} slug
 * @property {string} name
 *
 * @typedef {Object} Collection
 * @property {string} handle
 * @property {string} title
 * @property {string|null} description
 * @property {number} productCount
 */
export {};
