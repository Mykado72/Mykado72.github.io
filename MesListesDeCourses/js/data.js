// ── Données statiques : catégories, produits par défaut, listes exemples ──

export const BUILD_VERSION = '1.2.0';
export const BUILD_DATE    = '15/03/2026'; // mis à jour manuellement à chaque release

export const CATEGORIES = {
  'Fruits & Légumes':  '🥦',
  'Viandes & Poissons':'🥩',
  'Produits Laitiers': '🧀',
  'Boulangerie':       '🥖',
  'Épicerie':          '🥫',
  'Boissons':          '🥤',
  'Surgelés':          '🧊',
  'Snacks & Sucreries':'🍿',
  'Hygiène & Beauté':  '🧴',
  'Entretien':         '🧹',
  'Autre':             '📦',
};

export function getCatEmoji(cat) {
  return CATEGORIES[cat] ?? '📦';
}

// IDs stables pour les produits par défaut
const IDS = {
  oranges:      'a1000001-0000-0000-0000-000000000001',
  pommes:       'a1000002-0000-0000-0000-000000000001',
  bananes:      'a1000003-0000-0000-0000-000000000001',
  tomates:      'a1000004-0000-0000-0000-000000000001',
  salade:       'a1000005-0000-0000-0000-000000000001',
  carottes:     'a1000006-0000-0000-0000-000000000001',
  beurreD:      'a1000007-0000-0000-0000-000000000001',
  beurreDS:     'a1000008-0000-0000-0000-000000000001',
  laitE:        'a1000009-0000-0000-0000-000000000001',
  laitDE:       'a1000010-0000-0000-0000-000000000001',
  yaourts:      'a1000011-0000-0000-0000-000000000001',
  fromageRape:  'a1000012-0000-0000-0000-000000000001',
  baguette:     'a1000013-0000-0000-0000-000000000001',
  painMie:      'a1000014-0000-0000-0000-000000000001',
  croissants:   'a1000015-0000-0000-0000-000000000001',
  oeufs:        'a1000016-0000-0000-0000-000000000001',
  pates:        'a1000017-0000-0000-0000-000000000001',
  riz:          'a1000018-0000-0000-0000-000000000001',
  huile:        'a1000019-0000-0000-0000-000000000001',
  farine:       'a1000020-0000-0000-0000-000000000001',
  sucre:        'a1000021-0000-0000-0000-000000000001',
  cafe:         'a1000022-0000-0000-0000-000000000001',
  eau:          'a1000023-0000-0000-0000-000000000001',
  jus:          'a1000024-0000-0000-0000-000000000001',
  poulet:       'a1000025-0000-0000-0000-000000000001',
  steakHache:   'a1000026-0000-0000-0000-000000000001',
  saumon:       'a1000027-0000-0000-0000-000000000001',
  essuieTout:   'a1000028-0000-0000-0000-000000000001',
  papierToil:   'a1000029-0000-0000-0000-000000000001',
  liqVaisselle: 'a1000030-0000-0000-0000-000000000001',
  lessive:      'a1000031-0000-0000-0000-000000000001',
  shampoing:    'a1000032-0000-0000-0000-000000000001',
  dentifrice:   'a1000033-0000-0000-0000-000000000001',
};

export function getProduitsParDefaut() {
  return [
    { id: IDS.oranges,      nom: 'Oranges',           categorie: 'Fruits & Légumes',   emoji: '🍊', unite: 'kg' },
    { id: IDS.pommes,       nom: 'Pommes',             categorie: 'Fruits & Légumes',   emoji: '🍎', unite: 'kg' },
    { id: IDS.bananes,      nom: 'Bananes',            categorie: 'Fruits & Légumes',   emoji: '🍌', unite: 'kg' },
    { id: IDS.tomates,      nom: 'Tomates',            categorie: 'Fruits & Légumes',   emoji: '🍅', unite: 'kg' },
    { id: IDS.salade,       nom: 'Salade',             categorie: 'Fruits & Légumes',   emoji: '🥬', unite: 'unité' },
    { id: IDS.carottes,     nom: 'Carottes',           categorie: 'Fruits & Légumes',   emoji: '🥕', unite: 'kg' },
    { id: IDS.beurreD,      nom: 'Beurre doux',        categorie: 'Produits Laitiers',  emoji: '🧈', unite: 'unité' },
    { id: IDS.beurreDS,     nom: 'Beurre demi-sel',    categorie: 'Produits Laitiers',  emoji: '🧈', unite: 'unité' },
    { id: IDS.laitE,        nom: 'Lait entier',        categorie: 'Produits Laitiers',  emoji: '🥛', unite: 'L' },
    { id: IDS.laitDE,       nom: 'Lait demi-écrémé',   categorie: 'Produits Laitiers',  emoji: '🥛', unite: 'L' },
    { id: IDS.yaourts,      nom: 'Yaourts nature',     categorie: 'Produits Laitiers',  emoji: '🍦', unite: 'pack' },
    { id: IDS.fromageRape,  nom: 'Fromage râpé',       categorie: 'Produits Laitiers',  emoji: '🧀', unite: 'sachet' },
    { id: IDS.baguette,     nom: 'Baguette',           categorie: 'Boulangerie',        emoji: '🥖', unite: 'unité' },
    { id: IDS.painMie,      nom: 'Pain de mie',        categorie: 'Boulangerie',        emoji: '🍞', unite: 'unité' },
    { id: IDS.croissants,   nom: 'Croissants',         categorie: 'Boulangerie',        emoji: '🥐', unite: 'unité' },
    { id: IDS.oeufs,        nom: 'Œufs',               categorie: 'Épicerie',           emoji: '🥚', unite: 'boîte' },
    { id: IDS.pates,        nom: 'Pâtes',              categorie: 'Épicerie',           emoji: '🍝', unite: 'paquet' },
    { id: IDS.riz,          nom: 'Riz',                categorie: 'Épicerie',           emoji: '🍚', unite: 'kg' },
    { id: IDS.huile,        nom: "Huile d'olive",      categorie: 'Épicerie',           emoji: '🫒', unite: 'bouteille' },
    { id: IDS.farine,       nom: 'Farine',             categorie: 'Épicerie',           emoji: '🌾', unite: 'kg' },
    { id: IDS.sucre,        nom: 'Sucre',              categorie: 'Épicerie',           emoji: '🍬', unite: 'kg' },
    { id: IDS.cafe,         nom: 'Café',               categorie: 'Boissons',           emoji: '☕', unite: 'paquet' },
    { id: IDS.eau,          nom: 'Eau minérale',       categorie: 'Boissons',           emoji: '💧', unite: 'pack' },
    { id: IDS.jus,          nom: "Jus d'orange",       categorie: 'Boissons',           emoji: '🍊', unite: 'bouteille' },
    { id: IDS.poulet,       nom: 'Poulet',             categorie: 'Viandes & Poissons', emoji: '🍗', unite: 'kg' },
    { id: IDS.steakHache,   nom: 'Steak haché',        categorie: 'Viandes & Poissons', emoji: '🥩', unite: 'barquette' },
    { id: IDS.saumon,       nom: 'Saumon',             categorie: 'Viandes & Poissons', emoji: '🐟', unite: 'kg' },
    { id: IDS.essuieTout,   nom: 'Essuie-tout',        categorie: 'Entretien',          emoji: '🧻', unite: 'rouleau' },
    { id: IDS.papierToil,   nom: 'Papier toilette',    categorie: 'Entretien',          emoji: '🧻', unite: 'pack' },
    { id: IDS.liqVaisselle, nom: 'Liquide vaisselle',  categorie: 'Entretien',          emoji: '🧴', unite: 'bouteille' },
    { id: IDS.lessive,      nom: 'Lessive',            categorie: 'Entretien',          emoji: '🫧', unite: 'boîte' },
    { id: IDS.shampoing,    nom: 'Shampoing',          categorie: 'Hygiène & Beauté',   emoji: '🧴', unite: 'bouteille' },
    { id: IDS.dentifrice,   nom: 'Dentifrice',         categorie: 'Hygiène & Beauté',   emoji: '🦷', unite: 'tube' },
  ];
}

function el(produitId, nom, emoji, categorie, unite, quantite) {
  return { id: crypto.randomUUID(), produitId, nom, emoji, categorie, unite, quantite, estCoche: false, note: null };
}

export function getListesExemples() {
  return [
    {
      id: crypto.randomUUID(), nom: 'Pour ce week-end', description: 'Repas du samedi et dimanche',
      emoji: '🌅', couleur: '#FF9800', creeLe: new Date().toISOString(), modifieLe: null,
      elements: [
        el(IDS.poulet,      'Poulet',       '🍗','Viandes & Poissons','kg',       1),
        el(IDS.saumon,      'Saumon',       '🐟','Viandes & Poissons','kg',       1),
        el(IDS.tomates,     'Tomates',      '🍅','Fruits & Légumes',  'kg',       1),
        el(IDS.salade,      'Salade',       '🥬','Fruits & Légumes',  'unité',    1),
        el(IDS.oranges,     'Oranges',      '🍊','Fruits & Légumes',  'kg',       2),
        el(IDS.baguette,    'Baguette',     '🥖','Boulangerie',       'unité',    2),
        el(IDS.croissants,  'Croissants',   '🥐','Boulangerie',       'unité',    6),
        el(IDS.fromageRape, 'Fromage râpé', '🧀','Produits Laitiers', 'sachet',   1),
        el(IDS.oeufs,       'Œufs',         '🥚','Épicerie',          'boîte',    1),
        el(IDS.jus,         "Jus d'orange", '🍊','Boissons',          'bouteille',2),
      ]
    },
    {
      id: crypto.randomUUID(), nom: 'Pour la semaine', description: 'Ravitaillement hebdomadaire',
      emoji: '📅', couleur: '#2196F3', creeLe: new Date().toISOString(), modifieLe: null,
      elements: [
        el(IDS.poulet,       'Poulet',           '🍗','Viandes & Poissons','kg',       1),
        el(IDS.steakHache,   'Steak haché',      '🥩','Viandes & Poissons','barquette',2),
        el(IDS.pommes,       'Pommes',           '🍎','Fruits & Légumes',  'kg',       2),
        el(IDS.bananes,      'Bananes',          '🍌','Fruits & Légumes',  'kg',       1),
        el(IDS.carottes,     'Carottes',         '🥕','Fruits & Légumes',  'kg',       1),
        el(IDS.salade,       'Salade',           '🥬','Fruits & Légumes',  'unité',    2),
        el(IDS.laitDE,       'Lait demi-écrémé', '🥛','Produits Laitiers', 'L',        3),
        el(IDS.yaourts,      'Yaourts nature',   '🍦','Produits Laitiers', 'pack',     1),
        el(IDS.beurreD,      'Beurre doux',      '🧈','Produits Laitiers', 'unité',    1),
        el(IDS.baguette,     'Baguette',         '🥖','Boulangerie',       'unité',    5),
        el(IDS.oeufs,        'Œufs',             '🥚','Épicerie',          'boîte',    1),
        el(IDS.pates,        'Pâtes',            '🍝','Épicerie',          'paquet',   2),
        el(IDS.riz,          'Riz',              '🍚','Épicerie',          'kg',       1),
        el(IDS.cafe,         'Café',             '☕','Boissons',          'paquet',   1),
        el(IDS.eau,          'Eau minérale',     '💧','Boissons',          'pack',     1),
        el(IDS.liqVaisselle, 'Liquide vaisselle','🧴','Entretien',         'bouteille',1),
        el(IDS.essuieTout,   'Essuie-tout',      '🧻','Entretien',         'rouleau',  2),
      ]
    },
    {
      id: crypto.randomUUID(), nom: 'Pour les vacances', description: 'Grand ravitaillement avant le départ',
      emoji: '🏖️', couleur: '#00BCD4', creeLe: new Date().toISOString(), modifieLe: null,
      elements: [
        el(IDS.poulet,       'Poulet',           '🍗','Viandes & Poissons','kg',       2),
        el(IDS.saumon,       'Saumon',           '🐟','Viandes & Poissons','kg',       1),
        el(IDS.oranges,      'Oranges',          '🍊','Fruits & Légumes',  'kg',       3),
        el(IDS.pommes,       'Pommes',           '🍎','Fruits & Légumes',  'kg',       2),
        el(IDS.laitDE,       'Lait demi-écrémé', '🥛','Produits Laitiers', 'L',        6),
        el(IDS.oeufs,        'Œufs',             '🥚','Épicerie',          'boîte',    2),
        el(IDS.pates,        'Pâtes',            '🍝','Épicerie',          'paquet',   4),
        el(IDS.cafe,         'Café',             '☕','Boissons',          'paquet',   2),
        el(IDS.eau,          'Eau minérale',     '💧','Boissons',          'pack',     4),
        el(IDS.papierToil,   'Papier toilette',  '🧻','Entretien',         'pack',     2),
        el(IDS.lessive,      'Lessive',          '🫧','Entretien',         'boîte',    1),
        el(IDS.shampoing,    'Shampoing',        '🧴','Hygiène & Beauté',  'bouteille',2),
        el(IDS.dentifrice,   'Dentifrice',       '🦷','Hygiène & Beauté',  'tube',     2),
      ]
    },
    {
      id: crypto.randomUUID(), nom: 'Repas du soir', description: 'Courses rapides pour ce soir',
      emoji: '🌙', couleur: '#9C27B0', creeLe: new Date().toISOString(), modifieLe: null,
      elements: [
        el(IDS.steakHache,  'Steak haché',  '🥩','Viandes & Poissons','barquette',2),
        el(IDS.tomates,     'Tomates',      '🍅','Fruits & Légumes',  'kg',       1),
        el(IDS.salade,      'Salade',       '🥬','Fruits & Légumes',  'unité',    1),
        el(IDS.baguette,    'Baguette',     '🥖','Boulangerie',       'unité',    1),
        el(IDS.fromageRape, 'Fromage râpé', '🧀','Produits Laitiers', 'sachet',   1),
        el(IDS.pates,       'Pâtes',        '🍝','Épicerie',          'paquet',   1),
      ]
    },
    {
      id: crypto.randomUUID(), nom: 'Petit-déjeuner', description: 'Pour bien commencer la journée',
      emoji: '🥐', couleur: '#FF5722', creeLe: new Date().toISOString(), modifieLe: null,
      elements: [
        el(IDS.croissants, 'Croissants',      '🥐','Boulangerie',       'unité',    4),
        el(IDS.painMie,    'Pain de mie',     '🍞','Boulangerie',       'unité',    1),
        el(IDS.beurreD,    'Beurre doux',     '🧈','Produits Laitiers', 'unité',    1),
        el(IDS.laitDE,     'Lait demi-écrémé','🥛','Produits Laitiers', 'L',        2),
        el(IDS.yaourts,    'Yaourts nature',  '🍦','Produits Laitiers', 'pack',     1),
        el(IDS.oeufs,      'Œufs',            '🥚','Épicerie',          'boîte',    1),
        el(IDS.cafe,       'Café',            '☕','Boissons',          'paquet',   1),
        el(IDS.jus,        "Jus d'orange",    '🍊','Boissons',          'bouteille',1),
      ]
    },
  ];
}
