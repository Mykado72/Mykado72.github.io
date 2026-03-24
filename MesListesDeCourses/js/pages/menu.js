// ── Page : Menu de la semaine ─────────────────────────────
// Génération des menus : algorithme local intelligent (sans serveur)
// + option IA via endpoint configurable (Cloudflare Worker, backend perso...)
import { getListes, getStock, getProduits, ajouterListe } from '../store.js';
import { h, render, toast } from '../ui.js';
import { navigate } from '../router.js';

// ── Base de recettes françaises ───────────────────────────
const RECETTES = [
  // Viandes
  { nom:'Poulet rôti aux herbes', desc:'Poulet doré au four avec herbes de Provence', temps:'1h', diff:'Facile',
    proteines:['Poulet entier','Escalopes de poulet'], ingredients:['Pommes de terre','Ail','Herbes de Provence','Huile d\'olive'] },
  { nom:'Steak haché avec frites', desc:'Steak haché juteux et frites maison dorées', temps:'30 min', diff:'Facile',
    proteines:['Steaks hachés'], ingredients:['Pommes de terre','Salade verte','Sel','Huile de tournesol'] },
  { nom:'Escalope de veau à la crème', desc:'Escalope dorée, sauce crème et champignons', temps:'25 min', diff:'Facile',
    proteines:['Rôti de veau','Escalopes de poulet'], ingredients:['Crème fraîche épaisse','Champignons','Beurre doux','Sel','Poivre noir'] },
  { nom:'Côtes de porc à la moutarde', desc:'Côtes marinées à la moutarde de Dijon', temps:'30 min', diff:'Facile',
    proteines:['Côtes de porc'], ingredients:['Moutarde de Dijon','Crème liquide entière','Herbes de Provence'] },
  { nom:'Bœuf bourguignon', desc:'Bœuf mijoté au vin rouge, carottes et champignons', temps:'2h', diff:'Moyen',
    proteines:['Filet de bœuf'], ingredients:['Vin rouge','Carottes','Champignons','Oignons','Lardons','Bouillon cube bœuf'] },
  { nom:'Poulet au curry', desc:'Curry de poulet crémeux parfumé au lait de coco', temps:'40 min', diff:'Facile',
    proteines:['Escalopes de poulet','Poulet entier'], ingredients:['Curry en poudre','Lait de coco','Oignons','Tomates','Riz basmati'] },
  { nom:'Rôti de porc aux pommes', desc:'Rôti juteux accompagné de pommes caramélisées', temps:'1h15', diff:'Facile',
    proteines:['Côtes de porc'], ingredients:['Pommes','Beurre doux','Miel','Herbes de Provence'] },
  { nom:'Sauté de dinde aux légumes', desc:'Dinde sautée avec courgettes et poivrons colorés', temps:'35 min', diff:'Facile',
    proteines:['Dinde'], ingredients:['Courgettes','Poivrons','Oignons','Sauce soja','Huile d\'olive'] },
  // Poissons
  { nom:'Saumon en papillote', desc:'Saumon fondant cuit en papillote citron-aneth', temps:'25 min', diff:'Facile',
    proteines:['Saumon'], ingredients:['Citrons','Herbes de Provence','Huile d\'olive','Sel'] },
  { nom:'Cabillaud sauce vierge', desc:'Filet de cabillaud, tomates fraîches et basilic', temps:'20 min', diff:'Facile',
    proteines:['Cabillaud'], ingredients:['Tomates','Citrons','Huile d\'olive','Sel','Poivre noir'] },
  { nom:'Moules marinières', desc:'Moules fraîches au vin blanc et échalotes', temps:'20 min', diff:'Facile',
    proteines:['Moules'], ingredients:['Vin blanc sec','Oignons','Beurre doux','Baguette'] },
  { nom:'Gratin de poisson', desc:'Poisson gratiné sous une béchamel dorée', temps:'40 min', diff:'Moyen',
    proteines:['Lieu noir','Cabillaud'], ingredients:['Lait demi-écrémé','Farine T55','Beurre doux','Fromage râpé'] },
  { nom:'Crevettes à l\'ail', desc:'Crevettes sautées à l\'ail et au persil', temps:'15 min', diff:'Facile',
    proteines:['Crevettes'], ingredients:['Ail','Beurre doux','Citrons','Sel'] },
  { nom:'Sole meunière', desc:'Filet de sole doré au beurre noisette et citron', temps:'20 min', diff:'Facile',
    proteines:['Filet de sole'], ingredients:['Beurre doux','Citrons','Farine T55','Sel'] },
  // Pâtes & riz
  { nom:'Pâtes bolognaise', desc:'Pâtes avec sauce viande tomate maison mijotée', temps:'45 min', diff:'Facile',
    proteines:['Steaks hachés','Lardons'], ingredients:['Pâtes spaghetti','Sauce tomate cuisinée','Oignons','Parmesan','Herbes de Provence'] },
  { nom:'Carbonara maison', desc:'Pâtes à la crème, lardons et parmesan', temps:'20 min', diff:'Facile',
    proteines:['Lardons','Jambon blanc'], ingredients:['Pâtes spaghetti','Œufs','Parmesan','Crème fraîche épaisse','Poivre noir'] },
  { nom:'Risotto aux champignons', desc:'Risotto crémeux aux champignons et parmesan', temps:'35 min', diff:'Moyen',
    proteines:[], ingredients:['Riz rond','Champignons','Parmesan','Vin blanc sec','Oignons','Bouillon cube légumes','Beurre doux'] },
  { nom:'Pâtes pesto maison', desc:'Pâtes avec pesto basilic fait maison', temps:'20 min', diff:'Facile',
    proteines:[], ingredients:['Pâtes tagliatelles','Parmesan','Ail','Huile d\'olive','Amandes'] },
  { nom:'Riz cantonais', desc:'Riz sauté aux légumes, omelette et jambon', temps:'20 min', diff:'Facile',
    proteines:['Jambon blanc','Lardons'], ingredients:['Riz basmati','Œufs','Sauce soja','Petits pois surgelés','Carottes'] },
  { nom:'Paella', desc:'Riz safranier avec poulet, crevettes et légumes', temps:'1h', diff:'Moyen',
    proteines:['Escalopes de poulet','Crevettes'], ingredients:['Riz rond','Poivrons','Tomates','Paprika','Oignons','Bouillon cube légumes'] },
  // Végétarien
  { nom:'Quiche lorraine', desc:'Quiche fondante au lard et à la crème dans une pâte dorée', temps:'50 min', diff:'Moyen',
    proteines:['Lardons'], ingredients:['Œufs','Crème liquide entière','Farine T55','Beurre doux','Fromage râpé'] },
  { nom:'Omelette aux champignons', desc:'Omelette moelleuse garnie de champignons sautés', temps:'15 min', diff:'Facile',
    proteines:[], ingredients:['Œufs','Champignons','Beurre doux','Sel','Poivre noir'] },
  { nom:'Gratin de courgettes', desc:'Courgettes gratinées avec mozzarella et herbes', temps:'45 min', diff:'Facile',
    proteines:[], ingredients:['Courgettes','Mozzarella','Herbes de Provence','Huile d\'olive','Sel'] },
  { nom:'Soupe de légumes maison', desc:'Soupe réconfortante aux légumes de saison', temps:'30 min', diff:'Facile',
    proteines:[], ingredients:['Carottes','Pommes de terre','Poireaux','Oignons','Bouillon cube légumes','Sel'] },
  { nom:'Tarte aux légumes', desc:'Tarte feuilletée garnie de légumes rôtis colorés', temps:'45 min', diff:'Moyen',
    proteines:[], ingredients:['Farine T55','Beurre doux','Courgettes','Poivrons','Tomates','Mozzarella'] },
  { nom:'Wok de légumes sautés', desc:'Légumes croquants sautés à la sauce soja', temps:'15 min', diff:'Facile',
    proteines:[], ingredients:['Courgettes','Poivrons','Champignons','Sauce soja','Huile de sésame','Ail','Riz basmati'] },
  { nom:'Crêpes salées garnie', desc:'Crêpes garnies au jambon fromage', temps:'30 min', diff:'Facile',
    proteines:['Jambon blanc'], ingredients:['Farine T55','Œufs','Lait demi-écrémé','Beurre doux','Emmental'] },
  { nom:'Pizza maison', desc:'Pizza à la sauce tomate garnie selon les envies', temps:'40 min', diff:'Moyen',
    proteines:['Jambon blanc','Lardons'], ingredients:['Farine T55','Sauce tomate cuisinée','Mozzarella','Herbes de Provence'] },
  { nom:'Curry de lentilles', desc:'Dhal de lentilles corail au lait de coco et épices', temps:'30 min', diff:'Facile',
    proteines:[], ingredients:['Lentilles corail','Lait de coco','Curry en poudre','Oignons','Tomates','Riz basmati'] },
  { nom:'Tartiflette', desc:'Gratin de pommes de terre, reblochon et lardons', temps:'50 min', diff:'Facile',
    proteines:['Lardons'], ingredients:['Pommes de terre','Raclette (fromage)','Crème fraîche épaisse','Oignons'] },
];

export function renderMenu(container) {
  let nbPersonnes = 2;
  let nbRepas     = 7;
  let _menus      = null;
  let _loading    = false;
  let _error      = null;
  let _listeCreee = false;

  function draw() {
    render(container,
      h('div', { class: 'page-header' },
        h('div', {},
          h('h1', {}, '🍽️ Menu de la semaine'),
          h('p', { class: 'subtitle' }, 'Menus équilibrés selon votre stock et vos courses')
        )
      ),

      // Paramètres
      h('div', { class: 'menu-params' },
        h('div', { class: 'menu-param-row' },
          h('label', { class: 'menu-param-label' }, '👥 Nombre de personnes'),
          h('div', { class: 'menu-param-stepper' },
            h('button', { class: 'qty-btn', onclick: () => { if (nbPersonnes > 1) { nbPersonnes--; draw(); } } }, '−'),
            h('span', { class: 'menu-param-val' }, nbPersonnes),
            h('button', { class: 'qty-btn', onclick: () => { nbPersonnes++; draw(); } }, '＋')
          )
        ),
        h('div', { class: 'menu-param-row' },
          h('label', { class: 'menu-param-label' }, '🍴 Repas à planifier'),
          h('div', { class: 'menu-param-stepper' },
            h('button', { class: 'qty-btn', onclick: () => { if (nbRepas > 1) { nbRepas--; draw(); } } }, '−'),
            h('span', { class: 'menu-param-val' }, nbRepas),
            h('button', { class: 'qty-btn', onclick: () => { if (nbRepas < 14) { nbRepas++; draw(); } } }, '＋')
          )
        ),
        h('button', { class: 'btn-primary menu-generate-btn', onclick: genererMenus },
          '🍽️ Générer les menus'
        )
      ),

      _error ? h('div', { class: 'menu-error' }, `❌ ${_error}`) : null,

      _menus ? renderResultat() : null,

      // Message d'accueil si pas encore généré
      !_menus && !_error ? h('div', { class: 'menu-intro' },
        h('div', { class: 'menu-intro-icon' }, '👨‍🍳'),
        h('p', {}, 'L\'application sélectionne des recettes équilibrées en tenant compte de votre stock et de vos listes de courses actuelles.'),
        h('ul', { class: 'menu-intro-list' },
          h('li', {}, '🥦 Protéines variées : viande, poisson, végétarien'),
          h('li', {}, '🏠 Priorité aux ingrédients déjà en stock'),
          h('li', {}, '🛒 Liste de courses générée automatiquement')
        )
      ) : null
    );
  }

  // ── Algorithme de sélection des menus ─────────────────────
  function genererMenus() {
    _error = null; _listeCreee = false;

    const stockNoms = new Set(getStock().map(s => s.nom.toLowerCase()));
    const listesNoms = new Set(
      getListes().flatMap(l => l.elements.map(e => e.nom.toLowerCase()))
    );
    const disponibles = (nom) =>
      stockNoms.has(nom.toLowerCase()) || listesNoms.has(nom.toLowerCase());

    // Score une recette selon ce qu'on a déjà
    function scoreRecette(r) {
      const tous = [...(r.proteines ?? []), ...(r.ingredients ?? [])];
      const nbDispo = tous.filter(ing => disponibles(ing)).length;
      return nbDispo / Math.max(tous.length, 1);
    }

    // Trie par score décroissant puis mélange les ex-æquo
    const scorees = RECETTES.map(r => ({ r, score: scoreRecette(r) }))
      .sort((a, b) => b.score - a.score || Math.random() - 0.5);

    // Sélectionne nbRepas recettes en garantissant la variété
    const selection = [];
    const protUsees = new Set();
    const difficultes = { 'Facile': 0, 'Moyen': 0 };

    for (const { r } of scorees) {
      if (selection.length >= nbRepas) break;
      // Évite 3+ recettes avec la même protéine principale
      const protKey = r.proteines?.[0] ?? '__vege__';
      if ((protUsees.get?.(protKey) ?? 0) >= 2) continue;
      // Limite à 1 recette difficile sur 5
      if (r.diff === 'Difficile' && difficultes['Difficile'] >= Math.ceil(nbRepas / 5)) continue;

      selection.push(r);
      if (!protUsees.set) protUsees.set = new Map();
      protUsees.set(protKey, (protUsees.get?.(protKey) ?? 0) + 1);
      difficultes[r.diff] = (difficultes[r.diff] ?? 0) + 1;
    }

    // Complète si pas assez
    const reste = scorees.filter(({ r }) => !selection.includes(r));
    while (selection.length < nbRepas && reste.length) {
      selection.push(reste.shift().r);
    }

    // Assigne les jours et types
    const SLOTS = [];
    const JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
    for (const jour of JOURS) {
      SLOTS.push({ jour, type: 'Déjeuner' });
      SLOTS.push({ jour, type: 'Dîner' });
      if (SLOTS.length >= nbRepas) break;
    }

    _menus = selection.slice(0, nbRepas).map((r, i) => {
      const slot = SLOTS[i] ?? { jour: `Repas ${i+1}`, type: 'Dîner' };
      const tous = [...(r.proteines ?? []), ...(r.ingredients ?? [])];
      const manquants = tous.filter(ing => !disponibles(ing));
      const principal = tous.filter(ing => disponibles(ing));
      return {
        jour: slot.jour,
        type: slot.type,
        nom: r.nom,
        description: r.desc,
        ingredientsPrincipaux: principal,
        ingredientsManquants: manquants,
        tempsPreparation: r.temps,
        difficulte: r.diff
      };
    });

    draw();
  }

  // ── Affichage des résultats ───────────────────────────────
  function renderResultat() {
    const menus = _menus ?? [];
    const manquants = [...new Set(menus.flatMap(m => m.ingredientsManquants ?? []))];
    const nbDispo = menus.filter(m => (m.ingredientsManquants ?? []).length === 0).length;

    return h('div', { class: 'menu-resultat' },

      // Résumé
      h('div', { class: 'menu-conseil' },
        `✅ ${menus.length} repas planifiés pour ${nbPersonnes} personne(s). ` +
        `${nbDispo} repas entièrement réalisables avec ce que vous avez déjà.`
      ),

      // Grille
      h('div', { class: 'menu-grid' },
        ...menus.map(m => {
          const dKey = (m.difficulte ?? 'facile').toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g,'');
          return h('div', { class: `menu-card menu-diff-${dKey}` },
            h('div', { class: 'menu-card-header' },
              h('span', { class: 'menu-jour' }, m.jour),
              h('span', { class: 'menu-type' }, m.type)
            ),
            h('div', { class: 'menu-card-body' },
              h('div', { class: 'menu-nom' }, m.nom),
              h('div', { class: 'menu-desc' }, m.description),
              h('div', { class: 'menu-meta' },
                h('span', { class: 'menu-temps' }, `⏱ ${m.tempsPreparation}`),
                h('span', { class: `menu-badge menu-badge-${dKey}` }, m.difficulte)
              ),
              (m.ingredientsPrincipaux ?? []).length
                ? h('div', { class: 'menu-ingredients menu-ok' },
                    h('span', { class: 'menu-ing-label' }, '✅ Déjà disponible :'),
                    h('span', {}, (m.ingredientsPrincipaux ?? []).join(', '))
                  )
                : null,
              (m.ingredientsManquants ?? []).length
                ? h('div', { class: 'menu-ingredients menu-missing' },
                    h('span', { class: 'menu-ing-label' }, '🛒 À acheter :'),
                    h('span', {}, (m.ingredientsManquants ?? []).join(', '))
                  )
                : null
            )
          );
        })
      ),

      // Récap + bouton liste
      h('div', { class: 'menu-recap' + (manquants.length === 0 ? ' menu-recap-ok' : '') },
        manquants.length === 0
          ? '🎉 Tous les ingrédients sont déjà disponibles !'
          : h('div', {},
              h('div', { class: 'menu-recap-title' }, `🛒 ${manquants.length} ingrédient(s) à acheter`),
              h('div', { class: 'menu-recap-list' },
                ...manquants.map(ing =>
                  h('div', { class: 'menu-recap-item' }, `• ${ing}`)
                )
              ),
              !_listeCreee
                ? h('button', {
                    class: 'btn-primary', style: 'margin-top:14px;width:100%;',
                    onclick: () => creerListeCourses(manquants)
                  }, '📋 Créer la liste de courses « Menus de la semaine »')
                : h('div', { class: 'menu-liste-ok' },
                    '✅ Liste créée ! ',
                    h('span', { class: 'breadcrumb-link', onclick: () => navigate('#/') }, 'Voir mes listes →')
                  )
            )
      ),

      // Bouton regénérer
      h('button', {
        class: 'btn-secondary', style: 'margin-top:16px;width:100%;',
        onclick: genererMenus
      }, '🔄 Générer d\'autres suggestions')
    );
  }

  // ── Création de la liste de courses ───────────────────────
  function creerListeCourses(manquants) {
    const produits = getProduits();
    const elements = manquants.map(ing => {
      const lc = ing.toLowerCase();
      const match = produits.find(p =>
        p.nom.toLowerCase() === lc ||
        p.nom.toLowerCase().includes(lc) ||
        lc.includes(p.nom.toLowerCase())
      );
      return {
        id: crypto.randomUUID(),
        produitId: match?.id ?? crypto.randomUUID(),
        nom: match?.nom ?? ing,
        emoji: match?.emoji ?? '🛒',
        categorie: match?.categorie ?? 'Autre',
        unite: match?.unite ?? 'unité',
        quantite: 1,
        estCoche: false,
        note: null
      };
    });

    const semaine = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit' });
    ajouterListe({
      nom: `Menus de la semaine (${semaine})`,
      description: `${nbRepas} repas pour ${nbPersonnes} personne(s)`,
      emoji: '🍽️',
      couleur: '#4CAF50',
      elements
    });
    _listeCreee = true;
    toast('✅ Liste créée !', 'ok');
    draw();
  }

  draw();
}
