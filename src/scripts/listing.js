/**
 * Mağaza listeleme etkileşimleri: arama, filtre, sıralama, mobil filtre
 * paneli. Durum URL sorgu parametrelerinde tutulur:
 *   ?q=&kategori=a,b&ulke=&donem=&yil-min=&yil-max=&stokta=1&sirala=artan
 */
import { normalizeTr } from '../lib/text.js';

const MULTI = ['kategori', 'ulke', 'donem'];
const MOBILE = window.matchMedia('(max-width: 899px)');

export function initListing(root) {
  const $ = (s) => root.querySelector(s);
  const $$ = (s) => [...root.querySelectorAll(s)];

  const form = $('[data-filter-form]');
  const qInput = $('[data-q]');
  const sortSelect = $('[data-sort]');
  const grid = $('[data-grid]');
  const cards = $$('[data-product]');
  const countEl = $('[data-count]');
  const chipsEl = $('[data-chips]');
  const clearBtn = $('[data-clear]');
  const emptyEl = $('[data-empty]');
  const panel = $('[data-filters]');
  const openBtn = $('[data-filters-open]');
  const backdrop = $('[data-filters-backdrop]');
  const applyLabel = $('[data-apply-label]');
  const filterCount = $('[data-filter-count]');

  /* --- Durum ↔ kontroller ↔ URL ------------------------------------------ */

  function readControls() {
    const state = { q: qInput.value.trim(), sirala: sortSelect.value };
    for (const name of MULTI) {
      state[name] = $$(`input[name="${name}"]:checked`).map((i) => i.value);
    }
    state.yilMin = parseInt(form.elements['yil-min']?.value, 10) || null;
    state.yilMax = parseInt(form.elements['yil-max']?.value, 10) || null;
    state.stokta = Boolean(form.elements.stokta?.checked);
    return state;
  }

  function writeControls(state) {
    qInput.value = state.q ?? '';
    sortSelect.value = state.sirala || 'yeni';
    for (const name of MULTI) {
      $$(`input[name="${name}"]`).forEach((i) => (i.checked = state[name]?.includes(i.value) ?? false));
    }
    if (form.elements['yil-min']) form.elements['yil-min'].value = state.yilMin ?? '';
    if (form.elements['yil-max']) form.elements['yil-max'].value = state.yilMax ?? '';
    if (form.elements.stokta) form.elements.stokta.checked = Boolean(state.stokta);
  }

  function stateFromUrl() {
    const p = new URLSearchParams(location.search);
    const list = (k) => (p.get(k) ? p.get(k).split(',').filter(Boolean) : []);
    return {
      q: p.get('q') ?? '',
      sirala: ['yeni', 'artan', 'azalan'].includes(p.get('sirala')) ? p.get('sirala') : 'yeni',
      kategori: list('kategori'),
      ulke: list('ulke'),
      donem: list('donem'),
      yilMin: parseInt(p.get('yil-min'), 10) || null,
      yilMax: parseInt(p.get('yil-max'), 10) || null,
      stokta: p.get('stokta') === '1',
    };
  }

  function syncUrl(state) {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    for (const name of MULTI) if (state[name].length) p.set(name, state[name].join(','));
    if (state.yilMin) p.set('yil-min', state.yilMin);
    if (state.yilMax) p.set('yil-max', state.yilMax);
    if (state.stokta) p.set('stokta', '1');
    if (state.sirala !== 'yeni') p.set('sirala', state.sirala);
    const qs = p.toString();
    history.replaceState(history.state, '', `${location.pathname}${qs ? `?${qs}` : ''}`);
  }

  /* --- Filtreleme ve sıralama ------------------------------------------- */

  function matches(card, state, terms) {
    const d = card.dataset;
    if (terms.length && !terms.every((t) => d.search.includes(t))) return false;
    if (state.kategori.length && !state.kategori.includes(d.category)) return false;
    if (state.ulke.length && !state.ulke.includes(d.country)) return false;
    if (state.donem.length && !state.donem.includes(d.period)) return false;
    if (state.yilMin || state.yilMax) {
      const y = parseInt(d.year, 10);
      if (!y) return false;
      if (state.yilMin && y < state.yilMin) return false;
      if (state.yilMax && y > state.yilMax) return false;
    }
    if (state.stokta && d.available !== 'true') return false;
    return true;
  }

  const sorters = {
    yeni: (a, b) => b.dataset.created.localeCompare(a.dataset.created),
    artan: (a, b) => Number(a.dataset.price) - Number(b.dataset.price),
    azalan: (a, b) => Number(b.dataset.price) - Number(a.dataset.price),
  };

  function activeFilters(state) {
    const items = [];
    if (state.q) items.push({ label: `Arama: “${state.q}”`, clear: () => (qInput.value = '') });
    for (const name of MULTI) {
      for (const value of state[name]) {
        const input = $$(`input[name="${name}"]`).find((i) => i.value === value);
        if (!input) continue;
        items.push({ label: input.dataset.label, clear: () => (input.checked = false) });
      }
    }
    if (state.yilMin || state.yilMax) {
      const label = `Yıl: ${state.yilMin ?? '…'} – ${state.yilMax ?? '…'}`;
      items.push({
        label,
        clear: () => {
          form.elements['yil-min'].value = '';
          form.elements['yil-max'].value = '';
        },
      });
    }
    if (state.stokta) items.push({ label: 'Yalnızca satıştakiler', clear: () => (form.elements.stokta.checked = false) });
    return items;
  }

  function renderChips(items) {
    chipsEl.replaceChildren(
      ...items.map((item) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML = `<span></span><span aria-hidden="true">✕</span>`;
        btn.firstChild.textContent = item.label;
        btn.setAttribute('aria-label', `${item.label} filtresini kaldır`);
        btn.addEventListener('click', () => {
          item.clear();
          update();
          (chipsEl.querySelector('button') ?? qInput).focus();
        });
        li.append(btn);
        return li;
      }),
    );
  }

  function update({ updateUrl = true } = {}) {
    const state = readControls();
    const terms = normalizeTr(state.q).split(' ').filter(Boolean);

    const visible = cards.filter((card) => {
      const ok = matches(card, state, terms);
      card.hidden = !ok;
      return ok;
    });

    [...cards].sort(sorters[state.sirala]).forEach((card) => grid.append(card));

    const n = visible.length;
    countEl.textContent = n === cards.length && !terms.length ? `${n} ürün` : `${n} ürün bulundu`;
    emptyEl.hidden = n > 0;
    grid.hidden = n === 0;
    if (applyLabel) applyLabel.textContent = n ? `${n} sonucu göster` : 'Sonuç yok';

    const active = activeFilters(state);
    renderChips(active);
    clearBtn.hidden = active.length === 0;
    const panelFilters = active.filter((a) => !a.label.startsWith('Arama')).length;
    filterCount.hidden = panelFilters === 0;
    filterCount.textContent = String(panelFilters);

    if (updateUrl) syncUrl(state);
  }

  function clearAll() {
    writeControls({ q: '', sirala: sortSelect.value, kategori: [], ulke: [], donem: [], stokta: false });
    update();
  }

  /* --- Mobil filtre paneli ---------------------------------------------- */

  function setPanel(open) {
    panel.classList.toggle('is-open', open);
    openBtn.setAttribute('aria-expanded', String(open));
    backdrop.hidden = !open;
    document.body.classList.toggle('is-locked', open);
    if (open) {
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.querySelector('[data-filters-close]').focus();
    } else {
      panel.removeAttribute('role');
      panel.removeAttribute('aria-modal');
      openBtn.focus();
    }
  }

  function trapFocus(e) {
    if (!panel.classList.contains('is-open') || e.key !== 'Tab') return;
    const focusable = [...panel.querySelectorAll('button, input, select, [href]')].filter((el) => !el.disabled && el.offsetParent);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* --- Olaylar ---------------------------------------------------------- */

  let qTimer;
  qInput.addEventListener('input', () => {
    clearTimeout(qTimer);
    qTimer = setTimeout(update, 150);
  });
  sortSelect.addEventListener('change', () => update());
  form.addEventListener('change', () => update());
  form.addEventListener('input', (e) => {
    if (e.target.type === 'number') update();
  });
  clearBtn.addEventListener('click', clearAll);
  $('[data-clear-empty]').addEventListener('click', clearAll);
  $('[data-clear-panel]').addEventListener('click', clearAll);

  openBtn.addEventListener('click', () => setPanel(true));
  $('[data-filters-close]').addEventListener('click', () => setPanel(false));
  $('[data-filters-apply]').addEventListener('click', () => setPanel(false));
  backdrop.addEventListener('click', () => setPanel(false));
  panel.addEventListener('keydown', trapFocus);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) setPanel(false);
  });
  MOBILE.addEventListener('change', () => {
    if (!MOBILE.matches && panel.classList.contains('is-open')) setPanel(false);
  });

  // Sayfa açılışında URL'deki durumu uygula (arama sayfasından gelme, geri dönme)
  writeControls(stateFromUrl());
  update({ updateUrl: false });
}
