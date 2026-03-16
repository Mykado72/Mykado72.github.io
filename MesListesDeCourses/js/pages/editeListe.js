// ── Page : Éditer une liste ───────────────────────────────
import { getListe, modifierListe, getStockByProduit, getProduits,
         onStoreChange, offStoreChange, fmtQty } from '../store.js';
import { CATEGORIES, getCatEmoji } from '../data.js';
import { navigate } from '../router.js';
import { h, render, openModal, closeModal, toast } from '../ui.js';
import { isVoiceSupported, startVoice, matchVoiceToProduits } from '../voice.js';
import { createSpinner } from '../spinner.js';
import { getSuggestionsContextuelles } from '../history.js';

export function renderEditeListe(container, { id }) {
  let catFiltre   = '';
  let recherche   = '';
  let _voiceStop  = null;
  let _voiceActive = false;

  function draw() {
    const liste = getListe(id);
    if (!liste) {
      render(container,
        h('div', { class: 'page-header' },
          h('h1', {}, 'Liste introuvable'),
          h('button', { class: 'btn-secondary', onclick: () => navigate('#/') }, '← Retour')
        )
      );
      return;
    }

    const parCat  = groupBy(liste.elements, e => e.categorie);
    const catsTri = Object.keys(parCat).sort();

    render(container,
      // ── Header ───────────────────────────────────────────
      h('div', { class: 'page-header' },
        h('div', {},
          h('div', { class: 'breadcrumb' },
            h('span', { class: 'breadcrumb-link', onclick: () => navigate('#/') }, 'Mes Listes'),
            h('span', {}, ' › '),
            h('span', {}, `${liste.emoji} ${liste.nom}`)
          ),
          h('h1', {}, `${liste.emoji} ${liste.nom}`),
          h('p', { class: 'subtitle' }, `${liste.elements.length} produit(s) dans cette liste`)
        ),
        h('div', { class: 'header-actions' },
          h('button', { class: 'btn-secondary', onclick: () => navigate('#/') }, '← Retour'),
          h('button', { class: 'btn-primary', onclick: () => navigate(`#/courses/${id}`) }, '🛒 Faire les courses')
        )
      ),

      // ── Éléments existants ────────────────────────────────
      liste.elements.length === 0
        ? h('div', { class: 'empty-state', style: 'padding:40px 20px;' },
            h('div', { class: 'empty-icon' }, '📝'),
            h('h2', {}, 'Liste vide'),
            h('p', {}, 'Ajoutez des produits ci-dessous')
          )
        : h('div', {},
            ...catsTri.map(cat =>
              h('div', { class: 'category-section' },
                h('div', { class: 'category-header' },
                  h('span', {}, `${getCatEmoji(cat)} ${cat}`),
                  h('span', { class: 'category-count' }, parCat[cat].length)
                ),
                ...parCat[cat].map(el => {
                  const stock = getStockByProduit(el.produitId);
                  return h('div', { class: el.estCoche ? 'element-row checked' : 'element-row' },
                    h('div', { class: 'element-info' },
                      h('span', { class: 'element-emoji' }, el.emoji),
                      h('div', {},
                        h('div', { class: 'element-nom' }, el.nom),
                        stock?.quantite > 0
                          ? h('div', { class: 'stock-inline-hint' }, `🏠 En stock : ${fmtQty(stock.quantite)} ${stock.unite}`)
                          : null
                      )
                    ),
                    h('div', { class: 'element-controls' },
                      h('div', { class: 'qty-control' },
                        h('button', { class: 'qty-btn', onclick: () => changerQty(liste, el, -1) }, '−'),
                        h('span', { class: 'qty-val' }, `${el.quantite} ${el.unite}`),
                        h('button', { class: 'qty-btn', onclick: () => changerQty(liste, el, 1) }, '＋')
                      ),
                      h('button', { class: 'btn-icon btn-danger', onclick: () => retirerElement(liste, el) }, '🗑️')
                    )
                  );
                })
              )
            )
          ),

      // ── Section ajouter ───────────────────────────────────
      renderAjouterSection(liste)
    );
  }

  // ── Section "Ajouter des produits" ────────────────────────
  function renderAjouterSection(liste) {
    const dejaIds   = new Set(liste.elements.map(e => e.produitId));
    const produits  = getProduits();

    const disponibles = produits
      .filter(p => !dejaIds.has(p.id))
      .filter(p => !catFiltre || p.categorie === catFiltre)
      .filter(p => !recherche || p.nom.toLowerCase().includes(recherche.toLowerCase()))
      .sort((a, b) => a.categorie.localeCompare(b.categorie) || a.nom.localeCompare(b.nom))
      .slice(0, 20);

    // Filtres catégorie
    const catFiltersEl = h('div', { class: 'category-filters stock-cat-filters' });
    catFiltersEl.append(
      h('button', { class: `filter-btn${catFiltre === '' ? ' active' : ''}`,
        onclick: () => { catFiltre = ''; draw(); } }, 'Tout')
    );
    Object.keys(CATEGORIES).forEach(cat => {
      const cnt = produits.filter(p => p.categorie === cat && !dejaIds.has(p.id)).length;
      if (!cnt) return;
      catFiltersEl.append(h('button', {
        class: `filter-btn${catFiltre === cat ? ' active' : ''}`,
        onclick: () => { catFiltre = cat; draw(); }
      }, `${getCatEmoji(cat)} ${cat}`));
    });

    const rechercheInput = h('input', {
      class: 'search-input', type: 'text',
      placeholder: 'Rechercher un produit...', value: recherche
    });
    rechercheInput.addEventListener('input', e => { recherche = e.target.value; draw(); });

    const clearBtn = recherche
      ? h('button', { class: 'search-clear', onclick: () => { recherche = ''; draw(); } }, '✕')
      : null;

    // Bouton micro
    const voiceBtn = isVoiceSupported()
      ? h('button', {
          class: `btn-voice${_voiceActive ? ' active' : ''}`,
          title: _voiceActive ? "Arrêter l'écoute" : 'Ajouter par la voix',
          onclick: toggleVoice
        }, _voiceActive ? '🔴' : '🎤')
      : null;

    // Résultats
    // Suggestions intelligentes (basées sur l'historique)
    const suggestions = getSuggestionsContextuelles(4)
      .filter(s => !dejaIds.has(s.produitId))
      .filter(s => !catFiltre || s.categorie === catFiltre)
      .filter(s => !recherche);
    const suggestSection = suggestions.length > 0
      ? h('div', { class: 'suggestions-smart' },
          h('div', { class: 'suggestions-smart-title' }, '⭐ Souvent achetés'),
          ...suggestions.map(s => {
            const p = produits.find(p => p.id === s.produitId);
            if (!p) return null;
            return h('div', { class: 'suggestion-item suggestion-smart', onclick: () => ouvrirModalAjout(liste, p) },
              h('span', {}, `${p.emoji} ${p.nom}`),
              h('div', { class: 'suggestion-right' },
                h('span', { class: 'suggestion-cat' }, p.categorie),
                h('span', { class: 'suggestion-add' }, '＋')
              )
            );
          }).filter(Boolean)
        )
      : null;

    let listeProduits = null;
    if (disponibles.length > 0) {
      listeProduits = h('div', { class: 'suggestions-dropdown' },
        h('div', { class: 'suggestions-header' },
          `Disponibles (${disponibles.length}) — cliquez pour sélectionner :`
        ),
        ...disponibles.map(p => {
          const stock = getStockByProduit(p.id);
          return h('div', { class: 'suggestion-item', onclick: () => ouvrirModalAjout(liste, p) },
            h('span', {}, `${p.emoji} ${p.nom}`),
            h('div', { class: 'suggestion-right' },
              stock?.quantite > 0
                ? h('span', { class: 'stock-badge' }, `🏠 ${fmtQty(stock.quantite)} ${stock.unite}`)
                : null,
              h('span', { class: 'suggestion-cat' }, p.categorie),
              h('span', { class: 'suggestion-add' }, '＋')
            )
          );
        })
      );
    } else if (recherche || catFiltre) {
      listeProduits = h('div', { class: 'no-suggestion' },
        'Aucun produit trouvé — tous déjà dans la liste ?'
      );
    }

    return h('div', { class: 'ajouter-section' },
      h('div', { class: 'ajouter-title' }, '➕ Ajouter des produits'),
      suggestSection,
      catFiltersEl,
      h('div', { class: 'search-voice-row' },
        h('div', { class: 'search-box', style: 'flex:1;' },
          h('span', { class: 'search-icon' }, '🔍'),
          rechercheInput,
          clearBtn
        ),
        voiceBtn
      ),
      listeProduits
    );
  }

  // ── Reconnaissance vocale ─────────────────────────────────
  function toggleVoice() {
    if (_voiceActive) {
      _voiceStop?.(); _voiceStop = null; _voiceActive = false; draw(); return;
    }
    _voiceActive = true;
    draw();
    _voiceStop = startVoice({
      onResult: text => {
        _voiceActive = false; _voiceStop = null;
        const liste = getListe(id);
        if (!liste) { draw(); return; }
        const deja = new Set(liste.elements.map(e => e.produitId));
        const candidats = matchVoiceToProduits(text, getProduits().filter(p => !deja.has(p.id)));
        if (candidats.length === 0) {
          recherche = text; draw();
          toast(`Aucun produit trouvé pour "${text}"`, 'error');
        } else {
          // Ouvre le modal pour le meilleur candidat
          ouvrirModalAjout(liste, candidats[0]);
          draw();
        }
      },
      onEnd:  () => { _voiceActive = false; _voiceStop = null; draw(); },
      onError: msg => { _voiceActive = false; _voiceStop = null; toast(msg, 'error'); draw(); }
    });
  }

  // ── Modal confirmation ajout + roue crantée ───────────────
  function ouvrirModalAjout(liste, produit) {
    const stock = getStockByProduit(produit.id);
    let spinner;

    openModal((box, close) => {
      spinner = createSpinner({
        value: 1, min: 1, step: 1, unit: produit.unite,
        onChange: v => { if (navigator.vibrate) navigator.vibrate(15); }
      });

      render(box,
        h('h2', {}, 'Ajouter à la liste'),
        h('div', { class: 'modal-produit-header' },
          h('span', { class: 'modal-produit-emoji' }, produit.emoji),
          h('div', {},
            h('div', { class: 'modal-produit-nom' }, produit.nom),
            h('div', { class: 'modal-produit-cat' }, produit.categorie)
          ),
          h('button', { class: 'btn-icon', style: 'margin-left:auto', onclick: close }, '✕')
        ),
        stock?.quantite > 0
          ? h('div', { class: 'stock-inline-hint', style: 'margin-bottom:12px;' },
              `🏠 En stock : ${fmtQty(stock.quantite)} ${stock.unite}`)
          : null,
        h('div', { class: 'form-group' },
          h('label', {}, '↔ Faites glisser la roue pour ajuster la quantité'),
          spinner.el
        ),
        h('div', { class: 'modal-actions' },
          h('button', { class: 'btn-secondary', onclick: close }, 'Annuler'),
          h('button', { class: 'btn-primary', onclick: () => {
            liste.elements.push({
              id: crypto.randomUUID(), produitId: produit.id,
              nom: produit.nom, emoji: produit.emoji,
              categorie: produit.categorie, unite: produit.unite,
              quantite: spinner.getValue(), estCoche: false, note: null
            });
            liste.modifieLe = new Date().toISOString();
            modifierListe(liste);
            recherche = ''; catFiltre = '';
            if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
            close();
          }}, '＋ Ajouter')
        )
      );
    }, { top: true, small: true });
  }

  function changerQty(liste, el, delta) {
    el.quantite = Math.max(1, el.quantite + delta);
    liste.modifieLe = new Date().toISOString();
    modifierListe(liste);
    if (navigator.vibrate) navigator.vibrate(15);
  }

  function retirerElement(liste, el) {
    liste.elements = liste.elements.filter(e => e.id !== el.id);
    liste.modifieLe = new Date().toISOString();
    modifierListe(liste);
  }

  onStoreChange(draw);
  draw();
  return () => { _voiceStop?.(); offStoreChange(draw); };
}

function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const k = keyFn(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}
