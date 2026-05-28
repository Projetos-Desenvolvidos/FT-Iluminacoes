/**
 * Finale — clímax cinematográfico (pin + scrub + reveal)
 */
(function () {
  const section = document.querySelector('.finale');
  if (!section || typeof gsap === 'undefined') return;

  const manifest = section.querySelector('[data-finale-manifest]');
  const cta = section.querySelector('[data-finale-cta]');
  const lights = section.querySelector('[data-finale-lights]');
  const fog = section.querySelector('.finale__fog');
  const floorGlow = section.querySelector('.finale__floor-glow');
  const lineGhost = section.querySelector('.finale__line--ghost');
  const lineHero = section.querySelector('.finale__line--hero');
  const ctaGlow = section.querySelector('.finale__cta-glow');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPerfMode =
    Boolean(window.__ftLowPerfMode) ||
    window.matchMedia('(max-width: 900px)').matches ||
    window.matchMedia('(pointer: coarse)').matches;
  let lastViewportWidth = window.innerWidth;
  let lastViewportHeight = window.innerHeight;

  function revealStatic() {
    gsap.set([manifest, cta], { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' });
    section.classList.add('finale--revealed', 'finale--ready');
  }

  function initMotion() {
    if (typeof ScrollTrigger === 'undefined') {
      revealStatic();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ghostBlur = lowPerfMode ? 0 : 18;
    const heroBlur = lowPerfMode ? 0 : 22;
    const ctaBlur = lowPerfMode ? 0 : 14;

    gsap.set(manifest, { opacity: 0, y: 0 });
    gsap.set(lineGhost, { opacity: 0, y: 72, filter: ghostBlur ? `blur(${ghostBlur}px)` : 'none' });
    gsap.set(lineHero, { opacity: 0, y: 96, filter: heroBlur ? `blur(${heroBlur}px)` : 'none' });
    gsap.set(cta, { opacity: 0, y: 56, scale: 0.94, filter: ctaBlur ? `blur(${ctaBlur}px)` : 'none' });
    if (ctaGlow) gsap.set(ctaGlow, { opacity: 0, scale: 0.85 });
    if (lights) gsap.set(lights, { y: 40, scale: 1.05 });
    if (fog) gsap.set(fog, { opacity: 0.35 });
    if (floorGlow) gsap.set(floorGlow, { opacity: 0.25, scale: 0.9 });

    const tl = gsap.timeline({
      scrollTrigger: {
        id: 'ftFinaleClimax',
        trigger: section,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * (lowPerfMode ? 1.05 : 1.35))}`,
        pin: true,
        pinSpacing: true,
        scrub: lowPerfMode ? 0.85 : 1.35,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onEnter: () => section.classList.add('finale--revealed'),
      },
    });

    tl.to(manifest, { opacity: 1, duration: 0.15, ease: 'none' }, 0)
      .to(
        lineGhost,
        {
          opacity: 0.38,
          y: 0,
          filter: 'none',
          duration: 0.28,
          ease: 'power3.out',
        },
        0.02
      )
      .to(
        lineHero,
        {
          opacity: 1,
          y: 0,
          filter: 'none',
          duration: 0.38,
          ease: 'power3.out',
        },
        0.1
      )
      .to(
        lineGhost,
        {
          opacity: 0.22,
          y: -48,
          duration: 0.35,
          ease: 'power2.inOut',
        },
        0.38
      )
      .to(
        lineHero,
        {
          y: -72,
          scale: 0.94,
          duration: 0.35,
          ease: 'power2.inOut',
        },
        0.38
      )
      .to(
        manifest,
        {
          opacity: 0.55,
          duration: 0.25,
          ease: 'power2.in',
        },
        0.52
      );

    if (lights) {
      tl.to(lights, { y: -30, scale: 1, duration: 1, ease: 'none' }, 0).to(
        lights,
        { x: 24, duration: 1, ease: 'none' },
        0
      );
    }

    if (fog) {
      tl.to(fog, { opacity: 0.62, duration: 0.5, ease: 'none' }, 0.2);
    }

    if (floorGlow) {
      tl.to(floorGlow, { opacity: 0.65, scale: 1.08, duration: 0.55, ease: 'none' }, 0.45);
    }

    tl.to(
      cta,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'none',
        duration: 0.42,
        ease: 'power3.out',
      },
      0.5
    );

    if (ctaGlow) {
      tl.to(
        ctaGlow,
        {
          opacity: 0.5,
          scale: 1,
          duration: 0.45,
          ease: 'power2.out',
        },
        0.52
      );
    }

    tl.eventCallback('onStart', () => section.classList.add('finale--ready'));

    const refresh = () => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    };

    window.dispatchEvent(new CustomEvent('ft:finale-ready'));
    window.addEventListener('ft:loader-complete', refresh, { once: true });
    window.addEventListener('ft:final-cta-ready', refresh, { once: true });
    window.addEventListener('ft:cinematic-portfolio-ready', refresh, { once: true });
    let resizeTimer;
    window.addEventListener(
      'resize',
      () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const widthStable = Math.abs(w - lastViewportWidth) < 2;
        const heightDelta = Math.abs(h - lastViewportHeight);
        const isIosToolbarResize =
          (window.matchMedia('(pointer: coarse)').matches || /iPhone|iPad|iPod/i.test(navigator.userAgent)) &&
          widthStable &&
          heightDelta > 0 &&
          heightDelta < 140;

        lastViewportWidth = w;
        lastViewportHeight = h;
        if (isIosToolbarResize) return;

        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(refresh, 180);
      },
      { passive: true }
    );
  }

  function init() {
    if (reducedMotion) {
      revealStatic();
      return;
    }
    initMotion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
