// ScrollReveal — words fade and un-blur in a staggered sweep while the block
// settles from a slight tilt. Every main heading uses it; section 2 chains its
// heading, paragraph and button into one sequence.
//
// Fires when the element has climbed a quarter of the viewport, via a negative
// bottom rootMargin rather than a threshold — a threshold measures a share of
// the element, which would trigger at different heights for short and tall
// headings.
(function () {
  var BLUR = 10;    // px
  var STEP = 0.03;  // s between words
  var GAP = 0.2;    // s between chained blocks
  var LEAD = 0.15;  // s before anything moves

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function splitWords(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function (node) {
      if (!node.nodeValue.trim()) return;
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
          return;
        }
        var span = document.createElement('span');
        span.className = 'word';
        span.textContent = part;
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return root.querySelectorAll('.word');
  }

  function stagger(words, from) {
    for (var i = 0; i < words.length; i++) {
      words[i].style.transitionDelay = (from + i * STEP).toFixed(3) + 's';
    }
    return from + words.length * STEP;
  }

  function watch(el, onEnter) {
    if (!('IntersectionObserver' in window)) {
      onEnter();
      return;
    }
    new IntersectionObserver(
      function (entries, obs) {
        if (entries[0].isIntersecting) {
          onEnter();
          obs.disconnect();
        }
      },
      { rootMargin: '0px 0px -25% 0px' }
    ).observe(el);
  }

  // --- every standalone heading ---
  var HEADINGS = [
    '.problem-head',
    '.opp-head',
    '.about-name',
    '.contact-head',
    '.quote-body p'
  ];

  HEADINGS.forEach(function (sel) {
    var el = document.querySelector(sel);
    if (!el) return;
    el.style.setProperty('--blur', BLUR + 'px');
    stagger(splitWords(el), LEAD);
    el.classList.add('js-reveal');
    watch(el, function () {
      el.classList.add('is-in');
    });
  });

  // --- section 2: heading, then body, then button, on one trigger ---
  (function () {
    var sec = document.querySelector('.sec-intro');
    if (!sec) return;

    var badge = sec.querySelector('.intro-badge');
    var head = sec.querySelector('.intro-head');
    var body = sec.querySelector('.intro-body');
    var btn = sec.querySelector('.btn-ghost');
    if (!head || !body || !btn) return;

    if (badge) badge.classList.add('js-fade');
    [head, body, btn].forEach(function (el) {
      el.style.setProperty('--blur', BLUR + 'px');
      el.classList.add('js-reveal');
    });

    var t = LEAD;
    head.style.transitionDelay = t + 's';
    t = stagger(splitWords(head), t) + GAP;
    body.style.transitionDelay = t + 's';
    t = stagger(splitWords(body), t) + GAP;
    btn.style.transitionDelay = t.toFixed(3) + 's';

    watch(head, function () {
      if (badge) badge.classList.add('is-in');
      head.classList.add('is-in');
      body.classList.add('is-in');
      btn.classList.add('is-in');
    });
  })();

  // --- process heading: standard word reveal, fired by process.js at pin ---
  (function () {
    var el = document.querySelector('.proc-sub');
    if (!el) return;
    el.style.setProperty('--blur', BLUR + 'px');
    stagger(splitWords(el), LEAD);
    el.classList.add('js-reveal');
  })();

  // --- section 3: the tiles vault in, staggered right to left ---
  (function () {
    var cards = document.querySelector('.problem-cards');
    if (!cards) return;
    cards.classList.add('js-cards');
    watch(cards, function () {
      cards.classList.add('is-in');
    });
  })();

  // --- "למה דובאי" tiles: gentle drop into place ---
  (function () {
    var cards = document.querySelector('.opp-cards');
    if (!cards) return;
    cards.classList.add('js-drop');
    watch(cards, function () {
      cards.classList.add('is-in');
    });
  })();

  // --- section 3: TiltedCard, ported — the tile tilts toward the pointer ---
  // (the React original drives springs from mouse offsets; here the offsets go
  // straight into a transform and an inline transition supplies the easing,
  // which also outranks the entrance transition's staggered delays)
  (function () {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    var AMPLITUDE = 12;
    var SCALE = 1.05;

    document.querySelectorAll('.pcard').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        card.style.transition = 'transform .18s ease-out';
      });
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -AMPLITUDE;
        var ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * AMPLITUDE;
        card.style.transform =
          'perspective(800px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) scale(' + SCALE + ')';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform .8s cubic-bezier(.22,1.4,.36,1)';
        card.style.transform = '';
      });
    });
  })();

  // --- section 5: the whole copy block rides upward with the scroll ---
  // Spec: starts 15px BELOW its resting spot as the section enters, crosses
  // the resting spot mid-view, and has risen to 30px ABOVE it by the time the
  // section leaves the screen — 45px of continuous travel, scroll-locked.
  (function () {
    var sec = document.querySelector('.sec-about');
    var grid = document.querySelector('.about-grid');
    var name = document.querySelector('.about-name-wrap');
    if (!sec || !grid) return;

    var FROM = 43;   // px below rest at entry (÷7 of the previous range)
    var TO = -86;    // px above rest at exit
    // the drift crosses 0 exactly when the section is centred in the viewport,
    // so at full-screen the whole text group sits at its centred rest position
    var ZERO = -FROM / (TO - FROM);

    function upd() {
      var vh = innerHeight;
      var r = sec.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;

      var centredTop = -(r.height - vh) / 2;
      var p = ZERO + (centredTop - r.top) / vh;
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      var y = (FROM + (TO - FROM) * p).toFixed(1) + 'px';
      grid.style.setProperty('--drift', y);
      if (name) name.style.setProperty('--drift', y);
    }

    addEventListener('scroll', upd, { passive: true });
    upd();
  })();

  // --- section 5: photo wipe, then the bullets land beat by beat ---
  (function () {
    var stage = document.querySelector('.about-stage');
    if (!stage) return;
    stage.classList.add('js-stage');
    watch(stage, function () {
      stage.classList.add('is-in');
    });
  })();
})();
