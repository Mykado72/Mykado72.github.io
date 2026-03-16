// ── Page : Mode Courses ───────────────────────────────────
import { getListe, modifierListe, cocherElement, reinitialiserCoches,
         setStock, getStockByProduit, supprimerListe,
         onStoreChange, offStoreChange, fmtQty, progression } from '../store.js';
import { getCatEmoji } from '../data.js';
import { navigate } from '../router.js';
import { h, render, openModal, closeModal } from '../ui.js';
import { addSwipe } from '../swipe.js';
import { createSession, joinSession, destroySession, isConnected } from '../sync.js';

export function renderCourses(container, { id }) {
  const qtysReelles = {};
  let _swipeDetachers = [];
  let _syncStop = null;
  let _syncCode = null;
  let _syncConnected = false;

  function getQtyReelle(elId) { return qtysReelles[elId] ?? 0; }

  function draw() {
    // Nettoie les anciens swipe listeners
    _swipeDetachers.forEach(d => d());
    _swipeDetachers = [];

    const liste = getListe(id);
    if (!liste) {
      render(container,
        h('h1', {}, 'Liste introuvable'),
        h('button', { class: 'btn-secondary', onclick: () => navigate('#/') }, '← Retour')
      );
      return;
    }
    const nonCoches = liste.elements.filter(e => !e.estCoche);
    const coches    = liste.elements.filter(e => e.estCoche);
    const pct = progression(liste);

    // Indicateur de sync
    const syncBadge = _syncConnected
      ? h('div', { class: 'sync-badge sync-active', title: 'Partage actif' }, '🟢 Partage actif')
      : _syncCode
        ? h('div', { class: 'sync-badge sync-waiting', title: 'En attente de connexion' }, `⏳ Code : ${_syncCode}`)
        : null;

    render(container,
      h('div', { class: 'courses-header', style: `--card-color: ${liste.couleur}` },
        h('div', { class: 'courses-title-row' },
          h('button', { class: 'btn-back', onclick: cleanup }, '←'),
          h('div', {},
            h('h1', {}, `🛒 ${liste.nom}`),
            h('div', { class: 'courses-progress-text' }, `${coches.length} / ${liste.elements.length} articles cochés`)
          ),
          h('div', { style: 'display:flex;gap:6px;' },
            h('button', { class: 'btn-reset', title: 'Partager', onclick: ouvrirPartage }, '🔗'),
            h('button', { class: 'btn-reset', title: 'Tout décocher',
              onclick: () => { Object.keys(qtysReelles).forEach(k => delete qtysReelles[k]); reinitialiserCoches(id); }
            }, '↺')
          )
        ),
        h('div', { class: 'courses-progress-bar' },
          h('div', { class: 'courses-progress-fill', style: `width:${pct.toFixed(0)}%` })
        ),
        syncBadge,
        h('button', { class: 'btn-terminer', onclick: demanderFin }, '✓ Courses terminées')
      ),

      // Hint swipe (affiché uniquement si des articles non cochés)
      nonCoches.length > 0
        ? h('div', { class: 'swipe-hint' }, '← Swipez à droite pour cocher →')
        : null,

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
                const item = h('div', { class: 'courses-item swipeable' },
                  h('div', { class: 'courses-checkbox' }, h('div', { class: 'checkbox-circle' })),
                  h('div', { class: 'courses-item-info' },
                    h('span', { class: 'courses-emoji' }, el.emoji),
                    h('div', { class: 'courses-item-text' },
                      h('span', { class: 'courses-nom' }, el.nom),
                      stock?.quantite > 0
                        ? h('span', { class: 'courses-stock-hint' }, `🏠 ${fmtQty(stock.quantite)} ${stock.unite} à la maison`)
                        : null
                    )
                  ),
                  h('div', { class: 'courses-qty-planned' }, `${el.quantite} ${el.unite}`)
                );

                // Swipe droite → cocher directement avec qty prévue
                // Tap → modal pour saisir qty réelle
                item.addEventListener('click', () => ouvrirCoche(el));
                const detach = addSwipe(item, {
                  onSwipeRight: () => {
                    qtysReelles[el.id] = el.quantite;
                    cocherElement(id, el.id, true);
                    checkFin();
                  },
                  onSwipeLeft: () => {
                    // Swipe gauche → retirer de la liste
                    if (confirm(`Retirer "${el.nom}" de la liste ?`)) {
                      const l = getListe(id);
                      if (l) {
                        l.elements = l.elements.filter(e => e.id !== el.id);
                        modifierListe(l);
                      }
                    }
                  }
                });
                _swipeDetachers.push(detach);
                return item;
              })
            )
          ),

        // Dans le panier
        coches.length > 0 ? (() => {
          const details = h('details', { class: 'done-section' });
          if (!nonCoches.length) details.setAttribute('open', '');
          details.append(h('summary', {}, `🛒 Dans le panier (${coches.length})`));
          coches.forEach(el => {
            const qr = getQtyReelle(el.id);
            const diff = qr > 0 && qr !== el.quantite;
            const item = h('div', { class: 'courses-item done-item' },
              h('div', { class: 'courses-checkbox' },
                h('div', { class: 'checkbox-circle checked' }, h('span', {}, '✓'))
              ),
              h('div', { class: 'courses-item-info' },
                h('span', { class: 'courses-emoji' }, el.emoji),
                h('div', { class: 'courses-item-text' },
                  h('span', { class: 'courses-nom done' }, el.nom)
                )
              ),
              h('div', { class: 'courses-qty-done' },
                diff
                  ? [h('span', { class: 'qty-reelle-diff' }, `${fmtQty(qr)} ${el.unite}`),
                     h('span', { class: 'qty-prevue-barre' }, `/ ${el.quantite} prévu`)]
                  : h('span', {}, `${el.quantite} ${el.unite}`)
              )
            );
            item.addEventListener('click', () => ouvrirCoche(el));
            // Swipe gauche sur article coché → décocher
            const detach = addSwipe(item, {
              onSwipeLeft: () => {
                delete qtysReelles[el.id];
                cocherElement(id, el.id, false);
              }
            });
            _swipeDetachers.push(detach);
            details.append(item);
          });
          return details;
        })() : null
      )
    );
  }

  function checkFin() {
    const l = getListe(id);
    if (l && l.elements.length > 0 && progression(l) >= 100) ouvrirFinCourses();
  }

  // ── Modal cocher ──────────────────────────────────────────
  function ouvrirCoche(el) {
    let qty = qtysReelles[el.id] ?? el.quantite;
    openModal((box) => {
      const qtyInput = h('input', { class: 'form-input qty-input-center', type: 'number',
        inputmode: 'numeric', min: '0', step: '1', value: qty });
      const diffHint = h('div', { class: 'qty-diff-hint' });

      function updateDiff() {
        qty = parseFloat(qtyInput.value) || 0;
        const d = qty - el.quantite;
        diffHint.textContent = d !== 0 ? `⚠️ Différence : ${d > 0 ? '+' : ''}${fmtQty(d)} ${el.unite} par rapport au prévu` : '';
        diffHint.style.display = d !== 0 ? '' : 'none';
      }
      qtyInput.addEventListener('input', updateDiff);
      if (qty !== el.quantite) updateDiff();

      render(box,
        h('div', { class: 'coche-modal-header' },
          h('span', { class: 'coche-emoji' }, el.emoji),
          h('div', {}, h('div', { class: 'coche-nom' }, el.nom),
            h('div', { class: 'coche-prevue' }, `Prévu : ${el.quantite} ${el.unite}`))
        ),
        h('div', { class: 'form-group' },
          h('label', {}, 'Quantité prise en magasin'),
          h('div', { class: 'stock-qty-editor' },
            h('button', { class: 'qty-btn qty-btn-lg', type: 'button',
              onclick: () => { qty = Math.max(0, qty - 1); qtyInput.value = qty; updateDiff(); } }, '−'),
            qtyInput,
            h('button', { class: 'qty-btn qty-btn-lg', type: 'button',
              onclick: () => { qty++; qtyInput.value = qty; updateDiff(); } }, '＋'),
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
            checkFin();
          }}, '🛒 Mettre dans le panier')
        )
      );
    });
  }

  // ── Modal partage temps réel ──────────────────────────────
  function ouvrirPartage() {
    openModal((box) => {
      let mode = null; // 'host' | 'join'

      function showMain() {
        render(box,
          h('h2', {}, '🔗 Partager les courses'),
          h('p', { style: 'color:var(--text-2);font-size:.88rem;margin-bottom:16px;' },
            'Faites les courses à deux en temps réel. Chaque modification est synchronisée instantanément.'),
          h('div', { class: 'param-actions' },
            h('button', { class: 'btn-param btn-export', onclick: showHost },
              h('span', { class: 'btn-param-icon' }, '📱'),
              h('div', {},
                h('div', { class: 'btn-param-label' }, 'Créer une session'),
                h('div', { class: 'btn-param-desc' }, 'Générer un code à partager')
              )
            ),
            h('button', { class: 'btn-param btn-import', onclick: showJoin },
              h('span', { class: 'btn-param-icon' }, '🤝'),
              h('div', {},
                h('div', { class: 'btn-param-label' }, 'Rejoindre une session'),
                h('div', { class: 'btn-param-desc' }, 'Saisir le code reçu')
              )
            )
          ),
          isConnected()
            ? h('button', { class: 'btn-danger-full', style: 'margin-top:12px;', onclick: () => {
                destroySession(); _syncStop?.(); _syncStop = null;
                _syncCode = null; _syncConnected = false;
                closeModal(); draw();
              }}, '⏹ Arrêter le partage')
            : null,
          h('div', { class: 'modal-actions' },
            h('button', { class: 'btn-secondary', onclick: closeModal }, 'Fermer')
          )
        );
      }

      async function showHost() {
        render(box, h('p', { style: 'text-align:center;padding:20px;' }, '⏳ Création de la session…'));
        const { code, stop } = await createSession(id, {
          onConnected:    () => { _syncConnected = true; _syncStop = stop; closeModal(); draw(); },
          onDisconnected: () => { _syncConnected = false; draw(); },
          onError:        msg => { render(box, h('p', { style: 'color:red;' }, msg), h('button', { class: 'btn-secondary', onclick: showMain }, '← Retour')); }
        });
        _syncCode = code;
        render(box,
          h('h2', {}, '📱 Session créée'),
          h('p', { style: 'color:var(--text-2);font-size:.88rem;margin-bottom:16px;' },
            "Communiquez ce code à l'autre personne :"),
          h('div', { class: 'sync-code-display' }, code),
          h('p', { style: 'color:var(--text-2);font-size:.8rem;margin-top:8px;' }, '⏳ En attente de connexion…'),
          h('div', { class: 'modal-actions' },
            h('button', { class: 'btn-secondary', onclick: () => { stop(); _syncCode = null; closeModal(); draw(); } }, 'Annuler')
          )
        );
      }

      async function showJoin() {
        const input = h('input', { class: 'form-input', type: 'text',
          placeholder: 'Code à 6 caractères', maxlength: '6',
          style: 'text-transform:uppercase;letter-spacing:4px;font-size:1.3rem;text-align:center;' });
        input.addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,''); });

        render(box,
          h('h2', {}, '🤝 Rejoindre une session'),
          h('p', { style: 'color:var(--text-2);font-size:.88rem;margin-bottom:12px;' },
            "Saisissez le code affiché sur l'autre téléphone :"),
          h('div', { class: 'form-group' }, input),
          h('div', { class: 'modal-actions' },
            h('button', { class: 'btn-secondary', onclick: showMain }, '← Retour'),
            h('button', { class: 'btn-primary', onclick: async () => {
              const code = input.value.trim();
              if (code.length < 6) { input.focus(); return; }
              render(box, h('p', { style: 'text-align:center;padding:20px;' }, '⏳ Connexion en cours…'));
              const { stop } = await joinSession(code, id, {
                onConnected:    () => { _syncConnected = true; _syncStop = stop; closeModal(); draw(); },
                onDisconnected: () => { _syncConnected = false; draw(); },
                onError:        msg => { render(box, h('p', { style: 'color:red;padding:12px;' }, msg), h('button', { class: 'btn-secondary', onclick: showJoin }, '← Réessayer')); }
              });
            }}, 'Rejoindre')
          )
        );
        setTimeout(() => input.focus(), 100);
      }

      showMain();
    });
  }

  // ── Fin de courses ────────────────────────────────────────
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
            ...manquants.map(e => h('div', { class: 'recap-row recap-manque' },
              h('span', { class: 'recap-emoji' }, e.emoji),
              h('span', { class: 'recap-nom' }, e.nom),
              h('span', { class: 'recap-qty' }, `${e.quantite} ${e.unite}`)
            ))
          ),
          h('p', { class: 'recap-confirm-hint' }, 'Voulez-vous quand même terminer ?'),
          h('div', { class: 'fin-courses-actions', style: 'margin-top:16px;' },
            h('button', { class: 'fin-btn fin-btn-keep', onclick: () => { closeModal(); ouvrirFinCourses(); } },
              h('span', { class: 'fin-btn-icon' }, '✓'),
              h('div', {}, h('span', { class: 'fin-btn-label' }, 'Oui, terminer'))
            ),
            h('button', { class: 'fin-btn fin-btn-back', onclick: closeModal },
              h('span', { class: 'fin-btn-icon' }, '↩'),
              h('div', {}, h('span', { class: 'fin-btn-label' }, 'Continuer les courses'))
            )
          )
        );
      });
    } else {
      ouvrirFinCourses();
    }
  }

  function ouvrirFinCourses() {
    const liste = getListe(id);
    const coches   = liste.elements.filter(e => e.estCoche);
    const manquants = liste.elements.filter(e => !e.estCoche);
    const diffs    = coches.filter(e => { const qr = getQtyReelle(e.id); return qr > 0 && qr !== e.quantite; });
    const achetes  = coches.filter(e => getQtyReelle(e.id) > 0);
    let stockSel   = new Set(achetes.map(e => e.id));

    openModal((box) => {
      function rebuildStock() {
        stockList.innerHTML = '';
        achetes.forEach(a => {
          const sel = stockSel.has(a.id);
          const item = h('div', { class: `stock-propose-item${sel ? ' selected' : ''}`,
            onclick: () => { if (stockSel.has(a.id)) stockSel.delete(a.id); else stockSel.add(a.id); rebuildStock(); }
          },
            h('span', { class: 'stock-propose-check' }, sel ? '✓' : ''),
            h('span', { class: 'stock-propose-emoji' }, a.emoji),
            h('span', { class: 'stock-propose-nom' }, a.nom),
            h('span', { class: 'stock-propose-qty' }, `${fmtQty(getQtyReelle(a.id))} ${a.unite}`)
          );
          stockList.append(item);
        });
        addBtn.disabled = stockSel.size === 0;
        addBtn.textContent = `🏠 Ajouter ${stockSel.size} sélectionné(s) au stock`;
      }

      const stockList = h('div', {});
      const addBtn = h('button', { class: 'btn-add-stock', onclick: () => {
        achetes.filter(a => stockSel.has(a.id)).forEach(a => {
          const s = getStockByProduit(a.produitId);
          setStock(a.produitId, (s?.quantite ?? 0) + getQtyReelle(a.id));
        });
        stockSel.clear(); rebuildStock();
      }});

      render(box,
        h('div', { class: 'fin-courses-icon' }, '🎉'),
        h('h2', {}, 'Récapitulatif des courses'),
        manquants.length ? h('div', { class: 'recap-section recap-manquants' },
          h('div', { class: 'recap-title' }, `🚫 Non achetés (${manquants.length})`),
          ...manquants.map(e => h('div', { class: 'recap-row recap-manque' },
            h('span', { class: 'recap-emoji' }, e.emoji), h('span', { class: 'recap-nom' }, e.nom),
            h('span', { class: 'recap-qty' }, `${e.quantite} ${e.unite}`)
          ))
        ) : null,
        diffs.length ? h('div', { class: 'recap-section' },
          h('div', { class: 'recap-title' }, '⚠️ Quantités différentes'),
          ...diffs.map(e => {
            const qr = getQtyReelle(e.id);
            return h('div', { class: `recap-row ${qr < e.quantite ? 'recap-manque' : 'recap-surplus'}` },
              h('span', { class: 'recap-emoji' }, e.emoji), h('span', { class: 'recap-nom' }, e.nom),
              h('span', { class: 'recap-qty' }, `${fmtQty(qr)} / ${fmtQty(e.quantite)} ${e.unite}`)
            );
          })
        ) : null,
        !manquants.length && !diffs.length ? h('p', { class: 'recap-ok' }, '✅ Tout acheté comme prévu !') : null,
        achetes.length ? h('div', { class: 'stock-proposal' },
          h('div', { class: 'stock-proposal-title' }, '🏠 Ajouter au stock à la maison ?'),
          stockList, addBtn
        ) : null,
        h('div', { class: 'fin-courses-actions', style: 'margin-top:16px;' },
          h('button', { class: 'fin-btn fin-btn-keep', onclick: () => {
            Object.keys(qtysReelles).forEach(k => delete qtysReelles[k]);
            reinitialiserCoches(id); closeModal(); cleanup();
          }},
            h('span', { class: 'fin-btn-icon' }, '🔄'),
            h('div', {}, h('span', { class: 'fin-btn-label' }, 'Réutiliser la liste'),
              h('span', { class: 'fin-btn-desc' }, 'Décocher tout'))
          ),
          h('button', { class: 'fin-btn fin-btn-delete', onclick: () => {
            supprimerListe(id); closeModal(); cleanup();
          }},
            h('span', { class: 'fin-btn-icon' }, '🗑️'),
            h('div', {}, h('span', { class: 'fin-btn-label' }, 'Supprimer la liste'))
          )
        ),
        h('button', { class: 'btn-secondary', style: 'margin-top:12px;width:100%;', onclick: closeModal }, '↩ Continuer')
      );
      rebuildStock();
    });
  }

  function cleanup() {
    _swipeDetachers.forEach(d => d());
    _swipeDetachers = [];
    _syncStop?.();
    destroySession();
    offStoreChange(draw);
    navigate('#/');
  }

  onStoreChange(draw);
  draw();
  return cleanup;
}

function groupBy(arr, keyFn) {
  const map = new Map();
  arr.forEach(item => { const k = keyFn(item); if (!map.has(k)) map.set(k, []); map.get(k).push(item); });
  return [...map.entries()];
}
