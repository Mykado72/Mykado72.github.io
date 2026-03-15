// ── Page : Stock à la maison ──────────────────────────────
import { getStock, getProduits, setStock, supprimerStock,
         onStoreChange, offStoreChange, fmtQty } from '../store.js';
import { CATEGORIES, getCatEmoji } from '../data.js';
import { h, render, openModal, closeModal } from '../ui.js';

export function renderStock(container) {
  let recherche = '';

  function draw() {
    const stock = getStock().sort((a, b) => a.categorie?.localeCompare(b.categorie) || a.nom.localeCompare(b.nom));
    const filtered = stock.filter(s =>
      !recherche || s.nom.toLowerCase().includes(recherche.toLowerCase())
    );
    const bycat = groupBy(filtered, s => s.categorie);

    const rechercheInput = h('input', { class: 'search-input', type: 'text', placeholder: 'Rechercher dans le stock...', value: recherche });
    rechercheInput.addEventListener('input', e => { recherche = e.target.value; draw(); });

    render(container,
      h('div', { class: 'page-header' },
        h('div', {},
          h('h1', {}, '🏠 Stock à la maison'),
          h('p', { class: 'subtitle' }, `${stock.length} produit(s) en stock`)
        ),
        h('button', { class: 'btn-primary', onclick: () => openStockModal(null) }, '＋ Ajouter au stock')
      ),
      h('div', { class: 'search-box', style: 'margin-bottom:20px;' },
        h('span', { class: 'search-icon' }, '🔍'),
        rechercheInput,
        recherche ? h('button', { class: 'search-clear', onclick: () => { recherche = ''; draw(); } }, '✕') : null
      ),
      stock.length === 0
        ? h('div', { class: 'empty-state' }, h('div', { class: 'empty-icon' }, '🏠'), h('h2', {}, 'Stock vide'), h('p', {}, 'Ajoutez vos produits disponibles à la maison'))
        : h('div', {},
            ...bycat.map(([cat, items]) =>
              h('div', { class: 'category-section' },
                h('div', { class: 'category-header' },
                  h('span', {}, `${getCatEmoji(cat)} ${cat}`),
                  h('span', { class: 'category-count' }, items.length)
                ),
                ...items.map(s => h('div', { class: 'stock-row' },
                  h('div', { class: 'stock-info' },
                    h('span', { class: 'stock-emoji' }, s.emoji),
                    h('div', {},
                      h('div', { class: 'stock-nom' }, s.nom),
                      h('div', { class: 'stock-cat' }, s.categorie)
                    )
                  ),
                  h('div', { class: 'stock-controls' },
                    h('div', { class: 'stock-qty-editor' },
                      h('button', { class: 'qty-btn', onclick: () => setStock(s.produitId, Math.max(0, s.quantite - 0.5)) }, '−'),
                      h('span', { class: 'qty-val stock-qty-val' }, `${fmtQty(s.quantite)} ${s.unite}`),
                      h('button', { class: 'qty-btn', onclick: () => setStock(s.produitId, s.quantite + 0.5) }, '＋')
                    ),
                    h('button', { class: 'btn-icon', title: 'Modifier', onclick: () => openStockModal(s) }, '✏️'),
                    h('button', { class: 'btn-icon btn-danger', title: 'Retirer', onclick: () => supprimerStock(s.produitId) }, '🗑️')
                  )
                ))
              )
            )
          )
    );
  }

  // ── Modal ajout/édition stock ─────────────────────────────
  function openStockModal(stockEntry) {
    const isEdit = !!stockEntry;
    let qty = stockEntry?.quantite ?? 1;
    let selectedProduit = null;
    let catFiltre = '';
    let rechercheProd = '';

    openModal((box) => {
      function buildSearchView() {
        const produits = getProduits().filter(p => !getStock().some(s => s.produitId === p.id));
        const filtred = produits
          .filter(p => !catFiltre || p.categorie === catFiltre)
          .filter(p => !rechercheProd || p.nom.toLowerCase().includes(rechercheProd.toLowerCase()))
          .sort((a, b) => a.categorie.localeCompare(b.categorie) || a.nom.localeCompare(b.nom))
          .slice(0, 20);

        const catBar = h('div', { class: 'category-filters stock-cat-filters' });
        catBar.append(h('button', { class: `filter-btn${catFiltre === '' ? ' active' : ''}`, onclick: () => { catFiltre = ''; rebuildContent(); } }, 'Tout'));
        Object.keys(CATEGORIES).forEach(cat => {
          const cnt = produits.filter(p => p.categorie === cat).length;
          if (!cnt) return;
          catBar.append(h('button', { class: `filter-btn${catFiltre === cat ? ' active' : ''}`, onclick: () => { catFiltre = cat; rebuildContent(); } }, `${getCatEmoji(cat)}`));
        });

        const rechInput = h('input', { class: 'search-input', type: 'text', placeholder: 'Rechercher un produit...', value: rechercheProd });
        rechInput.addEventListener('input', e => { rechercheProd = e.target.value; rebuildContent(); });

        let suggestions;
        if (filtred.length > 0) {
          suggestions = h('div', { class: 'suggestions-dropdown' },
            ...filtred.map(p => h('div', { class: 'suggestion-item', onclick: () => { selectedProduit = p; qty = 1; rebuildContent(); } },
              h('span', {}, `${p.emoji} ${p.nom}`),
              h('span', { class: 'suggestion-cat' }, `${p.categorie} • ${p.unite}`)
            ))
          );
        } else if (rechercheProd || catFiltre) {
          suggestions = h('div', { class: 'no-suggestion' }, 'Aucun produit trouvé (ou déjà en stock)');
        } else {
          suggestions = null;
        }

        return [catBar, h('div', { class: 'search-box', style: 'margin-bottom:10px;' }, h('span', { class: 'search-icon' }, '🔍'), rechInput), suggestions].filter(Boolean);
      }

      function buildProduitView(p, label) {
        const qtyInput = h('input', { class: 'form-input qty-input-center', type: 'number', min: '0', step: '0.5', value: qty });
        qtyInput.addEventListener('input', e => qty = parseFloat(e.target.value) || 0);
        return [
          h('div', { class: 'modal-produit-header' },
            h('span', { class: 'modal-produit-emoji' }, p.emoji),
            h('div', {}, h('div', { class: 'modal-produit-nom' }, p.nom), h('div', { class: 'modal-produit-cat' }, p.categorie)),
            !isEdit ? h('button', { class: 'btn-icon', style: 'margin-left:auto', onclick: () => { selectedProduit = null; rebuildContent(); } }, '✕') : null
          ),
          h('div', { class: 'form-group' },
            h('label', {}, 'Quantité en stock'),
            h('div', { class: 'stock-qty-editor' },
              h('button', { class: 'qty-btn qty-btn-lg', type: 'button', onclick: () => { qty = Math.max(0, qty - 1); qtyInput.value = qty; } }, '−'),
              qtyInput,
              h('button', { class: 'qty-btn qty-btn-lg', type: 'button', onclick: () => { qty += 1; qtyInput.value = qty; } }, '＋'),
              h('span', { class: 'qty-unite-label' }, p.unite ?? stockEntry?.unite)
            )
          ),
          h('div', { class: 'modal-actions' },
            h('button', { class: 'btn-secondary', onclick: closeModal }, 'Annuler'),
            h('button', { class: 'btn-primary', onclick: () => {
              const pid = isEdit ? stockEntry.produitId : selectedProduit?.id;
              if (!pid) return;
              setStock(pid, qty);
              closeModal();
            }}, label)
          )
        ];
      }

      function rebuildContent() {
        box.innerHTML = '';
        if (isEdit) {
          box.append(h('h2', {}, 'Modifier le stock'));
          buildProduitView({ emoji: stockEntry.emoji, nom: stockEntry.nom, categorie: stockEntry.categorie, unite: stockEntry.unite }, 'Enregistrer')
            .forEach(el => box.append(el));
        } else if (selectedProduit) {
          box.append(h('h2', {}, 'Ajouter au stock'));
          buildProduitView(selectedProduit, '＋ Ajouter au stock')
            .forEach(el => box.append(el));
        } else {
          box.append(h('h2', {}, 'Ajouter au stock'));
          buildSearchView().forEach(el => el && box.append(el));
          box.append(h('div', { class: 'modal-actions', style: 'margin-top:16px;' },
            h('button', { class: 'btn-secondary', onclick: closeModal }, 'Annuler')
          ));
        }
      }

      rebuildContent();
    }, { top: !isEdit });
  }

  onStoreChange(draw);
  draw();
  return () => offStoreChange(draw);
}

function groupBy(arr, keyFn) {
  const map = new Map();
  arr.forEach(item => { const k = keyFn(item); if (!map.has(k)) map.set(k, []); map.get(k).push(item); });
  return [...map.entries()];
}
