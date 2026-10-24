/**
 * Ürün galerisi etkileşimleri. Fare, dokunmatik ve klavye ile çalışır;
 * hiçbir işlev yalnızca üzerine gelmeye (hover) bağlı değildir.
 */
export function initGallery(root) {
  const images = JSON.parse(root.dataset.images);
  const mainImg = root.querySelector('[data-main]');
  const mainLabel = root.querySelector('[data-main-label]');
  const thumbs = [...root.querySelectorAll('[data-thumb]')];
  const viewer = root.querySelector('[data-viewer]');
  const canvas = viewer.querySelector('[data-canvas]');
  const viewerImg = viewer.querySelector('[data-viewer-img]');
  const counter = viewer.querySelector('[data-counter]');
  const zoomBtn = viewer.querySelector('[data-zoom]');
  const zoomLabel = viewer.querySelector('[data-zoom-label]');
  let index = 0;
  let zoomed = false;

  function show(i) {
    index = (i + images.length) % images.length;
    const img = images[index];
    mainImg.src = img.url;
    mainImg.alt = img.alt;
    mainImg.removeAttribute('srcset');
    mainLabel.textContent = `Tam ekran incele: ${img.label}`;
    thumbs.forEach((t, n) => t.setAttribute('aria-pressed', String(n === index)));
    if (viewer.open) renderViewer();
  }

  function renderViewer() {
    const img = images[index];
    setZoom(false);
    viewerImg.src = img.url;
    viewerImg.alt = img.alt;
    counter.textContent = `${index + 1} / ${images.length} · ${img.label}`;
  }

  function setZoom(on, focus) {
    zoomed = on;
    canvas.classList.toggle('is-zoomed', on);
    zoomBtn.setAttribute('aria-pressed', String(on));
    zoomLabel.textContent = on ? 'Uzaklaştır' : 'Yakınlaştır';
    if (on) {
      const w = Math.max(canvas.clientWidth * 2, 1200);
      canvas.style.setProperty('--zoom-w', `${w}px`);
      requestAnimationFrame(() => {
        const ratio = w / (images[index].width || w);
        const h = (images[index].height || w) * ratio;
        const fx = focus?.x ?? 0.5;
        const fy = focus?.y ?? 0.5;
        canvas.scrollLeft = w * fx - canvas.clientWidth / 2;
        canvas.scrollTop = h * fy - canvas.clientHeight / 2;
      });
    }
  }

  function open() {
    viewer.showModal();
    document.body.classList.add('is-locked');
    renderViewer();
  }

  viewer.addEventListener('close', () => {
    document.body.classList.remove('is-locked');
    setZoom(false);
  });

  root.querySelector('[data-open-viewer]').addEventListener('click', open);
  thumbs.forEach((t) => t.addEventListener('click', () => show(Number(t.dataset.thumb))));
  viewer.querySelector('[data-close]').addEventListener('click', () => viewer.close());
  viewer.querySelector('[data-prev]')?.addEventListener('click', () => show(index - 1));
  viewer.querySelector('[data-next]')?.addEventListener('click', () => show(index + 1));
  zoomBtn.addEventListener('click', () => setZoom(!zoomed));

  // Görsele tıklayınca tıklanan noktaya yakınlaş
  let dragged = false;
  viewerImg.addEventListener('click', (e) => {
    if (dragged) return;
    if (zoomed) return setZoom(false);
    const r = viewerImg.getBoundingClientRect();
    setZoom(true, { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
  });

  // Fareyle sürükleyerek kaydırma (dokunmatikte doğal kaydırma kullanılır)
  let start = null;
  canvas.addEventListener('pointerdown', (e) => {
    if (!zoomed || e.pointerType !== 'mouse') return;
    dragged = false;
    start = { x: e.clientX, y: e.clientY, left: canvas.scrollLeft, top: canvas.scrollTop };
    canvas.classList.add('is-dragging');
  });
  window.addEventListener('pointermove', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) dragged = true;
    canvas.scrollLeft = start.left - dx;
    canvas.scrollTop = start.top - dy;
  });
  window.addEventListener('pointerup', () => {
    start = null;
    canvas.classList.remove('is-dragging');
    setTimeout(() => (dragged = false), 0);
  });

  viewer.addEventListener('keydown', (e) => {
    if (zoomed) {
      if (e.key === '-' || e.key === '0') setZoom(false);
      return; // ok tuşları odaklı alanı kaydırır
    }
    if (e.key === 'ArrowRight') show(index + 1);
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === '+') setZoom(true);
  });
}
