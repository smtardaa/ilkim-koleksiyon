# PayTR ile ödeme — Shopify entegrasyonu üzerinden

> Durum: **Dış bağlantı bekliyor.** PayTR üye işyeri hesabı ve Shopify mağazası olmadan kurulum ve ödeme
> testi yapılamaz; bu projede **gerçek ödeme testi yapılmadı.** Site “canlı satışa hazır” değildir.

## Seçilen mimari

```
Astro mağaza → Shopify Storefront Cart API → checkoutUrl → Shopify Checkout → PayTR (Shopify'da etkin ödeme yöntemi)
```

Bu projede PayTR'ye **doğrudan bağlanan kod yoktur.** PayTR, Shopify yönetim panelinden ödeme sağlayıcısı
olarak etkinleştirilir; kart bilgileri bu siteye hiç gelmez. PayTR anahtarları (`merchant_key`, `merchant_salt`)
bu projeye **eklenmez.**

## İki farklı şey: karıştırılmamalı

| | PayTR'nin Shopify entegrasyonu (bu proje) | PayTR iFrame / Direct API (özel entegrasyon) |
|---|---|---|
| Nerede kurulur | Shopify yönetimi → Ödemeler | Kendi sunucu kodunuzda |
| Ödeme sayfası | Shopify Checkout → PayTR ortak ödeme sayfası | Kendi sitenizde iFrame veya kendi formunuz |
| Sipariş kaydı | Shopify oluşturur | Sizin sisteminiz oluşturmalı |
| Gerekenler | PayTR hesabı + Shopify uygulaması | Sunucu tarafı token üretimi, **Bildirim URL (callback)**, hash doğrulama, sipariş oluşturma, stok düşme, iade akışı |
| Bu projede | Mimari hazır, kurulum bekliyor | **Uygulanmadı** (gerekmedikçe önerilmez) |

## Kurulum adımları (PayTR'nin resmî Shopify kılavuzuna göre)

Kaynak: PayTR geliştirici merkezi, “Hazır Altyapılar → Shopify”: https://dev.paytr.com/hazir-altyapi/shopify
(2026-11-03 tarihinde okunmuştur; adımlar değişebilir, kurulumda güncel sayfayı esas alın.)

1. PayTR'ye üye işyeri başvurusu yapılır ve onaylanır (mağaza paneli giriş bilgileri PayTR tarafından iletilir).
2. PayTR kılavuzundaki Shopify bağlantısıyla mağaza seçilir, **Bağlan** ve **Uygulamayı Yükle** adımları tamamlanır.
3. PayTR Mağaza Paneli'ne giriş yapılır (kılavuz giriş ekranında süre sınırı olduğunu belirtir).
4. Shopify yönetimi → **Ayarlar → Ödemeler → PayTR** → **Yönet** → uygulama etkinleştirilir.
5. **Test modu** açılarak deneme yapılır (kılavuza göre test siparişlerinde sipariş notunda test ibaresi görünür).
6. Shopify yönetimi → **Ayarlar → Ödeme sayfası**: kılavuz, müşteri iletişiminin e-posta ile alınmasını ve
   ad-soyad alanlarının zorunlu yapılmasını şart koşar.
7. PayTR paneli → Destek & Kurulum → Ayarlar: **Bildirim URL** değerinin kılavuzda verilen PayTR adresi
   olduğu kontrol edilir (Shopify entegrasyonunda bildirim PayTR ↔ Shopify arasında işler; bu sitenin bir
   callback ucu yoktur).

Shopify'ın genel üçüncü taraf ödeme sağlayıcı belgesi: https://help.shopify.com/en/manual/payments/third-party-providers
(Aynı anda yalnızca bir kredi kartı sağlayıcısı etkin olabilir; sağlayıcıyı yalnızca mağaza sahibi ekleyebilir.)

### Dikkat edilecekler (kurulum sırasında doğrulanmalı)

- Uygulamanın mağazanızla uyumluluğu (App Store sayfası mağaza koşullarına göre “uyumlu değil” uyarısı gösterebiliyor).
- İadeler: kılavuza göre iade Shopify siparişindeki **Para iadesi** ile yapılmalı; PayTR panelinden yapılan iade
  Shopify siparişine yansımayabilir.
- Shopify'ın üçüncü taraf ödeme sağlayıcıları için uyguladığı işlem ücretleri ve PayTR komisyonu ayrıca
  değerlendirilmelidir.
- Mobil cihazlarda ödeme sayfası davranışı test edilmelidir.

## Canlı ödeme testi kontrol listesi

- [ ] PayTR test modunda kart ile ödeme → Shopify'da sipariş oluştu mu?
- [ ] Sipariş tutarı, kargo, vergi doğru mu?
- [ ] Stok düştü mü; tekil üründe `sale_status=sold` işaretlenmesi süreçte nasıl yapılacak? (Shopify Flow veya elle)
- [ ] Başarısız/iptal ödeme: sipariş oluşmadı mı, stok geri döndü mü?
- [ ] İade akışı Shopify ve PayTR'de tutarlı mı?
- [ ] Test modu kapatılıp gerçek, düşük tutarlı ödeme ve iade denendi mi?

## İleride doğrudan PayTR (iFrame/Direct API) gerekirse

Ayrıca değerlendirilmesi gerekenler: sunucuda `paytr_token` üretimi; **Bildirim URL** ucunda hash doğrulaması ve
tekrar eden bildirimlere karşı idempotent işlem; Shopify Admin API ile sipariş oluşturma (gizli Admin token,
yalnızca sunucuda); stok eşitleme ve çifte satış önleme; iade/iptal; PCI ve KVKK yükümlülükleri. Bu, Shopify
Checkout'u devre dışı bırakan farklı bir mimaridir ve bu aşamada uygulanmamıştır.
