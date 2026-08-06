// ── Roue crantée de quantité ──────────────────────────────
// Usage :
//   const wheel = createSpinner({ value: 1, min: 0, step: 1, unit: 'kg',
//     onChange: (v) => console.log(v) });
//   container.append(wheel.el);
//   wheel.getValue(); wheel.setValue(3);

export function createSpinner({ value = 1, min = 0, step = 1, unit = '', onChange } = {}) {
  let _val = value;
  let _startX = 0;
  let _lastX = 0;
  let _dragging = false;
  let _accumulated = 0;    // px accumulés depuis dernier clic
  const PX_PER_STEP = 28; // px à parcourir pour changer d'une unité

  // Affichage
  const display = document.createElement('span');
  display.className = 'spinner-display';

  const unitEl = document.createElement('span');
  unitEl.className = 'spinner-unit';
  unitEl.textContent = unit;

  const track = document.createElement('div');
  track.className = 'spinner-track';

  // Ticks visuels (décoratifs)
  for (let i = 0; i < 7; i++) {
    const tick = document.createElement('div');
    tick.className = 'spinner-tick';
    track.append(tick);
  }

  const btnMinus = document.createElement('button');
  btnMinus.className = 'spinner-btn';
  btnMinus.textContent = '−';
  btnMinus.type = 'button';

  const btnPlus = document.createElement('button');
  btnPlus.className = 'spinner-btn';
  btnPlus.textContent = '＋';
  btnPlus.type = 'button';

  const el = document.createElement('div');
  el.className = 'spinner-wrap';
  el.append(btnMinus, track, display, unitEl, btnPlus);

  function snap(raw) {
    // Arrondi au step le plus proche, respect du min
    const steps = Math.round((raw - min) / step);
    return Math.max(min, min + steps * step);
  }

  function fmt(v) {
    return v === Math.floor(v) ? String(Math.floor(v)) : v.toFixed(1);
  }

  function update(newVal, haptic = true) {
    const snapped = snap(newVal);
    if (snapped === _val) return;
    _val = snapped;
    display.textContent = fmt(_val);
    display.classList.add('spinner-bump');
    setTimeout(() => display.classList.remove('spinner-bump'), 180);
    if (haptic && navigator.vibrate) navigator.vibrate(15);
    onChange?.(_val);
  }

  function init() {
    _val = snap(value);
    display.textContent = fmt(_val);
  }

  // ── Boutons ────────────────────────────────────────────
  btnMinus.addEventListener('click', () => update(_val - step));
  btnPlus.addEventListener('click',  () => update(_val + step));

  // ── Drag / Swipe sur la track ──────────────────────────
  function onPointerDown(e) {
    _dragging = true;
    _startX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    _lastX = _startX;
    _accumulated = 0;
    track.classList.add('spinning');
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!_dragging) return;
    const x = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const dx = x - _lastX;
    _lastX = x;
    _accumulated += dx;

    // Déclenche un cran quand le seuil est atteint
    while (_accumulated >= PX_PER_STEP) {
      _accumulated -= PX_PER_STEP;
      update(_val + step);
    }
    while (_accumulated <= -PX_PER_STEP) {
      _accumulated += PX_PER_STEP;
      update(_val - step);
    }

    // Rotation visuelle des ticks
    const totalDx = x - _startX;
    track.style.setProperty('--spin-offset', `${(totalDx % 40)}px`);
    e.preventDefault();
  }

  function onPointerUp() {
    _dragging = false;
    _accumulated = 0;
    track.classList.remove('spinning');
    track.style.setProperty('--spin-offset', '0px');
  }

  track.addEventListener('mousedown',  onPointerDown);
  track.addEventListener('touchstart', onPointerDown, { passive: false });
  window.addEventListener('mousemove',  onPointerMove);
  window.addEventListener('touchmove',  onPointerMove, { passive: false });
  window.addEventListener('mouseup',    onPointerUp);
  window.addEventListener('touchend',   onPointerUp);

  init();

  return {
    el,
    getValue: () => _val,
    setValue: (v) => { _val = snap(v); display.textContent = fmt(_val); },
    destroy: () => {
      window.removeEventListener('mousemove',  onPointerMove);
      window.removeEventListener('touchmove',  onPointerMove);
      window.removeEventListener('mouseup',    onPointerUp);
      window.removeEventListener('touchend',   onPointerUp);
    }
  };
}
