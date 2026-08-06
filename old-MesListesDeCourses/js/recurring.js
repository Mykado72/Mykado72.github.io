// ── Listes récurrentes ────────────────────────────────────
// Permet de marquer une liste comme récurrente (hebdo, bimensuel, mensuel)
// et de la réinitialiser automatiquement à chaque nouvelle période.

const LS_KEY = 'mldc-recurring';

const PERIODES = {
  hebdo:       { label: 'Chaque semaine',      jours: 7  },
  bimensuel:   { label: 'Toutes les 2 semaines', jours: 14 },
  mensuel:     { label: 'Chaque mois',         jours: 30 },
};

export function getPeriodes() { return PERIODES; }

export function chargerRecurrences() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}');
  } catch { return {}; }
}

function sauvegarder(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export function getRecurrence(listeId) {
  return chargerRecurrences()[listeId] ?? null;
}

export function setRecurrence(listeId, periode) {
  const data = chargerRecurrences();
  if (!periode) {
    delete data[listeId];
  } else {
    data[listeId] = { periode, derniereReinit: new Date().toISOString() };
  }
  sauvegarder(data);
}

/**
 * Vérifie si une liste récurrente doit être réinitialisée.
 * Appelé au démarrage et après chaque session de courses.
 * @param {Function} reinitFn - function(listeId) qui décoche tout
 */
export function verifierEcheances(listes, reinitFn) {
  const data = chargerRecurrences();
  const maintenant = new Date();
  let changed = false;

  Object.entries(data).forEach(([listeId, rec]) => {
    // Vérifie que la liste existe encore
    if (!listes.find(l => l.id === listeId)) {
      delete data[listeId]; changed = true; return;
    }
    const periode = PERIODES[rec.periode];
    if (!periode) return;
    const dernier = new Date(rec.derniereReinit);
    const diffJours = (maintenant - dernier) / (1000 * 60 * 60 * 24);
    if (diffJours >= periode.jours) {
      reinitFn(listeId);
      data[listeId].derniereReinit = maintenant.toISOString();
      changed = true;
    }
  });

  if (changed) sauvegarder(data);
}

export function supprimerRecurrence(listeId) {
  const data = chargerRecurrences();
  delete data[listeId];
  sauvegarder(data);
}
