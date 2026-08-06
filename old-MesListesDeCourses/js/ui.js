// ── Helpers UI partagés ───────────────────────────────────

// Crée un élément HTML avec classes et attributs
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'disabled') { if (v) el.disabled = true; }   // boolean : ne set que si true
    else if (k === 'checked')  { el.checked = !!v; }
    else if (k === 'selected') { el.selected = !!v; }
    else if (k === 'open')     { if (v) el.setAttribute('open', ''); }
    else if (v !== false && v !== null && v !== undefined) el.setAttribute(k, v);
  }
  for (const child of children.flat()) {
    if (child == null) continue;
    el.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return el;
}

// Vide et remplit un conteneur
export function render(container, ...nodes) {
  container.innerHTML = '';
  nodes.flat().filter(Boolean).forEach(n => container.append(n));
}

// ── Modal ─────────────────────────────────────────────────

let _activeModal = null;

export function openModal(contentFn, opts = {}) {
  closeModal();
  const overlay = h('div', { class: 'modal-overlay' + (opts.top ? ' modal-top' : '') });
  const box     = h('div', { class: 'modal' + (opts.small ? ' modal-small' : '') });
  overlay.append(box);
  if (!opts.noBackdropClose) overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.body.append(overlay);
  _activeModal = overlay;
  const result = contentFn(box, closeModal);
  return { overlay, box, close: closeModal };
}

export function closeModal() {
  if (_activeModal) { _activeModal.remove(); _activeModal = null; }
}

// ── Toast ─────────────────────────────────────────────────

export function toast(msg, type = 'ok', duration = 3000) {
  const t = h('div', { class: `toast toast-${type}` }, msg);
  document.body.append(t);
  requestAnimationFrame(() => t.classList.add('toast-visible'));
  setTimeout(() => { t.classList.remove('toast-visible'); setTimeout(() => t.remove(), 300); }, duration);
}

// ── Formatage ─────────────────────────────────────────────

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR');
}

// ── Category filter bar ───────────────────────────────────

import { CATEGORIES, getCatEmoji } from './data.js';

export function buildCategoryFilters(container, getCurrent, onSelect, countFn) {
  function refresh() {
    const current = getCurrent();
    render(container,
      h('button', { class: `filter-btn${current === '' ? ' active' : ''}`, onclick: () => { onSelect(''); refresh(); } }, 'Tout'),
      ...Object.keys(CATEGORIES).map(cat => {
        const cnt = countFn ? countFn(cat) : 1;
        if (cnt <= 0) return null;
        return h('button', {
          class: `filter-btn${current === cat ? ' active' : ''}`,
          onclick: () => { onSelect(cat); refresh(); }
        }, getCatEmoji(cat), ' ', cat);
      }).filter(Boolean)
    );
  }
  refresh();
  return refresh;
}
