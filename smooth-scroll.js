// Eased scrolling. The wheel feeds a target position and the page eases toward
// it each frame, which reads as inertia rather than the browser's stepped jumps.
// Plain page scrolling — no section paging.
//
// Deliberately drives the *real* scroll position with window.scrollTo instead of
// translating a wrapper: the hero parallax and the process track both measure
// with getBoundingClientRect(), and a transformed wrapper would invalidate them.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // leave touch devices on their own native momentum
  if (!window.matchMedia('(pointer: fine)').matches) return;

  var EASE = 0.045;     // lower = longer, softer glide
  var GLIDE_MS = 700;  // anchor links and in-page jumps tween over this
  var LINE = 40;       // px per line for deltaMode 1

  var target = window.scrollY;
  var current = target;
  var running = false;
  // fixed-duration tween used only for programmatic jumps
  var tween = null;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function limit() {
    return Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
  }

  function frame() {
    if (tween) {
      var t = (performance.now() - tween.start) / tween.dur;
      if (t >= 1) {
        current = target = tween.to;
        window.scrollTo(0, current);
        tween = null;
        running = false;
        return;
      }
      current = tween.from + (tween.to - tween.from) * easeInOutCubic(t);
      window.scrollTo(0, current);
      requestAnimationFrame(frame);
      return;
    }

    var delta = target - current;

    if (Math.abs(delta) < 0.4) {
      current = target;
      window.scrollTo(0, current);
      running = false;
      return;
    }

    current += delta * EASE;
    window.scrollTo(0, current);
    requestAnimationFrame(frame);
  }

  function start() {
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  }

  function tweenTo(y, ms) {
    tween = { from: current, to: y, start: performance.now(), dur: ms };
    target = y;
    start();
  }

  window.addEventListener(
    'wheel',
    function (e) {
      if (e.ctrlKey) return; // pinch-zoom
      e.preventDefault();

      var d = e.deltaY;
      if (e.deltaMode === 1) d *= LINE;
      else if (e.deltaMode === 2) d *= window.innerHeight;

      // a fresh gesture cancels any programmatic glide in flight
      tween = null;
      target = Math.min(limit(), Math.max(0, target + d));
      start();
    },
    { passive: false }
  );

  // keyboard, scrollbar drags and find-in-page still move the page natively —
  // resync so the next wheel tick starts from where the page actually is
  window.addEventListener(
    'scroll',
    function () {
      if (!running) {
        current = target = window.scrollY;
      }
    },
    { passive: true }
  );

  window.addEventListener('resize', function () {
    target = Math.min(limit(), target);
  });

  // let other scripts hand the engine a destination instead of jumping
  window.smoothScrollTo = function (y) {
    tweenTo(Math.min(limit(), Math.max(0, y)), GLIDE_MS);
  };

  // in-page links glide instead of snapping
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href');
    if (id.length < 2) return;
    var dest = document.querySelector(id);
    if (!dest) return;

    e.preventDefault();
    tweenTo(
      Math.min(
        limit(),
        Math.max(0, window.scrollY + dest.getBoundingClientRect().top)
      ),
      GLIDE_MS
    );
  });
})();
