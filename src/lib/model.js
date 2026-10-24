/**
 * Bileşenlerin kullandığı ortak ürün modeli.
 *
 * Bu model hiçbir veri sağlayıcısına bağlı değildir. Örnek veri kaynağı
 * (data/mock) doğrudan bu biçimde veri üretir. Shopify veri kaynağı ise
 * Storefront API yanıtını bu biçime dönüştürecektir (bkz. data/shopify).
 *
 * @typedef {{ amount: number, currencyCode: string }} Money
 *
 * @typedef {Object} ProductImage
 * @property {string} url
 * @property {string} alt          Görseli tarif eden alternatif metin
 * @property {number} width
 * @property {number} height
 * @property {string} [label]    Galeride gösterilen ad (ör. "Ön yüz")
 * @property {ImageCredit} [credit]
 *
 * @typedef {Object} ImageCredit   Görselin kaynağı ve lisansı
 * @property {string} author
 * @property {{ name: string, url: string|null }} license
 * @property {string} sourceUrl
 * @property {string} sourceLabel
 * @property {string} [note]      Görsel üzerinde yapılan işlem
 *
 * @typedef {Object} CatalogNumber
 * @property {string} system   Örn. "Pick", "KM"
 * @property {string} value
 *
 * @typedef {Object} Certificate      Yalnızca gerçekten sertifikalı üründe bulunur
 * @property {string} issuer
 * @property {string} grade
 * @property {string} [gradeLabel]
 * @property {string} number
 * @property {string|null} [verifyUrl]
 *
 * @typedef {Object} SetItem          Koleksiyon paketi içindeki tek parça
 * @property {string} title
 * @property {number|null} [year]
 * @property {string|null} [period]
 * @property {string|null} [condition]  conditions.js kodu
 * @property {string|null} [note]
 *
 * @typedef {Object} Product
 * @property {string} id            Kalıcı kimlik (Shopify'da GID)
 * @property {string} handle        URL'de kullanılan kısa ad
 * @property {'single'|'set'} kind  Tek parça veya koleksiyon paketi
 * @property {string} title
 * @property {string} summary       Kısa açıklama (kart, meta description)
 * @property {string[]} description Paragraflar
 * @property {ProductImage[]} images
 * @property {Money & { isExample?: boolean }} price
 * @property {boolean} availableForSale
 * @property {number|null} quantityAvailable
 * @property {string} category      Ana kategori slug'ı
 * @property {string[]} collections Ek koleksiyonlar (örn. "seckin-parcalar")
 * @property {string} country
 * @property {string} period
 * @property {string|null} [series]   Örn. "6. Emisyon"
 * @property {number|null} year       Filtre/sıralama için miladi yıl
 * @property {string|null} [yearLabel] Gösterim (örn. "1293/28 · yakl. 1903")
 * @property {string|null} [denomination]
 * @property {string|null} [material]
 * @property {string|null} [dimensions]
 * @property {string|null} [weight]
 * @property {CatalogNumber[]} catalogNumbers
 * @property {string|null} condition          conditions.js kodu
 * @property {string|null} [conditionNote]
 * @property {string[]} defects               Kondisyonu etkileyen kusurlar
 * @property {Certificate|null} certificate
 * @property {boolean} offerEnabled
 * @property {string} createdAt   ISO tarih
 * @property {SetItem[]} [setItems]
 * @property {number|null} [pieceCount]
 * @property {boolean} [isSample] Demo verisi mi (stok/fiyat örnek)
 * @property {{ label: string, url: string, checkedAt: string }} [source]  Bilgi kaynağı
 * @property {string} [imageNote]  Görsellerle ilgili açıklama (ör. tek yüz)
 */

export {};
