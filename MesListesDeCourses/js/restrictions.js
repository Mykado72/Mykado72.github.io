// ── Restrictions alimentaires ─────────────────────────────
// Profils prédéfinis + ingrédients interdits personnalisés

const LS_KEY = 'mldc-restrictions';

// Profils prédéfinis avec les ingrédients/catégories exclus
export const PROFILS = [
  {
    id: 'halal',
    label: 'Halal',
    emoji: '☪️',
    description: 'Exclut le porc et l\'alcool',
    ingredientsExclus: [
      'Lardons','Jambon blanc','Jambon de pays','Côtes de porc','Rôti de porc',
      'Saucisses','Chipolatas','Saucisson sec','Rosette','Boudin noir',
      'Mortadelle','Bacon','Knacks','Chorizo','Pâté de campagne','Rillettes',
      'Andouillette','Merguez de porc',
      'Vin rouge','Vin blanc sec','Champagne','Bière blonde',
      'Boeuf bourguignon', // contient du vin
    ],
    motsClesExclus: ['porc','cochon','jambon','lard','bacon','vin','alcool','bière','cidre'],
  },
  {
    id: 'casher',
    label: 'Casher',
    emoji: '✡️',
    description: 'Exclut le porc, les crustacés et le mélange viande/lait',
    ingredientsExclus: [
      'Lardons','Jambon blanc','Jambon de pays','Côtes de porc','Rôti de porc',
      'Saucisses','Chipolatas','Saucisson sec','Rosette','Boudin noir',
      'Mortadelle','Bacon','Knacks','Chorizo','Pâté de campagne','Rillettes',
      'Crevettes','Moules','Coquilles Saint-Jacques',
    ],
    motsClesExclus: ['porc','cochon','jambon','lard','crustacé','crevette','moule','huître','crabe','homard'],
  },
  {
    id: 'vegetarien',
    label: 'Végétarien',
    emoji: '🌿',
    description: 'Exclut la viande et le poisson',
    ingredientsExclus: [
      'Poulet entier','Escalopes de poulet','Steaks hachés','Filet de boeuf',
      'Côtes de porc','Rôti de veau','Lapin','Canard','Dinde','Sauté de porc',
      'Saumon','Cabillaud','Moules','Crevettes','Merlan','Lieu noir','Truite',
      'Thon en boîte','Sardines en boîte','Coquilles Saint-Jacques','Filet de sole',
      'Lardons','Jambon blanc','Jambon de pays','Chorizo','Bacon','Saucisses',
      'Chipolatas','Merguez','Saucisson sec','Boudin noir',
    ],
    motsClesExclus: ['poulet','boeuf','porc','veau','agneau','canard','lapin','dinde','saumon','thon','cabillaud','crevette','moule'],
  },
  {
    id: 'vegan',
    label: 'Vegan',
    emoji: '🌱',
    description: 'Exclut tous les produits animaux',
    ingredientsExclus: [
      // Viandes et poissons (même liste que végétarien)
      'Poulet entier','Escalopes de poulet','Steaks hachés','Filet de boeuf',
      'Côtes de porc','Rôti de veau','Lapin','Canard','Dinde',
      'Saumon','Cabillaud','Moules','Crevettes','Merlan','Lieu noir','Truite',
      'Thon en boîte','Sardines en boîte','Coquilles Saint-Jacques',
      'Lardons','Jambon blanc','Jambon de pays','Chorizo','Bacon','Saucisses',
      // Produits laitiers et oeufs
      'Oeufs','Beurre doux','Beurre demi-sel','Lait entier','Lait demi-écrémé',
      'Yaourts nature','Yaourts fruités','Fromage râpé','Crème fraîche épaisse',
      'Crème liquide entière','Fromage blanc','Camembert','Brie','Comté','Emmental',
      'Mozzarella','Feta','Parmesan','Mascarpone','Ricotta','Raclette (fromage)',
      'Chèvre frais','Philadelphia','Lait de croissance',
    ],
    motsClesExclus: ['viande','poisson','poulet','boeuf','porc','oeuf','lait','fromage','beurre','crème','yaourt'],
  },
  {
    id: 'sans-gluten',
    label: 'Sans gluten',
    emoji: '🌾❌',
    description: 'Exclut le blé, l\'orge, le seigle et leurs dérivés',
    ingredientsExclus: [
      'Pâtes spaghetti','Pâtes penne','Pâtes tagliatelles','Pâtes fusilli',
      'Farine T55','Pain de mie','Baguette','Pain complet','Pain aux céréales',
      'Brioche','Pain de seigle','Chapelure','Maïzena',
      'Pains au chocolat','Croissants','Muffins anglais','Pain burger','Tortillas',
      'Biscuits Lu','Oreo','Crackers','Madeleines',
    ],
    motsClesExclus: ['farine','pâte','pain','baguette','brioche','blé','orge','seigle','gluten','chapelure'],
  },
  {
    id: 'sans-porc',
    label: 'Sans porc',
    emoji: '🐷❌',
    description: 'Exclut uniquement le porc et ses dérivés',
    ingredientsExclus: [
      'Lardons','Côtes de porc','Rôti de porc','Saucisses','Chipolatas',
      'Saucisson sec','Rosette','Boudin noir','Mortadelle','Bacon','Knacks',
      'Chorizo','Pâté de campagne','Rillettes','Andouillette',
      'Jambon blanc','Jambon de pays',
    ],
    motsClesExclus: ['porc','cochon','lard','bacon','saucisson','jambon'],
  },
  {
    id: 'sans-lactose',
    label: 'Sans lactose',
    emoji: '🥛❌',
    description: 'Exclut le lait et les produits laitiers',
    ingredientsExclus: [
      'Beurre doux','Beurre demi-sel','Lait entier','Lait demi-écrémé',
      'Yaourts nature','Yaourts fruités','Fromage râpé','Crème fraîche épaisse',
      'Crème liquide entière','Fromage blanc','Camembert','Brie','Comté','Emmental',
      'Mozzarella','Feta','Parmesan','Mascarpone','Ricotta','Raclette (fromage)',
      'Chèvre frais','Philadelphia',
    ],
    motsClesExclus: ['lait','fromage','beurre','crème','yaourt','lactose'],
  },
  {
    id: 'sans-alcool',
    label: 'Sans alcool',
    emoji: '🍷❌',
    description: 'Exclut le vin, la bière et les spiritueux',
    ingredientsExclus: ['Vin rouge','Vin blanc sec','Champagne','Bière blonde','Sirop de menthe'],
    motsClesExclus: ['vin','alcool','bière','cidre','champagne','whisky','rhum'],
  },
  {
    id: 'sans-fruits-de-mer',
    label: 'Sans fruits de mer',
    emoji: '🦐❌',
    description: 'Exclut les crustacés et les mollusques',
    ingredientsExclus: ['Crevettes','Moules','Coquilles Saint-Jacques'],
    motsClesExclus: ['crevette','moule','huître','crabe','homard','langouste','palourde'],
  },
];

// ── Persistance ───────────────────────────────────────────

export function chargerRestrictions() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? 'null') ?? {
      profilsActifs: [],       // IDs des profils cochés
      ingredientsPerso: [],    // ingrédients tapés manuellement
    };
  } catch { return { profilsActifs: [], ingredientsPerso: [] }; }
}

export function sauvegarderRestrictions(r) {
  localStorage.setItem(LS_KEY, JSON.stringify(r));
}

// ── Calcule la liste complète des ingrédients/mots interdits ──

export function getIngredientsInterdits() {
  const r = chargerRestrictions();
  const interdits = new Set(r.ingredientsPerso.map(s => s.toLowerCase()));
  const motsCles  = new Set();

  for (const id of r.profilsActifs) {
    const profil = PROFILS.find(p => p.id === id);
    if (!profil) continue;
    profil.ingredientsExclus.forEach(i => interdits.add(i.toLowerCase()));
    profil.motsClesExclus.forEach(m => motsCles.add(m.toLowerCase()));
  }

  return { interdits, motsCles };
}

// Vérifie si un ingrédient est interdit
export function estInterdit(nomIngredient) {
  const { interdits, motsCles } = getIngredientsInterdits();
  const lc = nomIngredient.toLowerCase();
  if (interdits.has(lc)) return true;
  for (const mot of motsCles) {
    if (lc.includes(mot)) return true;
  }
  return false;
}

// Vérifie si une recette est compatible avec les restrictions
export function recetteCompatible(r) {
  const tous = [...(r.proteines ?? []), ...(r.ingredients ?? []), r.nom];
  return !tous.some(i => estInterdit(i));
}

// Résumé textuel pour le prompt IA
export function getResumeRestrictions() {
  const r = chargerRestrictions();
  const parties = [];

  const profilsLabels = r.profilsActifs
    .map(id => PROFILS.find(p => p.id === id)?.label)
    .filter(Boolean);
  if (profilsLabels.length) parties.push(`Régimes : ${profilsLabels.join(', ')}`);
  if (r.ingredientsPerso.length) parties.push(`Ingrédients interdits : ${r.ingredientsPerso.join(', ')}`);

  return parties.join('. ') || null;
}
