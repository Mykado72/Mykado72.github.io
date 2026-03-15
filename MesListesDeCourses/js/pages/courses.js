// ── Page : Mode Courses ───────────────────────────────────
import { getListe, modifierListe, cocherElement, reinitialiserCoches,
         setStock, getStockByProduit, supprimerListe,
         onStoreChange, offStoreChange, fmtQty, progression } from '../store.js';
import { getCatEmoji } from '../data.js';
import { navigate } from '../router.js';
import { h, render, openModal, closeModal } from '../ui.js';

export function renderCourses(container, { id }) {
  // qtys réelles saisies : elementId → double
  const qtysReelles = {};
  let showConfirmQuitter = false;
  let showFinCourses = false;

  function getQtyReelle(elId) { return qtysReelles[elId] ?? 0; }

  function draw() {
    const liste = getListe(id);
    if (!liste) { render(container, h('h1', {}, 'Liste introuvable'), h('button', { class: 'btn-secondary', onclick: () => navigate('#/') }, '← Retour')); return; }
    const nonCoches = liste.elements.filter(e => !e.estCoche);
    const coches    = liste.elements.filter(e => e.estCoche);
    const pct = progression(liste);

    render(container,
      // ── Header coloré
      h('div', { class: 'courses-header', style: `--card-color: ${liste.couleur}` },
        h('div', { class: 'courses-title-row' },
          h('button', { class: 'btn-back', onclick: () => navigate('#/') }, '←'),
          h('div', {},
            h('h1', {}, `🛒 ${liste.nom}`),
            h('div', { class: 'courses-progress-text' }, `${coches.length} / ${liste.elements.length} articles cochés`)
          ),
          h('button', { class: 'btn-reset', title: 'Tout décocher', onclick: () => { Object.keys(qtysReelles).forEach(k => delete qtysReelles[k]); reinitialiserCoches(id); } }, '↺')
        ),
        h('div', { class: 'courses-progress-bar' },
          h('div', { class: 'courses-progress-fill', style: `width:${pct.toFixed(0)}%` })
        ),
        h('button', { class: 'btn-terminer', onclick: demanderFin }, '✓ Courses terminées')
      ),

      // ── Articles non cochés groupés par catégorie
      h('div', { class: 'courses-list' },
        ...groupBy(nonCoches, e => e.categorie)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([cat, items]) =>
            h('div', { class: 'courses-category' },
              h('div', { class: 'courses-cat-header' },
                h('span', {}, `${getCatEmoji(cat)} ${cat}`),
                h('span', { class: 'category-count' }, items.length)
              ),
              ...items.map(el => {
                const stock = getStockByProduit(el.produitId);
                return h('div', { class: 'courses-item', onclick: () => ouvrirCoche(el) },
                  h('div', { class: 'courses-checkbox' }, h('div', { class: 'checkbox-circle' })),
                  h('div', { class: 'courses-item-info' },
                    h('span', { class: 'courses-emoji' }, el.emoji),
                    h('div', { class: 'courses-item-text' },
                      h('span', { class: 'courses-nom' }, el.nom),
                      stock && stock.quantite > 0 ? h('span', { class: 'courses-stock-hint' }, `🏠 ${fmtQty(stock.quantite)} ${stock.unite} à la maison`) : null
                    )
                  ),
                  h('div', { class: 'courses-qty-planned' }, `${el.quantite} ${el.unite}`)
                );
              })
            )
          ),

        // ── Dans le panier
        coches.length > 0 ? (() => {
          const details = h('details', { class: 'done-section' });
          if (!nonCoches.length) details.setAttribute('open', '');
          details.append(h('summary', {}, `🛒 Dans le panier (${coches.length})`));
          coches.forEach(el => {
            const qr = getQtyReelle(el.id);
            const diff = qr !== el.quantite && qr > 0;
            details.append(h('div', { class: 'courses-item done-item', onclick: () => ouvrirCoche(el) },
              h('div', { class: 'courses-checkbox' }, h('div', { class: 'checkbox-circle checked' }, h('span', {}, '✓'))),
              h('div', { class: 'courses-item-info' }, h('span', { class: 'courses-emoji' }, el.emoji),
                h('div', { class: 'courses-item-text' }, h('span', { class: 'courses-nom done' }, el.nom))
              ),
              h('div', { class: 'courses-qty-done' },
                diff ? [h('span', { class: 'qty-reelle-diff' }, `${fmtQty(qr)} ${el.unite}`), h('span', { class: 'qty-prevue-barre' }, `/ ${el.quantite} prévu`)]
                     : h('span', {}, `${el.quantite} ${el.unite}`)
              )
            ));
          });
          return details;
        })() : null
      )
    );
  }

  // ── Modal cocher ──────────────────────────────────────────
  function ouvrirCoche(el) {
    let qty = qtysReelles[el.id] ?? el.quantite;

    openModal((box) => {
      const qtyInput = h('input', { class: 'form-input qty-input-center', type: 'number', min: '0', step: '1', value: qty });
      let diffHint;

      function updateDiff() {
        const v = parseFloat(qtyInput.value) || 0;
        qty = v;
        if (diffHint) {
          const d = v - el.quantite;
          diffHint.textContent = d !== 0 ? `⚠️ Différence : ${d > 0 ? '+' : ''}${fmtQty(d)} ${el.unite} par rapport au prévu` : '';
          diffHint.style.display = d !== 0 ? '' : 'none';
        }
      }
      qtyInput.addEventListener('input', updateDiff);
      diffHint = h('div', { class: 'qty-diff-hint' });
      if (qty !== el.quantite) updateDiff();

      render(box,
        h('div', { class: 'coche-modal-header' },
          h('span', { class: 'coche-emoji' }, el.emoji),
          h('div', {},
            h('div', { class: 'coche-nom' }, el.nom),
            h('div', { class: 'coche-prevue' }, `Prévu : ${el.quantite} ${el.unite}`)
          )
        ),
        h('div', { class: 'form-group' },
          h('label', {}, 'Quantité prise en magasin'),
          h('div', { class: 'stock-qty-editor' },
            h('button', { class: 'qty-btn qty-btn-lg', type: 'button', onclick: () => { qty = Math.max(0, qty-1); qtyInput.value = qty; updateDiff(); } }, '−'),
            qtyInput,
            h('button', { class: 'qty-btn qty-btn-lg', type: 'button', onclick: () => { qty++; qtyInput.value = qty; updateDiff(); } }, '＋'),
            h('span', { class: 'qty-unite-label' }, el.unite)
          ),
          diffHint
        ),
        h('div', { class: 'modal-actions' },
          h('button', { class: 'btn-secondary', onclick: closeModal }, 'Annuler'),
          h('button', { class: 'btn-primary', onclick: () => {
            qtysReelles[el.id] = qty;
            cocherElement(id, el.id, qty > 0);
            closeModal();
            const l = getListe(id);
            if (l && l.elements.length > 0 && progression(l) >= 100) ouvrirFinCourses();
          }}, '🛒 Mettre dans le panier')
        )
      );
    });
  }

  // ── Demander fin / confirmation ───────────────────────────
  function demanderFin() {
    const liste = getListe(id);
    const manquants = liste.elements.filter(e => !e.estCoche);
    if (manquants.length > 0) {
      openModal((box) => {
        render(box,
          h('div', { class: 'fin-courses-icon' }, '🛒'),
          h('h2', {}, 'Terminer les courses ?'),
          h('div', { class: 'recap-section recap-manquants' },
            h('div', { class: 'recap-title' }, `⚠️ ${manquants.length} article(s) pas encore dans le panier`),
            ...manquants.map(el => h('div', { class: 'recap-row recap-manque' },
              h('span', { class: 'recap-emoji' }, el.emoji),
              h('span', { class: 'recap-nom' }, el.nom),
              h('span', { class: 'recap-qty' }, `${el.quantite} ${el.unite}`)
            ))
          ),
          h('p', { class: 'recap-confirm-hint' }, 'Voulez-vous quand même terminer les courses ?'),
          h('div', { class: 'fin-courses-actions', style: 'margin-top:16px;' },
            h('button', { class: 'fin-btn fin-btn-keep', onclick: () => { closeModal(); ouvrirFinCourses(); } },
              h('span', { class: 'fin-btn-icon' }, '✓'),
              h('div', {}, h('span', { class: 'fin-btn-label' }, 'Oui, terminer'), h('span', { class: 'fin-btn-desc' }, 'Voir le récapitulatif final'))
            ),
            h('button', { class: 'fin-btn fin-btn-back', onclick: closeModal },
              h('span', { class: 'fin-btn-icon' }, '↩'),
              h('div', {}, h('span', { class: 'fin-btn-label' }, 'Continuer les courses'), h('span', { class: 'fin-btn-desc' }, 'Retourner à la liste'))
            )
          )
        );
      });
    } else {
      ouvrirFinCourses();
    }
  }

  // ── Modal fin de courses ──────────────────────────────────
  function ouvrirFinCourses() {
    const liste = getListe(id);
    const coches = liste.elements.filter(e => e.estCoche);
    const manquants = liste.elements.filter(e => !e.estCoche);
    const diffs = coches.filter(e => { const qr = getQtyReelle(e.id); return qr > 0 && qr !== e.quantite; });
    const achetes = coches.filter(e => getQtyReelle(e.id) > 0);
    let stockSel = new Set(achetes.map(e => e.id));

    openModal((box) => {
      function rebuildStockList() {
        stockList.innerHTML = '';
        achetes.forEach(a => {
          const sel = stockSel.has(a.id);
          const item = h('div', { class: `stock-propose-item${sel ? ' selected' : ''}`, onclick: () => {
            if (stockSel.has(a.id)) stockSel.delete(a.id); else stockSel.add(a.id);
            rebuildStockList();
          }},
            h('span', { class: 'stock-propose-check' }, sel ? '✓' : ''),
            h('span', { class: 'stock-propose-emoji' }, a.emoji),
            h('span', { class: 'stock-propose-nom' }, a.nom),
            h('span', { class: 'stock-propose-qty' }, `${fmtQty(getQtyReelle(a.id))} ${a.unite}`)
          );
          stockList.append(item);
        });
        addStockBtn.disabled = stockSel.size === 0;
        addStockBtn.textContent = `🏠 Ajouter ${stockSel.size} sélectionné(s) au stock`;
      }

      const stockList = h('div', {});
      const addStockBtn = h('button', { class: 'btn-add-stock', onclick: () => {
        achetes.filter(a => stockSel.has(a.id)).forEach(a => {
          const s = getStockByProduit(a.produitId);
          setStock(a.produitId, (s?.quantite ?? 0) + getQtyReelle(a.id));
        });
        stockSel.clear();
        rebuildStockList();
      }});

      render(box,
        h('div', { class: 'fin-courses-icon' }, '🎉'),
        h('h2', {}, 'Récapitulatif des courses'),

        manquants.length > 0 ? h('div', { class: 'recap-section recap-manquants' },
          h('div', { class: 'recap-title' }, `🚫 Non achetés (${manquants.length})`),
          ...manquants.map(e => h('div', { class: 'recap-row recap-manque' }, h('span', { class: 'recap-emoji' }, e.emoji), h('span', { class: 'recap-nom' }, e.nom), h('span', { class: 'recap-qty' }, `${e.quantite} ${e.unite}`)))
        ) : null,

        diffs.length > 0 ? h('div', { class: 'recap-section' },
          h('div', { class: 'recap-title' }, '⚠️ Quantités différentes'),
          ...diffs.map(e => { const qr = getQtyReelle(e.id); return h('div', { class: `recap-row ${qr < e.quantite ? 'recap-manque' : 'recap-surplus'}` }, h('span', { class: 'recap-emoji' }, e.emoji), h('span', { class: 'recap-nom' }, e.nom), h('span', { class: 'recap-qty' }, `${fmtQty(qr)} / ${fmtQty(e.quantite)} ${e.unite}`)); })
        ) : null,

        !manquants.length && !diffs.length ? h('p', { class: 'recap-ok' }, '✅ Tout a été acheté comme prévu !') : null,

        achetes.length > 0 ? h('div', { class: 'stock-proposal' },
          h('div', { class: 'stock-proposal-title' }, '🏠 Ajouter au stock à la maison ?'),
          h('p', { class: 'stock-proposal-desc' }, 'Sélectionnez les produits à ajouter :'),
          stockList,
          addStockBtn
        ) : null,

        h('div', { class: 'fin-courses-actions', style: 'margin-top:16px;' },
          h('button', { class: 'fin-btn fin-btn-keep', onclick: () => { Object.keys(qtysReelles).forEach(k => delete qtysReelles[k]); reinitialiserCoches(id); closeModal(); navigate('#/'); } },
            h('span', { class: 'fin-btn-icon' }, '🔄'),
            h('div', {}, h('span', { class: 'fin-btn-label' }, 'Réutiliser la liste'), h('span', { class: 'fin-btn-desc' }, 'Décocher tout, conserver les produits'))
          ),
          h('button', { class: 'fin-btn fin-btn-delete', onclick: () => { supprimerListe(id); closeModal(); navigate('#/'); } },
            h('span', { class: 'fin-btn-icon' }, '🗑️'),
            h('div', {}, h('span', { class: 'fin-btn-label' }, 'Supprimer la liste'), h('span', { class: 'fin-btn-desc' }, "Je n'en aurai plus besoin"))
          )
        ),
        h('button', { class: 'btn-secondary', style: 'margin-top:12px;width:100%;', onclick: closeModal }, '↩ Continuer les courses')
      );

      rebuildStockList();
    });
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
