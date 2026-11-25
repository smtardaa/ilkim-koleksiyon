# İlkim Koleksiyon — katalog sitesi

Astro + HTML + CSS + JavaScript ile yazılmış nümismatik ve koleksiyon **kataloğu**.
Sitede sepet, çevrim içi ödeme, teklif veya favori yoktur. Ürün sayfasındaki
**“Satın almak için iletişime geç”** düğmesi, ürün adı, kodu ve bağlantısını içeren hazır bir mesajla
işletmenin WhatsApp'ını açar.

> **Durum:** Katalog şu an boştur. Ürünler ve işletme bilgileri **yönetim panelinden** (`/yonetim`) girilir;
> boş bırakılan bilgiler sitede gösterilmez. Kurulum: [docs/YONETIM-PANELI.md](docs/YONETIM-PANELI.md).

---

## Hızlı başlangıç

Gereksinim: **Node.js 22.12+** (hosting'de 24.x önerilir).

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
| `npm start` | Derlenmiş sunucuyu çalıştırır (`node ./dist/server/entry.mjs`; `PORT`, `HOST`) |
| `npm run preview` | Derlemeyi 5500 portunda önizler |
| `npm test` | Katalog verisi, arama motoru, ana sayfa bölümleri, WhatsApp mesajı ve yönetim paneli testleri |
| `npm run admin:parola` | Yönetim paneli için kullanıcı adı/parola özeti ve oturum anahtarı üretir |
| `npm run brand:assets` | Logodan amblem, favicon ve paylaşım görseli üretir |

## Mimari

```
src/
  config/          site.js (indeksleme, satılmış görünürlüğü, publicOrigin) · business.js (işletme bilgileri, WhatsApp — TEK MERKEZ)
                   navigation.js (menüler; kategoriler categories.json'dan) · home.js (ana sayfa bölümleri)
  data/catalog/    categories.json · countries.json · collections.json · products.json  ← BAŞLANGIÇ verisi (ilk açılışta DATA_DIR'e kopyalanır)
  lib/
    catalog.js     sayfaların tek giriş noktası
    providers/     local.js — siteye veriyi depodan sunar
    store/         file-store.js (DATA_DIR içindeki JSON) · index.js (getStore) — ileride mysql-store.js aynı yöntemlerle
    admin/         auth (giriş, oturum, CSRF) · service (kurallar) · settings-schema (Doldurulacaklar alanları) · images (sharp)
    runtime.js     panelden kaydedilen ayar/kategori değişikliklerini her istekte siteye uygular
    search/        normalize.js (Türkçe/sayı/katalog no) · engine.js (arama, faset, sıralama, sayfalama)
    home-sections.js  ana sayfa kategori bölümlerinin seçim mantığı
    seo.js         JSON-LD (Organization, WebSite, Product, BreadcrumbList, ItemList)
  components/      ProductCard, ProductSlider, CountryPicker (ülke seç penceresi), CatalogView …
  pages/           SSR katalog ve bilgi sayfaları, yonetim/ (panel), medya/ (yüklenen görseller), sitemap, robots, /api/health
  scripts/         ui.js · slider.js · cat-carousel.js (mobil sonsuz kategori kaydırıcısı) · admin.js (panel)
docs/              YONETIM-PANELI.md (panel kurulumu, güvenlik, MySQL'e geçiş)
tests/             node:test birim testleri (tests/fixtures yalnızca test verisidir)
```

- Ürün bilgileri bileşenlere sabit yazılmaz; bütün sayfalar `loadCatalog()` / sağlayıcı arayüzünden beslenir.
- **Kategoriler tek kaynaktan** gelir (`categories.json`): menü, ana sayfa kartları ve bölümleri, alt bilgi,
  kategori dizini, sitemap ve breadcrumb aynı sırayı kullanır.
- **Ülkeler ürünlerden bağımsızdır** (`countries.json`). “Yabancı Madeni Paralar” ve “Yabancı Kağıt Paralar”
  için `/kategori/{kategori}/{ülke}` sayfaları bu listeden üretilir; “Ülke seç” penceresi sayı göstermez.
- Kategori kartı görselleri açık lisanslı kaynaklardan bağlantıyla gösterilir; atıflar `/kaynaklar` sayfasındadır.
- Arayüz çerçevesi yoktur. Bağımlılıklar: `astro`, `@astrojs/node`, `sharp`, `@fontsource-variable/plus-jakarta-sans`.

### Sayfa oluşturma

| Sayfa | Oluşturma |
|---|---|
| Bütün sayfalar (bilgi sayfaları dahil) | İstek anında sunucuda (SSR) — panelden girilen bilgi hemen görünür |
| `/yonetim`, `/yonetim/eksikler` | SSR, yalnızca giriş yapmış yöneticiye |
| `/sitemap*.xml`, `/robots.txt`, `/api/health` | SSR |

## Ortam değişkenleri

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `SITE_URL` | `http://localhost:5500` | Canonical/OG/sitemap ve WhatsApp mesajındaki ürün bağlantısı |
| `DATA_SOURCE` | `local` | Veri kaynağı (ileride `mysql`) |
| `SITE_INDEXING` | `off` | `on` + gerçek https alan adı birlikte olmadan indeksleme açılmaz |
| `SOLD_PRODUCTS_VISIBILITY` | `visible` | `visible` / `unlisted` / `hidden` |
| `DATA_DIR` | `./storage/veri` | Panel verisinin kalıcı klasörü |
| `UPLOADS_DIR` | `./storage/gorseller` | Yüklenen ürün görselleri |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` | — | Panel girişi (gizli); `npm run admin:parola` |

Değişkenler `astro:env` şemasıyla (`astro.config.mjs`) doğrulanır ve sunucuda **çalışma anında** okunur.
Derlenmiş sunucu `.env` okumaz; canlıda değerler hosting panelinden verilir. `SITE_URL` derleme sırasında da
tanımlı olmalıdır (panel formlarının köken denetimi için; bkz. docs/YONETIM-PANELI.md → Güvenlik).

**WhatsApp bağlantısındaki ürün adresi:** `SITE_URL` gerçek bir https alan adıysa o kullanılır; değilse isteğin
kendi adresi kullanılır. Böylece canlıda müşteriye `localhost` bağlantısı gitmez.

## Ana sayfa

- Kompakt arama alanı ve “Koleksiyona göz at” düğmesi.
- “Koleksiyonunu seç”: masaüstünde 4'lü kare kategori kartları; mobilde 3'lü görünen, 3'er kayan,
  sonsuz döngülü kaydırıcı (dokunmatik + oklar, otomatik kayma yok). Kopya kartlar `inert` + `aria-hidden`
  olduğundan ekran okuyucu ve klavye için tekrar oluşmaz.
- Her ana kategori için sırayla bir ürün bölümü (en fazla 10 ürün, “Tümünü Gör”). Boş bölümde
  “Bu kategoriye henüz ürün eklenmedi.” yazar; sahte kart veya ok gösterilmez.

## SEO

- Sayfaya özgü `title`/`description`, canonical, Open Graph, JSON-LD (Product yalnızca gerçek ürünlerde; sahte sayı/puan yok).
- `sitemap.xml` → sayfalar, kategoriler, ürünler; istek anında sağlayıcıdan üretilir.
- İndeksleme `SITE_INDEXING` ile yönetilir ve otomatik açılmaz. Arama sayfası her zaman `noindex`.
  Boş kategori ve iskelet halindeki yasal sayfalar `noindex` kalır.
- Eski kategori adresleri yalnızca gerçek karşılığı varsa 301 ile yönlenir (`src/middleware.js`); karşılığı olmayanlar 404 döner.

## Yönetim paneli

`/yonetim` — iki sayfa: **Genel yönetim** (ürünler, kategoriler, ülkeler, seçkiler) ve **Doldurulacaklar**
(işletme bilgileri ve bilgi sayfası metinleri). Tek yönetici; giriş bilgileri ortam değişkenlerinde.
Veri bugün `DATA_DIR` içindeki JSON dosyalarında; MySQL'e geçişte yalnızca depo katmanı değişir.
Kurulum, güvenlik ve geçiş adımları: [docs/YONETIM-PANELI.md](docs/YONETIM-PANELI.md).

## Erişilebilirlik ve performans

- Klavye ile tam kullanım, görünür odak halkası, “içeriğe geç” bağlantısı, `dialog` tabanlı arama ve ülke seçimi
  (Escape kapatır, odak açan düğmeye döner), `prefers-reduced-motion` desteği.
- Ürün görselleri `object-fit: contain` ile kırpılmadan gösterilir; ekran altı görseller `loading="lazy"`.
