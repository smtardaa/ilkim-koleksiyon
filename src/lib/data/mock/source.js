import { products, categoryImages } from './products.js';

/**
 * Örnek veri kaynağı. Shopify kaynağıyla aynı arayüzü uygular:
 *   listProducts(): Promise<Product[]>
 *   getProductByHandle(handle): Promise<Product|null>
 *   getCategoryImage(slug): Promise<ProductImage|null>
 */
export const mockSource = {
  name: 'mock',
  isSample: true,

  async listProducts() {
    return products;
  },

  async getProductByHandle(handle) {
    return products.find((p) => p.handle === handle) ?? null;
  },

  async getCategoryImage(slug) {
    const product = products.find((p) => p.handle === categoryImages[slug]);
    return product?.images[0] ?? null;
  },
};
