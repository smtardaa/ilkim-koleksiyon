# Yönetim paneli ve MySQL — ileride yapılacaklar

> Bu belge **gereksinim ve bağlantı noktası** belgesidir. Panel, giriş sistemi, veritabanı ve CRUD uçları
> bu sürümde **kurulmadı**. Site şu an `DATA_SOURCE=local` ile `src/data/catalog/*.json` dosyalarından okur.

## 1. Bağlantı noktası: sağlayıcı arayüzü

Bütün sayfalar veriyi yalnızca `src/lib/catalog.js` → `getProvider()` üzerinden alır. MySQL'e geçiş için
yeni bir sağlayıcı yazılır ve sayfalara dokunulmaz:

1. `src/lib/providers/mysql.js` oluştur; `local.js` ile **aynı** yöntemleri ve aynı veri biçimini
   (`src/lib/types.js`) döndür.
2. `src/lib/catalog.js` içindeki sağlayıcı haritasına `mysql: () => import('./providers/mysql.js')…` ekle.
3. `astro.config.mjs` → `DATA_SOURCE` enum'una `'mysql'` ekle; `DB_*` değişkenlerini `access: 'secret'` olarak tanımla.
4. Hosting panelinde `DATA_SOURCE=mysql` yap, sunucuyu yeniden başlat.

| Yöntem | Döndürdüğü |
|---|---|
| `getAllProducts()` | Bütün ürünler (`Product[]`) |
| `getProductByHandle(handle)` | Tek ürün veya `null` |
| `getCategories()` | Ana kategoriler + ülke alt sayfaları (`{path, title, sort, description, parent, countries, countrySlug, image, productCount}`) |
| `getCountries()` | Ülke listesi (`{slug, name}`) — ürünlerden bağımsız |
| `getCollections()` | Seçkiler (ör. Sertifikalı Paralar) |
| `getHomeSections(requests)` | Ana sayfa bölümleri için kategori başına sınırlı aday ürün |
| `health()` | `/api/health` için durum bilgisi |

Ülke sayfası yolu: `{yabanci-madeni-paralar|yabanci-kagit-paralar}/{ülke-slug}`. Ürünün `categoryPaths`
alanına hem ana kategori hem ülke yolu yazılır.

## 2. Panelde olması gerekenler

**Ürün**
- Ekle / düzenle / kaldır (kaldırma: önce “yayından kaldır”, kalıcı silme ayrıca onaylı).
- Alanlar: ad, ürün kodu (`sku`, WhatsApp mesajına girer), fiyat, stok durumu (`in_stock` / `out_of_stock` / `sold`),
  açıklama, özellikler (`specs`: tür, ülke, yıl + takvim, nominal, emisyon, kondisyon, katalog no, sertifika, metal),
  SEO başlığı/açıklaması.
- Görseller: birden çok görsel, sıralama, ön/arka yüz. Yükleme sırasında WebP'ye çevirme ve küçük/büyük boyut üretimi.
- Kategori ilişkisi: bir ana kategori; yabancı para kategorilerinde zorunlu **ülke seçimi**.

**Ülke**
- Listeden seçme ve **yeni ülke ekleme** (ad + otomatik slug; slug değişirse eski adres yönlendirmesi).

**Kategori**
- Görsel değiştirme (lisans/atıf bilgisiyle; `/kaynaklar` sayfası bu alandan beslenir), açıklama, sıralama.

**İletişim ayarları**
- WhatsApp numarası (ülke koduyla, yalnızca rakam), telefon, e-posta, adres, sosyal hesaplar.
  Bugün bu bilgiler `src/config/business.js` içindedir; panelle birlikte veritabanından okunacak.

**Güvenlik**
- `/admin` yalnızca giriş yapmış kullanıcıya açık; parola özetli (bcrypt/argon2), oturum çerezi `HttpOnly; Secure; SameSite`.
- Formlarda CSRF koruması, giriş denemesi sınırı, yükleme türü/boyut denetimi.
- `/admin` her zaman `noindex` ve sitemap dışında.

## 3. Hosting (Hostinger) bilgileri

- Node.js **24.x** uygulaması; derleme `npm run build`, başlatma `npm start`.
- MySQL: `127.0.0.1:3306`. Veritabanı adı, kullanıcı ve parola **yalnızca** hosting panelindeki ortam
  değişkenlerinde (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`); depoya yazılmaz.
- Yüklenen görseller her derlemede silinmemesi için derleme klasörü ve `public_html` **dışında**, kalıcı bir
  klasörde tutulur (`UPLOADS_DIR`) ve bir rota üzerinden sunulur.
- Veritabanı için düzenli yedek alınmalı.

## 4. Önerilen tablolar (taslak)

`products` (id, handle, title, sku, price, status, description, specs JSON, category_path, country_slug, sort, created_at, updated_at) ·
`product_images` (product_id, path, width, height, sort) · `categories` (path, title, description, sort, image_src, image_credit JSON) ·
`countries` (slug, name) · `collections` + `collection_products` · `settings` (anahtar/değer: WhatsApp, telefon…) ·
`admin_users` (e-posta, parola özeti).
