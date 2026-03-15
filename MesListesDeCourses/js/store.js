// ── Store : gestion des données, localStorage, événements ──
import { getProduitsParDefaut } from './data.js';

// État global
let _produits = [];
let _listes   = [];
let _stock    = [];

// Abonnés aux changements
const _listeners = new Set();

export function onStoreChange(fn) { _listeners.add(fn); }
export function offStoreChange(fn) { _listeners.delete(fn); }
function notify() { _listeners.forEach(fn => fn()); }

// ── Persistance ───────────────────────────────────────────

function sauvegarder() {
  try {
    localStorage.setItem('produits', JSON.stringify(_produits));
    localStorage.setItem('listes',   JSON.stringify(_listes));
    localStorage.setItem('stock',    JSON.stringify(_stock));
  } catch(e) { console.warn('localStorage write error', e); }
}

export function charger() {
  try {
    const p = localStorage.getItem('produits');
    _produits = p ? JSON.parse(p) : getProduitsParDefaut();

    const l = localStorage.getItem('listes');
    _listes = l ? JSON.parse(l) : [];

    const s = localStorage.getItem('stock');
    _stock = s ? JSON.parse(s) : [];
  } catch(e) {
    _produits = getProduitsParDefaut();
    _listes = []; _stock = [];
  }
  sauvegarder(); // premier lancement : persiste les produits par défaut
  notify();
}

// ── Accesseurs ────────────────────────────────────────────

export const getProduits = () => [..._produits];
export const getListes   = () => [..._listes];
export const getStock    = () => [..._stock];

export function getStockByProduit(produitId) {
  return _stock.find(s => s.produitId === produitId) ?? null;
}

export function getListe(id) {
  return _listes.find(l => l.id === id) ?? null;
}

// ── Helpers ───────────────────────────────────────────────

export function fmtQty(q) {
  return q === Math.floor(q) ? String(Math.floor(q)) : q.toFixed(1).replace(/\.0$/, '');
}

export function progression(liste) {
  if (!liste.elements.length) return 0;
  return liste.elements.filter(e => e.estCoche).length / liste.elements.length * 100;
}

// ── Produits ──────────────────────────────────────────────

export function ajouterProduit(p) {
  p.id = crypto.randomUUID();
  p.creeLe = new Date().toISOString();
  _produits.push(p);
  sauvegarder(); notify();
  return p;
}

export function modifierProduit(p) {
  const idx = _produits.findIndex(x => x.id === p.id);
  if (idx >= 0) _produits[idx] = p;
  // Propage dans les listes
  _listes.forEach(l => l.elements.forEach(e => {
    if (e.produitId === p.id) {
      e.nom = p.nom; e.emoji = p.emoji; e.categorie = p.categorie;
    }
  }));
  // Propage dans le stock
  const s = _stock.find(s => s.produitId === p.id);
  if (s) { s.nom = p.nom; s.emoji = p.emoji; s.categorie = p.categorie; s.unite = p.unite; }
  sauvegarder(); notify();
}

export function dupliquerProduit(id) {
  const orig = _produits.find(p => p.id === id);
  if (!orig) return;
  const copie = { ...orig, id: crypto.randomUUID(), nom: `${orig.nom} (variante)`, creeLe: new Date().toISOString() };
  const idx = _produits.findIndex(p => p.id === id);
  _produits.splice(idx + 1, 0, copie);
  sauvegarder(); notify();
}

export function supprimerProduit(id) {
  _produits = _produits.filter(p => p.id !== id);
  _stock    = _stock.filter(s => s.produitId !== id);
  sauvegarder(); notify();
}

export function listesPourProduit(produitId) {
  return _listes.filter(l => l.elements.some(e => e.produitId === produitId));
}

// ── Stock ─────────────────────────────────────────────────

export function setStock(produitId, quantite) {
  const prod = _produits.find(p => p.id === produitId);
  if (!prod) return;
  const idx = _stock.findIndex(s => s.produitId === produitId);
  if (quantite <= 0) {
    if (idx >= 0) _stock.splice(idx, 1);
  } else if (idx < 0) {
    _stock.push({ produitId, nom: prod.nom, emoji: prod.emoji, categorie: prod.categorie,
                  unite: prod.unite, quantite, misAJourLe: new Date().toISOString() });
  } else {
    _stock[idx].quantite = quantite;
    _stock[idx].misAJourLe = new Date().toISOString();
  }
  sauvegarder(); notify();
}

export function supprimerStock(produitId) {
  _stock = _stock.filter(s => s.produitId !== produitId);
  sauvegarder(); notify();
}

// ── Listes ────────────────────────────────────────────────

export function ajouterListe(liste) {
  liste.id = liste.id ?? crypto.randomUUID();
  liste.creeLe = liste.creeLe ?? new Date().toISOString();
  liste.elements = liste.elements ?? [];
  _listes.push(liste);
  sauvegarder(); notify();
  return liste;
}

export function modifierListe(liste) {
  const idx = _listes.findIndex(l => l.id === liste.id);
  if (idx >= 0) _listes[idx] = liste;
  sauvegarder(); notify();
}

export function supprimerListe(id) {
  _listes = _listes.filter(l => l.id !== id);
  sauvegarder(); notify();
}

export function dupliquerListe(id) {
  const orig = _listes.find(l => l.id === id);
  if (!orig) return null;
  const copie = {
    ...orig,
    id: crypto.randomUUID(),
    nom: `${orig.nom} (copie)`,
    creeLe: new Date().toISOString(),
    modifieLe: null,
    elements: orig.elements.map(e => ({ ...e, id: crypto.randomUUID(), estCoche: false }))
  };
  _listes.push(copie);
  sauvegarder(); notify();
  return copie;
}

export function cocherElement(listeId, elementId, coche) {
  const liste = _listes.find(l => l.id === listeId);
  if (!liste) return;
  const el = liste.elements.find(e => e.id === elementId);
  if (el) el.estCoche = coche;
  sauvegarder(); notify();
}

export function reinitialiserCoches(listeId) {
  const liste = _listes.find(l => l.id === listeId);
  if (!liste) return;
  liste.elements.forEach(e => e.estCoche = false);
  sauvegarder(); notify();
}

// ── Partage GZip + Base64 (désactivé côté UI) ────────────

export async function genererLienPartage(listeId) {
  const liste = _listes.find(l => l.id === listeId);
  if (!liste) return '';
  const clone = { ...liste, id: crypto.randomUUID(), elements: liste.elements.map(e => ({...e, estCoche: false})) };
  const json = JSON.stringify(clone);
  const bytes = new TextEncoder().encode(json);
  const ds = new CompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(bytes); writer.close();
  const compressed = await new Response(ds.readable).arrayBuffer();
  const b64 = btoa(String.fromCharCode(...new Uint8Array(compressed)));
  return `${location.origin}${location.pathname}?partage=${encodeURIComponent(b64)}`;
}

export async function importerListePartagee(payload) {
  try {
    const compressed = Uint8Array.from(atob(decodeURIComponent(payload)), c => c.charCodeAt(0));
    const ds = new DecompressionStream('gzip');
    const writer = ds.writable.getWriter();
    writer.write(compressed); writer.close();
    const json = await new Response(ds.readable).text();
    const liste = JSON.parse(json);
    if (_listes.some(l => l.id === liste.id)) return { liste, dejaPresente: true };
    liste.modifieLe = new Date().toISOString();
    _listes.push(liste);
    sauvegarder(); notify();
    return { liste, dejaPresente: false };
  } catch(e) { return { liste: null, dejaPresente: false }; }
}

// ── Export / Import / Reset ───────────────────────────────

export function exporterJson() {
  return JSON.stringify({ version: '1.2.0', exportDate: new Date().toLocaleString('fr-FR'),
    produits: _produits, listes: _listes, stock: _stock }, null, 2);
}

export function importerJson(json) {
  try {
    const data = JSON.parse(json);
    if (data.produits) _produits = data.produits;
    if (data.listes)   _listes   = data.listes;
    if (data.stock)    _stock    = data.stock;
    sauvegarder(); notify();
    return { ok: true, message: `${_listes.length} liste(s), ${_produits.length} produit(s) et ${_stock.length} stock(s) importés.` };
  } catch(e) { return { ok: false, message: `Fichier invalide : ${e.message}` }; }
}

export function viderToutesDonnees() {
  _produits = getProduitsParDefaut();
  _listes = []; _stock = [];
  localStorage.removeItem('produits');
  localStorage.removeItem('listes');
  localStorage.removeItem('stock');
  notify();
}
