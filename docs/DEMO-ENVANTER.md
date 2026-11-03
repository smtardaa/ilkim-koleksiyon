# Demo envanter — kaynak ve yöntem

> Bu envanter **yalnızca demo** içindir. Ürünler, görseller ve fiyatlar
> **eskiparamarket.com** sitesinden örnek olarak alınmıştır ve İlkim Koleksiyon'un envanteri değildir.
> Canlıya geçişte tamamen İlkim Koleksiyon'un kendi Shopify içeriğiyle değiştirilecektir (README → “Demo
> envanterden gerçek envantere geçiş”). Sitede “Demo — ürünler ve fiyatlar örnek envanterden alınmıştır”
> açıklaması gösterilir.

## Ne alındı, ne alınmadı

| Alındı | Alınmadı |
|---|---|
| Ürün adı, kaynak URL'si, alınma tarihi | Kaynak sitenin telefonu, adresi, e-postası, sosyal hesapları |
| Kaynaktaki fiyat (TRY) ve stok metni | Kurumsal metinler, “ücretsiz kargo/2 iş günü” gibi ticari vaatler |
| Kategori ve alt kategori ilişkileri | Kargo, iade, sözleşme metinleri (ürün sayfalarındaki uzun iade metni dahil) |
| Ürün görselleri (kaynağın 750 px sürümü, en fazla 4 adet) | Kaynağın logosu/marka görselleri |
| Ürün başlığından okunabilen teknik bilgiler | Kaynağın iç stok kodu (yalnızca `source.model` alanında kayıt amaçlı) |

- Uzun açıklama metni kopyalanmadı; kaynak açıklamalar zaten çoğunlukla boştu. Kısa açıklama, doğrulanabilen
  özelliklerden üretildi (`scripts/build-demo-data.mjs → buildSummary`).
- Görsellerde filigran vb. hiçbir öğe kaldırılmadı veya eklenmedi; yalnızca düz beyaz kenar boşluğu kırpılıp
  WebP'ye çevrildi. Para kenarları kesilmez.
- Kaynak: `robots.txt` bütün yollara izin veriyordu. Tarama tek bağlantı, istek arası ≈1 sn (görseller 0,7 sn),
  önbellekli yapıldı; erişim engeli aşılmaya çalışılmadı.

## Dosyalar

| Dosya | İçerik |
|---|---|
| `demo-kaynak/kategori-taramasi.json` | Kaynak kategori sayfası → ürün listesi (ad, fiyat, ürün id) |
| `demo-kaynak/urun-taramasi.json` | Her ürün sayfasının ayrıştırılmış ham kaydı (URL, alınma tarihi, HTTP durumu, ad, fiyat, stok, görsel URL'leri) |
| `demo-kaynak/gorsel-indirme.json` | Her görsel URL'si için indirme sonucu |
| `demo-kaynak/gorsel-olculeri.json` | İşlenmiş görsel ölçüleri ve içerik oranı |
| `demo-kaynak/donusum-raporu.json` | Dönüşüm sayıları, kategori düzeltmeleri, hatalar, demo senaryoları |
| `src/data/demo/*.json` | Sitenin kullandığı ortak modeldeki demo envanter |

Her üründe `source` alanı: `url`, `fetchedAt`, `sourceId`, `originalTitle`, `priceText`, `stockText`, `categories`.

## Teknik bilgilerin çıkarılması

Bilgiler yalnızca kaynak ürün **başlığından** ve **kategorisinden** okunur; okunamayan alan boş kalır.

| Alan | Kaynak |
|---|---|
| Ülke | Yabancı paralarda ülke alt kategorisi; yoksa başlığın bilinen bir ülke adıyla başlaması. T.C. kategorileri → Türkiye, Osmanlı → Osmanlı Devleti |
| Yıl / aralık | “YIL 1961”, “1944/47”, “1903/1917”; nominal değer olarak kullanılan sayı yıl sayılmaz |
| Hicrî tarih | Osmanlı hükümdar adı + “1327/1” biçimi → `calendar: hicri` (cülus yılı/saltanat yılı). “1340 (1924)” → miladî 1924, yazım korunur |
| Nominal değer | Başlıktaki ilk “sayı + birim”; birim yoksa T.C. nominal alt kategorisinden (ör. “20.000.000 Lira”) |
| Emisyon / tertip | “5 EMİSYON”, “3 TERTİP” |
| Katalog no | “PİK P-173a”, “P#104/B”, “PİK PS532a” → `Pick P-…` |
| Kondisyon | “KONDİSYON 10/7,5” (kaynak satıcının 10'luk ölçeği), “ÇİL”, “ÇT” |
| Sertifika | “PMG 58” vb. Darphane'nin “sertifikalı” ifadesi derecelendirme sayılmaz, not olarak tutulur |
| Metal | Başlıkta “gümüş, bronz, nikel …” |
| Tür | Kategori (T.C./Osmanlı kâğıt/madeni), Pick numarası veya “polimer” → banknot; yabancı paralarda bunlar yoksa görselin belirgin dikdörtgen oranı (≥1,3) → banknot; aksi halde **boş** |

## Kategori yapısı

Kaynak hiyerarşi korunarak İlkim yollarına eşlendi (`scripts/build-demo-data.mjs → TOP, REGROUP`):

- `t-c-kagit-paralar/*` → `tc-kagit-paralar/*` (emisyonlar ve nominal alt kategoriler)
- `t-c-madeni-paralar/*` → `tc-madeni-paralar/*` (dönemler, tedavül setleri)
- `t-c-hatira-paralar/*` → `tc-hatira-paralari/*`
- `osmanli-paralari/*` → aynı (kâğıt/madeni, hükümdarlar)
- `yabanci-paralar/<ülke>` → `yabanci-paralar/<ülke-adından-slug>` (kaynakta bazı adresler adla uyuşmuyor, ör. `guney-osetya` adresinde “Güney Vietnam”)
- `pul`, `koleksiyon-malzeme/*` → `pul-ve-koleksiyon-malzemeleri/{pul, koleksiyon-malzemeleri/*}`
- `fantazi-paralar` → `antika-ve-diger/fantazi-paralar`
- `sertifikali-paralar` → kategori değil, **seçki** (ürün kendi kategorisinde kalır)
- `yeni-urunler`, `firsat-urunu` → ürün işareti (`source.flags`), kategori değil
- Yeni (kaynakta karşılığı doğrulanamayan, boş): `madalya-ve-objeler`, `antika-ve-diger/antika`

**Önemli bulgu:** Kaynak menüsündeki “MADALYA VE OBJE” bağlantısı `/firsat-urunu` listesine gidiyor ve bu
listede madalya/obje değil, indirimli banknotlar ve bir albüm bulunuyor. Bu nedenle hiçbir ürün madalya veya
antika olarak etiketlenmedi; bu kategoriler boş durum mesajıyla gösterilir.

### Kaynak ilişkilerinde uygulanan düzeltmeler

Kurallar `correctCategories()` ve ülke düzeltmesinde; her uygulama `donusum-raporu.json → categoryCorrections` içinde listelenir.

1. Hicrî tarihli Osmanlı sikkeleri T.C. kategorilerinden çıkarıldı.
2. Fantazi paralar T.C. hatıra kategorisinden çıkarıldı.
3. Para ürünleri koleksiyon malzemeleri kategorisinden; albüm gibi malzemeler para kategorilerinden çıkarıldı.
4. Başlıktaki ülke ile hiçbir ülke kategorisi uyuşmuyorsa başlıktaki ülke esas alındı.

## Demo senaryoları (gerçek veri değil)

Kaynakta bütün ürünler “Stok: Var” durumundaydı ve adet bilgisi yayınlanmıyordu. Davranışları gösterebilmek için:

- 2 ürün **“Satıldı”**, 1 ürün **“Stokta yok”** olarak işaretlendi (`demoScenario` alanı). Bu ürünlerin sayfasında
  “Demo senaryosu” notu görünür. Listesi `donusum-raporu.json → demoScenarios`.
- Adet bilinmediği için demo sepetinde her koleksiyon ilanı **tekil parça (en fazla 1 adet)**, koleksiyon
  malzemeleri en fazla 5 adet kabul edilir (`src/lib/cart-server.js → UNKNOWN_QTY_LIMIT`). Bu bir stok iddiası değil, demo politikasıdır.
- “Yeni gelenler” sıralaması kaynak kayıt numarasına göredir (kaynakta ekleme tarihi yayınlanmıyor).

## Yeniden üretme

```bash
npm run demo:images -- <ham-kayıt-klasörü>
```

```bash
npm run demo:data
```

Tarama betikleri `scripts/kaynak-tarama/` altındadır (bkz. `OKUBENI.md`); ürettikleri kayıtlar `demo-kaynak/` altındadır.
Ham görseller ve sayfa HTML önbelleği projeye alınmadı (yalnızca işlenmiş WebP'ler `public/demo/urun/`).
