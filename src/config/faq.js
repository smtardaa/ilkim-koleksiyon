/**
 * SSS içeriği. Genel bilgiler aşağıdaki kaynaklardan derlenerek
 * sadeleştirildi; işletmeye özel politika soruları bilgi gelene kadar
 * boş bırakıldı (store.js → policies).
 *
 * Cevaplar `paragraphs` (düz metin) ve isteğe bağlı `list` alanlarından oluşur.
 */
export const faqGeneral = [
  {
    id: 'baslangic',
    question: 'Koleksiyonculuğa nasıl başlanır?',
    paragraphs: [
      'Önce sizi en çok ilgilendiren konuyu seçin: belirli bir dönem, bir ülke, bir emisyon serisi ya da tek bir kupür. Her şeyi toplamaya çalışmak yerine bir tema belirlemek seçim yapmayı kolaylaştırır.',
    ],
    list: [
      'Küçük başlayın ve kendinize bir bütçe belirleyin.',
      'Kondisyon ve katalog numarası gibi temel terimleri öğrenin.',
      'Aldığınız her parçayı yılı, kondisyonu, nereden ve ne zaman alındığıyla not edin.',
      'Ürün fotoğraflarını ve kusur açıklamalarını dikkatle inceleyin; emin olmadığınız noktaları satıcıya sorun.',
    ],
  },
  {
    id: 'kondisyon',
    question: 'Kondisyon neyi ifade eder?',
    paragraphs: [
      'Kondisyon, bir paranın ne kadar kullanıldığını ve yüzeyinin ne ölçüde korunduğunu anlatır. Uluslararası derecelendirme kuruluşları 1 ile 70 arasındaki Sheldon ölçeğini kullanır: 60 ve üzeri tedavül görmemiş (Uncirculated), altındaki dereceler kullanılmış paralar içindir.',
      'Türkiye’de “Çil”, “Çil altı”, “Çok çok temiz”, “Çok temiz” ve “Temiz” gibi terimler yaygındır. Kondisyon bir uzman değerlendirmesidir; bu nedenle derece, fotoğraflar ve kusur açıklamalarıyla birlikte değerlendirilmelidir.',
    ],
    showScale: true,
  },
  {
    id: 'deger',
    question: 'Eski paranın değerini hangi özellikler etkiler?',
    paragraphs: [
      'Bir paranın yaşı tek başına değerini belirlemez. Genellikle şu özellikler birlikte etkilidir:',
    ],
    list: [
      'Nadirlik: basım adedi ve günümüze ulaşan örneklerin sayısı.',
      'Kondisyon: aşınma, kat izi, leke, yırtık veya darbe gibi kusurlar.',
      'Özgünlük: temizlenmemiş, onarılmamış, ütülenmemiş olması.',
      'Varyantlar: imza, tarih, seri veya baskı farkları.',
      'Talep: o tema veya seriye koleksiyonerlerin ilgisi.',
      'Bağımsız bir kuruluştan alınmış sertifika.',
    ],
    after: 'Piyasa değerleri zamanla değişebilir; geçmişteki fiyatlar gelecekteki fiyatlar için bir gösterge değildir.',
  },
  {
    id: 'saklama',
    question: 'Banknotlar ve madeni paralar nasıl saklanır?',
    paragraphs: [
      'Saklama koşulları, parçaların bugünkü durumunu korumak için en önemli etkendir.',
    ],
    list: [
      'PVC içermeyen, arşiv kalitesinde kılıflar kullanın (polyester/Mylar, polipropilen gibi). Yumuşak PVC zamanla kimyasal salarak yüzeye zarar verebilir.',
      'Serin, karanlık ve nemi sabit bir ortam seçin. Kaynaklar yaklaşık %35–50 bağıl nem önerir; ani sıcaklık ve nem değişimleri, ideal değerden biraz sapmaktan daha zararlıdır.',
      'Parçaları kenarlarından tutun; temiz ve kuru eller veya nitril eldiven kullanın.',
      'Banknotları katlamayın, bantlamayın, lamine etmeyin; lastik bant ve vinil klasörlerden uzak tutun.',
      'Nemi azaltmak için saklama kutusuna silika jel koyabilirsiniz.',
    ],
  },
  {
    id: 'temizlik',
    question: 'Eski paralar temizlenmeli mi?',
    paragraphs: [
      'Genel kural olarak hayır. Temizlik, paranın doğal yüzeyini ve patinasını bozar; gözle zor görülen ince çizikler bırakır ve çoğu zaman değeri düşürür. Uzmanlar ve derecelendirme kuruluşları temizlenmiş paraları ayırt edebilir.',
      'Banknotlar yıkanmamalı veya ütülenmemelidir. Bir parçada aktif bir bozulma görüyorsanız, kendiniz müdahale etmek yerine profesyonel konservasyon desteği alın.',
    ],
  },
  {
    id: 'sertifika',
    question: 'Sertifikalı para ne demektir?',
    paragraphs: [
      'Sertifikalı para, bağımsız bir derecelendirme kuruluşunun incelediği, derecelendirdiği ve kurcalanmaya karşı korumalı, mühürlü bir kapsüle yerleştirdiği paradır. Madeni paralarda PCGS ve NGC, banknotlarda PMG bu alanda bilinen kuruluşlardandır.',
      'Kapsül etiketinde paranın tanımı, derecesi ve benzersiz bir sertifika numarası bulunur; bu numara kuruluşun kendi sitesinden doğrulanabilir. Sertifika bağımsız bir görüş ve fiziksel koruma sağlar; ancak gelecekteki değer için bir garanti değildir.',
    ],
  },
  {
    id: 'katalog',
    question: 'Katalog numarası ne işe yarar?',
    paragraphs: [
      'Katalog numarası, bir paranın tipini kısa ve standart bir kodla tanımlar; böylece farklı satıcı ve koleksiyonerler aynı parçadan söz ettiklerinden emin olabilir.',
    ],
    list: [
      'Banknotlarda en yaygın sistem, Standard Catalog of World Paper Money’deki Pick numaralarıdır (ör. “P-120a”; harf ekleri imza veya tarih farklarını gösterir).',
      'Madeni paralarda Standard Catalog of World Coins’teki KM (Krause-Mishler) numaraları yaygındır.',
      'Numaralar ülke bazında verilir; aynı numara farklı ülkelerde farklı paralara karşılık gelir ve katalog baskıları arasında değişebilir.',
    ],
  },
  {
    id: 'yatirim',
    question: 'Koleksiyon paraları bir yatırım aracı mıdır?',
    paragraphs: [
      'Koleksiyon ürünlerinin piyasa değeri talebe ve koşullara göre artabilir veya azalabilir. Bu nedenle parçalar kesin bir getiri beklentisiyle alınmamalıdır. Bu sayfadaki bilgiler genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.',
    ],
  },
];

/** İşletmeye özel sorular — cevaplar store.policies'ten gelir. */
export const faqPolicies = [
  { id: 'kargo', question: 'Siparişler nasıl gönderiliyor?', policy: 'shipping' },
  { id: 'iade', question: 'İade koşulları nelerdir?', policy: 'returns' },
  { id: 'orijinallik', question: 'Ürünlerin orijinalliği nasıl kontrol ediliyor?', policy: 'authenticity' },
];

/** Genel bilgiler için kullanılan kaynaklar. */
export const faqSources = [
  { label: 'PMG — Adjectival grades (banknot derece adları)', url: 'https://www.pmgnotes.com/paper-money-grading/grading-scale/adjectival-grades/' },
  { label: 'PCGS — Grading standards', url: 'https://www.pcgs.com/grades' },
  { label: 'NGC — Coin encapsulation', url: 'https://www.ngccoin.com/coin-grading/grading-process/coin-encapsulation.aspx' },
  { label: 'Numismatic News — The Sheldon coin grading scale', url: 'https://www.numismaticnews.net/collecting-101/the-sheldon-coin-grading-scale' },
  { label: 'Numismatic News — All about Pick numbers', url: 'https://www.numismaticnews.net/all-about-pick-numbers' },
  { label: 'CoinWeek — KM number', url: 'https://coinweek.com/km-number-a-commonly-referred-to-world-coin-reference-number/' },
  { label: 'American Numismatic Association — Collecting 101', url: 'https://www.money.org/collect/' },
  { label: 'CoinWeek — Unintentional ways collectors damage coins', url: 'https://coinweek.com/coins/coin-collecting-strategies-2/tips-for-new-collectors/unintentional-ways-collectors-damage-coins-and-how-to-stop/' },
];
