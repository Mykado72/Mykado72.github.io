// ── Gestion du swipe tactile ──────────────────────────────
// Usage :
//   const detach = addSwipe(element, {
//     onSwipeRight: () => cocher(),   // swipe → droite
//     onSwipeLeft:  () => supprimer() // swipe → gauche
//   });
//   detach(); // pour supprimer les listeners

const SWIPE_THRESHOLD  = 60;   // px minimum pour déclencher
const SWIPE_MAX_ANGLE  = 35;   // degrés max d'écart vertical

export function addSwipe(el, { onSwipeRight, onSwipeLeft, onSwipeStart } = {}) {
  let startX = 0, startY = 0, startTime = 0;
  let currentX = 0;
  let active = false;

  function onTouchStart(e) {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    startTime = Date.now();
    currentX = 0;
    active = true;
    onSwipeStart?.();
  }

  function onTouchMove(e) {
    if (!active) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // Annule si trop diagonal (scroll vertical probable)
    if (Math.abs(dy) > Math.abs(dx) * Math.tan(SWIPE_MAX_ANGLE * Math.PI / 180)) {
      active = false;
      el.style.transform = '';
      return;
    }

    e.preventDefault(); // empêche le scroll pendant un swipe horizontal
    currentX = dx;

    // Feedback visuel : translate + teinte selon direction
    const clamped = Math.max(-120, Math.min(120, dx));
    el.style.transform = `translateX(${clamped}px)`;
    el.style.transition = 'none';

    if (dx > 20) {
      el.style.background = 'linear-gradient(to right, #D8F3DC, var(--surface))';
    } else if (dx < -20) {
      el.style.background = 'linear-gradient(to left, #FEE2E2, var(--surface))';
    } else {
      el.style.background = '';
    }
  }

  function onTouchEnd() {
    if (!active) return;
    active = false;
    el.style.transition = 'transform 0.25s ease, background 0.25s ease';
    el.style.transform = '';
    el.style.background = '';

    const elapsed = Date.now() - startTime;
    const velocity = Math.abs(currentX) / elapsed; // px/ms

    // Déclenche si déplacement suffisant OU geste rapide
    if (currentX > SWIPE_THRESHOLD || (currentX > 30 && velocity > 0.5)) {
      // Flash vert avant action
      el.style.background = '#D8F3DC';
      setTimeout(() => { el.style.background = ''; onSwipeRight?.(); }, 150);
      if (navigator.vibrate) navigator.vibrate(30);
    } else if (currentX < -SWIPE_THRESHOLD || (currentX < -30 && velocity > 0.5)) {
      el.style.background = '#FEE2E2';
      setTimeout(() => { el.style.background = ''; onSwipeLeft?.(); }, 150);
      if (navigator.vibrate) navigator.vibrate([20, 10, 20]);
    }
  }

  el.addEventListener('touchstart', onTouchStart, { passive: true });
  el.addEventListener('touchmove',  onTouchMove,  { passive: false });
  el.addEventListener('touchend',   onTouchEnd,   { passive: true });

  return () => {
    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchmove',  onTouchMove);
    el.removeEventListener('touchend',   onTouchEnd);
    el.style.transform = '';
    el.style.background = '';
  };
}
