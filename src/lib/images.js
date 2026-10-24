/**
 * Duyarlı görsel öznitelikleri. Shopify CDN görsellerinde genişlik
 * parametresiyle srcset üretilir; örnek SVG görsellerde gerek yoktur
 * (vektör, her boyutta net).
 */
const WIDTHS = [320, 480, 640, 960, 1280, 1600];

export function imageAttrs(image, { sizes = '100vw', maxWidth = 1600 } = {}) {
  const attrs = { src: image.url, alt: image.alt ?? '', width: image.width, height: image.height };
  if (image.url.includes('cdn.shopify.com')) {
    const widths = WIDTHS.filter((w) => w <= Math.min(maxWidth, image.width ?? maxWidth));
    const withWidth = (w) => `${image.url}${image.url.includes('?') ? '&' : '?'}width=${w}`;
    attrs.src = withWidth(widths.at(-1) ?? maxWidth);
    attrs.srcset = widths.map((w) => `${withWidth(w)} ${w}w`).join(', ');
    attrs.sizes = sizes;
  }
  return attrs;
}
