/**
 * Ürün erişim katmanı. Sayfalar ve bileşenler veriye yalnızca bu dosya
 * üzerinden ulaşır; veri kaynağının mock mu Shopify mı olduğunu bilmez.
 */
import { getDataSource } from './data/index.js';
import { categories, getCategory } from '../config/categories.js';
import { compareTr, normalizeTr } from './text.js';
import { conditionText } from './format.js';

const source = getDataSource();

export const isSampleData = source.isSample;

export async function getAllProducts() {
  return source.listProducts();
}

export async function getProductByHandle(handle) {
  return source.getProductByHandle(handle);
}

export async function getSingles() {
  return (await getAllProducts()).filter((p) => p.kind === 'single');
}

export async function getSets() {
  return sortNewest(await getAllProducts()).filter((p) => p.kind === 'set');
}

export async function getProductsByCategory(slug) {
  return (await getAllProducts()).filter((p) => p.category === slug);
}

export async function getNewArrivals(limit = 4) {
  return sortNewest(await getAllProducts())
    .filter((p) => p.availableForSale)
    .slice(0, limit);
}

/** Seçkin parçalar; `exclude` ile başka bölümde gösterilenler tekrar edilmez. */
export async function getFeatured(limit = 4, exclude = []) {
  const skip = new Set(exclude.map((p) => p.id));
  return sortNewest(await getAllProducts())
    .filter((p) => p.collections.includes('seckin-parcalar') && p.availableForSale && !skip.has(p.id))
    .slice(0, limit);
}

/** Aynı kategoriden, satıştaki ürünler önce gelecek şekilde benzer ürünler. */
export async function getRelated(product, limit = 4) {
  return sortNewest(await getProductsByCategory(product.category))
    .filter((p) => p.id !== product.id)
    .sort((a, b) => Number(b.availableForSale) - Number(a.availableForSale))
    .slice(0, limit);
}

export function sortNewest(list) {
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function productUrl(product) {
  return product.kind === 'set' ? `/koleksiyonlar/${product.handle}/` : `/urun/${product.handle}/`;
}

export function getCategoryForProduct(product) {
  return getCategory(product.category);
}

/** Filtre panelinde gösterilecek seçenekler, listedeki ürünlerden türetilir. */
export function getFacets(list) {
  const uniq = (values) => [...new Set(values.filter(Boolean))].sort(compareTr);
  const years = list.map((p) => p.year).filter((y) => typeof y === 'number');
  const usedCategories = new Set(list.map((p) => p.category));
  return {
    categories: categories.filter((c) => usedCategories.has(c.slug)),
    countries: uniq(list.map((p) => p.country)),
    periods: uniq(list.map((p) => p.period)),
    minYear: years.length ? Math.min(...years) : null,
    maxYear: years.length ? Math.max(...years) : null,
  };
}

/** Tarayıcıdaki arama için önceden normalize edilmiş arama metni. */
export function searchText(product) {
  const category = getCategory(product.category);
  return normalizeTr(
    [
      product.title,
      product.country,
      product.period,
      product.series,
      product.yearLabel,
      product.year,
      product.denomination,
      product.material,
      category?.name,
      conditionText(product.condition),
      ...product.catalogNumbers.map((c) => `${c.system} ${c.value}`),
      ...(product.setItems ?? []).map((i) => i.title),
    ].join(' '),
  );
}

/**
 * Kategori kartı görseli. Örnek veride kategorideki bir ürünün fotoğrafı;
 * Shopify'da ilgili koleksiyonun görseli kullanılacak.
 */
export async function getCategoryImage(category) {
  return source.getCategoryImage(category.slug);
}
