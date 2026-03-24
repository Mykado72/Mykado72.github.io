// ── Page : Menu de la semaine ─────────────────────────────
import { getListes, getStock, getProduits, ajouterListe } from '../store.js';
import { h, render, toast } from '../ui.js';
import { navigate } from '../router.js';

// ── Base de recettes françaises ───────────────────────────
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

// ── Gestion des clés API ──────────────────────────────────
const LS_API_KEY = 'mldc-api-config';

function getApiConfig() {
  try { return JSON.parse(localStorage.getItem(LS_API_KEY) ?? 'null'); } catch { return null; }
}
function saveApiConfig(cfg) {
  localStorage.setItem(LS_API_KEY, JSON.stringify(cfg));
}

// ── Appel IA selon le provider ────────────────────────────
async function appelIA(prompt, config) {
  if (config.provider === 'claude') {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? `HTTP ${resp.status}`);
    }
    const data = await resp.json();
    return data.content?.[0]?.text ?? '';
  }

  if (config.provider === 'openai') {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.key}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? `HTTP ${resp.status}`);
    }
    const data = await resp.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  if (config.provider === 'gemini') {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? `HTTP ${resp.status}`);
    }
    const data = await resp.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }

  throw new Error('Provider inconnu');
}

// ── Page principale ───────────────────────────────────────
export function renderMenu(container) {
  let nbPersonnes  = 2;
  let nbRepas      = 7;
  let _menus       = null;
  let _loading     = false;
  let _error       = null;
  let _listeCreee  = false;
  let _showConfig  = false;

  // Config IA en cours d'édition
  let _cfgProvider = 'claude';
  let _cfgKey      = '';

  function draw() {
    const apiConfig = getApiConfig();

    render(container,
      h('div', { class: 'page-header' },
        h('div', {},
          h('h1', {}, '🍽️ Menu de la semaine'),
          h('p', { class: 'subtitle' }, 'Menus équilibrés selon votre stock et vos courses')
        ),
        h('button', {
          class: `btn-secondary${apiConfig ? ' btn-ia-active' : ''}`,
          title: apiConfig ? `IA configurée : ${apiConfig.provider}` : 'Configurer une IA',
          onclick: () => { _showConfig = !_showConfig; draw(); }
        }, apiConfig ? `🤖 ${PROVIDERS[apiConfig.provider]?.label ?? apiConfig.provider}` : '🔑 Configurer l\'IA')
      ),

      // ── Panel config IA ───────────────────────────────────
      _showConfig ? renderConfigIA(apiConfig) : null,

      // ── Paramètres ────────────────────────────────────────
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
        h('button', {
          class: `btn-primary menu-generate-btn${_loading ? ' loading' : ''}`,
          disabled: _loading,
          onclick: () => {
            if (getApiConfig()) genererMenusIA();
            else genererMenusLocal();
          }
        }, _loading ? '⏳ Génération en cours…' : (apiConfig ? '🤖 Générer avec l\'IA' : '🍽️ Générer les menus'))
      ),

      _error ? h('div', { class: 'menu-error' }, `❌ ${_error}`) : null,

      _loading ? h('div', { class: 'menu-loading' },
        h('div', { class: 'menu-loading-icon' }, '⏳'),
        h('p', {}, apiConfig ? "L'IA compose vos menus…" : "Sélection des menus en cours…")
      ) : null,

      _menus && !_loading ? renderResultat() : null,

      !_menus && !_loading && !_error ? renderIntro(!!apiConfig) : null
    );
  }

  // ── Panel configuration IA ────────────────────────────────
  const PROVIDERS = {
    claude:  { label: 'Claude (Anthropic)', placeholder: 'sk-ant-api03-...' },
    openai:  { label: 'ChatGPT (OpenAI)',    placeholder: 'sk-proj-...' },
    gemini:  { label: 'Gemini (Google)',     placeholder: 'AIza...' },
  };

  function renderConfigIA(current) {
    if (current && !_cfgKey) { _cfgProvider = current.provider; _cfgKey = current.key; }

    const providerSel = h('select', { class: 'form-input' });
    Object.entries(PROVIDERS).forEach(([key, val]) => {
      const opt = h('option', { value: key }, val.label);
      if (key === _cfgProvider) opt.selected = true;
      providerSel.append(opt);
    });
    providerSel.addEventListener('change', e => { _cfgProvider = e.target.value; draw(); });

    const keyInput = h('input', {
      class: 'form-input',
      type: 'password',
      placeholder: PROVIDERS[_cfgProvider]?.placeholder ?? 'Clé API…',
      value: _cfgKey
    });
    keyInput.addEventListener('input', e => _cfgKey = e.target.value.trim());

    return h('div', { class: 'menu-config-panel' },
      h('div', { class: 'menu-config-title' }, '🔑 Configuration de l\'IA'),
      h('p', { class: 'menu-config-desc' },
        'Votre clé API est stockée uniquement dans votre navigateur (localStorage). Elle n\'est jamais envoyée ailleurs que vers le service choisi.'
      ),
      h('div', { class: 'form-group' }, h('label', {}, 'Service IA'), providerSel),
      h('div', { class: 'form-group' },
        h('label', {}, 'Clé API'),
        h('div', { class: 'menu-config-key-row' },
          keyInput,
          h('a', {
            class: 'menu-config-link',
            href: PROVIDERS[_cfgProvider] ? {
              claude: 'https://console.anthropic.com/settings/keys',
              openai: 'https://platform.openai.com/api-keys',
              gemini: 'https://aistudio.google.com/app/apikey',
            }[_cfgProvider] : '#',
            target: '_blank'
          }, '→ Obtenir une clé')
        )
      ),
      h('div', { class: 'menu-config-actions' },
        current ? h('button', { class: 'btn-danger-full', onclick: () => {
          localStorage.removeItem(LS_API_KEY);
          _cfgKey = ''; _showConfig = false; draw();
          toast('Clé supprimée', 'ok');
        }}, '🗑️ Supprimer la clé') : null,
        h('button', { class: 'btn-secondary', onclick: () => { _showConfig = false; draw(); } }, 'Annuler'),
        h('button', { class: 'btn-primary', onclick: () => {
          if (!_cfgKey) { toast('Clé API vide', 'error'); return; }
          saveApiConfig({ provider: _cfgProvider, key: _cfgKey });
          _showConfig = false; draw();
          toast('✅ Clé enregistrée !', 'ok');
        }}, '💾 Enregistrer')
      )
    );
  }

  // ── Génération locale (algo) ──────────────────────────────
  function genererMenusLocal() {
    _error = null; _listeCreee = false; _menus = null;

    const stockNoms   = new Set(getStock().map(s => s.nom.toLowerCase()));
    const listesNoms  = new Set(getListes().flatMap(l => l.elements.map(e => e.nom.toLowerCase())));
    const dispo = nom => stockNoms.has(nom.toLowerCase()) || listesNoms.has(nom.toLowerCase());

    const scorees = RECETTES
      .map(r => {
        const tous = [...r.proteines, ...r.ingredients];
        const score = tous.filter(i => dispo(i)).length / Math.max(tous.length, 1);
        return { r, score };
      })
      .sort((a, b) => b.score - a.score || Math.random() - 0.5);

    // Sélection avec variété — utilise une vraie Map
    const selection = [];
    const protCount  = new Map();

    for (const { r } of scorees) {
      if (selection.length >= nbRepas) break;
      const protKey = r.proteines[0] ?? '__vege__';
      if ((protCount.get(protKey) ?? 0) >= 2) continue;
      selection.push(r);
      protCount.set(protKey, (protCount.get(protKey) ?? 0) + 1);
    }
    // Complète si nécessaire
    for (const { r } of scorees) {
      if (selection.length >= nbRepas) break;
      if (!selection.includes(r)) selection.push(r);
    }

    const SLOTS = [];
    const JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
    for (const jour of JOURS) {
      SLOTS.push({ jour, type: 'Déjeuner' }, { jour, type: 'Dîner' });
      if (SLOTS.length >= nbRepas * 2) break;
    }

    _menus = selection.slice(0, nbRepas).map((r, i) => {
      const slot = SLOTS[i] ?? { jour: `Repas ${i+1}`, type: 'Dîner' };
      const tous = [...r.proteines, ...r.ingredients];
      return {
        jour: slot.jour, type: slot.type,
        nom: r.nom, description: r.desc,
        ingredientsPrincipaux: tous.filter(i => dispo(i)),
        ingredientsManquants:  tous.filter(i => !dispo(i)),
        tempsPreparation: r.temps, difficulte: r.diff
      };
    });

    draw();
  }

  // ── Génération IA ─────────────────────────────────────────
  async function genererMenusIA() {
    const config = getApiConfig();
    if (!config) { genererMenusLocal(); return; }

    _loading = true; _error = null; _menus = null; _listeCreee = false;
    draw();

    const stock = getStock().map(s => `${s.nom} (${s.quantite} ${s.unite})`).join(', ') || 'vide';
    const listes = getListes().flatMap(l => l.elements.map(e => e.nom))
      .filter((v,i,a) => a.indexOf(v) === i).join(', ') || 'aucun';

    const prompt = `Tu es un chef cuisinier français. Propose ${nbRepas} repas équilibrés pour ${nbPersonnes} personne(s).
Stock disponible : ${stock}
Produits dans les listes de courses : ${listes}
Privilégie les produits disponibles. Varie viande/poisson/végétarien.
Réponds UNIQUEMENT avec un JSON valide (sans markdown) :
{"menus":[{"jour":"Lundi","type":"Dîner","nom":"Poulet rôti","description":"...","ingredientsPrincipaux":["Poulet","Pommes de terre"],"ingredientsManquants":["Pommes de terre"],"tempsPreparation":"45 min","difficulte":"Facile"}],"conseil":"..."}`;

    try {
      const text = await appelIA(prompt, config);
      const clean = text.replace(/^```(?:json)?\n?/,'').replace(/\n?```$/,'').trim();
      _menus = JSON.parse(clean).menus;
      if (!Array.isArray(_menus)) throw new Error('Format inattendu');
    } catch(e) {
      console.error(e);
      _error = e.message.includes('401') ? 'Clé API invalide. Vérifiez votre configuration.'
             : e.message.includes('429') ? 'Quota API dépassé. Réessayez plus tard.'
             : `Erreur IA : ${e.message}. Génération locale utilisée à la place.`;
      genererMenusLocal(); return;
    } finally {
      _loading = false;
    }
    draw();
  }

  // ── Affichage résultats ───────────────────────────────────
  function renderResultat() {
    const menus = _menus ?? [];
    const manquants = [...new Set(menus.flatMap(m => m.ingredientsManquants ?? []))];
    const conseil = _menus?.conseil;

    return h('div', { class: 'menu-resultat' },
      conseil ? h('div', { class: 'menu-conseil' }, `💡 ${conseil}`) : null,
      h('div', { class: 'menu-conseil' },
        `✅ ${menus.length} repas planifiés pour ${nbPersonnes} personne(s). ` +
        `${menus.filter(m=>!(m.ingredientsManquants??[]).length).length} entièrement réalisables avec votre stock.`
      ),
      h('div', { class: 'menu-grid' },
        ...menus.map(m => {
          const dKey = (m.difficulte ?? 'facile').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
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
              (m.ingredientsPrincipaux??[]).length ? h('div', { class: 'menu-ingredients menu-ok' },
                h('span', { class: 'menu-ing-label' }, '✅ Déjà disponible :'),
                h('span', {}, (m.ingredientsPrincipaux??[]).join(', '))
              ) : null,
              (m.ingredientsManquants??[]).length ? h('div', { class: 'menu-ingredients menu-missing' },
                h('span', { class: 'menu-ing-label' }, '🛒 À acheter :'),
                h('span', {}, (m.ingredientsManquants??[]).join(', '))
              ) : null
            )
          );
        })
      ),
      h('div', { class: 'menu-recap' + (manquants.length === 0 ? ' menu-recap-ok' : '') },
        manquants.length === 0
          ? '🎉 Tous les ingrédients sont déjà disponibles !'
          : h('div', {},
              h('div', { class: 'menu-recap-title' }, `🛒 ${manquants.length} ingrédient(s) à acheter`),
              h('div', { class: 'menu-recap-list' }, ...manquants.map(ing => h('div', { class: 'menu-recap-item' }, `• ${ing}`))),
              !_listeCreee
                ? h('button', { class: 'btn-primary', style: 'margin-top:14px;width:100%;', onclick: () => creerListeCourses(manquants) },
                    '📋 Créer la liste de courses « Menus de la semaine »')
                : h('div', { class: 'menu-liste-ok' }, '✅ Liste créée ! ',
                    h('span', { class: 'breadcrumb-link', onclick: () => navigate('#/') }, 'Voir mes listes →'))
            )
      ),
      h('button', { class: 'btn-secondary', style: 'margin-top:16px;width:100%;',
        onclick: () => { if (getApiConfig()) genererMenusIA(); else genererMenusLocal(); }
      }, '🔄 Générer d\'autres suggestions')
    );
  }

  function renderIntro(hasIA) {
    return h('div', { class: 'menu-intro' },
      h('div', { class: 'menu-intro-icon' }, '👨‍🍳'),
      hasIA
        ? h('p', {}, 'L\'IA va composer des menus personnalisés en tenant compte de votre stock et de vos courses.')
        : h('p', {}, 'L\'application sélectionne 30 recettes françaises classiques en tenant compte de votre stock.'),
      h('ul', { class: 'menu-intro-list' },
        h('li', {}, '🥦 Protéines variées : viande, poisson, végétarien'),
        h('li', {}, '🏠 Priorité aux ingrédients déjà en stock'),
        h('li', {}, '🛒 Liste de courses générée automatiquement'),
        !hasIA ? h('li', {}, '🔑 Configurez une IA (Claude/ChatGPT/Gemini) pour des menus sur-mesure') : null
      )
    );
  }

  function creerListeCourses(manquants) {
    const produits = getProduits();
    const elements = manquants.map(ing => {
      const lc = ing.toLowerCase();
      const match = produits.find(p => p.nom.toLowerCase() === lc || p.nom.toLowerCase().includes(lc) || lc.includes(p.nom.toLowerCase()));
      return { id: crypto.randomUUID(), produitId: match?.id ?? crypto.randomUUID(),
        nom: match?.nom ?? ing, emoji: match?.emoji ?? '🛒',
        categorie: match?.categorie ?? 'Autre', unite: match?.unite ?? 'unité',
        quantite: 1, estCoche: false, note: null };
    });
    const sem = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit' });
    ajouterListe({ nom: `Menus de la semaine (${sem})`, description: `${nbRepas} repas pour ${nbPersonnes} pers.`, emoji: '🍽️', couleur: '#4CAF50', elements });
    _listeCreee = true;
    toast('✅ Liste créée !', 'ok');
    draw();
  }

  draw();
}
