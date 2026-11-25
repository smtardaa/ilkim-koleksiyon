/**
 * Mobil kategori slider'ı: her görünümde 3 kare, oklarla üçlü grup ilerler, iki yönde sonsuz döngü.
 *
 * Döngü için gerçek kart listesinin bir kopyası başa, bir kopyası sona eklenir. Kopyalar
 * yalnızca görseldir: `inert` + `aria-hidden` (ekran okuyucu ve klavye için yok sayılır),
 * id taşımaz ve yeni kategori verisi oluşturmaz. Kaydırma kopya bölgesine girdiğinde konum,
 * gerçek listedeki aynı noktaya animasyonsuz taşınır. Masaüstünde (ızgara) kopyalar gizlidir.
 * Otomatik oynatma yoktur.
 */
const MOBILE = matchMedia('(max-width: 760px)');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

function initCarousel(root) {
  const track = root.querySelector('[data-cat-track]');
  const prev = root.querySelector('[data-cat-prev]');
  const next = root.querySelector('[data-cat-next]');
  if (!track || !prev || !next) return;
  const real = [...track.children];
  const n = real.length;
  if (n < 4) return;

  const makeClone = (li) => {
    const c = li.cloneNode(true);
    c.classList.add('is-clone');
    c.setAttribute('aria-hidden', 'true');
    c.inert = true;
    c.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    return c;
  };
  track.prepend(...real.map(makeClone));
  track.append(...real.map(makeClone));

  // Kart genişliği kesirli olabilir; konumlar tek tek kartlardan okunur (yuvarlama birikmez).
  const posOf = (i) => track.children[i].offsetLeft - track.children[0].offsetLeft;
  const setWidth = () => posOf(2 * n) - posOf(n);
  const realStart = () => posOf(n);
  const total = 3 * n;
  /** Şu an başta duran kartın sırası (0…3n-1) */
  const indexAt = (x) => Math.round(x / (setWidth() / n));

  /** Kopya bölgesindeyse aynı görsel konuma, gerçek listeye taşı (animasyonsuz). */
  function normalize() {
    if (!MOBILE.matches) return;
    const w = setWidth();
    const start = realStart();
    let x = track.scrollLeft;
    if (x < start - 1) x += w;
    else if (x >= start + w - 1) x -= w;
    else return;
    track.style.scrollSnapType = 'none';
    track.scrollLeft = x;
    // Bir sonraki karede yakalamayı geri aç (taşıma sırasında sıçramayı önler)
    requestAnimationFrame(() => { track.style.scrollSnapType = ''; });
  }

  function reset() {
    if (!MOBILE.matches) return;
    track.style.scrollSnapType = 'none';
    track.scrollLeft = realStart();
    requestAnimationFrame(() => { track.style.scrollSnapType = ''; });
  }

  /**
   * Animasyon sürerken art arda basılan oklar kaybolmasın diye hedef hatırlanır:
   * yeni basış, yarıda kalan konumdan değil bekleyen hedeften devam eder.
   */
  let pending = null;
  let pendingTimer;
  const clearPending = () => { pending = null; clearTimeout(pendingTimer); };

  function go(dir) {
    let base;
    if (pending !== null) base = pending;
    else {
      normalize();
      // Üçlü gruba hizalı başlangıç: elle yarım bırakılmış kaydırmalar da grup sınırına oturur
      base = Math.round(indexAt(track.scrollLeft) / 3) * 3;
    }
    const index = Math.max(0, Math.min(total - 3, base + dir * 3));
    const target = posOf(index);
    if (Math.abs(target - track.scrollLeft) < 1) { clearPending(); normalize(); return; }
    const smooth = !reduceMotion.matches;
    if (smooth) {
      pending = index;
      clearTimeout(pendingTimer);
      pendingTimer = setTimeout(() => { clearPending(); normalize(); }, 1500); // scrollend gelmezse güvenlik
    }
    track.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'auto' });
  }

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  // Parmakla kaydırma başlarsa bekleyen ok hedefi geçersizdir
  track.addEventListener('pointerdown', clearPending, { passive: true });
  track.addEventListener('touchstart', clearPending, { passive: true });

  const settle = () => { clearPending(); normalize(); };
  let timer;
  const onSettle = () => { clearTimeout(timer); timer = setTimeout(settle, 120); };
  if ('onscrollend' in window) track.addEventListener('scrollend', settle);
  else track.addEventListener('scroll', onSettle, { passive: true });

  MOBILE.addEventListener('change', reset);
  window.addEventListener('resize', () => { if (MOBILE.matches) normalize(); });
  reset();
}

document.querySelectorAll('[data-cat-carousel]').forEach(initCarousel);
