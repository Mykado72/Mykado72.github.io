// ── Historique des courses + suggestions intelligentes ────
// Stocke chaque session de courses terminée dans localStorage.
// Permet d'afficher les tendances et de suggérer les produits fréquents.

const LS_KEY = 'mldc-history';
const MAX_ENTRIES = 50; // garder les 50 dernières sessions

export function chargerHistorique() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  } catch { return []; }
}

function sauvegarderHistorique(history) {
  localStorage.setItem(LS_KEY, JSON.stringify(history.slice(-MAX_ENTRIES)));
}

/**
 * Enregistre une session de courses terminée.
 * @param {string} listeNom
 * @param {Array}  elementsAchetes  - éléments cochés
 * @param {string} listeId
 */
export function enregistrerSession(listeNom, elementsAchetes, listeId = null) {
  const history = chargerHistorique();
  history.push({
    date: new Date().toISOString(),
    listeNom,
    listeId,
    articles: elementsAchetes.map(e => ({
      produitId: e.produitId,
      nom: e.nom,
      emoji: e.emoji,
      categorie: e.categorie,
      quantite: e.quantite,
      unite: e.unite
    }))
  });
  sauvegarderHistorique(history);
}

/**
 * Retourne les produits achetés le plus souvent, triés par fréquence.
 * @param {number} limit
 */
export function getProduitsFréquents(limit = 10) {
  const history = chargerHistorique();
  const counts = {};
  history.forEach(session => {
    session.articles.forEach(a => {
      if (!counts[a.produitId]) {
        counts[a.produitId] = { ...a, count: 0 };
      }
      counts[a.produitId].count++;
    });
  });
  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Retourne les produits achetés lors de la dernière session similaire
 * (même jour de semaine ± quelques jours).
 */
export function getSuggestionsContextuelles(limit = 5) {
  const history = chargerHistorique();
  if (history.length < 2) return [];
  const jourActuel = new Date().getDay();
  // Cherche des sessions passées le même jour de semaine
  const similaires = history.filter(s => new Date(s.date).getDay() === jourActuel);
  if (!similaires.length) return getProduitsFréquents(limit);
  // Compte les articles dans ces sessions similaires
  const counts = {};
  similaires.forEach(session => {
    session.articles.forEach(a => {
      counts[a.produitId] = (counts[a.produitId] ?? { ...a, count: 0 });
      counts[a.produitId].count++;
    });
  });
  return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, limit);
}

/**
 * Statistiques globales pour la page paramètres.
 */
export function getStats() {
  const history = chargerHistorique();
  if (!history.length) return null;
  const totalArticles = history.reduce((s, h) => s + h.articles.length, 0);
  const firstDate = new Date(history[0].date).toLocaleDateString('fr-FR');
  const lastDate  = new Date(history[history.length-1].date).toLocaleDateString('fr-FR');
  return {
    nbSessions: history.length,
    totalArticles,
    firstDate,
    lastDate,
    frequents: getProduitsFréquents(5)
  };
}

export function viderHistorique() {
  localStorage.removeItem(LS_KEY);
}
