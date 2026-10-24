# İlkim Koleksiyon — mağaza demosu

Eski para ve koleksiyon ürünleri satan İlkim Koleksiyon için Astro ile hazırlanmış, statik (SSG) bir e-ticaret demosu.
Ürünler müze, merkez bankası ve Wikimedia Commons kayıtlarındaki **gerçek parçalara** dayanır. Bu parçalar İlkim
Koleksiyon'un stoğunda değildir; fiyat ve stoklar **örnektir**. Ödeme ve sipariş alınmaz.

## Gereksinimler

- Node.js 22.23 veya üzeri (Astro 7 için; Node 24 ile test edildi)
- npm

## Çalıştırma

Proje klasöründe (`İlkim koleksiyon`):

```bash
npm install
```

```bash
npm run dev
```

Yerel adres: **http://localhost:5500** (otomatik olarak `http://localhost:5500/ilkim-koleksiyon/` adresine yönlenir)

Site, GitHub Pages ile aynı alt yolda (`/ilkim-koleksiyon/`) çalışır; böylece yerelde gördüğünüz bağlantılar yayındakiyle birebir aynıdır.

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | 5500 portunu kontrol eder, ardından geliştirme sunucusunu başlatır |
| `npm run build` | Statik siteyi `dist/` klasörüne üretir |
| `npm run preview` | Build çıktısını sunar; adres **http://localhost:5500/ilkim-koleksiyon/** (önizleme sunucusu kök adresi yönlendirmez) |

### 5500 portu doluysa

`scripts/check-port.mjs`, sunucu başlamadan önce portu kontrol eder. Port doluysa sunucu başka bir porta kaymaz; komut
nedeni ve çözümü yazarak durur. Hiçbir işlem otomatik kapatılmaz.

- VS Code **Live Server** açıksa durum çubuğundaki "Port : 5500" düğmesine tıklayarak kapatın.
- Bu projenin eski bir Astro sunucusu açıksa o terminalde `Ctrl+C`'ye basın veya `npx astro dev stop` çalıştırın.
- Portu hangi işlemin kullandığını görmek için (Windows): `netstat -ano | findstr :5500`

Live Server ile `dist` klasörünü açmak gerekmez; site Astro sunucusuyla çalışır. Alt sayfalara adres yazarak girmek ve
sayfayı yenilemek sorunsuzdur.

## GitHub Pages yayını

- Adres: **https://smtardaa.github.io/ilkim-koleksiyon/**
- `.github/workflows/deploy.yml`, `main` dalına her push'ta `withastro/action@v6` ile `npm ci` + `npm run build` çalıştırır ve `dist/` klasörünü `actions/deploy-pages@v5` ile yayınlar. Elle tetiklemek için Actions sekmesinde "Run workflow" da kullanılabilir.
- **GitHub ayarı (bir kez):** Settings → Pages → Build and deployment → Source: **GitHub Actions**. "Deploy from a branch" seçili kalırsa GitHub kendi Jekyll derlemesini çalıştırır ve `.astro` dosyalarındaki `---` bölümlerinde hata verir.
- `astro.config.mjs`: `site: 'https://smtardaa.github.io'`, `base: '/ilkim-koleksiyon'`. Site içi yollar `src/lib/paths.js` içindeki `url()` ile üretilir; yeni bir bağlantı eklerken `href={url('/sayfa/')}` kullanın.
- `public/.nojekyll`: Çıktının Jekyll tarafından işlenmesini kesin olarak engeller.
- Proje tamamen statiktir (Express, API veya SSR yok); GitHub Pages için ayrı bir sunucu gerekmez.

## Ortam değişkenleri

Değişkenlerin açıklamaları `.env.example` içinde.

| Değişken | Demo değeri | Ne işe yarar |
| --- | --- | --- |
| `SITE_URL` | boş → `https://smtardaa.github.io` | Yayın alan adı (canonical, og:url, JSON-LD, sitemap). Özel alan adına geçilirse değiştirilir. |
| `BASE_PATH` | boş → `/ilkim-koleksiyon` | Yayın alt yolu. Özel alan adında `/` yapılır. |
| `PUBLIC_ALLOW_INDEXING` | `false` | `true` yapılmadıkça tüm sayfalar `noindex, nofollow` olur. |
| `DATA_SOURCE` | `mock` | Ürün verisinin kaynağı. `shopify` seçeneği henüz uygulanmadı ve bilerek hata verir. |

## Klasör yapısı

```
public/urun-gorselleri/  gerçek ürün fotoğrafları (lisanslı; kaynakları ürün verisinde)
scripts/check-port.mjs   5500 port kontrolü
src/
  config/        mağazaya özel ayarlar (iletişim, kategoriler, kondisyon ölçeği, SSS, menü)
  lib/
    model.js     ortak ürün modeli (JSDoc)
    catalog.js   ürün erişim katmanı — sayfalar veriye yalnızca buradan ulaşır
    data/        veri kaynakları: mock/ (gerçek kayıtlara dayalı demo verisi), shopify/ (taslak)
  components/    Header, Footer, ProductCard, ProductGallery, ProductListing, ProductDetail …
  layouts/       BaseLayout (SEO etiketleri, ortak düzen)
  pages/         rotalar (urun/[slug], koleksiyonlar/[slug], magaza/[kategori], kaynaklar …)
  scripts/       istemci JS: sepet, filtre, galeri, ürün sayfası
  styles/        tokens.css (koyu kahve tema değişkenleri), global.css
```

## Demoda çalışanlar

- Ana sayfa, mağaza, 6 kategori sayfası, ürün ve koleksiyon paketi detayları, sepet, Hakkımızda, SSS, İletişim,
  Kaynaklar ve 404
- Türkçe büyük/küçük harf ve aksan duyarsız arama; ülke, dönem, yıl, kategori ve stok filtresi; fiyat ve yeniliğe göre
  sıralama. Filtre durumu URL'de tutulur.
- Mobil menü ve mobil filtre paneli
- Galeri: tam ekran inceleme, yakınlaştırma, klavye ile gezinme
- Demo sepeti (yalnızca tarayıcının `localStorage` alanında tutulur)
- Teklif formu (yalnızca teklife açık ürünlerde; hiçbir yere gönderilmez)
- Her ürün sayfasında bilgi kaynağı ve görsel lisansı; tüm liste `/kaynaklar/` sayfasında

## Henüz bağlı olmayanlar

- **Shopify Storefront API:** `src/lib/data/shopify/source.js` yalnızca taslak.
- **Gerçek sepet ve ödeme:** Shopify sepet adaptörü ve `checkoutUrl` ile Shopify Checkout. PayTR, Shopify'ın hazır
  entegrasyonuyla bağlanacak.
- **Teklif formu gönderimi, iletişim bilgileri, politikalar** (`src/config/store.js` içindeki boş alanlar)
- **Otomatik yeniden build:** Shopify webhook → sunucusuz fonksiyon → build hook → yayın

Ayrıntılı devir notları: [PROJE-OZETI.md](PROJE-OZETI.md)
