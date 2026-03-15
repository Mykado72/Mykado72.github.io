// ── Point d'entrée principal ──────────────────────────────
import { charger, onStoreChange } from './store.js';
import { route, navigate, startRouter } from './router.js';
import { renderIndex }      from './pages/index.js';
import { renderEditeListe } from './pages/editeListe.js';
import { renderCourses }    from './pages/courses.js';
import { renderProduits }   from './pages/produits.js';
import { renderStock }      from './pages/stock.js';
import { renderParametres } from './pages/parametres.js';

// ── Layout principal ──────────────────────────────────────

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
          <div class="app-version" id="app-version"></div>
          <div class="app-dedication">Réalisé par<br><strong>Mickael LEHAY</strong><br>pour lui même 💚</div>
        </div>
      </nav>
      <main class="content" id="page-content"></main>
      <nav class="bottom-nav" id="bottom-nav"></nav>
    </div>
  `;

  // Import BuildInfo (version injectée statiquement)
  import('./data.js').then(({ BUILD_VERSION, BUILD_DATE }) => {
    document.getElementById('app-version').textContent = `v${BUILD_VERSION} — ${BUILD_DATE}`;
  });
}

const NAV_ITEMS = [
  { hash: '#/',           label: 'Mes Listes',      icon: '📋', mobileLabel: 'Mes Listes' },
  { hash: '#/produits',   label: 'Produits',         icon: '🏪', mobileLabel: 'Produits' },
  { hash: '#/stock',      label: 'Stock à la maison',icon: '🏠', mobileLabel: 'Stock' },
  { hash: '#/parametres', label: 'Paramètres',       icon: '⚙️', mobileLabel: 'Paramètres' },
];

function updateNav() {
  const current = location.hash || '#/';

  // Sidebar
  const sidebarNav = document.getElementById('sidebar-nav');
  if (sidebarNav) {
    sidebarNav.innerHTML = '';
    NAV_ITEMS.forEach(item => {
      const isActive = current === item.hash || (item.hash !== '#/' && current.startsWith(item.hash));
      const a = document.createElement('a');
      a.href = item.hash;
      a.className = `nav-item${isActive ? ' active' : ''}`;
      a.innerHTML = `<span class="nav-icon">${item.icon}</span><span>${item.label}</span>`;
      sidebarNav.append(a);
    });
  }

  // Bottom nav
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) {
    bottomNav.innerHTML = '';
    NAV_ITEMS.forEach(item => {
      const isActive = current === item.hash || (item.hash !== '#/' && current.startsWith(item.hash));
      const a = document.createElement('a');
      a.href = item.hash;
      a.className = `bottom-nav-item${isActive ? ' active' : ''}`;
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

// ── Routage ───────────────────────────────────────────────

function setPage(renderFn, params = {}) {
  const content = document.getElementById('page-content');
  if (!content) return;
  return renderFn(content, params);
}

// ── Service Worker ───────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// ── Démarrage ─────────────────────────────────────────────

buildLayout();
detectInAppBrowser();

// Écoute les changements de hash pour mettre à jour la nav
window.addEventListener('hashchange', updateNav);
updateNav();

// Déclare les routes
route('#/',                params => setPage(renderIndex,      params));
route('#/liste/:id',       params => setPage(renderEditeListe, params));
route('#/courses/:id',     params => setPage(renderCourses,    params));
route('#/produits',        params => setPage(renderProduits,   params));
route('#/stock',           params => setPage(renderStock,      params));
route('#/parametres',      params => setPage(renderParametres, params));

// Charge les données puis démarre le routeur
charger();
startRouter();
