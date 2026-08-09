// Mobile menu: the header links double as the fullscreen sheet, so there is
// only one set of links to keep in sync.
(function () {
  var burger = document.querySelector('.nav-burger');
  if (!burger) return;

  function set(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  burger.addEventListener('click', function () {
    set(!document.body.classList.contains('menu-open'));
  });
  var close = document.querySelector('.nav-sheet-close');
  if (close) close.addEventListener('click', function () { set(false); });

  document.querySelectorAll('.nav-links a, .nav-sheet-links a').forEach(function (a) {
    a.addEventListener('click', function () { set(false); });
  });
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape') set(false);
  });
})();
