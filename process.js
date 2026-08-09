// Section 6. The stage pins and the card column travels upward with the scroll;
// once the fifth card has arrived the section releases to the next one.
//
// Travel = column height − window height:
//   5 × 236 + 4 × 25 = 1280px column, window 832 − 148 = 684px → 596px = 37.25rem
// which is the figure the CSS transform uses.
(function () {
  var sec = document.querySelector('.sec-process');
  if (!sec) return;

  var track = sec.querySelector('.proc-track');
  var heading = sec.querySelector('.proc-sub');
  var headWrap = sec.querySelector('.proc-sub-wrap');
  if (!track) return;

  var small = window.matchMedia('(max-width:900px)');
  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var rect = sec.getBoundingClientRect();

    // the heading is already up at half a screen, then settles into place
    if (headWrap) {
      var d = (vh * 0.5 - rect.top) / (vh * 0.5);
      d = d < 0 ? 0 : d > 1 ? 1 : d;
      headWrap.style.setProperty('--drop', (-(1 - d) * 6).toFixed(3) + 'rem');
      if (d > 0) heading.classList.add('is-in');
    }
    if (heading && rect.top <= 0 && rect.bottom >= vh) {
      heading.classList.add('is-in');
    }

    if (rect.bottom < 0 || rect.top > vh) return;

    // Desktop keeps a second viewport as the cover phase, where the quote
    // rides up over the pinned stage. On mobile the sections are only as tall
    // as their copy, so that overlap swallowed them — there the section ends
    // as soon as the cards finish.
    var runway = sec.offsetHeight - vh * (small.matches ? 1 : 2);
    if (runway <= 0) return;

    var p = -rect.top / runway;
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    // measured, since the cards now grow with their copy
    var travel = track.scrollHeight - track.parentElement.clientHeight;
    if (travel < 0) travel = 0;
    track.style.transform = 'translateY(' + (-p * travel).toFixed(1) + 'px)';
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
