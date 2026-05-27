/**
 * Loader inicial — preenchimento da logo + voo até posição fixa.
 */
(function () {
  const loader = document.getElementById('ft-loader');
  const logoFill = document.getElementById('ft-loader-logo-fill');
  const loaderLogo = document.querySelector('.ft-loader__logo');
  const progressBar = document.getElementById('ft-loader-progress-bar');
  const percentEl = document.getElementById('ft-loader-percent');
  const fixedLogo = document.querySelector('.site-brand-fixed .hero-logo-mark');
  const fixedBrand = document.querySelector('.site-brand-fixed .hero-brand');

  if (!loader || !logoFill || !loaderLogo) return;

  const MIN_MS = 1600;
  const MAX_WAIT_MS = 12000;
  const FLY_DURATION = 1.05;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let target = 0;
  let display = 0;
  let finished = false;
  let rafId = null;
  const startTime = performance.now();

  const weights = { fonts: 12, dom: 8, images: 65, window: 15 };
  const state = { fonts: 0, dom: 0, images: 0, window: 0 };

  function setTarget() {
    target = Math.min(
      100,
      state.fonts * weights.fonts +
        state.dom * weights.dom +
        state.images * weights.images +
        state.window * weights.window
    );
  }

  function paint(value) {
    const p = value / 100;
    logoFill.style.setProperty('--loader-fill', String(p));
    if (progressBar) progressBar.style.width = `${value}%`;
    if (percentEl) percentEl.textContent = `${Math.round(value)}%`;
  }

  function revealSiteChrome() {
    document.documentElement.classList.remove('ft-is-loading');
    document.body.classList.add('ft-is-loaded');

    if (fixedBrand) fixedBrand.style.opacity = '';
    if (fixedLogo) fixedLogo.style.opacity = '';

    const siteBrand = document.getElementById('site-brand-fixed');
    if (siteBrand) siteBrand.style.pointerEvents = '';
  }

  function simpleExit() {
    loader.classList.add('ft-loader--exit');
    revealSiteChrome();
    window.dispatchEvent(new CustomEvent('ft:loader-complete'));
    window.setTimeout(() => loader.remove(), reducedMotion ? 0 : 650);
  }

  function flyLogoToFixed() {
    if (!fixedLogo || typeof gsap === 'undefined') {
      simpleExit();
      return;
    }

    const fromRect = loaderLogo.getBoundingClientRect();
    const toRect = fixedLogo.getBoundingClientRect();

    if (!fromRect.width || !toRect.width) {
      simpleExit();
      return;
    }

    const flyer = loaderLogo.cloneNode(true);
    flyer.classList.add('ft-loader-fly');
    flyer.removeAttribute('id');
    document.body.appendChild(flyer);

    loader.classList.add('ft-loader--flight');

    gsap.set(flyer, {
      position: 'fixed',
      left: fromRect.left,
      top: fromRect.top,
      width: fromRect.width,
      height: fromRect.height,
      zIndex: 13001,
      margin: 0,
      overflow: 'visible',
    });

    gsap.to(loader, {
      opacity: 0,
      duration: 0.55,
      ease: 'power2.inOut',
      delay: 0.08,
    });

    if (fixedBrand) {
      gsap.to(fixedBrand, {
        opacity: 1,
        duration: 0.45,
        delay: 0.35,
        ease: 'power2.out',
      });
    }

    gsap.to(flyer, {
      left: toRect.left,
      top: toRect.top,
      width: toRect.width,
      height: toRect.height,
      duration: FLY_DURATION,
      ease: 'power3.inOut',
      onComplete: () => {
        gsap.set(fixedLogo, { opacity: 1 });
        flyer.remove();
        loader.remove();
        revealSiteChrome();
        window.dispatchEvent(new CustomEvent('ft:loader-complete'));
      },
    });
  }

  function finish() {
    if (finished) return;
    finished = true;
    if (rafId) cancelAnimationFrame(rafId);

    paint(100);

    if (reducedMotion) {
      simpleExit();
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(flyLogoToFixed);
    });
  }

  function tick() {
    const elapsed = performance.now() - startTime;
    const ready = target >= 100 && elapsed >= MIN_MS;

    if (ready) {
      display += (100 - display) * 0.14;
      paint(display);
      if (display >= 99.6) {
        paint(100);
        finish();
        return;
      }
    } else {
      const cap = target >= 100 ? 94 : target;
      display += (cap - display) * 0.11;
      paint(display);
    }

    rafId = requestAnimationFrame(tick);
  }

  function trackImages() {
    const images = Array.from(document.querySelectorAll('img[src]')).filter((img) => {
      const src = img.getAttribute('src') || '';
      return !src.startsWith('data:') && !img.closest('.ft-loader');
    });

    if (!images.length) {
      state.images = 1;
      setTarget();
      return;
    }

    let done = 0;

    const check = () => {
      done += 1;
      state.images = done / images.length;
      setTarget();
      if (done >= images.length) state.images = 1;
    };

    images.forEach((img) => {
      if (img.complete && img.naturalWidth > 0) {
        check();
        return;
      }
      img.addEventListener('load', check, { once: true });
      img.addEventListener('error', check, { once: true });
    });
  }

  state.dom = document.readyState === 'complete' ? 1 : 0;
  setTarget();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      state.dom = 1;
      setTarget();
      trackImages();
    });
  } else {
    state.dom = 1;
    trackImages();
  }

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      state.fonts = 1;
      setTarget();
    });
  } else {
    state.fonts = 1;
  }

  window.addEventListener('load', () => {
    state.window = 1;
    state.images = 1;
    setTarget();
    target = 100;
  });

  window.setTimeout(() => {
    if (!finished) {
      target = 100;
      state.window = 1;
      state.images = 1;
      state.fonts = 1;
      setTarget();
    }
  }, MAX_WAIT_MS);

  if (reducedMotion) {
    window.setTimeout(() => {
      target = 100;
      display = 100;
      finish();
    }, 400);
    return;
  }

  paint(0);
  rafId = requestAnimationFrame(tick);
})();
