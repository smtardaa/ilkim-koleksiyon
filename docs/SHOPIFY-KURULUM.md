# Shopify kurulumu ve alan eşlemesi

> Durum: **Dış bağlantı bekliyor.** Bu belgedeki kod yolu yazıldı; gerçek bir Shopify mağazasıyla
> **test edilmedi** (mağaza ve erişim bilgileri sağlanmadı).

Site, ürün/koleksiyon/fiyat/stok/görsel verilerini Shopify **Storefront API** (GraphQL, sürüm
`SHOPIFY_API_VERSION`, varsayılan `2026-10`) üzerinden okur. Yönetim (ürün ekleme, fiyat, stok,
görsel, açıklama) tamamen Shopify yönetim panelinden yapılır; projede özel yönetim paneli yoktur.

---

## 1. Kanal ve erişim

1. Shopify yönetim paneli → **Satış kanalları** → **Headless** kanalını ekleyin
   (Shopify App Store'daki resmî “Headless” kanalı).
2. Headless kanalında bir “storefront” oluşturun. İki token görünür:
   - **Public access token** → `SHOPIFY_STOREFRONT_PUBLIC_TOKEN`
   - **Private access token** → `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` (**gizli**; yalnızca sunucu ortam değişkeni)
   Bu projede bütün Storefront istekleri sunucuda yapılır; tanımlıysa private token kullanılır ve
   `Shopify-Storefront-Buyer-IP` başlığı gönderilir. Token'lar tarayıcıya hiçbir zaman gönderilmez.
3. Storefront API izinleri (Headless kanalı → storefront → **Storefront API permissions**):
   - ürün ve koleksiyon okuma (`unauthenticated_read_product_listings`)
   - **stok adedi okuma** (`unauthenticated_read_product_inventory`) — `quantityAvailable` alanı için.
     Verilmezse sorgu hata verir; bu durumda `src/lib/providers/shopify.js` içindeki
     `quantityAvailable` alanını kaldırın (sepet, adet bilinmediğinde `UNKNOWN_QTY_LIMIT` politikasını kullanır).
   - sepet/ödeme (`unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`)
   - metafield okuma (ürün/koleksiyon metafield'ları için ilgili okuma izni)
4. **Ürünler Headless kanalına yayımlanmalıdır.** Ürün → “Yayınlama/Satış kanalları” bölümünde
   Headless işaretli değilse ürün Storefront API'de görünmez (sitede 404 olur, sitemap'e girmez).
   Koleksiyonlar da aynı kanala yayımlanmalıdır.

`.env` örneği için: `.env.example`. Mod geçişi: `STORE_MODE=shopify`.

## 2. Kategori ve seçki yapısı (koleksiyonlar)

Shopify'da hiyerarşik kategori yoktur; hiyerarşi **koleksiyon metafield'larıyla** kurulur.

| Koleksiyon metafield'ı | Tür | Değer |
|---|---|---|
| `ilkim.collection_type` | Tek satır metin | `kategori` veya `secki` |
| `ilkim.category_path` | Tek satır metin | Kategori yolu, ör. `tc-kagit-paralar/6-emisyon/5-lira` |

- Her kategori düğümü için bir koleksiyon açılır (üst gruplar dahil: `tc-kagit-paralar`, `tc-kagit-paralar/6-emisyon` …).
  Üst seviye yollar `src/config/navigation.js → topCategories` ile aynı olmalıdır.
- Ürün, en derin kategori koleksiyonuna **ve** üst koleksiyonlara eklenebilir; site, ürünün en derin yolunu
  birincil kategori kabul eder. (Akıllı koleksiyon koşullarıyla otomatikleştirilebilir.)
- **Seçkiler** (Sertifikalı Paralar, Gümüş Paralar, Para Setleri …) `collection_type = secki` olan koleksiyonlardır.
  Bir ürün hem kategoride hem seçkide yer alır; kayıt çoğaltılmaz.
- Koleksiyon başlığı ve açıklaması sitede kategori başlığı/açıklaması olarak kullanılır.

Demo yapısındaki bütün yollar: `src/data/demo/categories.json` (Shopify'a aktarım için şablon olarak kullanılabilir).

## 3. Ürün metafield'ları (namespace `ilkim`)

Shopify yönetimi → **Ayarlar → Özel veriler → Ürünler** altında tanımlanır. Her tanımda
**“Storefronts” erişimi açık** olmalıdır (aksi halde Storefront API değeri döndürmez).
Bilinmeyen değer boş bırakılır; site tahmin yapmaz.

| Anahtar | Shopify türü | Sitedeki alan | Örnek | Not |
|---|---|---|---|---|
| `kind` | Tek satır metin (seçenek listesi) | Tür | `banknot` | `banknot, madeni, set, malzeme, madalya, obje, pul, antika` |
| `country` | Tek satır metin | Ülke | `Türkiye` | Filtre değeri bu metinden üretilir |
| `year_from` | Tam sayı | Yıl (başlangıç) | `1961` | Hicrî ise hicrî yıl |
| `year_to` | Tam sayı | Yıl (bitiş) | `1965` | Aralık yoksa boş |
| `calendar` | Tek satır metin | Takvim | `miladi` / `hicri` | Hicrî ve miladî karışmaz |
| `year_text` | Tek satır metin | Yazılış | `1327/1` | Ürün üzerindeki yazım |
| `denomination_value` | Ondalık sayı | Nominal değer | `2.5` | |
| `denomination_unit` | Tek satır metin | Para birimi | `Lira` | |
| `emission` | Tam sayı | Emisyon | `5` | T.C. banknotları |
| `ruler` | Tek satır metin | Hükümdar | `V. Mehmed Reşad` | |
| `period` | Tek satır metin | Dönem | `1924–1957 Dönemi` | |
| `condition` | Tek satır metin | Kondisyon | `10/9,5` | Ölçeği açıklamada belirtin |
| `catalog_number` | Tek satır metin | Katalog no | `Pick P-173a` | |
| `cert_service` | Tek satır metin | Sertifika kuruluşu | `PMG` | |
| `cert_grade` | Tam sayı | Sertifika derecesi | `58` | |
| `cert_number` | Tek satır metin | Sertifika no | `1234567-001` | |
| `metal` | Tek satır metin | Metal | `Gümüş` | |
| `sale_status` | Tek satır metin | Satış durumu | `sold` | Yalnızca satıldığı kesin tekil ürünlerde |
| `delivery_note` | Çok satırlı metin | Ürüne özel teslimat notu | | İsteğe bağlı |

Standart Shopify alanları: başlık, açıklama (HTML), görseller (alt metinleriyle), fiyat, karşılaştırma fiyatı,
SKU, stok, SEO başlığı/açıklaması, URL tanıtıcısı (`handle` → `/urun/{handle}`).

## 4. Satılmış ürün, stokta yok ve yayından kaldırma — fark

| Durum | Shopify'da nasıl | Sitede sonuç |
|---|---|---|
| **Stokta** | Stok takibi açık, adet > 0 | Satın alınabilir |
| **Stokta yok** | Stok takibi açık, adet 0, “Stokta yokken satışa devam et” **kapalı** | Sayfa açık, “Stokta yok”, satın alma kapalı |
| **Satıldı** | Yukarıdakine ek olarak `ilkim.sale_status = sold` | Sayfa ve görseller açık, “Satıldı” etiketi, satın alma kapalı |
| **Yayından kaldırıldı** | Ürün “Taslak/Arşiv” veya Headless kanalında yayımlanmamış | Storefront API ürünü döndürmez → sayfa **404**, sitemap'ten çıkar |

- Stokta olmayan her ürün “satıldı” sayılmaz: tekrar gelebilecek ürünler yalnızca “Stokta yok” görünür.
- Satılmış ürünün sayfasının açık kalması için ürünü **arşivlemeyin / kanaldan kaldırmayın**; adedi 0 yapıp
  `sale_status = sold` girin.
- Görünürlük tek ayarla değiştirilir: `SOLD_PRODUCTS_VISIBILITY = visible | unlisted | hidden` (bkz. `.env.example`).

## 5. Arama ve filtreler

**Bu projedeki yöntem:** Site, Headless kanalına yayımlanmış bütün ürünleri sunucu belleğinde tutar
(`CATALOG_CACHE_TTL_SECONDS`, varsayılan 300 sn) ve arama/filtre/sıralama/sayfalamayı bu tam katalog üzerinde
kendi motoruyla yapar (`src/lib/search/`). Böylece demo ve canlı modda davranış aynıdır ve şu özellikler
desteklenir: Türkçe karakter katlama, sayı yazımı birleştirme (1.000 = 1000), çok alanlı sorgu, yıl **aralığı**,
hicrî/miladî ayrımı, katalog numarası biçimleri.

- Ölçek: birkaç bin ürün için uygundur (her 250 ürün bir istek). On binlerce ürüne çıkılırsa Shopify'ın yerel
  arama/filtre API'sine geçilmelidir (aşağıdaki kısıtlarla).

**Shopify yerel filtreleri (Search & Discovery) — alternatif/ek kullanım:**
Shopify **Search & Discovery** uygulamasında filtre olarak eklenebilecek alanlar: fiyat, stok durumu,
ürün türü, satıcı, etiket, varyant seçenekleri ve **tek satır metin / tam sayı / ondalık / doğru-yanlış** türündeki
ürün metafield'ları. Storefront API'de bunlar `collection.products(filters: …)` ve `search(productFilters: …)`
ile kullanılır.

Yerel filtrelerle **desteklenmeyen / kısıtlı** olanlar (bu yüzden site kendi motorunu kullanır):
- Metafield'larda **aralık** filtresi yok (yıl aralığı yalnızca değerleri tek tek seçerek yapılabilir); aralık filtresi yalnızca fiyatta var.
- Türkçe karakter katlama ve “1.000 = 1000” gibi sayı birleştirme Shopify aramasının kontrolünde değildir.
- Metafield'lar metin aramasına dahil edilmek için Search & Discovery'de ayrıca seçilmelidir.

## 6. Güncelleme ve önbellek

| Katman | Süre | Ayar |
|---|---|---|
| Tam katalog (arama, liste, sitemap) | 300 sn | `CATALOG_CACHE_TTL_SECONDS` |
| Ürün sayfası | 60 sn | `PRODUCT_CACHE_TTL_SECONDS` |
| Sepet doğrulama ve ödeme | **önbelleksiz** | — her istekte Shopify'dan güncel fiyat/stok |
| CDN (varsa) | `s-maxage=60, stale-while-revalidate=300` | `src/middleware.js` |

Shopify'daki değişiklik, en geç bu süreler kadar sonra sitede görünür (“anlık” değildir).
Webhook bağlanırsa sunucu önbelleği hemen boşaltılır:

1. Shopify yönetimi → **Ayarlar → Bildirimler → Webhook'lar → Webhook oluştur**.
2. Biçim JSON, URL: `https://ALAN-ADI/api/webhooks/shopify`.
3. Konular: `products/create`, `products/update`, `products/delete`, `collections/create`,
   `collections/update`, `collections/delete`, `inventory_levels/update`.
4. Sayfada gösterilen imzalama anahtarını `SHOPIFY_WEBHOOK_SECRET` olarak girin.
   Uç nokta `X-Shopify-Hmac-Sha256` imzasını doğrular; geçersiz istek 401 alır.
- Çok sunuculu/serverless kurulumda webhook yalnızca isteği alan örneğin belleğini boşaltır; diğerleri TTL ile yenilenir.
  CDN kullanılıyorsa CDN'in önbellek temizleme API'si bu uca ayrıca bağlanmalıdır.

## 7. Sepet ve ödeme akışı

```
Tarayıcı sepeti (localStorage: varyant + adet)
  → POST /api/cart/validate   (sunucu: Shopify'dan güncel fiyat/stok)
  → POST /api/checkout        (sunucu: yeniden doğrulama → Storefront cartCreate)
  → cart.checkoutUrl          (Shopify Checkout)
  → Shopify'da etkinleştirilen ödeme yöntemi (ör. PayTR)
```

- Adet/stok değişmişse ödeme başlatılmaz, kullanıcı sepete yönlendirilir (409).
- `buyerIdentity.countryCode = SHOPIFY_COUNTRY` ve `@inContext(country, language)` kullanılır.
- Sipariş Shopify'da oluşur; stok Shopify tarafından düşülür. Bu site sipariş kaydı tutmaz.

## 8. Canlıya geçmeden önce yapılması gereken testler (gerçek erişim gerekir)

- [ ] `/api/health` → `{ ok: true, mode: "shopify" }`
- [ ] Ürün sayısı Shopify'daki yayımlanmış ürün sayısıyla aynı mı?
- [ ] Metafield'lar ürün sayfasında görünüyor mu (Storefronts erişimi)?
- [ ] Kategori/seçki koleksiyonları ve yolları doğru mu?
- [ ] Adet 0 + `sale_status=sold` ürün: sayfa açık, “Satıldı”, sepete eklenemiyor mu?
- [ ] Sepet → ödeme → Shopify Checkout açılıyor mu? Fiyatlar eşleşiyor mu?
- [ ] PayTR test modunda ödeme ve sipariş kaydı (bkz. `docs/PAYTR.md`).
- [ ] Webhook imzası doğrulanıyor ve değişiklik sitede görünüyor mu?
- [ ] Token yanlışken site “Mağaza verisine ulaşılamıyor” (503) gösteriyor mu? (Demo veriye düşmemeli.)
