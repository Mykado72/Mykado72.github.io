// ── Reconnaissance vocale ─────────────────────────────────
// Utilise l'API Web Speech (native Chrome/Safari, sans dépendance).
// Retourne une fonction stop() pour arrêter l'écoute.

export function isVoiceSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Lance la reconnaissance vocale.
 * @param {Object} opts
 * @param {Function} opts.onResult   - appelé avec le texte reconnu (string)
 * @param {Function} opts.onStart    - appelé quand l'écoute commence
 * @param {Function} opts.onEnd      - appelé quand l'écoute s'arrête
 * @param {Function} opts.onError    - appelé en cas d'erreur (string message)
 * @returns {Function} stop - arrête l'écoute
 */
export function startVoice({ onResult, onStart, onEnd, onError } = {}) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { onError?.('Reconnaissance vocale non supportée par ce navigateur.'); return () => {}; }

  const recognition = new SR();
  recognition.lang = 'fr-FR';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;

  recognition.onstart  = () => onStart?.();
  recognition.onend    = () => onEnd?.();
  recognition.onerror  = e => {
    const msgs = {
      'not-allowed':  'Microphone refusé. Autorisez l\'accès dans les paramètres.',
      'no-speech':    'Aucun son détecté. Réessayez.',
      'network':      'Erreur réseau. Vérifiez votre connexion.',
      'aborted':      null, // ignoré (arrêt volontaire)
    };
    const msg = msgs[e.error] ?? `Erreur : ${e.error}`;
    if (msg) onError?.(msg);
    onEnd?.();
  };

  recognition.onresult = e => {
    // Prend le résultat le plus probable
    const transcript = e.results[0][0].transcript.trim().toLowerCase();
    onResult?.(transcript);
  };

  recognition.start();
  return () => { try { recognition.stop(); } catch(e) {} };
}

/**
 * Trouve le meilleur produit correspondant au texte vocal.
 * @param {string} text    - texte reconnu
 * @param {Array}  produits - liste des produits disponibles
 * @returns {Array} produits trouvés, triés par pertinence
 */
export function matchVoiceToProduits(text, produits) {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  return produits
    .map(p => {
      const nom = p.nom.toLowerCase();
      const cat = p.categorie.toLowerCase();

      // Score : correspondance exacte > mot inclus > similitude partielle
      let score = 0;
      if (nom === text) score += 100;
      if (nom.includes(text)) score += 50;
      if (text.includes(nom)) score += 40;
      words.forEach(w => {
        if (nom.includes(w)) score += 20;
        if (cat.includes(w)) score += 5;
      });

      return { produit: p, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.produit);
}
