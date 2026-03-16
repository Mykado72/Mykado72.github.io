// ── Mode sombre / clair ───────────────────────────────────
// Suit automatiquement la préférence système, avec override manuel
// stocké dans localStorage.

const LS_KEY = 'mldc-theme';

function getPreferred() {
  const stored = localStorage.getItem(LS_KEY);
  if (stored) return stored; // 'dark' | 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  // Met à jour le meta theme-color pour la barre du navigateur mobile
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#1a1a2e' : '#2D6A4F';
}

export function initTheme() {
  apply(getPreferred());

  // Écoute les changements système (ex: passer en mode nuit auto)
  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', e => {
      if (!localStorage.getItem(LS_KEY)) apply(e.matches ? 'dark' : 'light');
    });
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') ?? 'light';
}

export function toggleTheme() {
  const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  localStorage.setItem(LS_KEY, next);
  apply(next);
  return next;
}

export function resetToSystem() {
  localStorage.removeItem(LS_KEY);
  apply(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
