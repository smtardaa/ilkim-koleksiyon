/**
 * ANA SAYFA ÜRÜN SLIDER'LARI — MERKEZİ YAPILANDIRMA
 * Her ana kategori için, kategori listesindeki sırayla bir bölüm oluşturulur
 * (src/data/catalog/categories.json). Ürünler veri sağlayıcısından gelir.
 * Ürünü olmayan bölüm başlık, “Tümünü Gör” ve boş durum mesajıyla gösterilir.
 */
import { topCategories } from './navigation.js';

export const homeSliders = {
  /** Bölüm başına en fazla ürün */
  defaultLimit: 10,
  /**
   * Aynı ürün birden fazla bölümde tekrar etmesin: bir bölümde, önceki bölümlerde gösterilmemiş
   * en az bu kadar ürün varsa yalnızca onlar gösterilir; yoksa tekrar eden ürünlerle tamamlanır.
   */
  preferUniqueMin: 5,
  sections: topCategories.map((c) => ({ id: c.path, source: { type: 'category', path: c.path }, visible: true })),
};

/** Boş bölümlerde gösterilen mesaj */
export const EMPTY_SECTION_TEXT = 'Bu kategoriye henüz ürün eklenmedi.';
