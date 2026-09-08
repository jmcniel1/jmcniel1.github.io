// Overlay menu. Shared by the home page and every project page: the bar's two
// rules cross, the sheet of links covers the page, Escape or a link closes it.
(function () {
  const btn = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');
  if (!btn || !menu) return;
  menu.hidden = false;
  const set = function (open) {
    menu.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.style.overflow = open ? 'hidden' : '';
  };
  btn.addEventListener('click', function () { set(!menu.classList.contains('is-open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
})();
