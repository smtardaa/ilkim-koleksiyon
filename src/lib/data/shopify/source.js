/**
 * SHOPIFY VERİ KAYNAĞI — HENÜZ UYGULANMADI.
 *
 * Bu dosya yalnızca entegrasyon aşamasında yapılacak işi tarif eder; şu an
 * hiçbir Shopify isteği yapılmaz. DATA_SOURCE=shopify seçilirse build bilerek
 * hata verir, böylece örnek veri yanlışlıkla gerçekmiş gibi yayımlanmaz.
 *
 * Yapılacaklar (güncel Shopify Storefront API belgeleri esas alınmalı):
 *  1. Build sırasında (sunucu tarafı) Storefront API'ye GraphQL istekleri:
 *     products / collections, sayfalama ile. Build tarafında private
 *     Storefront token kullanılabilir; bu token PUBLIC_ önekli olmamalı.
 *  2. Yanıtı src/lib/model.js'teki Product modeline dönüştüren bir mapper:
 *       id                ← product.id (GID)
 *       handle            ← product.handle
 *       title, summary    ← title, description (kısaltılmış) / metafield
 *       description       ← descriptionHtml veya metafield
 *       images            ← images { url, altText, width, height }
 *       price             ← priceRange.minVariantPrice { amount, currencyCode }
 *       availableForSale  ← availableForSale
 *       quantityAvailable ← variants[0].quantityAvailable (izin gerekir)
 *       category          ← ana kategori koleksiyonunun handle'ı
 *       collections       ← collections.nodes[].handle
 *       country, period, series, year, yearLabel, denomination, material,
 *       dimensions, catalogNumbers, condition, conditionNote, defects,
 *       certificate, offerEnabled, setItems, pieceCount
 *                         ← "koleksiyon" namespace'li ürün metafield'ları
 *       kind              ← ürün tipi veya metafield ("single" | "set")
 *       createdAt         ← publishedAt / createdAt
 *  3. Görseller için Shopify CDN genişlik parametreleriyle srcset üretimi.
 *
 * Admin API anahtarları bu projede hiçbir zaman kullanılmamalı; ürün
 * yönetimi Shopify panelinden yapılır.
 */
export const shopifySource = {
  name: 'shopify',
  isSample: false,

  async listProducts() {
    throw new Error('Shopify veri kaynağı henüz uygulanmadı. DATA_SOURCE=mock kullanın.');
  },

  async getProductByHandle() {
    throw new Error('Shopify veri kaynağı henüz uygulanmadı. DATA_SOURCE=mock kullanın.');
  },

  async getCategoryImage() {
    throw new Error('Shopify veri kaynağı henüz uygulanmadı. DATA_SOURCE=mock kullanın.');
  },
};
