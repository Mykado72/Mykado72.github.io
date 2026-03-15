// ── Page : Produits ───────────────────────────────────────
import { getProduits, ajouterProduit, modifierProduit, dupliquerProduit, supprimerProduit,
         listesPourProduit, onStoreChange, offStoreChange } from '../store.js';
import { CATEGORIES, getCatEmoji } from '../data.js';
import { h, render, openModal, closeModal } from '../ui.js';

const EMOJI_PAR_CAT = {
  'Fruits & Légumes':  ['🍎','🍊','🍋','🍇','🥦','🥕','🍅','🥑','🍓','🌽'],
  'Viandes & Poissons':['🥩','🍗','🐟','🦐','🥓','🍖','🦑','🐠','🐓','🥚'],
  'Produits Laitiers': ['🧀','🥛','🧈','🍦','🥗','🫙','🍶','🫐','🎂','🍰'],
  'Boulangerie':       ['🥖','🍞','🥐','🥨','🧇','🥞','🫓','🍩','🧁','🎂'],
  'Épicerie':          ['🥫','🍝','🍚','🌾','🍬','🫒','☕','🍵','🧂','🥜'],
  'Boissons':          ['💧','🧃','🥤','🍊','☕','🍵','🧋','🍶','🫖','🥛'],
  'Surgelés':          ['🧊','🍦','🍕','🥟','🍟','🫕','🥘','🍲','🧆','🥙'],
  'Snacks & Sucreries':['🍿','🍫','🍬','🍭','🧁','🍩','🥜','🍪','🎂','🍰'],
  'Hygiène & Beauté':  ['🧴','🪥','🧼','🪒','💊','🩹','🫧','💅','🧹','🪞'],
  'Entretien':         ['🧹','🧺','🪣','🧽','🧻','🪠','🪤','🔧','🪣','🫧'],
  'Autre':             ['📦','🛒','⭐','❤️','🎁','✏️','📝','🔑','💡','🎯'],
};

export function renderProduits(container) {
  let recherche = '';
  let catFiltre = '';

  function draw() {
    const produits = getProduits();
    const filtered = produits
      .filter(p => !catFiltre || p.categorie === catFiltre)
      .filter(p => !recherche || p.nom.toLowerCase().includes(recherche.toLowerCase()))
      .sort((a, b) => a.categorie.localeCompare(b.categorie) || a.nom.localeCompare(b.nom));

    // Filtres catégorie
    const catFiltersEl = h('div', { class: 'category-filters', style: 'margin-bottom:16px;' });
    catFiltersEl.append(h('button', { class: `filter-btn${catFiltre === '' ? ' active' : ''}`, onclick: () => { catFiltre = ''; draw(); } }, 'Tout'));
    Object.keys(CATEGORIES).forEach(cat => {
      const cnt = produits.filter(p => p.categorie === cat).length;
      if (!cnt) return;
      catFiltersEl.append(h('button', {
        class: `filter-btn${catFiltre === cat ? ' active' : ''}`,
        onclick: () => { catFiltre = cat; draw(); }
      }, `${getCatEmoji(cat)} ${cat}`));
    });

    const rechercheInput = h('input', { class: 'search-input', type: 'text', placeholder: 'Rechercher un produit...', value: recherche });
    rechercheInput.addEventListener('input', e => { recherche = e.target.value; draw(); });

    const bycat = Object.entries(
      filtered.reduce((acc, p) => { if (!acc[p.categorie]) acc[p.categorie] = []; acc[p.categorie].push(p); return acc; }, {})
    ).sort(([a], [b]) => a.localeCompare(b));

    render(container,
      h('div', { class: 'page-header' },
        h('div', {},
          h('h1', {}, '🏪 Produits'),
          h('p', { class: 'subtitle' }, `${produits.length} produit(s) dans le catalogue`)
        ),
        h('button', { class: 'btn-primary', onclick: () => openProduitModal(null) }, '＋ Nouveau produit')
      ),
      catFiltersEl,
      h('div', { class: 'search-box', style: 'margin-bottom:20px;' },
        h('span', { class: 'search-icon' }, '🔍'),
        rechercheInput,
        recherche ? h('button', { class: 'search-clear', onclick: () => { recherche = ''; draw(); } }, '✕') : null
      ),
      filtered.length === 0 ? h('div', { class: 'empty-state' }, h('div', { class: 'empty-icon' }, '🔍'), h('h2', {}, 'Aucun produit trouvé')) :
        h('div', {},
          ...bycat.map(([cat, prods]) =>
            h('div', { class: 'category-section' },
              h('div', { class: 'category-header' }, h('span', {}, `${getCatEmoji(cat)} ${cat}`), h('span', { class: 'category-count' }, prods.length)),
              h('div', { class: 'produits-grid' },
                ...prods.map(p => h('div', { class: 'produit-card' },
                  h('div', { class: 'produit-card-header' },
                    h('span', { class: 'produit-emoji' }, p.emoji),
                    h('div', { class: 'produit-card-actions' },
                      h('button', { class: 'btn-icon', title: 'Modifier', onclick: () => openProduitModal(p) }, '✏️'),
                      h('button', { class: 'btn-icon variante-icon', title: 'Créer une variante', onclick: () => dupliquerProduit(p.id) }, '±'),
                      h('button', { class: 'btn-icon btn-danger', title: 'Supprimer', onclick: () => confirmerSuppression(p) }, '🗑️')
                    )
                  ),
                  h('div', { class: 'produit-nom' }, p.nom),
                  h('div', { class: 'produit-meta' }, `${p.categorie} • ${p.unite}`)
                ))
              )
            )
          )
        )
    );
  }

  // ── Modal créer/éditer ────────────────────────────────────
  function openProduitModal(produit) {
    const isNew = !produit;
    let form = {
      nom:       produit?.nom ?? '',
      categorie: produit?.categorie ?? 'Autre',
      emoji:     produit?.emoji ?? '🛒',
      unite:     produit?.unite ?? 'unité',
    };

    openModal((box) => {
      const nomInput   = h('input', { class: 'form-input', type: 'text', placeholder: 'Nom du produit', value: form.nom });
      const uniteInput = h('input', { class: 'form-input', type: 'text', placeholder: 'unité, kg, L…', value: form.unite });
      nomInput.addEventListener('input',   e => form.nom   = e.target.value);
      uniteInput.addEventListener('input', e => form.unite = e.target.value);

      // Sélecteur catégorie
      const catSel = h('select', { class: 'form-input' }, ...Object.keys(CATEGORIES).map(c => {
        const opt = h('option', { value: c }, `${getCatEmoji(c)} ${c}`);
        if (c === form.categorie) opt.selected = true;
        return opt;
      }));
      catSel.addEventListener('change', e => { form.categorie = e.target.value; rebuildEmojis(); });

      const emojiGrid = h('div', { class: 'emoji-grid' });
      function rebuildEmojis() {
        emojiGrid.innerHTML = '';
        const emojis = EMOJI_PAR_CAT[form.categorie] ?? ['📦'];
        emojis.forEach(e => {
          emojiGrid.append(h('button', {
            class: `emoji-btn${e === form.emoji ? ' active' : ''}`, type: 'button',
            onclick: () => { form.emoji = e; rebuildEmojis(); }
          }, e));
        });
        // bouton emoji perso
        const customBtn = h('button', { class: 'emoji-btn', type: 'button', title: 'Emoji personnalisé',
          onclick: () => {
            const v = prompt('Entrez un emoji :');
            if (v) { form.emoji = v.trim(); rebuildEmojis(); }
          }
        }, '✏️');
        emojiGrid.append(customBtn);
      }
      rebuildEmojis();

      render(box,
        h('h2', {}, isNew ? '＋ Nouveau produit' : '✏️ Modifier le produit'),
        h('div', { class: 'form-group' }, h('label', {}, 'Nom'), nomInput),
        h('div', { class: 'form-group' }, h('label', {}, 'Catégorie'), catSel),
        h('div', { class: 'form-group' }, h('label', {}, 'Emoji'), emojiGrid),
        h('div', { class: 'form-group' }, h('label', {}, 'Unité'), uniteInput),
        h('div', { class: 'modal-actions' },
          h('button', { class: 'btn-secondary', onclick: closeModal }, 'Annuler'),
          h('button', { class: 'btn-primary', onclick: () => {
            if (!form.nom.trim()) { nomInput.focus(); return; }
            if (isNew) ajouterProduit({ ...form });
            else modifierProduit({ ...produit, ...form });
            closeModal();
          }}, isNew ? '＋ Créer' : '💾 Enregistrer')
        )
      );
    });
  }

  // ── Confirmation suppression ──────────────────────────────
  function confirmerSuppression(produit) {
    const listes = listesPourProduit(produit.id);
    openModal((box) => {
      render(box,
        h('h2', {}, '⚠️ Supprimer ce produit ?'),
        h('div', { class: 'suppr-produit-preview' },
          h('span', {}, produit.emoji),
          h('strong', {}, produit.nom),
          h('span', { class: 'suppr-produit-cat' }, produit.categorie)
        ),
        listes.length > 0
          ? h('div', { class: 'suppr-warning' },
              h('div', { class: 'suppr-warning-title' }, `🚫 Ce produit est utilisé dans ${listes.length} liste(s) :`),
              ...listes.map(l => h('div', { class: 'suppr-liste-item' },
                h('span', {}, `${l.emoji} ${l.nom}`),
                h('span', { class: 'suppr-liste-nb' }, `${l.elements.filter(e => e.produitId === produit.id).length} occurrence(s)`)
              )),
              h('div', { class: 'suppr-warning-note' }, 'Il sera également retiré de ces listes.')
            )
          : h('p', { style: 'color:var(--text-2);font-size:.88rem;margin-bottom:4px;' }, 'Ce produit sera retiré du catalogue. Cette action est irréversible.'),
        h('div', { class: 'modal-actions', style: 'margin-top:16px;' },
          h('button', { class: 'btn-secondary', onclick: closeModal }, 'Annuler'),
          h('button', { class: 'btn-danger-full', onclick: () => { supprimerProduit(produit.id); closeModal(); } }, '🗑️ Supprimer quand même')
        )
      );
    }, { small: true });
  }

  onStoreChange(draw);
  draw();
  return () => offStoreChange(draw);
}
