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

// --- letter-by-letter reveal: each character fades .3 -> 1 on its own beat,
// in reading order (right to left), every time its slide becomes active ---
(function () {
  var STEP = 0.008; // s between letters

  document.querySelectorAll('.story-text').forEach(function (text) {
    var walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    var i = 0;
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split('').forEach(function (ch) {
        if (/\s/.test(ch)) {
          frag.appendChild(document.createTextNode(ch));
          return;
        }
        var span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch;
        span.style.setProperty('--d', (i * STEP).toFixed(3) + 's');
        i++;
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    });
  });
})();
