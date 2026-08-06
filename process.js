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
  if (!track) return;

  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var rect = sec.getBoundingClientRect();

    // the heading pops the moment the stage fills the screen
    if (heading && rect.top <= 0 && rect.bottom >= vh) {
      heading.classList.add('is-in');
    }

    if (rect.bottom < 0 || rect.top > vh) return;

    // the last viewport of the section is the cover phase: the stage holds
    // still while the next section rides up over it
    var runway = sec.offsetHeight - vh * 2;
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
