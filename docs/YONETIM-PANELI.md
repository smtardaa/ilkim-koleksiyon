# Yönetim paneli

Panel adresi: **`/yonetim`**. İki sayfadan oluşur:

| Sayfa | Adres | İçerik |
|---|---|---|
| **Genel yönetim** | `/yonetim` | Ürünler (ekle/düzenle pencerede, görsel yükleme, yayından kaldır, sil) · Kategoriler (ad, sıra, açıklama, kart görseli ve atıf) · Ülkeler (ekle, adını düzelt, kullanılmayanı kaldır) · Seçkiler (oluştur, ürün ata, sil) |
| **Doldurulacaklar** | `/yonetim/eksikler` | Sitede “Doldurulacak” olarak bekleyen işletme bilgileri: iletişim, satış/kargo, firma/yasal bilgiler, hakkımızda, bilgi sayfası metinleri, sosyal hesaplar. İlerleme çubuğu, “yalnızca eksikler” süzgeci ve sunucu ayarlarının durumu. |

Kaydedilen her değişiklik **yeniden derleme olmadan** sitede hemen görünür.

## 1. Kurulum (giriş bilgileri)

1. Proje klasöründe çalıştırın ve kullanıcı adı ile parolayı (en az 12 karakter) girin:
   ```bash
   npm run admin:parola
   ```
2. Çıkan üç satırı Hostinger → Node.js uygulaması → **Ortam değişkenleri** bölümüne ekleyin:
   `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`.
3. Uygulamayı yeniden başlatın ve `https://alanadiniz/yonetim` adresine gidin.

Bu üç değişkenden biri eksikse panel **kapalı** kalır ve giriş sayfası neyin eksik olduğunu yazar.
Parolayı değiştirmek için komutu yeniden çalıştırıp `ADMIN_PASSWORD_HASH` değerini güncelleyin.
`SESSION_SECRET` değiştirilirse açık olan bütün oturumlar kapanır.

Yerel geliştirmede aynı değişkenler `.env` veya `.env.local` dosyasına yazılır (ikisi de depoya girmez).

## 2. Verinin yeri

| Ne | Nerede | Ortam değişkeni |
|---|---|---|
| Ürünler, kategoriler, ülkeler, seçkiler, işletme bilgileri | JSON dosyaları | `DATA_DIR` (varsayılan `./storage/veri`) |
| Yüklenen ürün görselleri (WebP, 1600px + 480px) | Dosyalar, `/medya/…` adresinden sunulur | `UPLOADS_DIR` (varsayılan `./storage/gorseller`) |

- Klasör ilk açılışta boşsa depodaki başlangıç verisi (`src/data/catalog/*.json`) oraya kopyalanır.
  Sonrasında site yalnızca bu klasörden okur; depodaki dosyalar yalnızca başlangıç verisidir.
- Bu klasörler derleme klasörünün dışındadır; yeniden derleme ya da yükleme onları silmez.
  Hostinger'da yeniden dağıtımın uygulama klasörünü sıfırladığı durumlar için iki değişkeni uygulama
  klasörü dışında kalıcı bir yola ayarlamak en güvenlisidir.
- **Yedek:** bu iki klasörü düzenli olarak indirin (MySQL'e geçince veritabanı yedeği).

## 3. Güvenlik

- Parola yalnızca **scrypt özeti** olarak saklanır (`node:crypto`; ek paket yok).
- Oturum: imzalı çerez, `HttpOnly; Secure; SameSite=Strict`, yol `/yonetim`, 8 saat.
- Her formda oturuma bağlı **CSRF anahtarı**; ayrıca Astro'nun köken denetimi (`security.checkOrigin`).
  Bu denetim için `astro.config.mjs` → `allowedDomains` alan adının www'li ve www'siz biçimini içerir;
  bu yüzden **`SITE_URL` derleme sırasında da tanımlı olmalıdır**.
- Aynı adresten 15 dakikada 5 hatalı giriş → 15 dakika bekleme.
- `/yonetim` her zaman `noindex, nofollow`, `Cache-Control: no-store`, `X-Frame-Options: DENY`; robots.txt'te `Disallow`.
- Görsel yükleme: türü sharp ile doğrulanır (JPEG/PNG/WebP/AVIF/HEIC), dosya başına 15 MB, ürün başına 12 görsel.
- Ürün açıklaması düz metin olarak alınır ve HTML kaçışlı paragraflara çevrilir.

## 4. Mimari — MySQL'e geçiş için bağlantı noktası

```
Panel sayfaları ─┐                         ┌─ file-store.js   (bugün: DATA_DIR içindeki JSON)
                 ├─ src/lib/admin/service.js ─┤
Site sayfaları ──┴─ providers/local.js ───── getStore() ─┴─ mysql-store.js  (ileride: aynı yöntemler)
```

- **Depo** (`src/lib/store/`) yalnızca okur/yazar. **Kurallar** (doğrulama, benzersiz adres/ürün kodu,
  ülke adı değişince ürünlerin taşınması, seçki üyelikleri) `src/lib/admin/service.js` içindedir ve depodan bağımsızdır.
- **İşletme bilgileri** depoda `settings` olarak durur; `src/lib/runtime.js` her istekte (yalnızca değiştiyse)
  `src/config/business.js` nesnesine uygular. Alan listesi tek yerde: `src/lib/admin/settings-schema.js`.

### Depo arayüzü

| Yöntem | Açıklama |
|---|---|
| `getSnapshot()` | `{ products, categories, countries, collections, settings, revision }` — `revision` her yazmada artar |
| `putProduct(product)` | Ürün ekle/güncelle (`id` ile) — biçim `src/lib/types.js` + `published`, `description`, `updatedAt` |
| `removeProduct(id)` | Ürünü kalıcı sil |
| `putCountry(country, previousSlug?)` | Ülke ekle/yeniden adlandır (`{slug, name}`) |
| `removeCountry(slug)` | Ülkeyi kaldır |
| `putCategory(category)` | Var olan kategoriyi güncelle |
| `putCollection(collection)` / `removeCollection(handle)` | Seçki ekle/güncelle/sil |
| `putSettings(settings)` | İşletme bilgilerinin tamamını yaz (yalnızca dolu alanlar) |

### MySQL'e geçiş adımları

1. `npm install mysql2`
2. `src/lib/store/mysql-store.js` yazın: yukarıdaki yöntemleri aynı veri biçimiyle sunsun.
   `revision` için her yazmada artan bir değer tutun (ör. `settings` tablosunda `revision` satırı).
3. `src/lib/store/index.js` → `factories` haritasına `mysql` girdisini ekleyin.
4. `astro.config.mjs` → `DATA_SOURCE` değerlerine `'mysql'`; `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`,
   `DB_PASSWORD` değişkenlerini `access: 'secret'` olarak ekleyin.
5. Mevcut veriyi aktarmak için `DATA_DIR` içindeki JSON dosyalarını tablolara yazan tek seferlik bir betik çalıştırın.
6. Hosting panelinde `DATA_SOURCE=mysql` yapıp uygulamayı yeniden başlatın. Panel ve sayfalar değişmez.

Hostinger MySQL: `127.0.0.1:3306`; bağlantı bilgileri yalnızca ortam değişkenlerinde tutulur.

### Önerilen tablolar (taslak)

```sql
CREATE TABLE products (
  id VARCHAR(32) PRIMARY KEY, handle VARCHAR(120) UNIQUE NOT NULL, title VARCHAR(200) NOT NULL,
  sku VARCHAR(60) UNIQUE NULL, price DECIMAL(12,2) NOT NULL, status ENUM('in_stock','out_of_stock','sold') NOT NULL,
  published TINYINT(1) NOT NULL DEFAULT 1, summary VARCHAR(300), description TEXT, description_html TEXT,
  specs JSON, category_path VARCHAR(80) NOT NULL, country_slug VARCHAR(80) NULL,
  seo_title VARCHAR(70), seo_description VARCHAR(170), delivery_note VARCHAR(300),
  sort_order INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL
);
CREATE TABLE product_images (product_id VARCHAR(32), position INT, src VARCHAR(255), src_small VARCHAR(255),
  width INT, height INT, alt VARCHAR(200), PRIMARY KEY (product_id, position));
CREATE TABLE categories (path VARCHAR(80) PRIMARY KEY, title VARCHAR(80), description VARCHAR(400), sort INT,
  has_countries TINYINT(1), image JSON);
CREATE TABLE countries (slug VARCHAR(80) PRIMARY KEY, name VARCHAR(80) UNIQUE);
CREATE TABLE collections (handle VARCHAR(120) PRIMARY KEY, title VARCHAR(80), description VARCHAR(400));
CREATE TABLE collection_products (handle VARCHAR(120), product_id VARCHAR(32), PRIMARY KEY (handle, product_id));
CREATE TABLE settings (`key` VARCHAR(80) PRIMARY KEY, value JSON);
```

## 5. Bilerek yapılmayanlar

- Birden çok yönetici hesabı ve rol yönetimi (tek yönetici; ortam değişkenleriyle).
- Kategori ekleme/silme (12 kategori sabit; ad, sıra, açıklama ve görsel düzenlenir).
- Panel içinden parola değiştirme (komutla yeni özet üretilir).
- İletişim formu gönderim adresi (`contactFormEndpoint`) panelde değildir; bir gönderim hizmeti seçilince kodda ayarlanır.
