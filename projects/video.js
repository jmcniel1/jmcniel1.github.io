/* Shared video behavior for project pages.
   1. Autoplay muted while in view, pause when scrolled away.
   2. Where a video carries sound ( data-sound ), a tap toggles it: first tap
      unmutes and restarts from the top so the voice is heard from the start,
      the next tap mutes again. The label says which state you are in. */
(function () {
  const vids = document.querySelectorAll('video[data-autoplay-inview]');
  if (!vids.length) return;

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) { v.play().catch(() => {}); }
        else { v.pause(); if (!v.muted) { v.muted = true; sync(v); } }
      });
    }, { threshold: 0.35 });
    vids.forEach((v) => io.observe(v));
  } else {
    vids.forEach((v) => { v.play && v.play().catch(() => {}); });
  }

  function label(v) { return v.parentElement.querySelector('.video-figure__sound'); }
  function sync(v) {
    const b = label(v); if (!b) return;
    b.textContent = v.muted ? 'Tap for sound' : 'Sound on';
    b.setAttribute('aria-pressed', v.muted ? 'false' : 'true');
  }
  function toggle(v) {
    if (v.muted) { v.muted = false; v.currentTime = 0; v.play().catch(() => {}); }
    else { v.muted = true; }
    sync(v);
  }

  vids.forEach((v) => {
    if (!v.hasAttribute('data-sound')) return;
    const b = label(v); if (!b) return;
    sync(v);
    b.addEventListener('click', (e) => { e.preventDefault(); toggle(v); });
    v.addEventListener('click', () => toggle(v));
    v.addEventListener('ended', () => { v.muted = true; sync(v); v.play().catch(() => {}); });
  });
})();
