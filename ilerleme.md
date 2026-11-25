# İlkim Koleksiyon — İlerleme Günlüğü

Bu dosya, çalışma yarıda kalırsa kaldığı yerden devam edebilmek için tutulur.
Durum etiketleri:

- **Planlandı** — henüz kod yok.
- **Uygulandı** — kod yazıldı, doğrulama yapılmadı ya da kısmen yapıldı.
- **Doğrulandı** — build/tarayıcı/komut ile kontrol edildi, sonuç kaydedildi.
- **Dış bağlantı bekliyor** — Shopify, PayTR, alan adı veya müşteri bilgisi olmadan tamamlanamaz.

---

## 2026-11-03 — Adım 0: Başlangıç incelemesi

**Durum:** Doğrulandı

- Çalışma klasöründe yalnızca iki referans görsel vardı; önceki bir proje dosyası (kod, README, ilerleme.md) bulunmadı. Proje sıfırdan kuruluyor.
  - `İLKİM KOLEKSİYON için Osmanlı sikkeli logo.png` — kare marka görseli (özgün dosya korunacak, değiştirilmeyecek).
  - `Zümrüt ve bakırla tasarlanmış numizmatik mağaza.png` — yerleşim/tasarım referansı (“Eski Para Market” markası ve “Teklif ver” ifadesi taşınmayacak).
- Ortam: Node 24.14.1, npm 11.11.0, Python 3.11 (PIL yok). npm'deki güncel sürümler: `astro` 7.4.5, `@astrojs/node` 11.1.9, `sharp` 0.35.5.
- Kaynak katalog: `https://eskiparamarket.com/` (OpenCart + Journal3 teması).
  - `robots.txt`: `User-Agent: * / Allow:` — tarama engeli yok.
  - `sitemap.xml` → ürün sitemap'leri 500 + 488 = **988 ürün URL'si**, kategori sitemap'i **291 kategori URL'si** (215'i yabancı ülke alt kategorisi).
  - Ürün sayfaları kategori yolu içermiyor; kategori ilişkisi kategori listelerinden çıkarılacak.
  - Üst menüdeki “MADALYA VE OBJE” bağlantısı `/firsat-urunu` kategorisine gidiyor.

**Uygulama sırası (Planlandı):**

1. Kaynak katalogu düşük hızla tara (≈1 istek/sn): kategori listeleri → ürün sayfaları → görseller.
2. Ham veriyi ortak ürün modeline dönüştür (`src/data/demo/`), görselleri WebP'ye çevir, kaynak kaydını tut.
3. Astro 7 + `@astrojs/node` (SSR) projesi; demo ve Shopify sağlayıcıları aynı arayüzle.
4. Ana sayfa, katalog, kategori, ürün, arama, yeni gelenler, seçkiler, sepet, favoriler, bilgi sayfaları, 404.
5. Arama/filtre (sunucu tarafında bütün veri kümesi üzerinde), URL durum yönetimi.
6. SEO: meta, canonical, OG, JSON-LD, dinamik sitemap, robots, noindex (demo).
7. README, Shopify alan eşlemesi, PayTR kurulum notları, `.env.example`.
8. Build + tarayıcı + mobil doğrulama.

---

## 2026-11-03 — Adım 1: Kaynak katalog taraması

**Durum:** Uygulandı (ürün sayfası ve görsel taraması sürüyor)

- Yapılan: Düşük hızlı tarayıcılar (≈1 istek/sn, tek bağlantı, önbellekli) yazıldı ve çalıştırıldı.
  - Kategori listeleri: 287 kategori sayfası (pazarlama listeleri `cok-satanlar`, `populer-paralar`, `tavsiye-ettiklerimiz`, `tukenmek-uzere`, `tum-urunler` hariç) → **988 ürünün tamamı** en az bir kategoriye eşlendi. HTTP hatası yok.
  - Ürün sayfaları: sitemap'teki 988 URL sırayla alınıyor.
  - Görseller: ürün başına en fazla 4 görsel (kaynağın 750px sürümü) iniyor.
- Bulgular:
  - Kaynakta “MADALYA VE OBJE” menüsü `/firsat-urunu` listesine gidiyor; içerik indirimli yabancı banknotlar + 1 albüm. **Madalya/obje ürünü doğrulanamadı** → İlkim'de “Madalya ve Objeler” kategorisi boş durumla gösterilecek.
  - Antika ürünü yok → “Antika” alt kategorisi boş durumla.
  - Kaynak açıklamaları çoğunlukla boş; teknik bilgiler ürün başlığında (Pick no, yıl, kondisyon).
  - Kaynakta bütün taranan ürünler “Stok: Var”; adet bilgisi yayınlanmıyor.
  - Kaynak kategori ilişkilerinde hatalar var (Osmanlı sikkeleri T.C. hatıra kategorisinde, fantazi para T.C. hatıra'da, gümüş 1 Lira malzeme kategorisinde, adres-ad uyuşmazlıkları ör. `guney-osetya` = “Güney Vietnam”). Belgelenmiş kurallarla düzeltiliyor.
- Ham kayıtlar: `demo-kaynak/` (kategori-taramasi.json, urun-taramasi.json, gorsel-indirme.json).

## 2026-11-03 — Adım 2: Proje iskeleti, veri modeli, sağlayıcılar

**Durum:** Uygulandı; build doğrulandı

- Astro 7.4.5 + @astrojs/node 11 (standalone), `output: 'server'`; bilgi sayfaları `prerender = true`.
- Tek font ailesi: Plus Jakarta Sans (yerel paket, `@fontsource-variable`).
- Ortak model (`src/lib/types.js`), demo sağlayıcı (`src/lib/providers/demo.js`), Shopify Storefront sağlayıcı (`shopify.js`, `shopify-mapper.js`), TTL önbellek (`src/lib/cache.js`).
- Arama/filtre motoru (`src/lib/search/`): Türkçe normalizasyon, sayı/katalog no birleştirme, fasetler, sıralama, sayfalama — bütün katalog üzerinde sunucuda.
- Dönüştürücüler: `scripts/build-demo-images.mjs` (WebP 720/360, yalnızca beyaz kenar kırpma), `scripts/build-demo-data.mjs`.
- Marka: `scripts/build-brand-assets.mjs` — amblem logodaki sikke bölgesinden oransal kırpıldı; özgün PNG değiştirilmedi.
- Kontrol: `astro build` başarılı (11 statik sayfa + SSR). Ekran görüntüleriyle masaüstü ana sayfa, kategori, ürün ve mobil hero incelendi.
- Bulunan hatalar ve düzeltmeler: hicrî yıl kalıbı 13xx'i kaçırıyordu (düzeltildi); Latin “I” → “ı” dönüşümü (“Bolıvıanos”) düzeltildi; Pick biçimleri (Ps122, P-S/1073, P/64) eklendi; “yeni” sıralaması kaynak kayıt sırasına bağlandı; kaynağın stok kodu İlkim ürün kodu gibi gösterilmiyor.

**Sonraki adım:** Tarama bitince verileri yeniden üret, tam veriyle doğrula; testler, README ve Shopify/PayTR dokümantasyonu.

## 2026-11-03 — Adım 3: Sayfalar, sepet, arama, SEO

**Durum:** Uygulandı; doğrulandı (demo modu)

- Sayfalar: ana sayfa, `/urunler`, `/kategori` + `/kategori/[...yol]`, `/urun/[handle]`, `/arama`, `/yeni-gelenler`,
  `/koleksiyonlar` + `/koleksiyonlar/[handle]`, `/sepet`, `/favoriler`, `/hakkimizda`, `/iletisim`,
  `/koleksiyon-rehberi`, `/sss`, `/bilgi/*` (7 düzenlenebilir iskelet), `404`.
- API: `/api/cart/validate`, `/api/checkout`, `/api/products`, `/api/webhooks/shopify` (HMAC), `/api/health`.
- SEO: `sitemap.xml` dizini + sayfalar/kategoriler/ürünler, dinamik `robots.txt`, noindex (meta + X-Robots-Tag), JSON-LD.
- Kontroller (dev sunucu, curl + tarayıcı paneli):
  - 404: bilinmeyen ürün/kategori/seçki/rota → HTTP 404 + özel sayfa ✔
  - `X-Robots-Tag: noindex, follow`, `<meta name="robots" content="noindex, follow">` ✔; robots.txt taramayı engellemiyor ✔
  - Sepete ekle: stok sınırı (ikinci eklemede adet 1'de kaldı, uyarı gösterildi) ✔; sayaç güncellendi ✔
  - Satılmış ürün: sayfa 200, “Satıldı”, satın alma yok, `SoldOut` şeması, sitemap'te ✔
  - Demo ödeme: `{demo:true}`, modal “sipariş oluşturulmadı” ✔; satılmış ürünle ödeme → 409 ✔
  - İmzasız webhook → 503 (anahtar tanımsız) ✔
  - Mobil (375 px): taşma yok (scrollWidth = 375) ✔; filtre paneli açılıyor, filtre URL'ye yazılıyor (`?tur=banknot&ulke=turkiye`) ✔
  - `npm test`: 24/24 ✔
- Hatalar/düzeltmeler: robots.txt'teki `/sepet`, `/favoriler` engeli kaldırıldı (noindex okunabilsin); devre dışı düğme stili
  (`:disabled`); ürün sayfasına Organization JSON-LD eklendi (Offer satıcı referansı); hero bağlantılı görselleri dekoratif yapıldı;
  “2000 Yen/Franc” gibi nominal değerler yıl sanılıyordu (düzeltildi); `session: false`.
- Not: Astro 7 aynı projede ikinci `astro dev` sürecine izin vermiyor; Shopify hata testi üretim derlemesiyle yapılacak.

## 2026-11-03 — Adım 4: Tam envanter, üretim derlemesi ve teslim kontrolleri

**Durum:** Doğrulandı (demo modu) · Shopify/PayTR: **Dış bağlantı bekliyor**

- Tarama tamamlandı: 988/988 ürün sayfası (HTTP 200), 2.393/2.393 görsel (1 görsel ilk denemede ağ hatası verdi, yeniden denemede alındı). Kaynağın tamamı aktarıldı.
- Dönüşüm (`demo-kaynak/donusum-raporu.json`): 988 ürün, 0 hata, 288 kategori (62 boş), 4 seçki; tür: 961 banknot, 17 madeni, 4 set, 3 malzeme, 3 bilinmiyor (fantazi paralar); 5 kategori düzeltmesi; 3 demo senaryosu (2 satıldı, 1 stokta yok).
- Kontroller:
  - `npm test` 24/24 ✔ · `npm run build` ✔
  - Kırık bağlantı/görsel taraması: 315 sayfa + 91 varlık, hata yok; “undefined/NaN” vb. yarım metin yok ✔
  - Konsol hatası yok (ana sayfa, ürün, arama, sepet, favoriler) ✔
  - Sitemap: 988 ürün + 230 kategori/seçki adresi ✔
  - Üretim sunucusu, hatalı Shopify ayarı: dinamik sayfalar 503 “Mağaza verisine şu anda ulaşılamıyor”, demo ürün gösterilmiyor, ödeme 503, sitemap 503, statik sayfalar 200 ✔; ayar eksik → `/api/health` 503 `config` ✔
  - İndeksleme kilidi: `SITE_INDEXING=on` + demo modu → yine noindex ✔
- Bulunan hata ve düzeltme: `access: 'public'` astro:env değişkenleri derlemeye gömülüyordu, üretimde `STORE_MODE` değiştirilemiyordu → bütün değişkenler çalışma anında okunacak şekilde (`access: 'secret'`) değiştirildi ve yeniden doğrulandı.

### Bekleyen işler / dış bağımlılıklar

- **Dış bağlantı bekliyor:** Shopify mağazası + Headless kanal token'ları + metafield/koleksiyon kurulumu (`docs/SHOPIFY-KURULUM.md`); gerçek Storefront API ile hiçbir test yapılmadı.
- **Dış bağlantı bekliyor:** PayTR üye işyeri + Shopify uygulaması + test modunda ödeme (`docs/PAYTR.md`). Gerçek ödeme testi yapılmadı → canlı satışa hazır değil.
- **Müşteriden beklenen:** `src/config/business.js` (telefon, e-posta, adres, WhatsApp, sosyal, çalışma saatleri, şirket bilgileri, kargo/iade/ödeme koşulları), Hakkımızda bilgileri, iletişim formu servisi, yasal metinler (hukuki danışman), gerçek alan adı, gerçek envanter.
- Planlandı (isteğe bağlı): demo görsel boyutu ≈170 MB; depoya alınacaksa kalite düşürülebilir veya Git LFS kullanılabilir.

**Sonraki somut adım:** Shopify geliştirme mağazası açılınca `.env` → `STORE_MODE=shopify`, birkaç örnek ürünle `docs/SHOPIFY-KURULUM.md §8` kontrol listesini çalıştırmak.

## 2026-11-07 — Adım 5: Teklif özelliği

**Durum:** Demo modunda uygulandı ve doğrulandı · Canlı gönderim ve Shopify eşlemesi: **Dış bağlantı bekliyor**

Karar değişikliği: “Bütün satışlar sabit fiyatlı, teklif yok” kararı kullanıcı isteğiyle değişti. Normal ürünler sabit fiyatla satılmaya devam eder; seçilen ürünler teklif usulüyle satılır. Açık artırma değildir, teklifler başkalarına gösterilmez, sipariş/ödeme oluşturmaz.

### Yapılan değişiklikler

| # | Değişiklik | Dosya | Durum |
|---|---|---|---|
| 1 | Ürün modeline `offersEnabled` ve `offersClosed` | `src/lib/types.js` | Doğrulandı |
| 2 | Tek karar noktası: `offerStatus()` (fiyat/stok/başlıktan türetmez) | `src/lib/offers/status.js` | Doğrulandı |
| 3 | Demo verisi: 6 açık, 1 kapalı, 1 satılmış teklif ürünü (açık kaynak kimlikleriyle) | `scripts/build-demo-data.mjs`, `src/data/demo/products.json` | Doğrulandı |
| 4 | Shopify eşlemesi `ilkim.offers_enabled`, `ilkim.offers_closed` | `shopify-mapper.js`, `shopify.js`, `docs/SHOPIFY-KURULUM.md` | Eşleyici test edildi; gerçek mağazada dış bağlantı bekliyor |
| 5 | `/teklif-ver` listesi; title, description, breadcrumb, JSON-LD | `src/pages/teklif-ver/index.astro` | Doğrulandı |
| 6 | Ürüne bağlı ayrı form sayfası `/teklif-ver/{ürün}` (noindex, no-store) | `src/pages/teklif-ver/[handle].astro`, `src/scripts/offer-form.js` | Doğrulandı |
| 7 | Ortak doğrulama (Türkçe yazımlı tutar dahil) | `src/lib/offers/validate.js` | Doğrulandı |
| 8 | Teklif uç noktası `POST /api/teklif` | `src/pages/api/teklif.js`, `src/lib/offers/service.js` | Doğrulandı (demo + birim) |
| 9 | Gönderim kanalları: webhook, e-posta (Resend), kalıcı JSONL kayıt | `src/lib/offers/delivery.js`, `config.js` | Birim testli; gerçek hizmet dış bağlantı bekliyor |
| 10 | Sınırlar ve yinelenen gönderim koruması | `src/lib/offers/rate-limit.js` | Doğrulandı |
| 11 | Ürün kartı ve detayda sepet yerine Teklif Ver; kapalı/satılmış durumları | `ProductCard.astro`, `urun/[handle].astro` | Doğrulandı |
| 12 | Teklif ürünü sepete/ödemeye giremez (doğrudan API dahil) | `src/lib/cart-server.js` | Doğrulandı |
| 13 | Teklif ürününde fiyat gösterilmez: kart, detay, meta, JSON-LD, API; fiyat filtresi ve sıralaması buna göre | `engine.js`, `seo.js`, `api/products.js`, sepet ve favori betikleri | Doğrulandı |
| 14 | Ana menü, mobil menü, footer, sitemap | `navigation.js`, `sitemap-sayfalar.xml.js` | Doğrulandı |
| 15 | Altı bağlantı sığsın diye hamburger menü eşiği 920 → 1080 px | `global.css`, `ui.js` | Doğrulandı |
| 16 | Çelişen metinler güncellendi: SSS, Hakkımızda, Gizlilik iskeleti (“sunucuda kişisel veri saklamaz” kaldırıldı) | `sss.astro`, `hakkimizda.astro`, `bilgi/[slug].astro` | Uygulandı |
| 17 | Ters vekil arkasında gerçek IP için `security.allowedDomains` | `astro.config.mjs` | Uygulandı; vekil arkasında test edilmedi |
| 18 | Ayarlar ve belgeler | `.env.example`, `README.md`, `docs/TEKLIF.md`, `docs/DEMO-ENVANTER.md`, `.gitignore` | Uygulandı |

### Kontroller ve sonuçlar

- `npm test`: **56/56** ✔ (32'si yeni teklif testi; gerçek HTTP ile webhook + alıcı tarafta imza doğrulaması dahil)
- `npm run build` ✔; `dist/client` içinde gizli değişken adı yok ✔
- Üretim derlemesinde uçtan uca betik: **50/50** ✔
  - Liste yalnızca 6 teklif ürünü gösteriyor; normal, kapalı ve satılmış ürün yok ✔
  - Normal ürünün form sayfası 404; kapalı/satılmış üründe form gösterilmiyor ✔
  - Doğrudan uç nokta: normal 403, kapalı 409, satılmış 409, bilinmeyen 404, geçersiz alan 422, tuzak 400, form içeriği 415, büyük gövde 413, bozuk JSON 400 ✔
  - IP sınırı 429 + `Retry-After` + Türkçe mesaj ✔
  - Sepet ve ödeme API'si teklif ürününü reddediyor (409), normal ürün çalışıyor ✔
  - Demo noindex korunuyor (meta + başlık) ✔; `/teklif-ver` sitemap'te, form sayfaları sitemap'te değil ✔
- Bağlantı taraması: 325 sayfa + 92 varlık, kırık bağlantı ve yarım metin yok ✔
- Tarayıcı (375 px mobil ve masaüstü):
  - Hata: alan hataları `aria-describedby` ile bağlı, odak özete geçiyor, özet bağlantısı alana götürüyor ✔
  - Klavye: sekme sırası doğru, tuzak alanı atlanıyor, Enter ile gönderim çalışıyor ✔
  - Yükleniyor: düğme kapalı, `aria-busy`, “Gönderiliyor…”; üç tetikleme tek istek ✔
  - Ağ hatası: “gönderilmedi” mesajı, bilgiler korunuyor, yeniden deneme başarılı ✔
  - 429: başarı mesajı yok, form korunuyor ✔
  - Başarı: “Demo teklif oluşturuldu, işletmeye gönderilmedi.”, odak sonuç kutusunda ✔
  - Yatay taşma yok (scrollWidth = 375) ✔; menü 1090 px'te tek satır, 1000 px'te hamburger ✔
  - Normal ürün sepete ekleme ve sepet sayfası çalışıyor ✔
- Shopify hatası (üretim derlemesi): liste ve form 503, teklif uç noktası 503 “gönderilmedi”; demo ürün gösterilmiyor ✔
- Sunucu günlüklerinde kişisel veri yok ✔

### Bulunan hatalar ve düzeltmeler

- Başarıdan sonra form ekranda kalıyordu (`.offer-form { display: grid }`, `hidden` niteliğini eziyordu) → `.offer-form[hidden]` eklendi.
- Hata özetinde “Ad soyad: Ad soyad zorunludur.” tekrarı → yalnızca hata metni; bütün hatalar düzelince özet kapanıyor.
- Altı menü bağlantısı 921–1080 px arasında sığmıyordu → hamburger eşiği yükseltildi.
- Gizlilik iskeletindeki “sunucuda kişisel veri saklamaz” ifadesi teklif kaydıyla çelişiyordu → değiştirildi.
- Uygulama sırasında betik iki kez çalıştığı için `types.js` ve `shopify-mapper.js` içindeki eklemeler çiftlendi → temizlendi, testle doğrulandı.

### Bekleyen işler / dış bağımlılıklar

- **Dış bağlantı bekliyor:** Canlı gönderim kanalı seçimi ve bilgileri (alıcı e-posta, gönderen alan adı + Resend hesabı veya webhook adresi, kalıcı disk). Gerçek e-posta gönderimi test edilmedi.
- **Dış bağlantı bekliyor:** Shopify'da metafield tanımları; gerçek Storefront API ile teklif akışı test edilmedi (`docs/SHOPIFY-KURULUM.md §3 ve §8`).
- **Doğrulanacak:** Teklif ürününün Shopify üzerinden doğrudan sepet bağlantısıyla satın alınamadığı; yalnızca Headless kanalında yayımlanmalı.
- **Müşteriden beklenen:** Gizlilik/KVKK metnine teklif verilerinin saklama süresi, hizmet sağlayıcılar ve aktarım bilgileri (form bu metne bağlanıyor).
- **Kapsam dışı (planlanmadı):** Teklif yönetim ekranı, müşteriye otomatik yanıt, kabul edilen tekliften sipariş. Süreç önerisi `docs/TEKLIF.md` sonunda.
- **Bilinen sınır:** Sınırlayıcılar bellektedir (yeniden başlatmada sıfırlanır, örnek başına); CAPTCHA yok.
- **Depo:** `smtardaa/ilkim-koleksiyon` anonim GitHub API isteğine 200 döndü, yani herkese açık görünüyor. Demo envanterdeki üçüncü taraf görselleri ve verileri nedeniyle özel yapılması önerilir; kullanıcı kararı bekliyor.

**Sonraki somut adım:** Gönderim kanalını seçmek (`docs/TEKLIF.md`) ve Shopify geliştirme mağazasında `offers_enabled` ile bir örnek ürünü uçtan uca denemek. Bu değişiklikler henüz commit edilmedi.

## 2026-11-07 — Adım 6: GitHub Pages statik önizleme sürümü (ayrı klasör)

**Durum:** Yerelde uygulandı ve doğrulandı · GitHub Actions ve gerçek Pages yayını: **Dış bağlantı bekliyor** (kullanıcı yapacak)

**Amaç:** Siteyi gerçek yayına almadan telefonda ve başka cihazlarda incelemek için ana projeden bağımsız, sunucusuz sürüm.

**Konum:** `C:\Users\foren\Desktop\İlkim Koleksiyon-GitHub` (kendi README'si var). Ana proje kodu değiştirilmedi; bu dosya tek istisnadır.

### Yapılanlar

- Çalışma ağacı kopyalandı (commit edilmemiş teklif özelliği dahil). Git başlatılmadı, commit/push yapılmadı.
- Kopyalanmayanlar: `node_modules`, `dist`, `.astro`, `.git`, `.env`, `.claude`, `ilerleme.md`, Eski Para Market markalı taslak görsel, özgün logo PNG'si, `demo-kaynak/`, `scripts/` (veri üreticileri), `docs/`.
- Astro `output: 'static'`; `@astrojs/node`, `sharp`, `/api/*`, middleware, Shopify sağlayıcısı, önbellek, gönderim kanalları ve sınırlayıcılar kaldırıldı. Kilit dosyası güncellendi.
- Alt yol: `BASE_PATH` ve `SITE_URL` ortam değişkenlerinden; bütün iç adresler `src/lib/paths.js` → `u()`. Depo adı koda yazılmadı.
- `getStaticPaths` ile 1.309 sayfa: 988 ürün, 288 kategori, 4 seçki, 8 teklif formu, 20 sabit sayfa, 404.
- Arama, filtre, sıralama, sayfalama tarayıcıya taşındı: aynı motor; kart ve katalog HTML'i tek şablonda birleştirildi (`src/lib/render/`). Veri: `data/catalog.json` (kaynak kaydı ve teklif fiyatı yazılmaz).
- Sepet kuralları saf modüle alındı (`cart-core.js`); teklif formu tarayıcıda doğrulanır, sonuç “Demo teklif oluşturuldu, işletmeye gönderilmedi.”
- Görünür tek değişiklik: üst şerit metni “Statik önizleme…”.
- `.github/workflows/deploy-pages.yml`: checkout v7, setup-node v7, configure-pages v6, upload-pages-artifact v5, deploy-pages v5 (sürümler GitHub API'den doğrulandı).
- `scripts/check-static.mjs` (çıktı denetimi), `scripts/serve-dist.mjs` (Pages benzeri yerel sunucu).

### Kontrol sonuçları

- `npm ci` ✔, `npm test` 58/58 ✔ (sunucu testleri tarayıcı akışına uyarlandı; boş sonuçla geçebilen denetimler güçlendirildi).
- Tip denetimi yok: projede `@astrojs/check` kurulu değil (ana projede de).
- Çıktı denetimi hem `/ilkim-koleksiyon` alt yoluyla hem alt yolsuz geçti: 1.309 sayfa, 115.794 bağlantı (6.106 benzersiz), 3.569 JSON-LD, 1.228 sitemap adresi, ~198 MB.
- Denetim betiğinin hata yakaladığı kanıtlandı: eklenen kırık bağlantı, eksik görsel, alt yolsuz adres, kaldırılmış noindex, bozuk robots.txt ve `/api/` çağrısının hepsi çıkış kodu 1 verdi.
- Ana sürümle karşılaştırma: 50 sorguda (10.860 sonuç) toplam, ürün sırası ve filtre sayıları birebir aynı, fark 0. Karşılaştırma için ana projenin mevcut derlemesi salt okunur çalıştırıldı.
- Tarayıcı (`/ilkim-koleksiyon/`, 5510 portu): filtre, sıralama, sayfalama, filtre etiketi, geri/ileri, paylaşılan bağlantı, başlıktaki arama, sepet + stok sınırı + demo ödeme, favoriler, teklif formu (hata ve başarı), kapalı ürün, 404, mobil menü ve filtre paneli ✔. Konsolda yalnızca bilerek açılan 404. Yatay taşma yok (375 px ve 1280 px).
- Ana proje zaman damgası: 19.498 dosyada kopyalamadan sonra değişiklik yok (yalnızca bu kayıt eklendi).

### Yapılamayan / doğrulanamayan

- GitHub Actions gerçek depoda **çalıştırılmadı**; Pages adresi ve gerçek telefonda test yapılmadı.
- Yerel sunucu GitHub Pages'e benzer, aynısı değildir.
- Hreflang ve dil değişimi yoktur: site tek dillidir.

### Ana projeyi de ilgilendiren bulgular (Bekliyor — ana projede düzeltilmedi)

- **Bekliyor:** `smtardaa/ilkim-koleksiyon` deposu herkese açık görünüyor; `demo-kaynak/`, üçüncü taraf ürün görselleri, başka markalı taslak ve bu kayıt orada. Özel yapılması önerilir.
- **Bekliyor:** Teklif özelliği ana projede hâlâ commit edilmemiş durumda (kullanıcı bekletti).
- **Bekliyor:** `tests/search.test.mjs` ve `tests/data.test.mjs` içinde boş sonuçla geçebilen denetimler var; kopyada güçlendirildi, ana projeye taşınmalı.
- **Bekliyor:** Kart şablonu ana projede `ProductCard.astro` ve `favorites-page.js` içinde iki kez yazılı; kopyadaki tek şablon yaklaşımı alınabilir.

### Bekleyen işler

- Kullanıcı: yeni GitHub deposu, push, Settings → Pages → Source: GitHub Actions, iş akışı sonucunu kontrol.
- Kullanıcı kararı: Örnek envanter (eskiparamarket.com görselleri) GitHub Pages'te herkese açık olacak; yayınlamadan önce kullanım hakkı değerlendirilmeli.

**Sonraki somut adım:** Yeni depoya gönderip ilk iş akışını çalıştırmak ve telefonda açmak.

## 2026-11-11 — Adım 7: Ana sayfada kategori slider'ları

**Durum:** Demo modunda uygulandı ve doğrulandı · Shopify sorgusu: **Dış bağlantı bekliyor** (gerçek mağazayla denenmedi)

Müşteri isteği: Kategorilerin ürünleri ana sayfada ayrı yatay slider bölümleri halinde görünsün. Kategori sayfaları ve header menüsü değişmedi.

### Yapılan değişiklikler

| # | Değişiklik | Dosya | Durum |
|---|---|---|---|
| 1 | Merkezi yapılandırma: bölüm sırası, görünürlük, ürün sınırı | `src/config/home.js` | Doğrulandı |
| 2 | Seçim mantığı: en fazla 10 ürün, açık ürünler önce, tekrar yok, boş bölüm yok | `src/lib/home-sections.js` | Doğrulandı |
| 3 | Sağlayıcı yöntemi `getHomeSections()` (demo: yerel veri) | `src/lib/providers/demo.js` | Doğrulandı |
| 4 | Shopify: bütün bölümler tek istekte, `COLLECTION_DEFAULT` sırasıyla, 60 sn önbellek | `shopify.js`, `shopify-home.js` | Birim testli; gerçek mağaza bekliyor |
| 5 | Slider bileşeni ve betiği (ek bağımlılık yok, tarayıcının kendi kaydırması + scroll-snap) | `ProductSlider.astro`, `src/scripts/slider.js` | Doğrulandı |
| 6 | Stil: masaüstü 4, tablet 3, küçük tablet 2,2, mobil 1,35 kart; alt bölümler daha küçük | `src/styles/global.css` | Doğrulandı |
| 7 | Ana sayfa akışı: hero → Koleksiyonunu seç → 7 slider → Diğer koleksiyon ürünleri → rehber bandı | `src/pages/index.astro` | Doğrulandı |
| 8 | Belgeler | `README.md`, `docs/SHOPIFY-KURULUM.md` | Uygulandı |

Bölümler (demo verisi): T.C. Kâğıt 10, T.C. Madeni 10, T.C. Hatıra 5, Osmanlı 6, Yabancı 10, Sertifikalı 9, Teklif Ver 6; altta Pul ve Koleksiyon Malzemeleri 3, Antika ve Diğer 3. Madalya ve Objeler'de ürün olmadığı için bölüm gösterilmiyor.

### Verilen kararlar

- **“Yeni eklenenler” sekmeli bölümü kaldırıldı:** Yeni slider'larla aynı ürünleri tekrar ediyordu. `/yeni-gelenler` sayfası ve menü bağlantısı duruyor.
- **Eski “Antika ve diğer” kutusu kaldırıldı;** yerine altta düşük öncelikli slider'lar geldi. Boş Antika ve Madalya kategorilerine “Koleksiyonunu seç” altındaki kategori etiketlerinden ulaşılıyor.
- **Bölümler arası tekrar önleme:** Demo verisinde T.C. Madeni ve Hatıra aynı 16 ürünü paylaşıyor. Bir bölümde daha önce gösterilmemiş en az 5 ürün varsa yalnızca onlar gösterilir (`preferUniqueMin`).
- **Teklif ürünleri** önce “Teklif Ver” bölümüne ayrılır, kategori slider'larında yeniden öne çıkmaz.
- **Demo sırası:** Demo verisinde koleksiyon içi elle sıralama yok; varsayılan “açık ürünler önce, sonra en yeni”.
- **Sertifikalı Paralar** kategori değil seçki olduğundan `/koleksiyonlar/sertifikali-paralar` sayfasına bağlanır.
- Hero ve kategori kartlarının görselleri ile teklif bölümü, sitenin ortak katalog önbelleğinden seçilmeye devam ediyor (ek istek yok).

### Kontroller ve sonuçlar

- `npm test`: 75/75 ✔ (19'u yeni: yapılandırma, seçim kuralları, demo bölümleri, Shopify sorgu kurucu ve yanıt eşleme).
- `npm run build` ✔.
- Tarayıcı, 1280 px: 4 kart görünüyor; kart yükseklikleri her slider içinde eşit; başlangıçta “önceki” ok pasif, sonda “sonraki” pasif; ürünleri sığan alt bölümlerde oklar gizli ✔.
- Sürükleme: fareyle 200 px sürükleme kaydırıyor ve tıklama tetiklemiyor; 3 px hareket normal tıklama sayılıyor ✔.
- Klavye: şerit odaklanabilir, erişilebilir adlar var, son karta Tab ile gelince kart görünür alana kayıyor ✔.
- 375 px: 1,3 kart (bir tam kart + sonraki kartın bir kısmı); 768 px: 3 kart; sayfada yatay taşma yok (scrollWidth = pencere genişliği) ✔.
- Bağlantılar: ürün → `/urun/…`, “Tümünü Gör” → doğru kategori/seçki/teklif sayfası; teklif bölümünde yalnızca “Teklif Ver” düğmesi, fiyat yok; normal üründe sepete ekleme çalışıyor ✔.
- Slider görsellerinin tamamı `loading="lazy"`; kırık görsel ve konsol hatası yok ✔.

### Bulunan hata ve düzeltme

- Başlangıçta “önceki” ok pasif değildi: scroll-snap ilk kartı 2 px kaydırıyordu → `scroll-padding-inline` ve 4 px kenar payı eklendi.

### Doğrulanamayanlar / bekleyenler

- **Dış bağlantı bekliyor:** Shopify'da tek sorgunun gerçek yanıtı, koleksiyon sırası ve sorgu maliyeti gerçek mağazada denenmedi.
- Gerçek telefonda parmakla kaydırma denenmedi; mobil genişlik tarayıcı öykünmesiyle kontrol edildi (kaydırma tarayıcının kendi yatay kaydırmasıdır).
- **Bekliyor:** GitHub Pages önizleme kopyası (`İlkim Koleksiyon-GitHub`) bu değişikliği içermiyor; istenirse oraya ayrıca taşınmalı.
- Bu değişiklikler ve teklif özelliği hâlâ commit edilmedi.

**Sonraki somut adım:** Müşteri onayından sonra bölüm sırasını/sınırını `src/config/home.js` üzerinden ayarlamak; istenirse önizleme kopyasına taşımak.

## 2026-11-11 — Adım 8: Slider'ların GitHub Pages önizleme kopyasına taşınması

**Durum:** Kopyada uygulandı ve yerelde doğrulandı · GitHub'a gönderilmedi (commit ve push kullanıcıda)

- Konum: `C:\Users\foren\Desktop\İlkim Koleksiyon-GitHub`. Ana projede bu kayıt dışında değişiklik yapılmadı.
- Taşınanlar: `src/config/home.js`, `src/lib/home-sections.js`, `ProductSlider.astro`, `src/scripts/slider.js`, slider stilleri, ana sayfa akışı, `tests/home.test.mjs`. Shopify sorgusu kopyada yok; bölümler demo envanterden derlemede üretiliyor.
- Kontroller: `npm test` 82/82 ✔; `SITE_URL=https://smtardaa.github.io`, `BASE_PATH=/-lkimKoleksiyon` ile derleme (1.309 sayfa) ve `check:static` ✔ (115.912 bağlantı, çıkış 0); bütün slider bağlantıları alt yollu.
- Tarayıcı (5510, alt yolla): 9 slider, başlangıçta “önceki” ok pasif, ok ile kaydırma, sepete ekleme, teklif bağlantısı ✔; 375 px'te 1,3 kart ve yatay taşma yok ✔; konsol hatası ve kırık görsel yok ✔.
- Not: Gizli tarayıcı panelinde yumuşak kaydırma kare üretilmediği için ilk ölçümde ilerlemedi; ekran görüntüsüyle kare üretilince doğru çalıştığı görüldü (kod sorunu değil).
- Bekleyen: Kullanıcı kopyadaki değişiklikleri commit edip gönderecek; GitHub Actions sonucu henüz görülmedi.

## 2026-11-25 — Adım 9: Satış sitesinden katalog sitesine geçiş

**Durum:** Ana projede uygulandı ve yerelde doğrulandı · commit yapılmadı (kullanıcı isteği) · GitHub kopyasına dokunulmadı

> **Karar notu:** Bu adımdaki katalog kararları, önceki adımlardaki satış kararlarının (Shopify, sepet, PayTR ödeme,
> teklif sistemi, favoriler, demo envanter) **yerine geçer**. Eski kayıtlar tarihçe olarak bırakıldı.

### Kaldırılanlar
- Sepet, ödeme, PayTR ve Shopify kodu (sağlayıcılar, sepet/ödeme API'leri, webhook, önbellek); teklif sistemi; favoriler;
  ilgili menü, simge, sayaç ve bildirimler; mesafeli satış / ön bilgilendirme / ödeme seçenekleri sayfaları.
- Demo şeridi ve görünür demo metinleri; eskiparamarket kaynaklı bütün örnek ürünler, görseller (`public/demo/`, ≈167 MB),
  `src/data/demo/`, `demo-kaynak/`, demo üretim betikleri ve ilgili belgeler.

### Yeni yapı
- Tek veri merkezi `src/data/catalog/`: `categories.json` (11 istenen kategori + boş “Osmanlı Paraları”, sırayla),
  `countries.json` (215 ülke, ürünlerden bağımsız), `collections.json` (boş “Sertifikalı Paralar”), `products.json` (boş).
- Sağlayıcı arayüzü (`src/lib/catalog.js` + `providers/local.js`), `DATA_SOURCE=local`; ileride `mysql.js` aynı yöntemlerle eklenecek.
- Hero: yalnızca arama alanı + “Koleksiyona göz at”. Kategori kartları: masaüstünde 4'lü kare ızgara, mobilde 3'lü sonsuz
  kaydırıcı (`src/scripts/cat-carousel.js`); altta sayısız kategori kısayolları (mobilde tek satır).
- “Ülke seç” penceresi (`CountryPicker.astro`): masaüstünde ortada, mobilde alttan açılan sayfa; arama, Escape, odak dönüşü.
- Ana sayfada her kategori için bölüm (en fazla 10 ürün, “Tümünü Gör”, boşsa “Bu kategoriye henüz ürün eklenmedi.”).
- “Satın almak için iletişime geç”: ürün adı, kodu ve bağlantısıyla WhatsApp mesajı (`whatsappProductUrl`); numara boşken
  bağlantı üretilmez; ürün bağlantısı `publicOrigin` ile canlıda localhost olmaz.
- Eski kategori adresleri yalnızca gerçek karşılığına 301 (`src/middleware.js`); eski yabancı ülke sayfaları 404.
- Kategori görselleri açık lisanslı kaynaklardan bağlantıyla; atıflar `/kaynaklar` sayfasında.
- Belgeler: README yeniden yazıldı; `docs/YONETIM-PANELI.md` (panel gereksinimleri, sağlayıcı arayüzü, Hostinger/MySQL notları);
  `.env.example` sadeleştirildi.

### Kontroller
- `npm test` 29/29 ✔ (katalog verisi, arama motoru — yalnızca `tests/fixtures` test verisiyle, ana sayfa bölümleri, WhatsApp mesajı).
- `npm run build` ✔.
- Tarayıcı 1280 px: 12 kare kart 4+4+4, hero 159 px, kırık görsel yok, taşma yok ✔.
- Tarayıcı 375 px: 3 kart görünür; **50 ileri + 50 geri ok adımı hatasız** (her adımda beklenen üçlü), sonunda gerçek listede;
  hızlı art arda basışlar kaybolmuyor; kopyalar `inert` + `aria-hidden`, tekrarlanan id yok; kısayollar tek satır ✔.
- Ülke penceresi: arama süzüyor, bağlantılar geçerli kategorinin ülke sayfasına gidiyor, Escape ilk basışta kapatıyor, odak düğmeye dönüyor ✔.
- 14 sayfada mobil taşma ve demo/sepet/teklif/favori metni taraması ✔ (KVKK metnindeki “sepet yoktur” cümlesi bilinçli).
- Yönlendirmeler: eski adresler 301 / 404 beklendiği gibi; `/sepet`, `/teklif-ver`, `/favoriler` 404 ✔. Konsol hatası yok.

### Bulunan hatalar ve düzeltmeler
- Mobil kaydırıcıda kart genişliği kesirli (117,67 px) iken adım yuvarlanmış `offsetLeft` ile hesaplanıyordu; kayma birikip
  yanlış gruba oturuyordu → konumlar kart sırası üzerinden hesaplanıyor.
- Animasyon sürerken basılan ok kayboluyordu → bekleyen hedef hatırlanıyor.
- Ülke penceresinde arama kutusu doluyken ilk Escape yalnızca kutuyu temizliyordu → ilk basışta kapanıyor, arama sıfırlanıyor.
- Ana sayfada `h1` kalmamıştı → görünmez `h1` eklendi.
- Testler JSON içe aktarımında hata verdi → `with { type: 'json' }` eklendi.

### Bekleyenler
- **İşletme bilgisi:** WhatsApp numarası, telefon, e-posta, adres, ticari unvan/vergi bilgileri, kargo/iade metinleri, ödeme yöntemleri
  (`src/config/business.js`). WhatsApp boş olduğu sürece “Satın almak için iletişime geç” pasif görünür.
- Kategori görselleri dış sitelerden bağlantıyla geliyor; panelle birlikte yerel kopyaya geçilmesi önerilir.
- Depo herkese açıksa eski örnek görseller git geçmişinde durur.
- İndeksleme ayarı değiştirilmedi (`SITE_INDEXING=off`).
- Gerçek telefonda parmakla kaydırma denenmedi (tarayıcı öykünmesiyle kontrol edildi).

**Sonraki somut adım:** İşletme bilgilerini doldurmak; ardından `docs/YONETIM-PANELI.md` doğrultusunda panel ve MySQL sağlayıcısı.
