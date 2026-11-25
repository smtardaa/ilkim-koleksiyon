/**
 * Yönetim paneli 1. sayfa davranışları:
 * ürün penceresi (yeni/düzenle, görseller, gönderim), ürün ve ülke filtreleri, silme onayları.
 */
const data = JSON.parse(document.getElementById('adm-data')?.textContent || '{}');
const products = new Map((data.products ?? []).map((p) => [p.id, p]));
const foreign = new Set(data.foreign ?? []);
const MAX = data.maxImages ?? 12;

/* ---------------------------------------------------------- Silme onayı */
document.querySelectorAll('form[data-confirm]').forEach((f) => {
  f.addEventListener('submit', (e) => { if (!confirm(f.dataset.confirm)) e.preventDefault(); });
});

/* ------------------------------------------------------- Ürün filtreleri */
const fText = document.querySelector('[data-filter-text]');
const fCat = document.querySelector('[data-filter-cat]');
const fStatus = document.querySelector('[data-filter-status]');
const rows = [...document.querySelectorAll('.adm-product')];
function filterProducts() {
  const q = (fText?.value ?? '').trim().toLocaleLowerCase('tr');
  const cat = fCat?.value ?? '';
  const st = fStatus?.value ?? '';
  let shown = 0;
  rows.forEach((r) => {
    const ok = (!q || r.dataset.text.includes(q)) && (!cat || r.dataset.cat === cat)
      && (!st || (st === 'hidden' ? r.dataset.live === '0' : r.dataset.status === st));
    r.hidden = !ok;
    if (ok) shown++;
  });
  const c = document.querySelector('[data-filter-count]');
  if (c) c.textContent = `${shown} ürün gösteriliyor`;
  const empty = document.querySelector('[data-filter-empty]');
  if (empty) empty.hidden = shown > 0;
}
[fText, fCat, fStatus].forEach((el) => el?.addEventListener('input', filterProducts));

/* -------------------------------------------------------- Ülke filtresi */
const cFilter = document.querySelector('[data-country-filter]');
cFilter?.addEventListener('input', () => {
  const q = cFilter.value.trim().toLocaleLowerCase('tr');
  document.querySelectorAll('[data-country-list] li').forEach((li) => { li.hidden = q && !li.dataset.name.includes(q); });
});

/* --------------------------------------------------------- Ürün penceresi */
const dlg = document.getElementById('product-dialog');
const form = dlg?.querySelector('[data-product-form]');
if (dlg && form) {
  const title = dlg.querySelector('[data-pd-title]');
  const errBox = dlg.querySelector('[data-pd-errors]');
  const imgList = dlg.querySelector('[data-pd-images]');
  const fileInput = dlg.querySelector('[data-pd-files]');
  const filesInfo = dlg.querySelector('[data-pd-files-info]');
  const catSel = dlg.querySelector('[data-pd-cat]');
  const countrySel = dlg.querySelector('[data-pd-country]');
  const countryReq = dlg.querySelector('[data-pd-country-req]');
  const submit = dlg.querySelector('[data-pd-submit]');
  let opener = null;
  let dirty = false;

  const syncCountry = () => {
    const req = foreign.has(catSel.value);
    countrySel.required = req;
    countryReq.hidden = !req;
  };
  catSel.addEventListener('change', syncCountry);

  function clearErrors() {
    errBox.hidden = true;
    errBox.textContent = '';
    form.querySelectorAll('[data-err]').forEach((p) => { p.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  }

  function showErrors(errors, general) {
    clearErrors();
    const msgs = [];
    for (const [k, msg] of Object.entries(errors ?? {})) {
      const slot = form.querySelector(`[data-err="${k}"]`);
      if (slot) slot.textContent = msg;
      const field = form.elements.namedItem(k);
      if (field && field.setAttribute) field.setAttribute('aria-invalid', 'true');
      // Kapalı bölümdeki hata görünsün
      slot?.closest('details')?.setAttribute('open', '');
      msgs.push(msg);
    }
    if (general) msgs.unshift(general);
    if (msgs.length) {
      errBox.innerHTML = `<strong>Kaydedilmedi.</strong> ${msgs.length > 1 ? 'Şunları düzeltin:' : ''}`;
      const ul = document.createElement('ul');
      msgs.forEach((m) => { const li = document.createElement('li'); li.textContent = m; ul.append(li); });
      errBox.append(ul);
      errBox.hidden = false;
      errBox.scrollIntoView({ block: 'nearest' });
    }
  }

  /* Görseller: mevcutlar (sıralanabilir, kaldırılabilir) + yeni seçilenler (önizleme) */
  let newFiles = [];
  function imageItem({ src, alt, isNew, file }) {
    const li = document.createElement('li');
    li.className = 'adm-image';
    const img = document.createElement('img');
    img.alt = '';
    img.width = 88; img.height = 88;
    img.src = isNew ? URL.createObjectURL(file) : src;
    const body = document.createElement('div');
    body.className = 'adm-image-body';
    if (isNew) {
      li.dataset.new = '1';
      body.innerHTML = `<span class="adm-badge adm-badge--new">Yeni</span> <span class="adm-hint"></span>`;
      body.querySelector('.adm-hint').textContent = file.name;
      li._file = file;
    } else {
      const keep = document.createElement('input');
      keep.type = 'hidden'; keep.name = 'mevcutGorsel'; keep.value = src;
      const lab = document.createElement('label');
      lab.className = 'adm-hint';
      lab.textContent = 'Görsel açıklaması (görme engelliler için)';
      const altIn = document.createElement('input');
      altIn.className = 'adm-input adm-input--sm';
      altIn.name = 'mevcutAlt'; altIn.value = alt ?? ''; altIn.maxLength = 200;
      lab.append(altIn);
      body.append(keep, lab);
    }
    const tools = document.createElement('div');
    tools.className = 'adm-image-tools';
    tools.innerHTML = `
      <button type="button" class="adm-icon-btn" data-move="-1" aria-label="Öne al">↑</button>
      <button type="button" class="adm-icon-btn" data-move="1" aria-label="Geri al">↓</button>
      <button type="button" class="adm-icon-btn adm-icon-btn--danger" data-remove aria-label="Görseli kaldır">✕</button>`;
    li.append(img, body, tools);
    return li;
  }
  function renumber() {
    imgList.querySelectorAll('.adm-image').forEach((li, i) => li.classList.toggle('is-first', i === 0));
    const n = imgList.children.length;
    filesInfo.textContent = n ? `${n} / ${MAX} görsel` : 'Henüz görsel yok.';
  }
  imgList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const li = btn.closest('.adm-image');
    dirty = true;
    if (btn.hasAttribute('data-remove')) li.remove();
    else if (btn.dataset.move === '-1' && li.previousElementSibling) li.previousElementSibling.before(li);
    else if (btn.dataset.move === '1' && li.nextElementSibling) li.nextElementSibling.after(li);
    renumber();
  });
  fileInput.addEventListener('change', () => {
    const room = MAX - imgList.children.length;
    const picked = [...fileInput.files];
    picked.slice(0, Math.max(0, room)).forEach((file) => imgList.append(imageItem({ isNew: true, file })));
    if (picked.length > room) showErrors({ images: `En fazla ${MAX} görsel eklenebilir; ${picked.length - room} görsel eklenmedi.` });
    fileInput.value = '';
    dirty = true;
    renumber();
  });

  function setValue(name, value) {
    const els = form.querySelectorAll(`[name="${name}"]`);
    els.forEach((el) => {
      if (el.type === 'checkbox') el.checked = Array.isArray(value) ? value.includes(el.value) : Boolean(value);
      else if (el.type === 'radio') el.checked = el.value === String(value);
      else el.value = value ?? '';
    });
  }

  function open(product, trigger) {
    opener = trigger;
    form.reset();
    clearErrors();
    imgList.replaceChildren();
    form.querySelectorAll('details').forEach((d) => d.removeAttribute('open'));
    if (product) {
      title.textContent = `Ürünü düzenle: ${product.title}`;
      for (const [k, v] of Object.entries(product)) if (k !== 'images') setValue(k, v);
      product.images.forEach((im) => imgList.append(imageItem(im)));
      // Dolu özellik varsa o bölüm açık gelsin
      const specKeys = ['kind', 'yearFrom', 'denominationValue', 'emission', 'ruler', 'period', 'condition', 'catalogNumber', 'certService', 'metal'];
      if (specKeys.some((k) => product[k] !== '' && product[k] != null)) form.querySelectorAll('details')[0].setAttribute('open', '');
    } else {
      title.textContent = 'Yeni ürün';
      setValue('id', '');
    }
    syncCountry();
    renumber();
    dirty = false;
    dlg.showModal();
    form.querySelector('#pd-name').focus();
  }

  function close() {
    if (dirty && !confirm('Kaydedilmemiş değişiklikler kaybolacak. Pencere kapatılsın mı?')) return;
    dirty = false;
    dlg.close();
  }
  dlg.addEventListener('close', () => opener?.focus());
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dlg.querySelectorAll('[data-pd-close]').forEach((b) => b.addEventListener('click', close));
  form.addEventListener('input', () => { dirty = true; });

  document.querySelectorAll('[data-product-new]').forEach((b) => b.addEventListener('click', () => open(null, b)));
  document.querySelectorAll('[data-product-edit]').forEach((b) => b.addEventListener('click', () => open(products.get(b.dataset.productEdit), b)));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Tarayıcı içi zorunlu alan kontrolü (sunucu yine de doğrular)
    const missing = {};
    if (!form.elements.namedItem('title').value.trim()) missing.title = 'Ürün adı zorunludur.';
    if (!form.elements.namedItem('price').value.trim()) missing.price = 'Fiyat zorunludur.';
    if (!catSel.value) missing.category = 'Bir kategori seçin.';
    if (countrySel.required && !countrySel.value) missing.country = 'Bu kategoride ülke seçimi zorunludur.';
    if (Object.keys(missing).length) { showErrors(missing); return; }

    const fd = new FormData(form);
    fd.delete('yeniGorsel');
    imgList.querySelectorAll('.adm-image[data-new]').forEach((li) => fd.append('yeniGorsel', li._file, li._file.name));
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    const label = submit.innerHTML;
    submit.textContent = 'Kaydediliyor…';
    try {
      const res = await fetch('/yonetim/urun-kaydet', { method: 'POST', body: fd, credentials: 'same-origin' });
      const out = await res.json().catch(() => ({ ok: false, error: `Sunucu hatası (${res.status}).` }));
      if (out.ok) { dirty = false; location.href = out.redirect; return; }
      if (res.status === 401) { showErrors({}, out.error); setTimeout(() => { location.href = '/yonetim/giris'; }, 1500); return; }
      showErrors(out.errors, out.error);
    } catch {
      showErrors({}, 'Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.');
    } finally {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
      submit.innerHTML = label;
    }
  });
}
