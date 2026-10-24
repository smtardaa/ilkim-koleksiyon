# İlkim Koleksiyon — Proje Özeti ve Devir Notları

> Bu belge projeyi ilk kez açacak bir geliştiricinin ya da yapay zekânın neyin, neden ve nasıl yapıldığını baştan sona anlayabilmesi için yazıldı.
> Son güncelleme: 25 Ekim 2026 · Durum: **Çalışan görsel demo.** Shopify bağlantısı yok, gerçek satış yok.

---

## 0. Sürüm geçmişi

| Tur | Ne yapıldı |
| --- | --- |
| 1 (24 Ekim 2026) | Astro iskeleti, veri katmanı, tüm sayfalar, açık (krem) tema, temsilî SVG ürün çizimleri, sepet/filtre/galeri/teklif etkileşimleri |
| 3 (25 Ekim 2026) | **GitHub Pages yayını:** `site`/`base` ayarlandı (`/ilkim-koleksiyon`), tüm iç yollar `src/lib/paths.js` → `url()` üzerinden, `.github/workflows/deploy.yml` (withastro/action@v6 + deploy-pages@v5), `public/.nojekyll`. Yerel dev sunucusu kök adresi alt yola yönlendirir. Demo sepeti anahtarı `v2` oldu. |
| 2 (24–25 Ekim 2026) | Temsilî ürünler kaldırıldı; **gerçek koleksiyon kayıtlarına dayalı 20 ürün ve 1 paket** eklendi. Gerçek, lisanslı fotoğraflar kullanıldı. **#EACEAA tamamen kaldırıldı**, tasarım **koyu kahve temaya** geçti. `npm run dev` artık **http://localhost:5500** adresinde açılıyor ve port kontrolü yapıyor. `/kaynaklar/` sayfası eklendi. |

---

## 1. Proje nedir?

İlkim Koleksiyon, eski ve koleksiyon değeri taşıyan paralar ile koleksiyon ürünleri satan bir işletme. Bu klasör, işletme için tasarlanan e-ticaret sitesinin **ilk aşama demosudur**.

1. **Şimdi:** Görsel olarak değerlendirilebilen, etkileşimleri çalışan bir demo.
2. **Sonra (yapılmadı):** Aynı arayüz gerçek bir Shopify mağazasına bağlanacak. Ürün, stok, fiyat ve sipariş yönetimi Shopify panelinden yapılacak. Ödeme Shopify Checkout ile alınacak; PayTR, Shopify'ın hazır entegrasyonuyla bağlanacak.

### Proje sahibinin koyduğu ana kurallar

- Teknoloji: **Astro + semantik HTML + düz CSS (CSS değişkenleri) + JavaScript/ES modülleri**, ağırlıklı olarak SSG.
- React, Next.js, Vue, Express, CSS framework'ü veya başka büyük bağımlılık **eklenmeyecek**. Somut bir ihtiyaç doğarsa önce gerekçe açıklanacak.
- Ürün içeriği ilk HTML çıktısında bulunacak; istemci JS yalnızca etkileşim için kullanılacak.
- Gerçek ödeme, sipariş ya da sahte başarı mesajı olmayacak. İşletme bilgileri uydurulmayacak.
- Demo ürünleri gerçek parçalara dayanabilir, ancak **İlkim Koleksiyon'un stoğu gibi sunulmayacak**. Kaynakta olmayan bilgi (kondisyon, katalog no., sertifika, fiyat) uydurulmayacak.
- Görseller kullanım izni uygun, gerçek fotoğraflar olacak. Kırpılmayacak, renkleri değiştirilmeyecek, filigranları kaldırılmayacak. Yapay zekâ görseli ve çizim kullanılmayacak.
- Renk paleti: **#34150F baskın**, #160D09 derin zemin, #85431E yardımcı yüzey/sınır, #D39858 ana eylem. **#EACEAA kullanılmayacak**, yerine krem/bej bir ton da eklenmeyecek.
- Arayüz dili Türkçe.

---

## 2. Çalıştırma (localhost:5500)

Proje klasöründe (`C:\Users\foren\Desktop\İlkim koleksiyon`):

```bash
npm install
npm run dev
```

Tarayıcıda: **http://localhost:5500**

- `npm run dev` → `node scripts/check-port.mjs && astro dev --port 5500`
- `npm run preview` → aynı kontrol + `astro preview --port 5500` (önce `npm run build`)
- `astro.config.mjs` içinde `server.port = 5500`, `host = 'localhost'` ve Vite `strictPort: true` ayarlı.

**Port kontrolü neden var?** Testte gördük: VS Code Live Server 5500'ü tüm adreslerde (0.0.0.0) tutarken Astro yalnızca bir uyarı verip `localhost:5500`'e yine de bağlanabiliyor. Bu durumda tarayıcı aynı adreste bazen Live Server'ı, bazen demoyu açabilir. `scripts/check-port.mjs` 0.0.0.0, 127.0.0.1 ve ::1 adreslerini kontrol eder; port doluysa başka porta kaymadan, çözümü yazarak çıkar. Hiçbir işlemi kapatmaz.

Port doluysa:
- VS Code Live Server → durum çubuğundaki "Port : 5500" düğmesine tıklayarak kapatın.
- Eski Astro sunucusu → o terminalde `Ctrl+C` veya `npx astro dev stop`.
- Kim kullanıyor? → `netstat -ano | findstr :5500`

Bağımlılıklar: `astro@7.4.2`, `@astrojs/sitemap@3.7.4`, `@fontsource/federo` (geçici marka fontu).

### Ortam değişkenleri (`.env.example`)

| Değişken | Demo | Açıklama |
| --- | --- | --- |
| `SITE_URL` | boş | Gerçek alan adı. Doldurulunca canonical, og:url, mutlak JSON-LD, sitemap ve robots.txt Sitemap satırı üretilir. |
| `PUBLIC_ALLOW_INDEXING` | `false` | `true` olmadıkça tüm sayfalar `noindex, nofollow`. |
| `DATA_SOURCE` | `mock` | `shopify` henüz uygulanmadı; seçilirse build bilerek hata verir. |

---

## 2b. GitHub Pages yayını (3. tur)

- Yayın adresi: **https://smtardaa.github.io/ilkim-koleksiyon/** · Repo: `smtardaa/ilkim-koleksiyon`, dal `main`.
- **Önceki hata:** "Build with Jekyll" adımı başarısız oluyordu, çünkü Pages kaynağı "Deploy from a branch" idi ve GitHub repoyu Jekyll ile derlemeye çalışıyordu. Jekyll, `.astro` dosyalarındaki `---` bölümlerini YAML front matter sanıyordu. Çözüm: Pages kaynağı **GitHub Actions** yapılır ve `.github/workflows/deploy.yml` Astro'nun kendi build'ini kullanır. Astro bileşenleri değiştirilmedi.
- Workflow: `main`'e push veya elle tetikleme → `actions/checkout@v7` → `withastro/action@v6` (Node 24, npm, `package-lock.json` korunur, `npm run build`, `dist/` artifact) → `actions/deploy-pages@v5`. İzinler: `contents: read`, `pages: write`, `id-token: write`.
- `astro.config.mjs`: `site = SITE_URL || 'https://smtardaa.github.io'`, `base = BASE_PATH || '/ilkim-koleksiyon'`. Sitemap artık her zaman üretilir (`/sepet/` hariç).
- **Yollar:** Köke göre yazılmış tüm iç bağlantılar, form adresleri, görseller, favicon ve sitemap bağlantısı `url()` yardımcısından geçer (`src/lib/paths.js`, idempotent). CSS, JS ve font dosyalarını Astro `base`'e göre kendisi üretir.
- **Sunucu tarafı:** Projede Express, `server.js`, API rotası veya SSR yok. `robots.txt.js` build sırasında statik dosyaya dönüşür. Render veya başka bir backend gerekmez. İleride Shopify webhook'u için sunucusuz fonksiyon gerekecek (§9); bu GitHub Pages'te çalışamaz.
- **robots.txt notu:** Proje sitelerinde arama motorları yalnızca alan adının kökündeki robots.txt'yi okur; `/ilkim-koleksiyon/robots.txt` dikkate alınmaz. İndeksleme kapatma `noindex` meta etiketiyle yapılır (her sayfada var).
- Yerel: `npm run dev` → http://localhost:5500 → `/ilkim-koleksiyon/` adresine 302 yönlendirme. `npm run preview` → http://localhost:5500/ilkim-koleksiyon/ (Astro'nun statik önizleme sunucusu Vite eklentilerini çalıştırmadığı için kök yönlendirmesi yok).

## 3. Mimari

```
public/urun-gorselleri/    gerçek ürün fotoğrafları (JPEG)
scripts/check-port.mjs     5500 port kontrolü
src/
├─ config/                 MAĞAZAYA ÖZEL ayarlar
│  ├─ store.js             iletişim, sosyal medya, politikalar (null = henüz yok), demo bayrağı
│  ├─ categories.js        6 ana kategori
│  ├─ conditions.js        kondisyon ölçeği (Çil, ÇA, ÇÇT, ÇT, T, O)
│  ├─ faq.js, guides.js, navigation.js
├─ lib/
│  ├─ model.js             ORTAK ÜRÜN MODELİ (JSDoc)
│  ├─ catalog.js           ERİŞİM KATMANI (sayfalar veriye yalnızca buradan ulaşır)
│  ├─ data/index.js        DATA_SOURCE'a göre kaynak seçimi
│  ├─ data/mock/products.js  gerçek kayıtlara dayalı demo ürünleri + kaynak/lisans bilgisi
│  ├─ data/mock/source.js    listProducts, getProductByHandle, getCategoryImage
│  ├─ data/shopify/source.js TASLAK (alan eşlemesi yorumda)
│  ├─ format.js, text.js, images.js, structured-data.js
├─ components/             Header, Footer, Brand, Icon, ProductCard, CategoryCard, Breadcrumbs,
│                          ContactInfo, ProductListing, ProductGallery, ProductDetail, OfferDialog
├─ layouts/BaseLayout.astro
├─ pages/                  index, magaza/, magaza/[kategori], urun/[slug], koleksiyonlar/, koleksiyonlar/[slug],
│                          sepet, sss, hakkimizda, iletisim, kaynaklar, 404, robots.txt.js
├─ scripts/                cart/, listing.js, gallery.js, product-page.js, cart-page.js
└─ styles/                 tokens.css, global.css
```

- Bileşenler `mock/products.js` dosyasını doğrudan içe aktarmaz; her şey `catalog.js` üzerinden gelir.
- Kategori kartı görseli artık veri kaynağından gelir (`getCategoryImage`): demoda kategorideki bir ürünün gerçek fotoğrafı, Shopify'da koleksiyon görseli olacak.
- SSG: ürün adı, açıklaması, fiyatı ve kartlar build sırasında HTML'e yazılır. Tarayıcı JS'i yalnızca filtreler, sıralar ve sepeti yönetir. DOM'un değişmesi sunucudaki HTML'i güncellemez; ürün değişiklikleri yeniden build ile yansır.

### Ürün modeli (özet)

`id, handle, kind, title, summary, description[], images[{url, width, height, label, alt, credit{author, license{name,url}, sourceUrl, sourceLabel, note}}], price{amount, currencyCode, isExample}, availableForSale, quantityAvailable, category, collections[], country, period, series, year, yearLabel, denomination, material, dimensions, weight, catalogNumbers[], condition, conditionNote, defects[], certificate, offerEnabled, createdAt, setItems[], pieceCount, isSample, source{label, url, checkedAt}, imageNote`

Shopify'da numismatik alanlar `koleksiyon` namespace'li metafield'lardan, görsel kredileri gerekirse görsel `altText`/metafield'dan gelecek.

---

## 4. Demo ürünleri ve kaynakları

**Tüm ürünler gerçek parçalardır, ancak İlkim Koleksiyon'un stoğunda değildir.** Bilgiler kaynak kayıttan alındı ve 24 Ekim 2026'da kontrol edildi. **Kaynaklarda fiyat yoktur**; sitedeki fiyatlar örnektir ve "örnek fiyat" etiketiyle gösterilir. Kondisyon yalnızca sertifikalı parçalarda (kapsül etiketinden) verildi; diğerlerinde "Belirtilmemiş" yazar.

| Kategori | Ürün | Bilgi ve görsel kaynağı | Lisans |
| --- | --- | --- | --- |
| T.C. Kâğıt | 1. Emisyon 1 / 5 / 10 Türk Lirası (I. Tertip) | [TCMB – 1. Emisyon Grubu](https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Banknotlar/Cumhuriyet+Donemi+Banknotlari/Emisyon+Gruplari/1.+Emisyon+Grubu/Emisyon2) (tarih, ölçü, görsel) | TCMB çoğaltma koşulları |
| T.C. Madeni | 100 Para (1926) | [Dalarnas museum, DM 25183](https://digitaltmuseum.se/021028689367) | CC BY 4.0 |
| T.C. Madeni | 10 Lira (1986) | [Commons – AKS.9955](https://commons.wikimedia.org/wiki/File:10_Lira_(Turkey).jpg) | CC BY-SA 4.0 |
| T.C. Madeni | 1 Lira (1972) | [TECHNOSEUM, EVZ:2013/0077-501](https://www.europeana.eu/item/249/item_IXZHIPR55GHRWYCZOJTHITHQGH6UV4PU) | CC0 |
| Osmanlı | III. Mustafa 2 Zolota (1768), KM #324 | [MNIR 28430](https://www.europeana.eu/item/953/Culturalia_b1667dcf_c9d3_4353_8d31_fa0fb20cc740) | CC BY-SA 4.0 |
| Osmanlı | Abdülmecid 5 Kuruş (1848), KM #673 | [MNIR 88341](https://www.europeana.eu/item/953/Culturalia_56faa6eb_1fd2_4e36_a09f_fcc4a16776b6) | CC BY-SA 4.0 |
| Osmanlı | Gümüş Kuruş, H. 1187 Kostantiniyye | [Brukenthal T 5533](https://clasate.cimec.ro/detaliu.asp?k=81b182fd1724417a9618be13b9350626) | CC BY-SA 4.0 |
| Osmanlı | Abdülmecid 2 Kuruş (H. 1255/9) | [KENOM 322582](https://www.kenom.de/id/record_DE-MUS-805310_kenom_322582) | CC0 |
| Osmanlı (paket) | Osmanlı Gümüş Süs Parası Üçlüsü | [Wereldmuseum TM-3317-91](https://www.europeana.eu/item/2048221/europeana_fashion_103089) | CC0 |
| Yabancı | Saksonya Taleri (1763) | [KENOM 215660](https://www.kenom.de/id/record_DE-MUS-805310_kenom_215660) | CC0 |
| Yabancı | Saksonya Taleri, I. Johann Georg (1655) | [KENOM 215477](https://www.kenom.de/id/record_DE-MUS-805310_kenom_215477) | CC0 |
| Yabancı | Fransa ½ Frank (1808) | [KENOM 322542](https://www.kenom.de/id/record_DE-MUS-805310_kenom_322542) | CC0 |
| Sertifikalı | Morgan Doları 1904-O, PCGS MS63 | [Commons – Bruxton](https://commons.wikimedia.org/wiki/File:PCGS_certified_1904-O_MS_63.jpg) | Kamu malı |
| Sertifikalı | Peace Doları 1922, NGC MS 63 | [Commons – Bruxton](https://commons.wikimedia.org/wiki/File:1922_Peace_dollar_from_the_Great_Montana_Collection_graded_and_slabbed_by_NGC.jpg) | CC0 |
| Sertifikalı | Morgan Doları 1884-O, NGC MS 64 | [Commons – Bruxton](https://commons.wikimedia.org/wiki/File:NGC_slabbed_Morgan_dollar_from_the_Fitzgerald_collection.jpg) | Kamu malı |
| Diğer | Ayasofya Restorasyonu Madalyası (1849) | [MNIR 317879](https://www.europeana.eu/item/951/Culturalia_a2dff2b5_56e2_46cc_9dda_8384fd7206e9) | CC BY-SA 4.0 |
| Diğer | "Régénération de l'Empire d'Osman" Madalyası (1850) | [MNIR 323293](https://www.europeana.eu/item/951/Culturalia_7e57e6fe_4cff_4b23_a236_aa9a3e927225) | CC BY-SA 4.0 |
| Diğer | Osmanlı Askerî Madalyası, Abdülmecid tuğralı | [MNIR 325397](https://www.europeana.eu/item/951/Culturalia_2199cb5b_5d12_4fa3_a4b2_ca1e76b89f58) | CC BY-SA 4.0 |
| Diğer | Trakya I. Ordu Manevrası Hatırası (1937) | [Commons – Ertly](https://commons.wikimedia.org/wiki/File:1937_Thrace_Military_Manouvres_Momento_Side-1.jpg) | CC BY-SA 3.0 |

MNIR: Muzeul Național de Istorie a României. KENOM kayıtları: Landesamt für Denkmalpflege und Archäologie Sachsen-Anhalt – Landesmuseum für Vorgeschichte.

### Görsel kuralları ve kararlar

- **Ön/arka eşleşmesi:** Ayrı ön ve arka fotoğraflar yalnızca aynı müze nesnesine (aynı envanter numarası) ait olduğunda birlikte kullanıldı. Bazı fotoğraflar iki yüzü tek karede gösteriyor (10 Lira 1986, H. 1187 kuruş). Tek yüzü olan parçalar başka bir parçanın fotoğrafıyla tamamlanmadı; ürün sayfasında bu durum belirtiliyor (1 Lira 1972, T.C. banknotları, sertifikalı kapsüller, süs parası üçlüsü).
- **T.C. banknotları:** TCMB, tedavülden kalkmış olanlar dahil tüm banknotların elektronik görüntülerinin 72 dpi'yi aşmamasını ve üzerinde çapraz "ÖRNEKTİR GEÇMEZ" ibaresi bulunmasını şart koşuyor ([TCMB duyurusu](https://tcmb.gov.tr/wps/wcm/connect/EN/TCMB+EN/Main+Menu/Banknotes/General+Information+on+Banknotes/Banknote+Reproduction)). TCMB'nin kendi görselleri bu ibareyi zaten taşıyor ve yaklaşık 300 px genişlikte, yani sınırın altında (5 TL için 170 mm → en fazla 481 px). Görseller **değiştirilmeden** kullanıldı. TCMB'nin arka yüz görsellerinin aynı fiziksel parçaya ait olduğu doğrulanamadığından yalnızca ön yüz eklendi.
- **İşlem:** Görseller Windows'un yerleşik görüntü kütüphanesiyle (System.Drawing; ek paket kurulmadı) en fazla 1200–1600 px'e küçültüldü ve TIFF'ler JPEG'e çevrildi. Kırpma, renk düzeltmesi veya filigran kaldırma yapılmadı.
- **Elenenler:** Einbeck Şehir Müzesi'nin 1923 tarihli 1 ve 2 Milyon Mark banknotlarının fotoğrafları banknot kenarlarını kesiyordu; 2 Milyon Mark kaydındaki metin de görseldeki baskıyla uyuşmuyordu. NGC kapsülündeki 1911 Çin dolarının fotoğrafı paranın kenarını kesiyor ve etiketi göstermiyordu. Technoseum'un İtalya 10 Lire kaydında tarih "yaklaşık" verilmişti ve fotoğrafta görünmüyordu. TCMB'nin 2. Emisyon 50 Kuruş ve 1 Lira görsellerinin tedavül geçmişi kaynaklarda çelişkiliydi. Bunların hiçbiri kullanılmadı.
- **Atıf:** Her ürün sayfasında "Kaynak ve görsel lisansı" bölümü, tüm liste `/kaynaklar/` sayfasında. CC BY-SA görsellerin küçültülmüş kopyaları da aynı lisansla paylaşılır.

---

## 5. Görsel tasarım sistemi (koyu kahve tema)

| Renk | Rol |
| --- | --- |
| `#34150F` | Baskın sayfa zemini ve geniş bölümler |
| `#160D09` | Header, footer, kartlar, formlar ve derin bölüm bantları (ton ayrımı) |
| `#85431E` | Kenarlıklar, seçili filtre çipleri, rozetler, demo şeridi, ikincil buton hover zemini |
| `#D39858` | Ana butonlar (koyu metinle), bağlantılar, odak halkası, stokta işareti, aktif menü çizgisi |
| Nötr beyaz/gri | Metin (#ECECEC), başlık (#FFFFFF), ikincil metin (#B5B5B5), form kenarlığı (#8A8A8A), ürün fotoğrafı arka alanı (#ECECEC) |

- **#EACEAA tamamen kaldırıldı.** Eski açık tema değişkenleri (`--c-sand`, `--c-surface*`, `--c-line*` vb.) silindi ve anlamsal değişkenlere geçildi (`--bg`, `--bg-deep`, `--surface`, `--text`, `--muted`, `--accent`, `--line`…). Build çıktısında, kaynak kodda ve public klasöründe arama yapıldı; renk hiçbir yerde geçmiyor.
- **Fotoğraf alanı:** Ürün fotoğrafları nötr açık gri (#ECECEC) bir çerçevede, `object-fit: contain` ile gösterilir. Fotoğrafa filtre uygulanmaz; paraların gerçek renkleri korunur.
- **Kontrast (hesaplandı):** gövde metni/zemin 14.1:1, ikincil metin/zemin 8.1:1, #D39858 bağlantı/zemin 6.7:1, ana buton metni/#D39858 7.7:1, beyaz/#85431E 7.45:1, form kenarlığı/alan 5.6:1. #85431E metin rengi olarak (2.2:1) ve #D39858 metni #85431E üzerinde (2.98:1) **kullanılmıyor**.
- **Tipografi:** Marka yazısı "ilkim koleksiyon", geçici olarak **Federo** fontuyla. Referans **Decondol**'ün ücretsiz sürümü yalnızca kişisel kullanım için; ticari lisans alınınca `--font-brand` değişkeni değiştirilecek. Proje sahibinin bahsettiği referans görsel bize hiç ulaşmadı. Arayüzde SF Pro, sistem fontu yığınıyla kullanılıyor (Apple cihazlarda SF Pro, diğerlerinde sistem fontu).
- **Hareket:** Kısa geçişler; `prefers-reduced-motion` desteklenir.

---

## 6. Sayfalar ve özellikler

- **Ana sayfa** (sıra korunuyor): tanıtım ve arama → 5 dikey kategori kartı ve altında "Diğer Koleksiyon ve Antika Ürünler" → Yeni Eklenenler → Seçkin Parçalar → İşletmenin hikâyesi → Koleksiyon Rehberi → Mağaza bilgileri. Mobilde kategoriler 2 sütunlu ızgarada.
- **Mağaza / kategori:** Türkçe harf ve aksan duyarsız arama; ülke, dönem, yıl aralığı, kategori ve stok filtresi; sıralama; etkin filtre çipleri; boş sonuç durumu; durumun URL'de tutulması; mobil filtre paneli.
- **Ürün detayı:** galeri (tam ekran, yakınlaştırma), bilgi tablosu, "örnek fiyat" etiketi, stok, sepete ekle (stokla sınırlı), teklif (yalnızca uygun ürünlerde, gönderilmez), WhatsApp (numara yokken devre dışı), açıklama, kondisyon ve kusurlar, sertifika (yalnızca sertifikalılarda), teknik bilgiler (malzeme, ölçü, ağırlık), **kaynak ve görsel lisansı**, kargo/iade (işletmeden bekleniyor), benzer ürünler.
- **Koleksiyon paketi:** parça sayısı, fiyata dahil olanlar, içerik tablosu.
- **Sepet:** adet, kaldırma, ara toplam; ödeme düğmesi devre dışı ve demo olduğu yazıyor.
- **Bilgi sayfaları:** SSS (8 soru, kaynaklı), Hakkımızda, İletişim, **Kaynaklar**, 404.

---

## 7. SEO ve erişilebilirlik

Sayfaya özel title ve description; canonical, og ve sitemap yalnızca `SITE_URL` ile; Product JSON-LD yalnızca gerçek alanlarla (puan yok); demo `noindex`; görünür odak, "İçeriğe geç" bağlantısı, etiketli formlar, alt metinler, en az 44 px dokunma hedefleri. Lighthouse ölçümü yapılmadı.

---

## 8. Yapılan kontroller (2. tur, gerçekten çalıştırılanlar)

| Kontrol | Sonuç |
| --- | --- |
| `npm run build` | ✅ 36 sayfa, hata yok |
| Port 5500 doluyken `npm run dev` | ✅ Başka porta geçmedi; Türkçe hata mesajı ve çözümle çıktı (exit 1) |
| Dev modunda doğrudan adres ile 14 rota + görsel + favicon | ✅ Hepsi 200; olmayan sayfa 404; sondaki eğik çizgi olsa da olmasa da açılıyor |
| Masaüstü ve mobil (375 px) görünüm, yatay taşma | ✅ Taşma yok; kategoriler mobilde 2 sütun |
| Ürün–görsel eşleşmesi | ✅ 32 görselin hepsi tek tek açılıp kayıtla karşılaştırıldı; uymayan 4 aday elendi (§4) |
| Arama "OSMANLI", kategori filtresi, yıl 1900–1950 ile azalan fiyat sıralaması, mobil filtre paneli | ✅ |
| Sepete ekleme ve kaldırma (koyu tema) | ✅ |
| Kontrast oranları | ✅ hesaplandı (§5) |
| #EACEAA araması (dist, src, public) | ✅ bulunmadı |

**Kontrol edilemeyen:** `http://localhost:5500` adresinin kendisi açılamadı, çünkü test sırasında port 5500 VS Code (Code.exe, büyük olasılıkla Live Server) tarafından kullanılıyordu ve kapatılmadı. Ayrıca bu proje için daha önce başlatılmış bir Astro geliştirme sunucusu 5501'de çalışıyordu. Sayfa kontrolleri o sunucu üzerinden (aynı kod, canlı yenileme) yapıldı. Ekran okuyucu, gerçek cihaz ve Safari/Firefox testi yapılmadı.

---

## 9. Üretim aşamasında yapılacaklar

1. Shopify mağazası, `koleksiyon` metafield'ları ve kategori koleksiyonları (`categories.js` slug'larıyla aynı handle'lar, `seckin-parcalar`).
2. `src/lib/data/shopify/source.js`: Storefront API GraphQL ve modele dönüştüren mapper; `getCategoryImage` koleksiyon görselinden. Admin API anahtarı hiçbir yerde kullanılmayacak.
3. `src/scripts/cart/shopify-adapter.js`: `cartCreate` / `cartLines*`; ödeme `checkoutUrl` ile. `store.js` → `isDemo: false`.
4. Ödeme: Shopify Checkout + Shopify'ın PayTR entegrasyonu.
5. Gerçek ürün fotoğrafları Shopify'a yüklenecek. `public/urun-gorselleri/` ve demo verisi kaldırılacak. T.C. banknot fotoğrafları için TCMB koşulları (72 dpi ve "ÖRNEKTİR GEÇMEZ") uygulanmalı.
6. İsteğe bağlı: tarayıcıda canlı fiyat/stok kontrolü (public Storefront token).
7. Webhook → HMAC doğrulayan sunucusuz fonksiyon → build hook → Astro build → yayın (hosting seçildikten sonra).
8. Teklif formu gönderimi ve KVKK metni (işletmeyle karar verilecek).
9. Decondol ticari lisansı ve logo.
10. Yayın öncesi: `SITE_URL`, `PUBLIC_ALLOW_INDEXING=true`, Search Console, Lighthouse, gerçek cihaz testi.

---

## 10. İşletmeden alınması gereken bilgiler

- [ ] Adres ve harita bağlantısı, çalışma saatleri, telefon, WhatsApp (ülke koduyla, yalnızca rakam), e-posta, sosyal medya
- [ ] İşletme hikâyesi (isteğe bağlı kuruluş yılı)
- [ ] Kargo, iade, orijinallik kontrolü ve garanti koşulları
- [ ] Kullanılan kondisyon ölçeğinin onayı (`src/config/conditions.js`)
- [ ] Gerçek stok ürünleri ve fotoğrafları (ön/arka, düz nötr zemin)
- [ ] Logo, alan adı, Decondol lisansı
- [ ] Teklif özelliğinin gerçekten istenip istenmediği

---

## 11. Araştırma kaynakları

**Ürün görselleri ve kayıtları:** §4'teki tablo. Kullanılan portallar: [TCMB](https://www.tcmb.gov.tr), [Europeana](https://www.europeana.eu) (MNIR, Brukenthal/CIMEC, TECHNOSEUM, Wereldmuseum kayıtları), [KENOM](https://www.kenom.de), [DigitaltMuseum](https://digitaltmuseum.se), [Wikimedia Commons](https://commons.wikimedia.org).

**Lisans ve banknot kuralları:** [TCMB – Banknote Reproduction](https://tcmb.gov.tr/wps/wcm/connect/EN/TCMB+EN/Main+Menu/Banknotes/General+Information+on+Banknotes/Banknote+Reproduction), Commons "Copyright rules by territory/Turkey" (Currency bölümü), [TCMB – Emisyon Grupları](https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB%2BTR/Main%2BMenu/Banknotlar/Cumhuriyet%2BDonemi%2BBanknotlari).

**Kondisyon, sertifika, katalog, saklama (SSS için, 1. tur):** [PMG adjectival grades](https://www.pmgnotes.com/paper-money-grading/grading-scale/adjectival-grades/), [PCGS grades](https://www.pcgs.com/grades), [NGC encapsulation](https://www.ngccoin.com/coin-grading/grading-process/coin-encapsulation.aspx), [Numismatic News – Sheldon](https://www.numismaticnews.net/collecting-101/the-sheldon-coin-grading-scale), [Numismatic News – Pick](https://www.numismaticnews.net/all-about-pick-numbers), [CoinWeek – KM](https://coinweek.com/km-number-a-commonly-referred-to-world-coin-reference-number/), [ANA – Collecting 101](https://www.money.org/collect/), [CoinWeek – coin damage](https://coinweek.com/coins/coin-collecting-strategies-2/tips-for-new-collectors/unintentional-ways-collectors-damage-coins-and-how-to-stop/).

**Font:** [Decondol (FontSpace)](https://www.fontspace.com/decondol-font-f127750).

---

## 12. Bilerek yapılmayanlar

- Üyelik/giriş, ürün yönetim paneli, gerçek ödeme/sipariş/teklif kaydı
- Müşteri yorumu, puan, nadirlik veya değer iddiası; kaynakta olmayan kondisyon, katalog no. veya sertifika
- Yapay zekâ görseli, çizim, kırpılmış veya renk filtresi uygulanmış fotoğraf
- Sabit, içeriği kapatan büyük WhatsApp düğmesi
- Webhook, sunucusuz fonksiyon ve canlı yayın otomasyonu (yalnızca §9'da belgelendi)
