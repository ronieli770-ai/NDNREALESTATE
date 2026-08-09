// עלינו — a stepped story with no page scroll. The dots (and wheel / arrow
// keys) move between slides; each activation replays the right-to-left word
// reveal and cross-fades the photo to the one the slide carries.
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.story-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.story-dot'));
  if (!slides.length) return;

  var stage = document.querySelector('.story');

  // On a phone the stepped story has nowhere to put a slide's overflow (the
  // closing form especially), so it unfolds into a normal scrolling column:
  // every slide keeps its own photo and scrolling simply moves to the next.
  if (window.matchMedia('(max-width:900px)').matches) {
    document.body.classList.add('story-flow');
    slides.forEach(function (slide) {
      slide.classList.add('is-active');
      if (!slide.dataset.img) return;
      var img = document.createElement('img');
      img.className = 'story-photo';
      img.src = slide.dataset.img;
      img.alt = slide.dataset.alt || '';
      slide.insertBefore(img, slide.firstChild);
    });
    return;
  }
  var photo = document.querySelector('.decay img');
  var current = 0;
  var lock = 0;

  // preload so the cross-fade never lands on a blank frame
  slides.forEach(function (s) {
    if (s.dataset.img) new Image().src = s.dataset.img;
  });

  function setPhoto(slide) {
    if (!photo || !slide.dataset.img || photo.getAttribute('src') === slide.dataset.img) return;
    photo.classList.add('is-swapping');
    setTimeout(function () {
      photo.src = slide.dataset.img;
      photo.alt = slide.dataset.alt || '';
      photo.classList.remove('is-swapping');
    }, 260);
  }

  function goTo(i) {
    if (i < 0 || i >= slides.length || i === current) return;
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = i;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    setPhoto(slides[current]);
    stage.classList.toggle('is-form', slides[current].classList.contains('story-slide--form'));
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

// --- word-by-word reveal: every word rests at 30% white and snaps to full
// white on its own beat, in reading order (right to left). The sweep is gated
// on .is-ready so it starts only after the iris has finished. ---
(function () {
  var STEP = 0.07; // s between words

  document.querySelectorAll('.story-text').forEach(function (text) {
    var walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    var i = 0;
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
          return;
        }
        var span = document.createElement('span');
        span.className = 'sword';
        span.textContent = part;
        span.style.setProperty('--d', (i * STEP).toFixed(2) + 's');
        i++;
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    });
  });

  // let the first paint settle, then fade the composition in
  requestAnimationFrame(function () {
    setTimeout(function () {
      document.body.classList.add('is-ready');
    }, 60);
  });
})();
