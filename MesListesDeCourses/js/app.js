// ── Point d'entrée principal ──────────────────────────────
import { charger } from './store.js';
import { route, startRouter } from './router.js';
import { renderIndex }      from './pages/index.js';
import { renderEditeListe } from './pages/editeListe.js';
import { renderCourses }    from './pages/courses.js';
import { renderProduits }   from './pages/produits.js';
import { renderStock }      from './pages/stock.js';
import { renderParametres } from './pages/parametres.js';
import { renderMenu }       from './pages/menu.js';
import { BUILD_VERSION, BUILD_DATE } from './data.js';
import { initTheme, toggleTheme, getCurrentTheme } from './theme.js';

// ── Service Worker ────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// ── Items de navigation ───────────────────────────────────
const NAV_ITEMS = [
  { hash: '#/',           label: 'Mes Listes',       icon: '📋', mobileLabel: 'Mes Listes' },
  { hash: '#/produits',   label: 'Produits',          icon: '🏪', mobileLabel: 'Produits' },
  { hash: '#/stock',      label: 'Stock à la maison', icon: '🏠', mobileLabel: 'Stock' },
  { hash: '#/menu',       label: 'Menu semaine',      icon: '🍽️', mobileLabel: 'Menu' },
  { hash: '#/parametres', label: 'Paramètres',        icon: '⚙️', mobileLabel: 'Paramètres' },
];

// ── Construit le layout HTML ──────────────────────────────
function buildLayout() {
  document.getElementById('app').innerHTML = `
    <div class="app-shell">
      <nav class="sidebar">
        <div class="logo">
          <span class="logo-icon">🛒</span>
          <span class="logo-text">Ma Liste de Courses</span>
        </div>
        <div class="nav-links" id="sidebar-nav"></div>
        <div class="sidebar-footer">
          <div class="app-version">v${BUILD_VERSION} — ${BUILD_DATE}</div>
          <button id="theme-toggle" class="btn-theme-toggle" title="Changer de thème">🌙</button>
          <div class="app-dedication">Réalisé par<br><strong>Mickael LEHAY</strong><br>pour lui même 💚</div>
        </div>
      </nav>
      <main class="content" id="page-content"></main>
      <nav class="bottom-nav" id="bottom-nav"></nav>
    </div>
  `;
}

// ── Met à jour la nav active ──────────────────────────────
function updateNav() {
  const hash = location.hash;
  const current = (!hash || hash === '#') ? '#/' : hash;

  function isActive(item) {
    if (item.hash === '#/') return current === '#/' || current === '' || current === '#';
    return current === item.hash || current.startsWith(item.hash + '/');
  }

  const sidebarNav = document.getElementById('sidebar-nav');
  if (sidebarNav) {
    sidebarNav.innerHTML = '';
    NAV_ITEMS.forEach(item => {
      const a = document.createElement('a');
      a.href = item.hash;
      a.className = `nav-item${isActive(item) ? ' active' : ''}`;
      a.innerHTML = `<span class="nav-icon">${item.icon}</span><span>${item.label}</span>`;
      sidebarNav.append(a);
    });
  }

  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) {
    bottomNav.innerHTML = '';
    NAV_ITEMS.forEach(item => {
      const a = document.createElement('a');
      a.href = item.hash;
      a.className = `bottom-nav-item${isActive(item) ? ' active' : ''}`;
      a.innerHTML = `<span class="bottom-nav-icon">${item.icon}</span><span class="bottom-nav-label">${item.mobileLabel}</span>`;
      bottomNav.append(a);
    });
  }
}

// ── Détection In-App Browser ──────────────────────────────
function detectInAppBrowser() {
  const ua = navigator.userAgent || '';
  const isInApp =
    /FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Snapchat|Twitter|Line\/|MicroMessenger|LinkedIn/i.test(ua) ||
    (/iPhone|iPad|iPod/i.test(ua) && !/Safari/i.test(ua) && !/Chrome/i.test(ua));
  if (!isInApp) return;
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const banner = document.createElement('div');
  banner.className = 'inapp-banner';
  banner.innerHTML = `
    <div class="inapp-banner-content">
      <span class="inapp-icon">⚠️</span>
      <div>
        <strong>Navigateur intégré détecté</strong>
        <div class="inapp-detail">
          ${isIOS
            ? 'Appuyez sur <strong>⋯</strong> puis <em>"Ouvrir dans Safari"</em> pour accéder à vos données.'
            : 'Appuyez sur <strong>⋮</strong> puis <em>"Ouvrir dans Chrome"</em> pour accéder à vos données.'}
        </div>
      </div>
    </div>
    <button class="inapp-close">✕</button>
  `;
  banner.querySelector('.inapp-close').addEventListener('click', () => banner.remove());
  document.body.prepend(banner);
}

// ── Render une page dans #page-content ───────────────────
function setPage(renderFn, params = {}) {
  const content = document.getElementById('page-content');
  if (content) return renderFn(content, params);
}

// ── Initialisation dans DOMContentLoaded ─────────────────
document.addEventListener('DOMContentLoaded', () => {
  // 1. Construit le layout (crée #page-content, #sidebar-nav, #bottom-nav)
  buildLayout();

  // 2. Initialise le thème (avant tout render)
  initTheme();
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const theme = toggleTheme();
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  });
  // Icône initiale
  setTimeout(() => {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = getCurrentTheme() === 'dark' ? '☀️' : '🌙';
  }, 0);

  // 3. Détecte les In-App browsers
  detectInAppBrowser();

  // 3. Met à jour la nav à chaque changement de hash
  window.addEventListener('hashchange', updateNav);
  updateNav();

  // 4. Déclare les routes (patterns sans le #)
  route('/',             params => setPage(renderIndex,      params));
  route('/liste/:id',    params => setPage(renderEditeListe, params));
  route('/courses/:id',  params => setPage(renderCourses,    params));
  route('/produits',     params => setPage(renderProduits,   params));
  route('/stock',        params => setPage(renderStock,      params));
  route('/menu',         params => setPage(renderMenu,       params));
  route('/parametres',   params => setPage(renderParametres, params));

  // 5. Charge les données depuis localStorage
  charger();

  // 6. Démarre le routeur — déclenche le premier render
  startRouter();
});
