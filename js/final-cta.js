/**
 * CTA final — motion typography com GSAP + ScrollTrigger (pin + scrub)
 */
(function () {
  const section = document.querySelector('.final-cta');
  if (!section || typeof gsap === 'undefined') return;

  const track1 = section.querySelector('[data-final-cta-track="1"]');
  const track2 = section.querySelector('[data-final-cta-track="2"]');
  const track3 = section.querySelector('[data-final-cta-track="3"]');
  const rowsMuted = gsap.utils.toArray('.final-cta__row--muted', section);
  const rowAccent = section.querySelector('.final-cta__row--accent');
  const foreground = section.querySelector('[data-final-cta-foreground]');

  if (!track1 || !track2 || !track3) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPerfMode =
    Boolean(window.__ftLowPerfMode) ||
    window.matchMedia('(max-width: 900px)').matches ||
    window.matchMedia('(pointer: coarse)').matches;
  let lastViewportWidth = window.innerWidth;
  let lastViewportHeight = window.innerHeight;

  function moveAmount() {
    const vw = window.innerWidth;
    return Math.min(vw * 0.36, 500);
  }

  function setStatic() {
    const amount = moveAmount() * 0.12;
    gsap.set(track1, { x: -amount });
    gsap.set(track2, { x: amount });
    gsap.set(track3, { x: -amount });
    gsap.set(rowsMuted, { opacity: 0.36 });
    gsap.set(rowAccent, { opacity: 1 });
    if (foreground) gsap.set(foreground, { opacity: 1, y: 0 });
    section.classList.add('final-cta--ready');
  }

  function initMotion() {
    if (typeof ScrollTrigger === 'undefined') {
      setStatic();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (foreground) {
      gsap.set(foreground, { opacity: 0, y: 24 });
    }

    const amount = moveAmount() * (lowPerfMode ? 0.75 : 1);
    gsap.set(track1, { x: amount * 0.12 });
    gsap.set(track2, { x: -amount * 0.12 });
    gsap.set(track3, { x: amount * 0.1 });
    gsap.set(rowsMuted, { opacity: 0.4 });
    gsap.set(rowAccent, { opacity: 0.88 });

    const tl = gsap.timeline({
      scrollTrigger: {
        id: 'ftFinalCtaMotion',
        trigger: section,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * 1.2)}`,
        pin: true,
        pinSpacing: true,
        scrub: lowPerfMode ? 0.7 : 1.1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.to(track1, { x: -amount, ease: 'none', duration: 1 }, 0)
      .to(track2, { x: amount, ease: 'none', duration: 1 }, 0)
      .to(track3, { x: -amount * 0.92, ease: 'none', duration: 1 }, 0)
      .to(rowsMuted, { opacity: 0.32, ease: 'none', duration: 1 }, 0)
      .to(rowAccent, { opacity: 1, ease: 'none', duration: 1 }, 0)
      .to(rowAccent, { y: -amount * (lowPerfMode ? 0.02 : 0.05), ease: 'none', duration: 1 }, 0)
      .to(rowsMuted, { y: amount * (lowPerfMode ? 0.015 : 0.03), ease: 'none', duration: 1 }, 0);

    if (foreground) {
      tl.to(
        foreground,
        {
          opacity: 1,
          y: 0,
          duration: 0.32,
          ease: 'power3.out',
        },
        0.06
      );
    }

    tl.eventCallback('onStart', () => section.classList.add('final-cta--ready'));

    const refresh = () => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    };

    window.dispatchEvent(new CustomEvent('ft:final-cta-ready'));
    window.addEventListener('ft:loader-complete', refresh, { once: true });
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
      setStatic();
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
