// ── Partage en temps réel ─────────────────────────────────
//
// DEUX modes :
//   1. BroadcastChannel  → même navigateur, plusieurs onglets/fenêtres
//   2. PeerJS (WebRTC)   → deux appareils différents via code de session
//
// Le second appareil scanne/saisit le code et reçoit toutes les
// modifications en temps réel (coches, ajouts, suppressions d'éléments).

import { getListe, modifierListe, onStoreChange, offStoreChange } from './store.js';

// ── BroadcastChannel (même appareil) ─────────────────────

let _bc = null;

export function startBroadcast(listeId, onRemoteChange) {
  _bc = new BroadcastChannel(`mldc-liste-${listeId}`);
  _bc.onmessage = e => onRemoteChange(e.data);

  // Diffuse les changements locaux
  function sendChange() {
    const liste = getListe(listeId);
    if (liste) _bc.postMessage({ type: 'update', liste });
  }
  onStoreChange(sendChange);

  return {
    send: sendChange,
    stop: () => {
      offStoreChange(sendChange);
      _bc?.close();
      _bc = null;
    }
  };
}

// ── PeerJS (deux appareils) ───────────────────────────────
// PeerJS est chargé dynamiquement depuis CDN pour ne pas alourdir le bundle.

let _peer = null;
let _conn = null;
let _syncListeId = null;
let _onRemote = null;

async function loadPeerJS() {
  if (window.Peer) return;
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.2/peerjs.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.append(s);
  });
}

function generateCode() {
  // Code court lisible (6 caractères, sans ambiguïtés 0/O/1/l)
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/**
 * Crée une session de partage.
 * Retourne { code, stop } — partage le code à l'autre appareil.
 */
export async function createSession(listeId, { onConnected, onDisconnected, onError } = {}) {
  try {
    await loadPeerJS();
    _syncListeId = listeId;
    const code = generateCode();
    const peerId = `mldc-${code.toLowerCase()}`;

    _peer = new Peer(peerId, { debug: 0 });

    _peer.on('error', e => {
      if (e.type === 'unavailable-id') onError?.('Ce code est déjà utilisé, réessayez.');
      else onError?.(`Erreur réseau : ${e.message}`);
    });

    _peer.on('connection', conn => {
      _conn = conn;
      conn.on('open', () => {
        onConnected?.();
        // Envoie l'état actuel immédiatement
        const liste = getListe(listeId);
        if (liste) conn.send({ type: 'full', liste });

        // Puis envoie chaque mise à jour
        function sendUpdate() {
          const l = getListe(listeId);
          if (l && conn.open) conn.send({ type: 'update', liste: l });
        }
        onStoreChange(sendUpdate);
        conn.on('close', () => { offStoreChange(sendUpdate); onDisconnected?.(); });
        conn.on('data', data => _handleIncoming(data));
      });
    });

    return {
      code,
      stop: () => { _peer?.destroy(); _peer = null; _conn = null; }
    };
  } catch(e) {
    onError?.('PeerJS non disponible. Vérifiez votre connexion.');
    return { code: null, stop: () => {} };
  }
}

/**
 * Rejoint une session existante avec un code.
 */
export async function joinSession(code, listeId, { onConnected, onDisconnected, onError, onData } = {}) {
  try {
    await loadPeerJS();
    _syncListeId = listeId;
    _onRemote = onData;

    _peer = new Peer({ debug: 0 });
    _peer.on('open', () => {
      const peerId = `mldc-${code.toLowerCase()}`;
      _conn = _peer.connect(peerId, { reliable: true });

      _conn.on('open', () => onConnected?.());
      _conn.on('close', () => onDisconnected?.());
      _conn.on('error', e => onError?.(`Connexion perdue : ${e}`));
      _conn.on('data', data => _handleIncoming(data));
    });
    _peer.on('error', e => onError?.(`Connexion impossible. Code invalide ou expiré.`));

    return {
      stop: () => { _peer?.destroy(); _peer = null; _conn = null; }
    };
  } catch(e) {
    onError?.('PeerJS non disponible.');
    return { stop: () => {} };
  }
}

function _handleIncoming(data) {
  if (!data || !_syncListeId) return;
  if (data.type === 'full' || data.type === 'update') {
    // Met à jour la liste locale avec les données reçues
    if (data.liste) {
      modifierListe({ ...data.liste, id: _syncListeId });
    }
    _onRemote?.(data);
  }
}

export function sendToPartner(data) {
  if (_conn?.open) _conn.send(data);
}

export function isConnected() {
  return !!_conn?.open;
}

export function destroySession() {
  _peer?.destroy();
  _peer = null; _conn = null; _syncListeId = null; _onRemote = null;
}
