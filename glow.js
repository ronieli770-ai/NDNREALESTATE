// The CTA halo follows the cursor: the pointer's offset from the button's
// centre becomes the shadow's offset, so the glow slides around the rim.
(function () {
  var SEL = '.hero-cta,.btn-ghost,.contact-form button,.nav-call';
  var REACH = 26; // px the halo travels from centre

  document.querySelectorAll(SEL).forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var r = btn.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      btn.classList.add('is-glowing');
      btn.style.setProperty('--gx', (x * 2 * REACH).toFixed(1) + 'px');
      btn.style.setProperty('--gy', (2 + y * 2 * REACH).toFixed(1) + 'px');
    });
    btn.addEventListener('mouseleave', function () {
      btn.classList.remove('is-glowing');
      btn.style.removeProperty('--gx');
      btn.style.removeProperty('--gy');
    });
  });
})();
