// The about heading's bottom must rest on the last line of ניהול נכס מלא
// ("לקצה") — but line wrapping differs between browsers, so a fixed offset
// can't hold. Measured live instead, drift-neutralised, refreshed on resize.
(function () {
  function align() {
    var stage = document.querySelector('.about-stage');
    var l2 = document.querySelector('.feat--l2 p');
    var wrap = document.querySelector('.about-name-wrap');
    var grid = document.querySelector('.about-grid');
    if (!stage || !l2 || !wrap || !grid) return;

    // strip the scroll-drift translate out of the measurement — the wrap
    // carries the same drift, so it must anchor against the neutral position
    var m = getComputedStyle(grid).transform;
    var ty = 0;
    if (m && m !== 'none') {
      var parts = m.match(/matrix\(([^)]+)\)/);
      if (parts) ty = parseFloat(parts[1].split(',')[5]) || 0;
    }
    var sb = stage.getBoundingClientRect().bottom;
    var lb = l2.getBoundingClientRect().bottom - ty;
    wrap.style.bottom = (sb - lb).toFixed(1) + 'px';
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(align);
  } else {
    align();
  }
  addEventListener('resize', align);
  addEventListener('load', align);
})();

// Match the loader iris' starting aperture to the on-screen mark: the eye is
// 600 viewBox-units wide and `slice` scales the 1000-unit box to the viewport.
(function () {
  var loader = document.querySelector('.site-loader');
  var mark = document.querySelector('.loader-mark');
  if (!loader || !mark) return;
  var unit = Math.max(innerWidth, innerHeight) / 1000;
  var scale = mark.getBoundingClientRect().width / (600 * unit);
  loader.style.setProperty('--iris-from', scale.toFixed(4));
})();

// Shared switch for the bare header. Several pinned sections ask for it, so it
// is reference-counted by key — otherwise whichever section ran last would
// clear the class the other one had just set.
window.setNavBare = function (key, on) {
  var claims = window.__navBare || (window.__navBare = {});
  if (on) claims[key] = 1;
  else delete claims[key];

  var nav = document.querySelector('.nav');
  if (nav) nav.classList.toggle('nav-hero', Object.keys(claims).length > 0);
};

// Hero scroll: sky stays put, the title drifts up a little, the buildings rise
// over it and clear the frame, uncovering the dark section underneath.
// The same progress value drives the header's background swap.
(function () {
  var section = document.querySelector('.sec-hero');
  var copy = document.querySelector('.hero-copy');
  var buildings = document.querySelector('.hero-buildings');
  var nav = document.querySelector('.nav');
  if (!section || !copy || !buildings) return;

  var TITLE_RISE = 90;       // px
  var BUILDINGS_RISE = 1.25; // × viewport height
  // On mobile the layer is a full-frame export whose skyline starts halfway
  // down, so it clears after ~55% of a screen. Rising the full 1.25 screens
  // meant the last two thirds of the runway showed nothing but empty sky.
  var small = window.matchMedia('(max-width:900px)');
  var NAV_AT = 0.98;         // stays bare until the hero has fully cleared
  var animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ticking = false;

  function update() {
    ticking = false;
    var rect = section.getBoundingClientRect();
    var runway = section.offsetHeight - window.innerHeight;

    // no runway (mobile, where the hero is exactly one screen): the header
    // still has to switch the moment the hero clears
    if (runway <= 0) {
      if (nav) nav.classList.toggle('is-scrolled', rect.bottom <= window.innerHeight * 0.5);
      return;
    }

    var p = -rect.top / runway;
    p = p < 0 ? 0 : p > 1 ? 1 : p;

    if (nav) nav.classList.toggle('is-scrolled', p > NAV_AT);
    if (!animate) return;

    copy.style.setProperty('--y', -(p * TITLE_RISE).toFixed(1) + 'px');
    // mobile: the whole layers animation plays out in the first half of the
    // runway; section 2's text enters during the second half
    var pb = small.matches ? Math.min(1, p * 2) : p;
    var rise = small.matches ? 0.58 : BUILDINGS_RISE;
    buildings.style.setProperty(
      '--y',
      -(pb * rise * window.innerHeight).toFixed(1) + 'px'
    );
  }

  function request() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  update();
})();
