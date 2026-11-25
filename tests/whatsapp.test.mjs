// “Satın almak için iletişime geç” WhatsApp mesajı testleri — `npm test`
// Numara yalnızca bu test sürecinin belleğinde geçici olarak verilir; business.js dosyası değişmez.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { business, whatsappProductUrl } from '../src/config/business.js';

const product = { title: 'Gümüş 1 Lira 1947 & “Atatürk”', sku: 'IK-0002' };
const link = 'https://www.ornek.com.tr/urun/gumus-1-lira-1947';

test('Numara yokken bağlantı üretilmez', () => {
  assert.equal(business.contact.whatsapp, null);
  assert.equal(whatsappProductUrl(product, link), null);
});

test('Mesaj ürün adı, kodu ve bağlantısını içerir ve URL kodludur', () => {
  const saved = business.contact.whatsapp;
  business.contact.whatsapp = '905000000000';
  try {
    const url = new URL(whatsappProductUrl(product, link));
    assert.equal(url.origin + url.pathname, 'https://wa.me/905000000000');
    assert.equal(url.searchParams.get('text'),
      `Merhaba, ${product.title} adlı ürününüzü satın almak için bilgi almak istiyorum. Ürün kodu: IK-0002. Ürün bağlantısı: ${link}`);
    assert.ok(!whatsappProductUrl(product, link).includes(' '));
    // Ürün kodu yoksa o cümle atlanır
    assert.ok(!new URL(whatsappProductUrl({ title: 'X', sku: null }, link)).searchParams.get('text').includes('Ürün kodu'));
  } finally {
    business.contact.whatsapp = saved;
  }
});
