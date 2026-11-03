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
