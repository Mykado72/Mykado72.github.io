// ── Routeur SPA minimal basé sur le hash ──────────────────
// Routes : #/  #/liste/:id  #/courses/:id  #/produits  #/stock  #/parametres

const _routes = [];
let _currentCleanup = null;

export function route(pattern, handler) {
  _routes.push({ pattern, handler });
}

function matchRoute(hash) {
  const path = hash.replace(/^#/, '') || '/';
  for (const r of _routes) {
    const keys = [];
    const regexStr = r.pattern.replace(/:([^/]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; });
    const match = path.match(new RegExp(`^${regexStr}$`));
    if (match) {
      const params = {};
      keys.forEach((k, i) => params[k] = decodeURIComponent(match[i + 1]));
      return { handler: r.handler, params };
    }
  }
  return null;
}

function dispatch() {
  if (_currentCleanup) { _currentCleanup(); _currentCleanup = null; }
  const hash = location.hash || '#/';
  const matched = matchRoute(hash);
  if (matched) {
    const cleanup = matched.handler(matched.params);
    if (typeof cleanup === 'function') _currentCleanup = cleanup;
  }
}

export function navigate(path) {
  location.hash = path;
}

export function startRouter() {
  window.addEventListener('hashchange', dispatch);
  dispatch(); // render initial route
}
