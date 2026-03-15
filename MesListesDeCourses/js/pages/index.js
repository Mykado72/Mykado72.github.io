// ── Page : Mes Listes ─────────────────────────────────────
import { getListes, ajouterListe, modifierListe, supprimerListe, dupliquerListe,
         onStoreChange, offStoreChange, progression } from '../store.js';
import { getListesExemples } from '../data.js';
import { navigate } from '../router.js';
import { h, render, openModal, closeModal } from '../ui.js';

const EMOJIS = ['🛒','🏪','🧺','📝','🍎','🥗','🎁','🏠','⭐','❤️','🌅','📅','🏖️','🌙','🥐'];
const COULEURS = ['#4CAF50','#2196F3','#FF9800','#E91E63','#9C27B0','#00BCD4','#FF5722','#607D8B'];

export function renderIndex(container) {
  function draw() {
    const listes = getListes();
    render(container,
      renderBanner(),
      h('div', { class: 'page-header' },
        h('div', {},
          h('h1', {}, '📋 Mes Listes de Courses'),
          h('p', { class: 'subtitle' }, `${listes.length} liste(s)`)
        ),
        h('div', { class: 'header-actions' },
          h('button', { class: 'btn-primary', onclick: () => openListeModal(null) }, '＋ Nouvelle liste')
        )
      ),
      listes.length === 0 ? renderEmpty() : renderGrid(listes)
    );
  }

  function renderBanner() {
    // Import banner si liste partagée en cours
    const url = new URL(location.href.replace(/#.*$/, '') + location.hash.replace(/^#\//, '/'));
    const partage = new URLSearchParams(location.search).get('partage');
    if (!partage) return null;
    // handled in app.js startup
    return null;
  }

  function renderEmpty() {
    return h('div', { class: 'empty-state' },
      h('div', { class: 'empty-icon' }, '📋'),
      h('h2', {}, 'Aucune liste pour le moment'),
      h('p', {}, 'Créez votre première liste ou chargez des exemples'),
      h('div', { style: 'display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:16px;' },
        h('button', { class: 'btn-primary', onclick: () => openListeModal(null) }, '＋ Créer une liste'),
        h('button', { class: 'btn-exemples', onclick: openExemplesModal }, '📋 Charger les listes d\'exemple')
      )
    );
  }

  function renderGrid(listes) {
    return h('div', { class: 'listes-grid' },
      ...listes.map(l => {
        const pct = progression(l);
        const card = h('div', { class: 'liste-card', style: `--card-color: ${l.couleur}` },
          h('div', { class: 'card-header' },
            h('span', { class: 'card-emoji' }, l.emoji),
            h('div', { class: 'card-meta' },
              h('div', { class: 'card-nom' }, l.nom),
              l.description ? h('div', { class: 'card-desc' }, l.description) : null
            )
          ),
          h('div', { class: 'card-progress-bar' },
            h('div', { class: 'card-progress-fill', style: `width:${pct.toFixed(0)}%` })
          ),
          h('div', { class: 'card-footer' },
            h('span', { class: 'card-count' }, `${l.elements.length} produit(s)`),
            h('div', { class: 'card-actions' },
              h('button', { class: 'btn-icon', title: 'Faire les courses', onclick: e => { e.stopPropagation(); navigate(`#/courses/${l.id}`); } }, '🛒'),
              h('button', { class: 'btn-icon', title: 'Modifier', onclick: e => { e.stopPropagation(); openListeModal(l); } }, '✏️'),
              h('button', { class: 'btn-icon', title: 'Dupliquer', onclick: e => { e.stopPropagation(); const c = dupliquerListe(l.id); navigate(`#/liste/${c.id}`); } }, '📋'),
              h('button', { class: 'btn-icon btn-danger', title: 'Supprimer', onclick: e => { e.stopPropagation(); confirmerSuppression(l); } }, '🗑️')
            )
          )
        );
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => navigate(`#/liste/${l.id}`));
        return card;
      })
    );
  }

  // ── Modal créer/éditer une liste ─────────────────────────
  function openListeModal(liste) {
    const isNew = !liste;
    let formNom    = liste?.nom ?? '';
    let formDesc   = liste?.description ?? '';
    let formEmoji  = liste?.emoji ?? '🛒';
    let formCouleur = liste?.couleur ?? '#4CAF50';

    openModal((box) => {
      function rebuildEmojiGrid() {
        emojiGrid.innerHTML = '';
        EMOJIS.forEach(e => {
          const btn = h('button', {
            class: `emoji-btn${e === formEmoji ? ' active' : ''}`,
            type: 'button',
            onclick: () => { formEmoji = e; rebuildEmojiGrid(); }
          }, e);
          emojiGrid.append(btn);
        });
      }
      function rebuildColorGrid() {
        colorGrid.innerHTML = '';
        COULEURS.forEach(c => {
          const btn = h('div', {
            class: `color-dot${c === formCouleur ? ' active' : ''}`,
            style: `background:${c}`,
            onclick: () => { formCouleur = c; rebuildColorGrid(); }
          });
          colorGrid.append(btn);
        });
      }

      const nomInput  = h('input', { class: 'form-input', type: 'text', placeholder: 'Nom de la liste', value: formNom });
      const descInput = h('input', { class: 'form-input', type: 'text', placeholder: 'Description (optionnel)', value: formDesc });
      nomInput.addEventListener('input',  () => formNom  = nomInput.value);
      descInput.addEventListener('input', () => formDesc = descInput.value);

      const emojiGrid = h('div', { class: 'emoji-grid' });
      const colorGrid = h('div', { class: 'color-grid' });
      rebuildEmojiGrid(); rebuildColorGrid();

      render(box,
        h('h2', {}, isNew ? '✨ Nouvelle liste' : '✏️ Modifier la liste'),
        h('div', { class: 'form-group' }, h('label', {}, 'Nom'), nomInput),
        h('div', { class: 'form-group' }, h('label', {}, 'Description'), descInput),
        h('div', { class: 'form-group' }, h('label', {}, 'Emoji'), emojiGrid),
        h('div', { class: 'form-group' }, h('label', {}, 'Couleur'), colorGrid),
        h('div', { class: 'modal-actions' },
          h('button', { class: 'btn-secondary', type: 'button', onclick: closeModal }, 'Annuler'),
          h('button', { class: 'btn-primary', type: 'button', onclick: () => {
            if (!formNom.trim()) { nomInput.focus(); return; }
            if (isNew) {
              const n = ajouterListe({ nom: formNom, description: formDesc, emoji: formEmoji, couleur: formCouleur, elements: [] });
              closeModal(); navigate(`#/liste/${n.id}`);
            } else {
              modifierListe({ ...liste, nom: formNom, description: formDesc, emoji: formEmoji, couleur: formCouleur, modifieLe: new Date().toISOString() });
              closeModal();
            }
          }}, isNew ? '✨ Créer' : '💾 Enregistrer')
        )
      );
    }, { small: false });
  }

  // ── Modal exemples ────────────────────────────────────────
  function openExemplesModal() {
    const exemples = getListesExemples();
    let selected = new Set(exemples.map(l => l.id));

    openModal((box) => {
      function rebuildList() {
        listContainer.innerHTML = '';
        exemples.forEach(l => {
          const checked = selected.has(l.id);
          const item = h('div', { class: `exemple-item${checked ? ' selected' : ''}`,
            onclick: () => {
              if (selected.has(l.id)) selected.delete(l.id); else selected.add(l.id);
              rebuildList();
            }
          },
            h('span', { class: `exemple-check${checked ? ' visible' : ''}` }, '✓'),
            h('span', {}, l.emoji),
            h('span', { class: 'exemple-nom' }, l.nom),
            h('span', { class: 'exemple-count' }, `${l.elements.length} articles`)
          );
          listContainer.append(item);
        });
      }

      const listContainer = h('div', {});
      rebuildList();

      render(box,
        h('h2', {}, '📋 Listes d\'exemple'),
        h('p', { style: 'color:var(--text-2);font-size:.88rem;margin-bottom:12px;' }, 'Sélectionnez les listes à importer :'),
        h('button', { class: 'btn-secondary', style: 'margin-bottom:12px;', onclick: () => {
          if (selected.size === exemples.length) selected.clear(); else selected = new Set(exemples.map(l => l.id));
          rebuildList();
        }}, 'Tout sélectionner / désélectionner'),
        listContainer,
        h('div', { class: 'modal-actions' },
          h('button', { class: 'btn-secondary', onclick: closeModal }, 'Annuler'),
          h('button', { class: 'btn-primary', onclick: () => {
            exemples.filter(l => selected.has(l.id)).forEach(l => ajouterListe({ ...l, id: crypto.randomUUID() }));
            closeModal();
          }}, `Importer (${selected.size})`)
        )
      );
    });
  }

  // ── Confirmation suppression ──────────────────────────────
  function confirmerSuppression(liste) {
    openModal((box) => {
      render(box,
        h('h2', {}, '⚠️ Supprimer ?'),
        h('p', {}, `Supprimer la liste "${liste.emoji} ${liste.nom}" ? Cette action est irréversible.`),
        h('div', { class: 'modal-actions' },
          h('button', { class: 'btn-secondary', onclick: closeModal }, 'Annuler'),
          h('button', { class: 'btn-danger-full', onclick: () => { supprimerListe(liste.id); closeModal(); } }, 'Supprimer')
        )
      );
    }, { small: true });
  }

  onStoreChange(draw);
  draw();
  return () => offStoreChange(draw);
}
