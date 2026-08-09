// Section 6. The stage pins and the card column travels upward with the scroll;
// once the fifth card has arrived the section releases to the next one.
//
// Travel = column height − window height:
//   5 × 236 + 4 × 25 = 1280px column, window 832 − 148 = 684px → 596px = 37.25rem
// which is the figure the CSS transform uses.
(function () {
  var sec = document.querySelector('.sec-process');
  if (!sec) return;

  // The cards' glass blur, forced inline. The Lovable build pipeline processes
  // site.css and somewhere along the way the backdrop-filter stopped reaching
  // the page; an inline style bypasses any stylesheet transform for good.
  sec.querySelectorAll('.step').forEach(function (card) {
    card.style.webkitBackdropFilter = 'blur(10.7px)';
    card.style.backdropFilter = 'blur(10.7px)';
  });

  var track = sec.querySelector('.proc-track');
  var heading = sec.querySelector('.proc-sub');
  var headWrap = sec.querySelector('.proc-sub-wrap');
  if (!track) return;

  var small = window.matchMedia('(max-width:900px)');
  var ticking = false;

  // --- mobile: the column turns on its side and the finger drives it ---
  // The card that is only half on screen carries a light blur, which lifts as
  // it slides into view — that is what tells you there is more to swipe.
  if (small.matches) {
    var scroller = sec.querySelector('.proc-viewport');
    var cards = Array.prototype.slice.call(track.children);

    var paint = function () {
      var box = scroller.getBoundingClientRect();
      cards.forEach(function (card) {
        var r = card.getBoundingClientRect();
        var visible = Math.min(r.right, box.right) - Math.max(r.left, box.left);
        var ratio = Math.max(0, Math.min(1, visible / r.width));
        // the card stays crisp — only its copy softens, and a small swipe
        // (over half the card in view) already clears it completely
        var soft = 1 - Math.min(1, ratio / 0.55);
        var f = soft > 0.02 ? 'blur(' + (soft * 2.5).toFixed(2) + 'px)' : '';
        card.querySelectorAll('h3, p').forEach(function (el) { el.style.filter = f; });
        card.__ratio = ratio;
      });

      var best = 0;
      cards.forEach(function (card, i) { if (card.__ratio > cards[best].__ratio) best = i; });
      pips.forEach(function (p, i) { p.classList.toggle('is-on', i === best); });
    };

    // a slim progress rail under the deck, so the position is always legible
    var rail = document.createElement('div');
    rail.className = 'proc-rail';
    cards.forEach(function () { rail.appendChild(document.createElement('span')); });
    scroller.parentNode.insertBefore(rail, scroller.nextSibling);
    var pips = Array.prototype.slice.call(rail.children);

    // painting five cards is cheap — run it straight off the event rather
    // than through rAF, which some in-app browsers starve
    scroller.addEventListener('scroll', paint, { passive: true });
    addEventListener('resize', paint);

    // the deck deals in once the section reaches the viewport
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) {
          scroller.classList.add('is-in');
          obs.disconnect();
        }
      }, { rootMargin: '0px 0px -12% 0px' }).observe(scroller);
    } else {
      scroller.classList.add('is-in');
    }
    if (heading) heading.classList.add('is-in');
    paint();
    setTimeout(paint, 300);
    return;
  }

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
