/* Laptop carousel driver — shared across project case-study pages.
   Initializes every [data-slider] on the page: builds dots, wires prev/next,
   scroll-snap dot sync, arrow keys when in view, and resize recalibration. */
(function () {
  function initSlider(slider) {
    const track = slider.querySelector('[data-slider-track]');
    if (!track) return;
    const slides = Array.from(track.querySelectorAll('.slide'));
    const dotsHost = slider.querySelector('[data-slider-dots]');
    if (!slides.length) return;

    // Build dots
    const dots = slides.map((s, i) => {
      const b = document.createElement('button');
      b.className = 'slider__dot' + (i === 0 ? ' is-active' : '');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', s.dataset.slideLabel || `Slide ${i + 1}`);
      b.addEventListener('click', () => goTo(i));
      dotsHost?.appendChild(b);
      return b;
    });

    function goTo(i, behavior = 'smooth') {
      const idx = Math.max(0, Math.min(slides.length - 1, i));
      const slide = slides[idx];
      const targetX = slide.offsetLeft - (track.clientWidth / 2) + (slide.clientWidth / 2);
      track.scrollTo({ left: targetX, behavior });
      setActive(idx);
    }
    function setActive(idx) {
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    }
    function currentIndex() {
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bestDist = Infinity;
      slides.forEach((s, i) => {
        const sc = s.offsetLeft + s.clientWidth / 2;
        const d = Math.abs(sc - center);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    }
    function move(dir) {
      goTo(currentIndex() + dir);
    }

    // Sync dots on scroll (debounced via rAF)
    let scrollRaf = 0;
    track.addEventListener('scroll', () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        setActive(currentIndex());
      });
    }, { passive: true });

    slider.querySelector('[data-slider-prev]')?.addEventListener('click', () => move(-1));
    slider.querySelector('[data-slider-next]')?.addEventListener('click', () => move(1));

    // Arrow keys when slider is in view
    let inView = false;
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        inView = entries[0].isIntersecting;
      }, { threshold: 0.25 });
      obs.observe(slider);
    } else {
      inView = true;
    }
    document.addEventListener('keydown', (e) => {
      if (!inView) return;
      if (e.target.matches('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); move(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    });

    // Recalibrate on resize so scroll position stays aligned
    let resizeRaf = 0;
    window.addEventListener('resize', () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        goTo(currentIndex(), 'auto');
      });
    });
  }

  document.querySelectorAll('[data-slider]').forEach(initSlider);
})();

/* Tall web slides (.slide--scroll): 3s hold on the hero, slow scroll top→bottom,
   fade to black, restart. Plays only while centered in the device and in view. */
(function () {
  const slides = Array.from(document.querySelectorAll('.slide--scroll'));
  if (!slides.length) return;
  const anims = new Map();
  const inView = new Set();
  const shells = [...new Set(slides.map((s) => s.closest('[data-slider]')).filter(Boolean))];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { e.isIntersecting ? inView.add(e.target) : inView.delete(e.target); });
      update();
    }, { threshold: 0.4 });
    shells.forEach((sh) => io.observe(sh));
  } else { shells.forEach((sh) => inView.add(sh)); }

  function build(slide) {
    const img = slide.querySelector('.slide__scroll');
    if (!img) return null;
    const dist = Math.round(img.getBoundingClientRect().height - slide.clientHeight);
    if (dist <= 8) return null;
    const HOLD = 3000, SCROLL = dist * 16, FADE = 800, BLACK = 600, FADEIN = 500;
    const total = HOLD + SCROLL + FADE + BLACK + FADEIN;
    const o = (t) => t / total;
    const a = img.animate([
      { transform: 'translateY(0)',          opacity: 1, offset: 0 },
      { transform: 'translateY(0)',          opacity: 1, offset: o(HOLD) },
      { transform: `translateY(${-dist}px)`, opacity: 1, offset: o(HOLD + SCROLL) },
      { transform: `translateY(${-dist}px)`, opacity: 0, offset: o(HOLD + SCROLL + FADE) },
      { transform: 'translateY(0)',          opacity: 0, offset: o(HOLD + SCROLL + FADE + BLACK) },
      { transform: 'translateY(0)',          opacity: 1, offset: 1 },
    ], { duration: total, iterations: Infinity, easing: 'linear' });
    a.pause();
    return a;
  }
  function update() {
    const vw = window.innerWidth;
    slides.forEach((slide) => {
      let a = anims.get(slide);
      if (!a) { a = build(slide); if (a) anims.set(slide, a); else return; }
      const sh = slide.closest('[data-slider]');
      const r = slide.getBoundingClientRect();
      const centered = Math.abs((r.left + r.width / 2) - vw / 2) < r.width / 2;
      if (inView.has(sh) && centered) { a.play(); } else { a.pause(); a.currentTime = 0; }
    });
  }
  [...new Set(slides.map((s) => s.closest('[data-slider-track]')).filter(Boolean))].forEach((tr) => {
    let raf = 0;
    tr.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; update(); });
    }, { passive: true });
  });
  let rRaf = 0;
  window.addEventListener('resize', () => {
    if (rRaf) return;
    rRaf = requestAnimationFrame(() => {
      rRaf = 0;
      slides.forEach((s) => { const i = s.querySelector('.slide__scroll'); if (i) i.getAnimations().forEach((x) => x.cancel()); });
      anims.clear(); update();
    });
  });
  slides.forEach((s) => { const img = s.querySelector('.slide__scroll'); if (img && !img.complete) img.addEventListener('load', update, { once: true }); });
  update();
})();
