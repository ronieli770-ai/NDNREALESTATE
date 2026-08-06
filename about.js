// עלינו — a stepped story with no page scroll. The dots (and wheel / arrow
// keys) move between slides; each activation replays the right-to-left text
// wipe. The photo is a vanilla port of the React Bits DecayCard: cursor speed
// feeds an feDisplacementMap while the card drifts and tilts after the pointer.
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.story-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.story-dot'));
  if (!slides.length) return;

  var current = 0;
  var lock = 0;

  function goTo(i) {
    if (i < 0 || i >= slides.length || i === current) return;
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = i;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      goTo(i);
    });
  });

  addEventListener('wheel', function (e) {
    e.preventDefault();
    var now = performance.now();
    if (now < lock || Math.abs(e.deltaY) < 4) return;
    lock = now + 900;
    goTo(current + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') goTo(current + 1);
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') goTo(current - 1);
  });
})();

// --- DecayCard, ported (gsap replaced with direct attribute/style writes) ---
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  var card = document.querySelector('.decay');
  var map = document.getElementById('decayMap');
  if (!card || !map) return;

  var MAX_DISPLACEMENT = 400;
  var MOVEMENT_BOUND = 50;

  var cursor = { x: innerWidth / 2, y: innerHeight / 2 };
  var cached = { x: cursor.x, y: cursor.y };
  var t = { x: 0, y: 0, rz: 0, scale: 0 };

  function lerp(a, b, n) { return (1 - n) * a + n * b; }
  function mapRange(x, a, b, c, d) { return ((x - a) * (d - c)) / (b - a) + c; }

  addEventListener('mousemove', function (e) {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
  }, { passive: true });

  (function render() {
    var tx = lerp(t.x, mapRange(cursor.x, 0, innerWidth, -120, 120), 0.1);
    var ty = lerp(t.y, mapRange(cursor.y, 0, innerHeight, -120, 120), 0.1);
    var rz = lerp(t.rz, mapRange(cursor.x, 0, innerWidth, -10, 10), 0.1);

    if (tx > MOVEMENT_BOUND) tx = MOVEMENT_BOUND + (tx - MOVEMENT_BOUND) * 0.2;
    if (tx < -MOVEMENT_BOUND) tx = -MOVEMENT_BOUND + (tx + MOVEMENT_BOUND) * 0.2;
    if (ty > MOVEMENT_BOUND) ty = MOVEMENT_BOUND + (ty - MOVEMENT_BOUND) * 0.2;
    if (ty < -MOVEMENT_BOUND) ty = -MOVEMENT_BOUND + (ty + MOVEMENT_BOUND) * 0.2;

    t.x = tx; t.y = ty; t.rz = rz;
    card.style.transform =
      'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) rotateZ(' + rz.toFixed(2) + 'deg)';

    var travelled = Math.hypot(cached.x - cursor.x, cached.y - cursor.y);
    t.scale = lerp(t.scale, mapRange(travelled, 0, 200, 0, MAX_DISPLACEMENT), 0.06);
    map.setAttribute('scale', t.scale.toFixed(1));

    cached.x = cursor.x;
    cached.y = cursor.y;
    requestAnimationFrame(render);
  })();
})();
