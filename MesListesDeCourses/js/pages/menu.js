// ── Page : Menu de la semaine (IA) ───────────────────────
import { getListes, getStock, getProduits, ajouterListe } from '../store.js';
import { h, render, toast } from '../ui.js';
import { navigate } from '../router.js';

const JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
const REPAS_TYPES = ['Déjeuner','Dîner'];

export function renderMenu(container) {
  let nbPersonnes = 2;
  let nbRepas     = 7;  // repas à planifier (sur 14 max pour 7 jours)
  let _menus      = null;  // résultat IA
  let _loading    = false;
  let _error      = null;
  let _listeCreee = false;

  function draw() {
    render(container,
      h('div', { class: 'page-header' },
        h('div', {},
          h('h1', {}, '🍽️ Menu de la semaine'),
          h('p', { class: 'subtitle' }, 'Laissez l\'IA composer vos menus selon votre stock')
        )
      ),

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
          h('label', { class: 'menu-param-label' }, '🍴 Repas à planifier cette semaine'),
          h('div', { class: 'menu-param-stepper' },
            h('button', { class: 'qty-btn', onclick: () => { if (nbRepas > 1) { nbRepas--; draw(); } } }, '−'),
            h('span', { class: 'menu-param-val' }, nbRepas),
            h('button', { class: 'qty-btn', onclick: () => { if (nbRepas < 14) { nbRepas++; draw(); } } }, '＋')
          )
        ),
        h('button', {
          class: `btn-primary menu-generate-btn${_loading ? ' loading' : ''}`,
          onclick: genererMenus,
          disabled: _loading
        },
          _loading ? '⏳ Génération en cours…' : '✨ Générer les menus'
        )
      ),

      // ── Résultat ou état ──────────────────────────────────
      _error   ? h('div', { class: 'menu-error' }, `❌ ${_error}`) : null,
      _loading ? h('div', { class: 'menu-loading' },
        h('div', { class: 'menu-loading-dots' }, ''),
        h('p', {}, 'L\'IA compose vos menus en tenant compte de votre stock…')
      ) : null,

      _menus && !_loading ? renderResultat() : null
    );
  }

  // ── Génération IA ─────────────────────────────────────────
  async function genererMenus() {
    _loading = true; _error = null; _menus = null; _listeCreee = false;
    draw();

    // Contexte : stock + produits dans les listes
    const stock = getStock().map(s => `${s.nom} (${s.quantite} ${s.unite})`).join(', ') || 'vide';
    const listesArticles = getListes()
      .flatMap(l => l.elements.map(e => e.nom))
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(', ') || 'aucun';

    const prompt = `Tu es un chef cuisinier français expert en planification de repas.

Contexte :
- Famille de ${nbPersonnes} personne(s)
- ${nbRepas} repas à planifier pour la semaine
- Stock à la maison : ${stock}
- Produits déjà dans les listes de courses : ${listesArticles}

Ta mission : propose ${nbRepas} repas équilibrés, variés et adaptés à une famille française.
Privilégie les produits déjà en stock ou dans les listes de courses.
Varie les protéines (viande, poisson, végétarien) et les types de cuisine.

Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de texte avant ou après) :
{
  "menus": [
    {
      "jour": "Lundi",
      "type": "Dîner",
      "nom": "Poulet rôti aux herbes",
      "description": "Poulet rôti avec pommes de terre et haricots verts",
      "ingredientsPrincipaux": ["Poulet", "Pommes de terre", "Haricots verts"],
      "ingredientsManquants": ["Haricots verts"],
      "tempsPreparation": "45 min",
      "difficulte": "Facile"
    }
  ],
  "conseil": "Un conseil général sur les menus proposés"
}

Inclus uniquement les ingrédients manquants dans ingredientsManquants (ceux qui ne sont ni en stock ni dans les listes).`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      const text = data.content?.[0]?.text ?? '';
      // Nettoie les backticks markdown éventuels
      const clean = text.replace(/```json|```/g, '').trim();
      _menus = JSON.parse(clean);
    } catch(e) {
      _error = 'Impossible de générer les menus. Vérifiez votre connexion.';
    }

    _loading = false;
    draw();
  }

  // ── Affichage des menus ───────────────────────────────────
  function renderResultat() {
    const menus = _menus?.menus ?? [];
    const conseil = _menus?.conseil;
    const manquants = [...new Set(menus.flatMap(m => m.ingredientsManquants ?? []))];

    return h('div', { class: 'menu-resultat' },

      conseil ? h('div', { class: 'menu-conseil' }, `💡 ${conseil}`) : null,

      // Grille des menus
      h('div', { class: 'menu-grid' },
        ...menus.map(m => {
          const inStock = (m.ingredientsPrincipaux ?? [])
            .filter(ing => !(m.ingredientsManquants ?? []).includes(ing));
          return h('div', { class: `menu-card menu-diff-${(m.difficulte||'').toLowerCase().replace(/é/g,'e')}` },
            h('div', { class: 'menu-card-header' },
              h('span', { class: 'menu-jour' }, m.jour),
              h('span', { class: 'menu-type' }, m.type)
            ),
            h('div', { class: 'menu-card-body' },
              h('div', { class: 'menu-nom' }, m.nom),
              h('div', { class: 'menu-desc' }, m.description),
              h('div', { class: 'menu-meta' },
                h('span', { class: 'menu-temps' }, `⏱ ${m.tempsPreparation}`),
                h('span', { class: `menu-badge menu-badge-${(m.difficulte||'').toLowerCase().replace(/é/g,'e')}` }, m.difficulte)
              ),
              // Ingrédients disponibles
              inStock.length ? h('div', { class: 'menu-ingredients menu-ok' },
                h('span', { class: 'menu-ing-label' }, '✅ En stock / en liste :'),
                h('span', {}, inStock.join(', '))
              ) : null,
              // Ingrédients manquants
              (m.ingredientsManquants ?? []).length ? h('div', { class: 'menu-ingredients menu-missing' },
                h('span', { class: 'menu-ing-label' }, '🛒 À acheter :'),
                h('span', {}, m.ingredientsManquants.join(', '))
              ) : null
            )
          );
        })
      ),

      // Récap ingrédients manquants + bouton liste
      manquants.length > 0 ? h('div', { class: 'menu-recap' },
        h('div', { class: 'menu-recap-title' }, `🛒 ${manquants.length} ingrédient(s) à acheter`),
        h('div', { class: 'menu-recap-list' },
          ...manquants.map(ing => h('div', { class: 'menu-recap-item' },
            h('span', {}, '• '),
            h('span', {}, ing)
          ))
        ),
        !_listeCreee
          ? h('button', { class: 'btn-primary', style: 'margin-top:14px;width:100%;',
              onclick: () => creerListeCourses(manquants)
            },
              '📋 Créer la liste de courses « Menus de la semaine »'
            )
          : h('div', { class: 'menu-liste-ok' },
              '✅ Liste créée ! ',
              h('span', { class: 'breadcrumb-link', onclick: () => navigate('#/') }, 'Voir mes listes →')
            )
      ) : h('div', { class: 'menu-recap menu-recap-ok' },
        '🎉 Tous les ingrédients sont déjà disponibles !'
      )
    );
  }

  // ── Création de la liste de courses ───────────────────────
  function creerListeCourses(manquants) {
    const produits = getProduits();
    const elements = manquants.map(ing => {
      // Essaie de trouver le produit correspondant
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
