# Demo envanter tarama betikleri (yalnızca demo)

Bu Python betikleri demo envanteri oluşturmak için **bir kez** çalıştırıldı (2026-11-03). Canlı sitede
kullanılmaz; gerçek envanter Shopify'dan gelir. Betikler kayıt ve tekrarlanabilirlik için saklanmıştır.

| Betik | Ne yapar |
|---|---|
| `crawl_cats.py <çalışma-klasörü>` | `src/cats.txt` listesindeki kategori sayfalarını `?limit=100` ile ve sayfalamayı izleyerek okur → `categories.json` |
| `crawl_products.py <çalışma-klasörü>` | Ürün sitemap'lerindeki (`src/sm_product_page_*.xml`) her ürün sayfasını okur → `products_raw.json` |
| `fetch_images.py <çalışma-klasörü>` | Ürün başına en fazla 4 görseli indirir → `images/{kaynakId}-{sıra}.jpg`, `images_manifest.json` |

Kurallar: tek bağlantı, istekler arası ≈1 sn (görsellerde 0,7 sn), yanıtlar önbelleklenir, hata olan sayfa
kaydedilir ve atlanır; erişim engeli aşma denemesi yapılmaz. Kaynak `robots.txt` taramaya izin veriyordu.

Çıktılar proje kökündeki `demo-kaynak/` klasörüne kopyalanıp `npm run demo:images -- <klasör>` ve
`npm run demo:data` ile siteye dönüştürülür. Ayrıntı: `docs/DEMO-ENVANTER.md`.
