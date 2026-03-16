// ── Page : Paramètres ─────────────────────────────────────
import { exporterJson, importerJson, viderToutesDonnees, getListes, getProduits, getStock } from '../store.js';
import { getStats, viderHistorique } from '../history.js';
import { getRecurrence, setRecurrence, getPeriodes } from '../recurring.js';
import { BUILD_VERSION, BUILD_DATE } from '../data.js';
import { h, render, openModal, closeModal, toast } from '../ui.js';
import { navigate } from '../router.js';

export function renderParametres(container) {
  let confirmVider = false;

  function draw() {
    render(container,
      h('div', { class: 'page-header' },
        h('div', {},
          h('h1', {}, '⚙️ Paramètres'),
          h('p', { class: 'subtitle' }, 'Gestion des données et de l\'application')
        )
      ),

      // ── Export / Import
      h('div', { class: 'param-section' },
        h('div', { class: 'param-section-title' }, '📦 Export / Import des données'),
        h('p', { class: 'param-desc' }, 'Exportez vos listes, produits et stock en fichier JSON pour les sauvegarder ou les transférer vers un autre navigateur / appareil.'),
        h('div', { class: 'param-actions' },
          h('button', { class: 'btn-param btn-export', onclick: doExport },
            h('span', { class: 'btn-param-icon' }, '⬇️'),
            h('div', {}, h('div', { class: 'btn-param-label' }, 'Exporter mes données'), h('div', { class: 'btn-param-desc' }, 'Télécharge un fichier .json'))
          ),
          (() => {
            const label = h('label', { class: 'btn-param btn-import' });
            const input = h('input', { type: 'file', accept: '.json', style: 'display:none' });
            input.addEventListener('change', doImport);
            label.append(
              h('span', { class: 'btn-param-icon' }, '⬆️'),
              h('div', {}, h('div', { class: 'btn-param-label' }, 'Importer des données'), h('div', { class: 'btn-param-desc' }, 'Restaurer depuis un fichier .json')),
              input
            );
            return label;
          })()
        )
      ),

      // ── Vider les données
      h('div', { class: 'param-section param-section-danger' },
        h('div', { class: 'param-section-title' }, '🗑️ Réinitialisation'),
        h('p', { class: 'param-desc' }, 'Supprime définitivement toutes vos listes, votre stock et vos produits personnalisés. Les produits par défaut seront restaurés. ', h('strong', {}, 'Cette action est irréversible.')),
        !confirmVider
          ? h('button', { class: 'btn-param btn-danger-param', onclick: () => { confirmVider = true; draw(); } },
              h('span', { class: 'btn-param-icon' }, '⚠️'),
              h('div', {}, h('div', { class: 'btn-param-label' }, 'Vider toutes les données'), h('div', { class: 'btn-param-desc' }, 'Repart à zéro'))
            )
          : h('div', { class: 'confirm-vider' },
              h('div', { class: 'confirm-vider-msg' }, '⚠️ Êtes-vous sûr ? Toutes vos listes et votre stock seront perdus.'),
              h('div', { class: 'confirm-vider-actions' },
                h('button', { class: 'btn-secondary', onclick: () => { confirmVider = false; draw(); } }, 'Annuler'),
                h('button', { class: 'btn-danger-full', onclick: () => { viderToutesDonnees(); confirmVider = false; navigate('#/'); } }, 'Oui, tout supprimer')
              )
            )
      ),

      // ── Listes récurrentes
      (() => {
        const listes = getListes();
        const periodes = getPeriodes();
        if (!listes.length) return null;
        return h('div', { class: 'param-section' },
          h('div', { class: 'param-section-title' }, '🔄 Listes récurrentes'),
          h('p', { class: 'param-desc' }, 'Réinitialisez automatiquement une liste à intervalle régulier (décocher tous les articles).'),
          h('div', {},
            ...listes.map(l => {
              const rec = getRecurrence(l.id);
              const sel = h('select', { class: 'form-input', style: 'width:auto;' });
              const optNone = h('option', { value: '' }, 'Désactivé');
              if (!rec) optNone.selected = true;
              sel.append(optNone);
              Object.entries(periodes).forEach(([key, val]) => {
                const opt = h('option', { value: key }, val.label);
                if (rec?.periode === key) opt.selected = true;
                sel.append(opt);
              });
              sel.addEventListener('change', e => {
                setRecurrence(l.id, e.target.value || null);
                draw();
              });
              return h('div', { class: 'param-about-row' },
                h('span', {}, `${l.emoji} ${l.nom}`),
                sel
              );
            })
          )
        );
      })(),

      // ── Historique
      (() => {
        const stats = getStats();
        return h('div', { class: 'param-section' },
          h('div', { class: 'param-section-title' }, '📊 Historique des courses'),
          stats ? h('div', {},
            h('div', { class: 'param-about' },
              h('div', { class: 'param-about-row' }, h('span', {}, 'Sessions enregistrées'), h('strong', {}, stats.nbSessions)),
              h('div', { class: 'param-about-row' }, h('span', {}, 'Articles achetés au total'), h('strong', {}, stats.totalArticles)),
              h('div', { class: 'param-about-row' }, h('span', {}, 'Première session'), h('strong', {}, stats.firstDate)),
              h('div', { class: 'param-about-row' }, h('span', {}, 'Dernière session'), h('strong', {}, stats.lastDate))
            ),
            stats.frequents.length ? h('div', { style: 'margin-top:12px;' },
              h('div', { style: 'font-size:.8rem;color:var(--text-2);margin-bottom:6px;' }, '⭐ Vos produits les plus achetés :'),
              h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;' },
                ...stats.frequents.map(p =>
                  h('span', { class: 'filter-btn', style: 'cursor:default;' }, `${p.emoji} ${p.nom} ×${p.count}`)
                )
              )
            ) : null,
            h('button', { class: 'btn-param btn-danger-param', style: 'margin-top:12px;',
              onclick: () => { if (confirm("Effacer tout l'historique ?")) { viderHistorique(); draw(); } }
            },
              h('span', { class: 'btn-param-icon' }, '🗑️'),
              h('div', {}, h('div', { class: 'btn-param-label' }, "Effacer l'historique"))
            )
          ) : h('p', { class: 'param-desc' }, "Aucune session enregistrée pour l'instant. Terminez vos premières courses pour voir les statistiques ici.")
        );
      })(),

      // ── À propos
      h('div', { class: 'param-section' },
        h('div', { class: 'param-section-title' }, 'ℹ️ À propos'),
        h('div', { class: 'param-about' },
          h('div', { class: 'param-about-row' }, h('span', {}, 'Version'), h('strong', {}, `v${BUILD_VERSION} — ${BUILD_DATE}`)),
          h('div', { class: 'param-about-row' }, h('span', {}, 'Stockage'), h('strong', {}, `${getListes().length} liste(s) · ${getProduits().length} produit(s) · ${getStock().length} stock(s)`)),
          h('div', { class: 'param-about-row' }, h('span', {}, 'Réalisé par'), h('strong', {}, 'Mickael LEHAY 💚'))
        )
      )
    );
  }

  function doExport() {
    const json = exporterJson();
    const date = new Date().toISOString().slice(0, 10);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `MesListesDeCourses_${date}.json`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    toast('✅ Données exportées !', 'ok');
  }

  function doImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = importerJson(ev.target.result);
      toast(result.ok ? `✅ ${result.message}` : `❌ ${result.message}`, result.ok ? 'ok' : 'error');
      if (result.ok) draw();
    };
    reader.readAsText(file);
    e.target.value = ''; // reset pour permettre re-import
  }

  draw();
}
