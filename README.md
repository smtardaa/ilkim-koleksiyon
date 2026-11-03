# İlkim Koleksiyon — e-ticaret sitesi (demo)

Astro + HTML + CSS + JavaScript ile yazılmış, **Shopify Storefront API'ye hazır** numizmatik mağaza.
Şu anki sürüm müşteriye gösterilecek **demo**dur: ürünler ve fiyatlar örnek envanterden (kaynak:
eskiparamarket.com, bkz. `docs/DEMO-ENVANTER.md`) alınmıştır; ödeme alınmaz, sipariş oluşturulmaz.

> **Canlı satışa hazır değildir.** Shopify mağazası, erişim token'ları, PayTR hesabı, gerçek envanter,
> işletme bilgileri ve yasal metinler henüz sağlanmadı; bunlarla yapılması gereken testler
> `docs/SHOPIFY-KURULUM.md §8` ve `docs/PAYTR.md` içinde listelidir.

---

## Hızlı başlangıç

Gereksinim: **Node.js 22.12+** (geliştirmede 24.14 kullanıldı).

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
npm run dev
```

Geliştirme sunucusu: http://localhost:5500

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu (127.0.0.1:5500) |
| `npm run build` | Üretim derlemesi → `dist/` |
| `npm start` | Derlenmiş sunucuyu çalıştırır (`node ./dist/server/entry.mjs`; port `PORT`, adres `HOST` ortam değişkenleri) |
| `npm run preview` | Derlemeyi 5500 portunda önizler |
| `npm test` | Arama motoru ve demo veri bütünlüğü testleri (`node --test`) |
| `npm run check` | Astro tür/şablon kontrolü (`@astrojs/check` kurulursa) |
| `npm run brand:assets` | Logodan amblem, favicon ve paylaşım görseli üretir |
| `npm run demo:images -- <ham-klasör>` | Demo ürün görsellerini WebP'ye çevirir |
| `npm run demo:data` | `demo-kaynak/` ham kayıtlarından demo envanteri üretir |

## Mimari

```
src/
  config/          site.js (mod, indeksleme, satılmış görünürlüğü) · business.js (işletme bilgileri — TEK MERKEZ)
                   navigation.js (menü, ana sayfa kartları)
  lib/
    types.js       ortak ürün/kategori/seçki modeli (JSDoc)
    catalog.js     sayfaların tek giriş noktası; STORE_MODE'a göre sağlayıcı seçer
    providers/     demo.js (yerel envanter) · shopify.js + shopify-mapper.js (Storefront API)
    search/        normalize.js (Türkçe/sayı/katalog no) · engine.js (arama, faset, sıralama, sayfalama)
    cart-server.js sunucu tarafı fiyat/stok doğrulaması
    seo.js         JSON-LD (Organization, WebSite, Product/Offer, BreadcrumbList, ItemList)
    cache.js       TTL bellek önbelleği
  pages/           SSR ürün/kategori/arama sayfaları, statik bilgi sayfaları, API uçları, sitemap, robots
  components/ layouts/ scripts/ (tarayıcı JS) styles/global.css
scripts/           marka varlıkları, demo görsel ve veri dönüştürücüleri
demo-kaynak/       demo envanterin ham kaynak kayıtları ve dönüşüm raporu
docs/              SHOPIFY-KURULUM.md · PAYTR.md · DEMO-ENVANTER.md
tests/             node:test birim testleri
```

- Ürün bilgileri bileşenlere sabit yazılmaz; bütün sayfalar `loadCatalog()` / sağlayıcı arayüzünden beslenir.
- **Demo ve Shopify aynı bileşenleri kullanır.** Mod: `STORE_MODE=demo | shopify`.
- **Shopify hatasında demo veriye düşülmez**: sayfa 503 ve “Mağaza verisine şu anda ulaşılamıyor” gösterir.
- Ürün başlığı, açıklaması, fiyatı, stok durumu ve SEO etiketleri **ilk HTML yanıtında** sunucuda oluşur.
  JavaScript yalnızca sepet, favoriler, galeri büyütme, sekmeler ve filtre kolaylıkları içindir.
- Arayüz çerçevesi (React/Vue vb.) yoktur. Bağımlılıklar: `astro`, `@astrojs/node`, `sharp` (görsel işleme),
  `@fontsource-variable/plus-jakarta-sans` (yerelde barındırılan font).

### Sayfa oluşturma

| Sayfa | Oluşturma |
|---|---|
| Ana sayfa, `/urunler`, `/kategori/...`, `/urun/...`, `/arama`, `/yeni-gelenler`, `/koleksiyonlar/...` | İstek anında sunucuda (SSR) |
| `/sepet`, `/favoriler` | SSR kabuk + tarayıcıda yerel veri (noindex) |
| `/hakkimizda`, `/iletisim`, `/koleksiyon-rehberi`, `/sss`, `/bilgi/*` | Derleme sırasında statik |
| `/sitemap*.xml`, `/robots.txt`, `/api/*` | SSR |

## Ortam değişkenleri

Ayrıntılı açıklamalar `.env.example` içindedir.

| Değişken | Gizli mi | Varsayılan | Açıklama |
|---|---|---|---|
| `SITE_URL` | hayır | `http://localhost:5500` | Canonical/OG/sitemap mutlak adresi |
| `STORE_MODE` | hayır | `demo` | `demo` / `shopify` |
| `SITE_INDEXING` | hayır | `off` | `on` + `shopify` + gerçek https alan adı birlikte olmadan indeksleme açılmaz |
| `SOLD_PRODUCTS_VISIBILITY` | hayır | `visible` | `visible` / `unlisted` / `hidden` |
| `SHOPIFY_STORE_DOMAIN` | hayır | — | `magaza.myshopify.com` |
| `SHOPIFY_API_VERSION` | hayır | `2026-10` | Storefront API sürümü |
| `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` | public token | — | Headless kanalı public token |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | **evet** | — | Headless kanalı private token (sunucuda) |
| `SHOPIFY_WEBHOOK_SECRET` | **evet** | — | Webhook HMAC doğrulama anahtarı |
| `SHOPIFY_COUNTRY` / `SHOPIFY_LANGUAGE` | hayır | `TR` | Fiyat/dil bağlamı |
| `CATALOG_CACHE_TTL_SECONDS` | hayır | `300` | Tam katalog önbelleği |
| `PRODUCT_CACHE_TTL_SECONDS` | hayır | `60` | Ürün sayfası önbelleği |

Admin API token'ları ve PayTR anahtarları bu projede **kullanılmaz ve eklenmemelidir.**
Değişkenler `astro:env` şemasıyla (`astro.config.mjs`) doğrulanır ve yalnızca sunucu kodunda okunur.

**Çalışma anı / derleme anı:**
- SSR sayfaları ve API'ler değişkenleri **çalışma anında** okur: `STORE_MODE`, `SITE_INDEXING`, Shopify ayarları
  değiştirilip sunucu yeniden başlatılınca geçerli olur (yeniden derleme gerekmez).
- Derlenmiş sunucu `.env` dosyasını **okumaz**; değerler barındırma ortamının değişken panelinden verilmelidir.
  (`npm run dev` ve `npm run build` sırasında `.env` okunur.)
- Statik bilgi sayfaları (`/hakkimizda`, `/iletisim`, `/sss`, `/koleksiyon-rehberi`, `/bilgi/*`) derleme anındaki
  değerlerle üretilir; robots meta etiketi ve canonical adresleri için yayına geçişte **yeniden derleme gerekir**.

## Üretim ortamı

- Çıktı: Node.js standalone sunucu (`@astrojs/node`, `mode: 'standalone'`). Kalıcı bir Node süreci çalıştırabilen
  her ortamda çalışır (VPS, Docker, Render, Railway, Fly.io vb.). `npm run build` → `npm start`.
  Sunucuya `HOST=0.0.0.0` ve `PORT` verilmelidir; önüne HTTPS sonlandıran bir ters vekil/CDN konmalıdır.
- Serverless (Vercel/Netlify/Cloudflare) tercih edilirse `@astrojs/node` yerine ilgili Astro adapter'ı kurulmalı;
  `src/pages/api/webhooks/shopify.js` içindeki `node:crypto` kullanımı Cloudflare için Web Crypto'ya çevrilmelidir.
  Bellek önbelleği her örnekte ayrıdır (TTL ile sınırlı tazelik).
- `public/demo/` demo görselleri (≈170 MB, 4.786 WebP) yalnızca demo içindir; canlıda görseller Shopify CDN'den gelir ve
  bu klasör kaldırılabilir.
- Statik bilgi sayfaları derleme anındaki `business.js` ve ortam değişkenleriyle üretilir; bu dosyalar
  değişince yeniden derleme gerekir.

## Güncelleme ve önbellek

Shopify'da yapılan değişiklikler elle HTML düzenlemeden görünür:

- Ürün sayfası en geç **60 sn**, listeler/arama/sitemap en geç **300 sn** sonra (ayarlanabilir).
- Webhook (`/api/webhooks/shopify`) bağlanırsa sunucu önbelleği değişiklik bildiriminde hemen boşaltılır.
- Sepete eklemede ve ödeme öncesinde fiyat/stok **önbelleksiz** doğrulanır.
- CDN önündeyken HTML için `s-maxage=60, stale-while-revalidate=300` gönderilir (`src/middleware.js`).

Ayrıntı: `docs/SHOPIFY-KURULUM.md §6`.

## Shopify alan eşlemesi

Tam tablo: `docs/SHOPIFY-KURULUM.md §2–3`. Özet:

| Site | Shopify |
|---|---|
| Başlık, açıklama, görseller, fiyat, karşılaştırma fiyatı, SKU, SEO | Standart ürün alanları |
| Stok durumu | `variant.availableForSale` (+ `quantityAvailable`) |
| “Satıldı” | metafield `ilkim.sale_status = sold` |
| Ülke, yıl (+takvim), nominal, emisyon, hükümdar, dönem, kondisyon, katalog no, sertifika, metal | `ilkim.*` ürün metafield'ları |
| Kategori hiyerarşisi | `collection_type = kategori` + `category_path` koleksiyon metafield'ları |
| Seçkiler | `collection_type = secki` koleksiyonlar |

## Ödeme ve PayTR

Canlı akış: Astro → Storefront Cart API → `checkoutUrl` → Shopify Checkout → Shopify'da etkinleştirilen PayTR.
Demo modunda ödeme düğmesi yalnızca “demo, sipariş oluşturulmadı” bilgisini gösterir. Kurulum ve test listesi:
`docs/PAYTR.md`.

## SEO

- Sayfaya özgü `title`/`description`, canonical, Open Graph/Twitter, JSON-LD (Organization yalnızca dolu
  alanlarla; Product/Offer gerçek fiyat ve stokla; sahte puan/yorum yok).
- `sitemap.xml` (dizin) → `sitemap-sayfalar.xml`, `sitemap-kategoriler.xml`, `sitemap-urunler.xml`:
  istek anında sağlayıcıdan üretilir; yeni Shopify ürünü önbellek yenilenince otomatik girer.
- **İndeksleme stratejisi:**
  - Demo/staging: her sayfa `noindex` (meta + `X-Robots-Tag`); `robots.txt` taramayı **engellemez**
    (engellerse noindex okunamaz) ve sitemap satırı içermez.
  - Canlı (`SITE_INDEXING=on`, `STORE_MODE=shopify`, gerçek https `SITE_URL`): ürün, kategori, seçki ve bilgi
    sayfaları indekslenir.
  - Arama, sepet, favoriler: her zaman `noindex`.
  - Filtre/sıralama kombinasyonları: `noindex, follow` + temel kategori adresine canonical.
    Yalnızca sayfalama (`?sayfa=2`) kendi adresine canonical olur.
  - Boş kategori ve iskelet halindeki yasal sayfalar: `noindex` (tamamlanınca açılır).
  - Satılmış ama yayında kalan ürün 404 olmaz; `SoldOut` şemasıyla indekslenmeye devam eder.
- Gerçek 404 durum kodu (bilinmeyen ürün/kategori/seçki ve rota).

## Demo envanterden gerçek envantere geçiş

1. Shopify mağazası ve Headless kanalını kurun; metafield ve koleksiyon yapısını oluşturun (`docs/SHOPIFY-KURULUM.md`).
2. İlkim Koleksiyon'un **kendi** ürünlerini, görsellerini ve fiyatlarını Shopify'a girin.
   Demo envanter (eskiparamarket.com kaynaklı) **canlıya aktarılmaz.**
3. `.env`: `STORE_MODE=shopify`, Shopify değişkenleri, gerçek `SITE_URL`.
4. `src/config/business.js` içindeki bütün “Doldurulacak” alanları doldurun; yasal sayfaları
   (`src/pages/bilgi/[slug].astro`) hukuki danışmanla tamamlayıp `isComplete = true` yapın.
5. Shopify Checkout + PayTR test modunda uçtan uca deneme yapın (`docs/PAYTR.md`).
6. Bütün testler geçtikten sonra `SITE_INDEXING=on` ile yayına alın.
7. Demo dosyalarını kaldırın: `public/demo/`, `src/data/demo/`, `demo-kaynak/`, `scripts/build-demo-*.mjs`
   ve `src/lib/providers/demo.js` (ya da test için saklayın; canlıda yüklenmez).

## Erişilebilirlik ve performans notları

- Klavye ile tam kullanım, görünür odak halkası, “içeriğe geç” bağlantısı, ARIA sekmeleri, `dialog` tabanlı
  arama/büyütme/demo uyarısı, etiketli form alanları, `prefers-reduced-motion` desteği.
- Görseller WebP; listelerde 360 px, galeride 720 px; ölçüler (`width/height`) tanımlı; ekran altı görseller
  `loading="lazy"`, hero görseli öncelikli yüklenir.
- Ürün görselleri `object-fit: contain` ile kırpılmadan gösterilir.
