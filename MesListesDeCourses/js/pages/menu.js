// ── Page : Menu de la semaine ─────────────────────────────
import { getListes, getStock, getProduits, ajouterListe } from '../store.js';
import { recetteCompatible, getResumeRestrictions, getIngredientsInterdits } from '../restrictions.js';
import { h, render, toast } from '../ui.js';
import { navigate } from '../router.js';

// ── Base de recettes ──────────────────────────────────────
const RECETTES = [
  { nom:'Poulet rôti aux herbes', desc:'Poulet doré au four avec herbes de Provence', temps:'1h', diff:'Facile',
    proteines:['Poulet entier','Escalopes de poulet'], ingredients:['Pommes de terre','Ail','Herbes de Provence','Huile d\'olive'] },
  { nom:'Steak haché et frites', desc:'Steak haché juteux et frites maison dorées', temps:'30 min', diff:'Facile',
    proteines:['Steaks hachés'], ingredients:['Pommes de terre','Salade verte','Sel fin','Huile de tournesol'] },
  { nom:'Saumon en papillote', desc:'Saumon fondant cuit en papillote au citron', temps:'25 min', diff:'Facile',
    proteines:['Saumon'], ingredients:['Citrons','Herbes de Provence','Huile d\'olive'] },
  { nom:'Pâtes bolognaise', desc:'Pâtes avec sauce viande tomate maison', temps:'45 min', diff:'Facile',
    proteines:['Steaks hachés'], ingredients:['Pâtes spaghetti','Sauce tomate cuisinée','Oignons','Parmesan'] },
  { nom:'Poulet au curry', desc:'Curry de poulet crémeux au lait de coco', temps:'40 min', diff:'Facile',
    proteines:['Escalopes de poulet'], ingredients:['Curry en poudre','Lait de coco','Oignons','Riz basmati'] },
  { nom:'Carbonara maison', desc:'Pâtes à la crème, lardons et parmesan', temps:'20 min', diff:'Facile',
    proteines:['Lardons'], ingredients:['Pâtes spaghetti','Oeufs','Parmesan','Crème fraîche épaisse'] },
  { nom:'Risotto aux champignons', desc:'Risotto crémeux aux champignons et parmesan', temps:'35 min', diff:'Moyen',
    proteines:[], ingredients:['Riz rond','Champignons','Parmesan','Vin blanc sec','Oignons','Bouillon cube légumes'] },
  { nom:'Cabillaud sauce vierge', desc:'Filet de cabillaud, tomates fraîches et basilic', temps:'20 min', diff:'Facile',
    proteines:['Cabillaud'], ingredients:['Tomates','Citrons','Huile d\'olive'] },
  { nom:'Quiche lorraine', desc:'Quiche fondante au lard et crème dans une pâte dorée', temps:'50 min', diff:'Moyen',
    proteines:['Lardons'], ingredients:['Oeufs','Crème liquide entière','Farine T55','Beurre doux','Fromage râpé'] },
  { nom:'Moules marinières', desc:'Moules fraîches au vin blanc et échalotes', temps:'20 min', diff:'Facile',
    proteines:['Moules'], ingredients:['Vin blanc sec','Oignons','Beurre doux','Baguette'] },
  { nom:'Gratin de courgettes', desc:'Courgettes gratinées avec mozzarella et herbes', temps:'45 min', diff:'Facile',
    proteines:[], ingredients:['Courgettes','Mozzarella','Herbes de Provence','Huile d\'olive'] },
  { nom:'Omelette aux champignons', desc:'Omelette moelleuse garnie de champignons sautés', temps:'15 min', diff:'Facile',
    proteines:[], ingredients:['Oeufs','Champignons','Beurre doux'] },
  { nom:'Riz cantonais', desc:'Riz sauté aux légumes, omelette et jambon', temps:'20 min', diff:'Facile',
    proteines:['Jambon blanc'], ingredients:['Riz basmati','Oeufs','Sauce soja','Petits pois surgelés','Carottes'] },
  { nom:'Boeuf bourguignon', desc:'Boeuf mijoté au vin rouge, carottes et champignons', temps:'2h', diff:'Moyen',
    proteines:['Filet de boeuf'], ingredients:['Vin rouge','Carottes','Champignons','Oignons','Lardons'] },
  { nom:'Soupe de légumes', desc:'Soupe réconfortante aux légumes de saison', temps:'30 min', diff:'Facile',
    proteines:[], ingredients:['Carottes','Pommes de terre','Poireaux','Oignons','Bouillon cube légumes'] },
  { nom:'Escalope crème et champignons', desc:'Escalope dorée, sauce crème et champignons', temps:'25 min', diff:'Facile',
    proteines:['Escalopes de poulet'], ingredients:['Crème fraîche épaisse','Champignons','Beurre doux'] },
  { nom:'Curry de lentilles', desc:'Dhal de lentilles corail au lait de coco', temps:'30 min', diff:'Facile',
    proteines:[], ingredients:['Lentilles corail','Lait de coco','Curry en poudre','Oignons','Tomates','Riz basmati'] },
  { nom:'Pizza maison', desc:'Pizza à la sauce tomate garnie au jambon', temps:'40 min', diff:'Moyen',
    proteines:['Jambon blanc'], ingredients:['Farine T55','Sauce tomate cuisinée','Mozzarella'] },
  { nom:'Wok de légumes', desc:'Légumes croquants sautés à la sauce soja', temps:'15 min', diff:'Facile',
    proteines:[], ingredients:['Courgettes','Poivrons','Champignons','Sauce soja','Ail','Riz basmati'] },
  { nom:'Tartiflette', desc:'Gratin de pommes de terre, fromage et lardons', temps:'50 min', diff:'Facile',
    proteines:['Lardons'], ingredients:['Pommes de terre','Raclette (fromage)','Crème fraîche épaisse','Oignons'] },
  { nom:'Crevettes à l\'ail', desc:'Crevettes sautées à l\'ail et au beurre', temps:'15 min', diff:'Facile',
    proteines:['Crevettes'], ingredients:['Ail','Beurre doux','Citrons'] },
  { nom:'Crêpes salées jambon-fromage', desc:'Crêpes garnies au jambon et emmental fondu', temps:'30 min', diff:'Facile',
    proteines:['Jambon blanc'], ingredients:['Farine T55','Oeufs','Lait demi-écrémé','Emmental'] },
  { nom:'Paella', desc:'Riz safrané avec poulet, crevettes et légumes', temps:'1h', diff:'Moyen',
    proteines:['Escalopes de poulet','Crevettes'], ingredients:['Riz rond','Poivrons','Tomates','Paprika','Oignons'] },
  { nom:'Tarte aux légumes', desc:'Tarte garnie de légumes rôtis colorés', temps:'45 min', diff:'Moyen',
    proteines:[], ingredients:['Farine T55','Beurre doux','Courgettes','Poivrons','Tomates','Mozzarella'] },
  { nom:'Rôti de porc aux pommes', desc:'Rôti juteux accompagné de pommes caramélisées', temps:'1h15', diff:'Facile',
    proteines:['Côtes de porc'], ingredients:['Pommes','Beurre doux','Miel'] },
  { nom:'Lieu noir en sauce', desc:'Lieu noir mijoté avec tomates et câpres', temps:'25 min', diff:'Facile',
    proteines:['Lieu noir'], ingredients:['Tomates pelées en boîte','Oignons','Huile d\'olive','Ail'] },
  { nom:'Pâtes au pesto', desc:'Pâtes fraîches avec pesto maison basilic-parmesan', temps:'20 min', diff:'Facile',
    proteines:[], ingredients:['Pâtes tagliatelles','Parmesan','Ail','Huile d\'olive','Amandes'] },
  { nom:'Gratin dauphinois', desc:'Gratin fondant de pommes de terre à la crème', temps:'1h', diff:'Facile',
    proteines:[], ingredients:['Pommes de terre','Crème liquide entière','Ail','Fromage râpé'] },
  { nom:'Salade niçoise', desc:'Salade composée avec thon, oeufs et légumes', temps:'15 min', diff:'Facile',
    proteines:['Thon en boîte'], ingredients:['Oeufs','Tomates','Salade verte','Citrons','Huile d\'olive'] },
  { nom:'Côtes de porc à la moutarde', desc:'Côtes marinées à la moutarde de Dijon et crème', temps:'30 min', diff:'Facile',
    proteines:['Côtes de porc'], ingredients:['Moutarde de Dijon','Crème liquide entière','Herbes de Provence'] },
];

// ── Persistance ───────────────────────────────────────────
const LS_MENUS  = 'mldc-menus-semaine';
const LS_API_KEY = 'mldc-api-config';

function sauvegarderMenus(state) {
  localStorage.setItem(LS_MENUS, JSON.stringify(state));
}
function chargerMenus() {
  try { return JSON.parse(localStorage.getItem(LS_MENUS) ?? 'null'); } catch { return null; }
}
function getApiConfig() {
  try { return JSON.parse(localStorage.getItem(LS_API_KEY) ?? 'null'); } catch { return null; }
}
function saveApiConfig(cfg) {
  localStorage.setItem(LS_API_KEY, JSON.stringify(cfg));
}

// ── Appel IA ──────────────────────────────────────────────
async function appelIA(prompt, config) {
  if (config.provider === 'claude') {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': config.key,
        'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: 'claude-opus-4-6', max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }] })
    });
    if (!resp.ok) throw new Error((await resp.json().catch(()=>({}))).error?.message ?? `HTTP ${resp.status}`);
    return (await resp.json()).content?.[0]?.text ?? '';
  }
  if (config.provider === 'openai') {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.key}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }] })
    });
    if (!resp.ok) throw new Error((await resp.json().catch(()=>({}))).error?.message ?? `HTTP ${resp.status}`);
    return (await resp.json()).choices?.[0]?.message?.content ?? '';
  }
  if (config.provider === 'gemini') {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.key}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
    );
    if (!resp.ok) throw new Error((await resp.json().catch(()=>({}))).error?.message ?? `HTTP ${resp.status}`);
    return (await resp.json()).candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }
  throw new Error('Provider inconnu');
}

// ── Algo local de sélection ───────────────────────────────
function selectionnerRecettes(nbRepas, exclure = []) {
  const stockNoms  = new Set(getStock().map(s => s.nom.toLowerCase()));
  const listesNoms = new Set(getListes().flatMap(l => l.elements.map(e => e.nom.toLowerCase())));
  const dispo = nom => stockNoms.has(nom.toLowerCase()) || listesNoms.has(nom.toLowerCase());

  const nomsExclus = new Set(exclure.map(n => n.toLowerCase()));

  const candidates = RECETTES
    .filter(r => !nomsExclus.has(r.nom.toLowerCase()))
    .filter(r => recetteCompatible(r))  // exclut les recettes incompatibles avec les restrictions
    .map(r => {
      const tous = [...r.proteines, ...r.ingredients];
      return { r, score: tous.filter(i => dispo(i)).length / Math.max(tous.length, 1) };
    })
    .sort((a, b) => b.score - a.score || Math.random() - 0.5);

  const selection = [];
  const protCount = new Map();
  for (const { r } of candidates) {
    if (selection.length >= nbRepas) break;
    const protKey = r.proteines[0] ?? '__vege__';
    if ((protCount.get(protKey) ?? 0) >= 2) continue;
    selection.push(r);
    protCount.set(protKey, (protCount.get(protKey) ?? 0) + 1);
  }
  // Complète si besoin
  for (const { r } of candidates) {
    if (selection.length >= nbRepas) break;
    if (!selection.includes(r)) selection.push(r);
  }
  return selection.slice(0, nbRepas);
}

function recetteToMenu(r, slot, dispo) {
  const tous = [...r.proteines, ...r.ingredients];
  return {
    slot,
    nom: r.nom,
    description: r.desc,
    ingredientsPrincipaux: tous.filter(i => dispo(i)),
    ingredientsManquants:  tous.filter(i => !dispo(i)),
    tempsPreparation: r.temps,
    difficulte: r.diff,
    valide: false   // false = en attente, true = validé
  };
}

// ── Page ──────────────────────────────────────────────────
export function renderMenu(container) {
  // Charge l'état persisté ou initialise
  let state = chargerMenus() ?? {
    nbPersonnes: 2,
    nbRepas: 7,
    menus: [],      // liste des menus avec leur statut
    listeCreee: false,
    showConfig: false
  };

  let _loading         = false;
  let _error           = null;
  let _showPrompt      = false;   // afficher le prompt pour copier-coller
  let _promptTexte     = '';      // texte du prompt
  let _cfgProvider     = state.cfgProvider ?? 'claude';
  let _cfgKey          = '';

  const SLOTS = () => {
    const slots = [];
    const JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
    for (const jour of JOURS) {
      slots.push(`${jour} – Déjeuner`, `${jour} – Dîner`);
    }
    return slots;
  };

  function save() { sauvegarderMenus(state); }

  function draw() {
    const apiConfig = getApiConfig();
    const nbValides = state.menus.filter(m => m.valide).length;
    const nbTotal   = state.menus.length;

    render(container,
      // Header
      h('div', { class: 'page-header' },
        h('div', {},
          h('h1', {}, '🍽️ Menu de la semaine'),
          h('p', { class: 'subtitle' }, nbTotal > 0
            ? `${nbValides} validé(s) sur ${nbTotal} — ${state.nbRepas} repas demandés`
            : 'Menus équilibrés selon votre stock et vos courses')
        ),
        h('button', {
          class: `btn-secondary${apiConfig ? ' btn-ia-active' : ''}`,
          onclick: () => { state.showConfig = !state.showConfig; draw(); }
        }, apiConfig ? `🤖 ${PROVIDERS[apiConfig.provider]?.label?.split(' ')[0] ?? 'IA'}` : '🔑 IA')
      ),

      // Panel config IA (repliable)
      state.showConfig ? renderConfigIA(apiConfig) : null,

      // Paramètres + bouton générer
      h('div', { class: 'menu-params' },
        h('div', { class: 'menu-param-row' },
          h('label', { class: 'menu-param-label' }, '👥 Personnes'),
          h('div', { class: 'menu-param-stepper' },
            h('button', { class: 'qty-btn', onclick: () => { if (state.nbPersonnes > 1) { state.nbPersonnes--; save(); draw(); } } }, '−'),
            h('span', { class: 'menu-param-val' }, state.nbPersonnes),
            h('button', { class: 'qty-btn', onclick: () => { state.nbPersonnes++; save(); draw(); } }, '＋')
          )
        ),
        h('div', { class: 'menu-param-row' },
          h('label', { class: 'menu-param-label' }, '🍴 Repas à planifier'),
          h('div', { class: 'menu-param-stepper' },
            h('button', { class: 'qty-btn', onclick: () => { if (state.nbRepas > 1) { state.nbRepas--; save(); draw(); } } }, '−'),
            h('span', { class: 'menu-param-val' }, state.nbRepas),
            h('button', { class: 'qty-btn', onclick: () => { if (state.nbRepas < 14) { state.nbRepas++; save(); draw(); } } }, '＋')
          )
        ),
        h('button', {
          class: 'btn-primary menu-generate-btn',
          onclick: () => { state.menus = []; state.listeCreee = false; save(); apiConfig ? genererMenusIA() : genererMenusLocal(); }
        }, apiConfig ? '🤖 Générer avec l\'IA' : '🍽️ Générer les menus'),
        apiConfig ? btnVoirPrompt() : null
      ),

      _error ? h('div', { class: 'menu-error' }, _error) : null,
      _loading ? h('div', { class: 'menu-loading' },
        h('div', { class: 'menu-loading-icon' }, '⏳'),
        h('p', {}, "Génération en cours…")
      ) : null,

      // Bloc prompt : visible en cas d'erreur IA ou sur demande
      !_loading && (_showPrompt || false) ? renderBlcPrompt() : null,

      // Menus
      state.menus.length > 0 && !_loading ? renderMenus() : null,

      // Intro si vide
      !state.menus.length && !_loading ? renderIntro(!!apiConfig) : null
    );
  }

  // ── Grille des menus ──────────────────────────────────────
  function renderMenus() {
    const nbValides  = state.menus.filter(m => m.valide).length;
    const manquants  = [...new Set(
      state.menus.filter(m => m.valide).flatMap(m => m.ingredientsManquants ?? [])
    )];

    return h('div', { class: 'menu-resultat' },

      // Bandeau de progression
      h('div', { class: 'menu-progression' },
        h('div', { class: 'menu-progression-bar' },
          h('div', { class: 'menu-progression-fill', style: `width:${Math.round(nbValides/state.nbRepas*100)}%` })
        ),
        h('div', { class: 'menu-progression-label' },
          `${nbValides} / ${state.nbRepas} menus validés`,
          nbValides === state.nbRepas
            ? h('span', { class: 'menu-complet-badge' }, '✅ Semaine complète !')
            : null
        )
      ),

      // Cartes
      h('div', { class: 'menu-grid' }, ...state.menus.map((m, idx) => renderCarteMenu(m, idx))),

      // Récap + liste si au moins 1 validé
      nbValides > 0 ? h('div', { class: 'menu-recap' + (manquants.length === 0 ? ' menu-recap-ok' : '') },
        manquants.length === 0
          ? h('p', { style: 'font-weight:700;color:var(--primary);text-align:center;' },
              '🎉 Tous les ingrédients sont déjà disponibles !')
          : h('div', {},
              h('div', { class: 'menu-recap-title' }, `🛒 ${manquants.length} ingrédient(s) à acheter pour les ${nbValides} repas validés`),
              h('div', { class: 'menu-recap-list' }, ...manquants.map(ing =>
                h('div', { class: 'menu-recap-item' }, `• ${ing}`)
              )),
              !state.listeCreee
                ? h('button', { class: 'btn-primary', style: 'margin-top:14px;width:100%;',
                    onclick: () => creerListeCourses(manquants)
                  }, '📋 Créer la liste de courses « Menus de la semaine »')
                : h('div', { class: 'menu-liste-ok' },
                    '✅ Liste créée ! ',
                    h('span', { class: 'breadcrumb-link', onclick: () => navigate('#/') }, 'Voir mes listes →')
                  )
            )
      ) : null
    );
  }

  // ── Carte d'un menu ───────────────────────────────────────
  function renderCarteMenu(m, idx) {
    const dKey = (m.difficulte ?? 'facile').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const estValide = m.valide;

    const card = h('div', { class: `menu-card menu-diff-${dKey}${estValide ? ' menu-card-valide' : ''}` },
      // Header : slot + badge difficulté
      h('div', { class: 'menu-card-header' },
        h('span', { class: 'menu-slot' }, m.slot ?? `Repas ${idx+1}`),
        h('span', { class: `menu-badge menu-badge-${dKey}` }, m.difficulte)
      ),
      // Corps
      h('div', { class: 'menu-card-body' },
        h('div', { class: 'menu-nom' }, m.nom),
        h('div', { class: 'menu-desc' }, m.description),
        h('div', { class: 'menu-temps' }, `⏱ ${m.tempsPreparation}`),
        (m.ingredientsPrincipaux ?? []).length ? h('div', { class: 'menu-ingredients menu-ok' },
          h('span', { class: 'menu-ing-label' }, '✅ Disponible :'),
          h('span', {}, (m.ingredientsPrincipaux ?? []).join(', '))
        ) : null,
        (m.ingredientsManquants ?? []).length ? h('div', { class: 'menu-ingredients menu-missing' },
          h('span', { class: 'menu-ing-label' }, '🛒 À acheter :'),
          h('span', {}, (m.ingredientsManquants ?? []).join(', '))
        ) : null
      ),
      // Actions : Valider / Remplacer
      h('div', { class: 'menu-card-actions' },
        estValide
          ? h('button', { class: 'menu-btn-annuler', onclick: () => { m.valide = false; save(); draw(); } },
              '↩ Retirer')
          : h('button', { class: 'menu-btn-valider', onclick: () => { m.valide = true; save(); draw(); } },
              '✅ Valider ce repas'),
        h('button', { class: 'menu-btn-remplacer', onclick: () => remplacerMenu(idx) },
          '🔄 Remplacer')
      )
    );
    return card;
  }

  // ── Remplacer un menu ─────────────────────────────────────
  function remplacerMenu(idx) {
    const nomActuels = state.menus.map(m => m.nom);
    const nouvelles = selectionnerRecettes(1, nomActuels);
    if (!nouvelles.length) { toast('Plus de recettes disponibles !', 'error'); return; }

    const stockNoms  = new Set(getStock().map(s => s.nom.toLowerCase()));
    const listesNoms = new Set(getListes().flatMap(l => l.elements.map(e => e.nom.toLowerCase())));
    const dispo = nom => stockNoms.has(nom.toLowerCase()) || listesNoms.has(nom.toLowerCase());

    state.menus[idx] = recetteToMenu(nouvelles[0], state.menus[idx].slot, dispo);
    if (navigator.vibrate) navigator.vibrate(20);
    save();
    draw();
  }

  // ── Génération locale ─────────────────────────────────────
  function genererMenusLocal() {
    _error = null;
    const stockNoms  = new Set(getStock().map(s => s.nom.toLowerCase()));
    const listesNoms = new Set(getListes().flatMap(l => l.elements.map(e => e.nom.toLowerCase())));
    const dispo = nom => stockNoms.has(nom.toLowerCase()) || listesNoms.has(nom.toLowerCase());

    const recettes = selectionnerRecettes(state.nbRepas, []);
    const slots = SLOTS();
    state.menus = recettes.map((r, i) => recetteToMenu(r, slots[i] ?? `Repas ${i+1}`, dispo));
    state.listeCreee = false;
    save();
    draw();
  }

  // ── Construit le prompt ──────────────────────────────────
  function construirePrompt() {
    const stock  = getStock().map(s => `${s.nom} (${s.quantite} ${s.unite})`).join(', ') || 'vide';
    const listes = getListes().flatMap(l => l.elements.map(e => e.nom))
      .filter((v,i,a) => a.indexOf(v)===i).join(', ') || 'aucun';
    const restrictions = getResumeRestrictions();
    const ligneRestrictions = restrictions ? `\nRESTRICTIONS ABSOLUES À RESPECTER : ${restrictions}. N'utilise JAMAIS ces ingrédients.` : '';
    return `Tu es un chef cuisinier français. Propose exactement ${state.nbRepas} repas variés et équilibrés pour ${state.nbPersonnes} personne(s).
Stock disponible à la maison : ${stock}.
Produits déjà dans les listes de courses : ${listes}.${ligneRestrictions}
Instructions : Privilégie les produits disponibles. Varie les protéines (viande, poisson, végétarien). Répartis les repas sur la semaine.
Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans texte avant ou après :
{"menus":[{"slot":"Lundi – Déjeuner","nom":"Nom du plat","description":"Description courte","ingredientsPrincipaux":["Ingrédient 1","Ingrédient 2"],"ingredientsManquants":["Ingrédient manquant"],"tempsPreparation":"30 min","difficulte":"Facile","valide":false}]}
Les valeurs possibles pour difficulte sont : Facile, Moyen, Difficile.
Les valeurs possibles pour slot sont : Lundi – Déjeuner, Lundi – Dîner, Mardi – Déjeuner, Mardi – Dîner, Mercredi – Déjeuner, Mercredi – Dîner, Jeudi – Déjeuner, Jeudi – Dîner, Vendredi – Déjeuner, Vendredi – Dîner, Samedi – Déjeuner, Samedi – Dîner, Dimanche – Déjeuner, Dimanche – Dîner.`;
  }

  // ── Traite une réponse JSON (IA ou collée manuellement) ──
  function traiterReponseIA(text) {
    const clean = text.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'').trim();
    const data  = JSON.parse(clean);
    const menus = Array.isArray(data) ? data : (data.menus ?? []);
    if (!menus.length) throw new Error('Aucun menu dans la réponse');
    state.menus = menus.map((m, i) => ({
      ...m, slot: m.slot ?? SLOTS()[i] ?? `Repas ${i+1}`, valide: false
    }));
    state.listeCreee = false;
    save();
  }

  // ── Génération IA ─────────────────────────────────────────
  async function genererMenusIA() {
    const config = getApiConfig();
    if (!config) { genererMenusLocal(); return; }

    const prompt = construirePrompt();
    _promptTexte = prompt;
    _loading = true; _error = null; _showPrompt = false;
    draw();

    try {
      const text = await appelIA(prompt, config);
      traiterReponseIA(text);
    } catch(e) {
      console.error('Erreur IA:', e);
      _loading = false;
      _showPrompt = true;  // affiche le prompt pour copier-coller manuellement
      if (e.message.includes('401') || e.message.includes('403')) {
        _error = '❌ Clé API invalide ou non autorisée. Vérifiez votre configuration.';
      } else if (e.message.includes('429')) {
        _error = '⚠️ Quota API dépassé. Réessayez plus tard.';
      } else if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError') || e.message.includes('CORS')) {
        _error = "⚠️ Impossible de contacter l'API (CORS ou réseau). Utilisez le prompt ci-dessous pour copier-coller la réponse.";
      } else {
        _error = `⚠️ ${e.message}. Utilisez le prompt ci-dessous pour copier-coller manuellement.`;
      }
      draw();
      return;
    }
    _loading = false;
    draw();
  }

  // ── Config IA ─────────────────────────────────────────────
  const PROVIDERS = {
    claude: { label: 'Claude (Anthropic)', placeholder: 'sk-ant-api03-...' },
    openai: { label: 'ChatGPT (OpenAI)',   placeholder: 'sk-proj-...' },
    gemini: { label: 'Gemini (Google)',    placeholder: 'AIza...' },
  };

  function renderConfigIA(current) {
    if (current && !_cfgKey) { _cfgProvider = current.provider; _cfgKey = current.key; }
    const provSel = h('select', { class: 'form-input' });
    Object.entries(PROVIDERS).forEach(([k, v]) => {
      const opt = h('option', { value: k }, v.label);
      if (k === _cfgProvider) opt.selected = true;
      provSel.append(opt);
    });
    provSel.addEventListener('change', e => { _cfgProvider = e.target.value; draw(); });
    const keyInput = h('input', { class: 'form-input', type: 'password',
      placeholder: PROVIDERS[_cfgProvider]?.placeholder ?? '...', value: _cfgKey });
    keyInput.addEventListener('input', e => _cfgKey = e.target.value.trim());
    const LINKS = { claude:'https://console.anthropic.com/settings/keys',
      openai:'https://platform.openai.com/api-keys', gemini:'https://aistudio.google.com/app/apikey' };
    return h('div', { class: 'menu-config-panel' },
      h('div', { class: 'menu-config-title' }, '🔑 Configuration IA'),
      h('p', { class: 'menu-config-desc' }, 'Clé stockée uniquement dans votre navigateur, jamais transmise à d\'autres serveurs.'),
      h('div', { class: 'form-group' }, h('label', {}, 'Service'), provSel),
      h('div', { class: 'form-group' }, h('label', {}, 'Clé API'),
        h('div', { class: 'menu-config-key-row' },
          keyInput,
          h('a', { class: 'menu-config-link', href: LINKS[_cfgProvider] ?? '#', target: '_blank' }, '→ Obtenir')
        )
      ),
      h('div', { class: 'menu-config-actions' },
        current ? h('button', { class: 'btn-danger-full', onclick: () => {
          localStorage.removeItem(LS_API_KEY); _cfgKey = ''; state.showConfig = false; save(); draw();
          toast('Clé supprimée', 'ok');
        }}, '🗑️ Supprimer') : null,
        h('button', { class: 'btn-secondary', onclick: () => { state.showConfig = false; draw(); } }, 'Annuler'),
        h('button', { class: 'btn-primary', onclick: () => {
          if (!_cfgKey) { toast('Clé vide', 'error'); return; }
          saveApiConfig({ provider: _cfgProvider, key: _cfgKey });
          state.showConfig = false; save(); draw();
          toast('✅ Clé enregistrée !', 'ok');
        }}, '💾 Enregistrer')
      )
    );
  }

  // ── Bloc prompt + réponse manuelle ───────────────────────
  function renderBlcPrompt() {
    // Zone de texte pour coller la réponse JSON
    const repTxt = h('textarea', {
      class: 'menu-response-input',
      placeholder: "Collez ici la réponse JSON de l'IA…",
      rows: '6'
    });

    return h('div', { class: 'menu-prompt-panel' },
      h('div', { class: 'menu-prompt-title' }, '📋 Prompt à copier-coller'),
      h('p', { class: 'menu-prompt-desc' },
        'Copiez ce prompt, collez-le dans Claude.ai, ChatGPT ou Gemini, puis collez la réponse JSON dans le champ ci-dessous.'
      ),
      // Zone prompt
      h('div', { class: 'menu-prompt-box' },
        h('pre', { class: 'menu-prompt-text' }, _promptTexte),
        h('button', { class: 'menu-prompt-copy', onclick: () => {
          navigator.clipboard.writeText(_promptTexte).then(() => toast('✅ Prompt copié !', 'ok'));
        }}, '📋 Copier le prompt')
      ),
      // Zone réponse
      h('div', { class: 'menu-prompt-section-title' }, '⬇️ Collez la réponse JSON ici :'),
      repTxt,
      h('div', { class: 'menu-config-actions' },
        h('button', { class: 'btn-secondary', onclick: () => {
          _showPrompt = false; draw();
        }}, 'Fermer'),
        h('button', { class: 'btn-primary', onclick: () => {
          try {
            traiterReponseIA(repTxt.value);
            _showPrompt = false; _error = null;
            draw();
            toast('✅ Menus importés !', 'ok');
          } catch(e) {
            toast('❌ JSON invalide : ' + e.message, 'error');
          }
        }}, '✅ Importer la réponse')
      )
    );
  }

  // ── Bouton pour afficher le prompt manuellement ───────────
  function btnVoirPrompt() {
    return h('button', {
      class: 'btn-secondary', style: 'margin-top:8px;width:100%;font-size:.85rem;',
      onclick: () => { _promptTexte = construirePrompt(); _showPrompt = true; draw(); }
    }, '📋 Voir / copier le prompt pour une IA externe');
  }

  // ── Intro ─────────────────────────────────────────────────
  function renderIntro(hasIA) {
    return h('div', { class: 'menu-intro' },
      h('div', { class: 'menu-intro-icon' }, '👨‍🍳'),
      h('p', {}, hasIA
        ? "L'IA va composer des menus sur-mesure en tenant compte de votre stock."
        : "30 recettes françaises classiques, sélectionnées selon votre stock."),
      h('ul', { class: 'menu-intro-list' },
        h('li', {}, '✅ Validez les repas qui vous conviennent'),
        h('li', {}, '🔄 Remplacez ceux qui ne vous plaisent pas'),
        h('li', {}, '💾 Vos choix sont sauvegardés automatiquement'),
        h('li', {}, '🛒 Liste de courses générée pour les menus validés')
      )
    );
  }

  // ── Créer liste de courses ────────────────────────────────
  function creerListeCourses(manquants) {
    const produits = getProduits();
    const elements = manquants.map(ing => {
      const lc = ing.toLowerCase();
      const match = produits.find(p =>
        p.nom.toLowerCase() === lc || p.nom.toLowerCase().includes(lc) || lc.includes(p.nom.toLowerCase())
      );
      return { id: crypto.randomUUID(), produitId: match?.id ?? crypto.randomUUID(),
        nom: match?.nom ?? ing, emoji: match?.emoji ?? '🛒',
        categorie: match?.categorie ?? 'Autre', unite: match?.unite ?? 'unité',
        quantite: 1, estCoche: false, note: null };
    });
    const sem = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit' });
    const nbVal = state.menus.filter(m => m.valide).length;
    ajouterListe({ nom: `Menus de la semaine (${sem})`,
      description: `${nbVal} repas pour ${state.nbPersonnes} pers.`,
      emoji: '🍽️', couleur: '#4CAF50', elements });
    state.listeCreee = true; save();
    toast('✅ Liste créée !', 'ok'); draw();
  }

  draw();
}
