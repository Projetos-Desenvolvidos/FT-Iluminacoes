/**
 * Experiências — galeria horizontal com pin exclusivo (ftExperiences*)
 */
(function () {
  const NS = window.FT_SCROLL?.experiences;
  const showcase = document.querySelector('[data-ft-scroll="experiences"]') || document.querySelector('.about-section__showcase');
  const viewport = document.querySelector('.about-section__gallery-viewport');
  const gallery = document.querySelector('.about-section__gallery');

  if (!showcase || !viewport || !gallery || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  const PIN_ID = NS?.pinId || 'ftExperiencesHorizontalPin';
  const TRACK_ID = NS?.trackId || 'ftExperiencesGalleryTrack';
  const ACTIVE_CLASS = NS?.activeClass || 'ft-experiences-scroll--active';
  const STATIC_CLASS = NS?.staticClass || 'ft-experiences-scroll--static';
  const READY_EVENT = NS?.readyEvent || 'ft:experiences-scroll-ready';

  let trackTween = null;
  let resizeTimer = null;
  let hasAnnouncedReady = false;
  let lastViewportWidth = window.innerWidth;
  let lastViewportHeight = window.innerHeight;
  const IS_MOBILE = window.matchMedia('(max-width: 900px)').matches || window.matchMedia('(pointer: coarse)').matches;
  const SCRUB_SMOOTH = IS_MOBILE ? 0.8 : 1.35;
  const SCROLL_DISTANCE_MULTIPLIER = IS_MOBILE ? 1.05 : 1.2;
  const cards = gsap.utils.toArray('.about-section__card', gallery);
  const images = cards.map((card) => card.querySelector('img')).filter(Boolean);

  function getScrollAmount() {
    const maxScroll = Math.max(0, gallery.scrollWidth - viewport.clientWidth);

    if (cards.length <= 2) {
      return 0;
    }

    const secondLast = cards[cards.length - 2];
    const stopAt = secondLast.offsetLeft;

    return Math.min(maxScroll, Math.max(0, stopAt));
  }

  function resetCardEffects() {
    return;
  }

  function getScrollProgress() {
    const amount = getScrollAmount();
    if (amount <= 0) return 0;
    return gsap.utils.clamp(0, 1, Math.abs(Number(gsap.getProperty(gallery, 'x')) || 0) / amount);
  }

  function applyCardVisuals(card, img, focus, reveal, direction) {
    const easeOut = gsap.parseEase('power3.out');
    const easeReveal = gsap.parseEase('expo.out');
    const f = easeOut(focus);
    const r = easeReveal(reveal);

    const clipY = (1 - r) * 24;
    const clipX = (1 - f) * 12;
    const lift = (1 - f) * 32;
    const rotateY = direction * (1 - f) * 14;
    const imageScale = 1.22 - f * 0.22;
    const cardScale = 0.86 + f * 0.14;
    const brightness = 0.58 + f * 0.42;
    const saturate = 0.72 + f * 0.28;

    gsap.set(card, {
      scale: cardScale,
      opacity: 0.22 + f * 0.78,
      zIndex: Math.round(f * 100),
    });

    gsap.set(img, {
      scale: imageScale,
      y: lift,
      rotateY,
      opacity: 0.5 + f * 0.5,
      clipPath: `inset(${clipY}% ${clipX}% round 1px)`,
      filter: `brightness(${brightness}) saturate(${saturate}) contrast(${0.92 + f * 0.08})`,
    });
  }

  function updateCardEffects() {
    return;
  }

  function destroyTrack() {
    window.ftScrollPins?.kill(PIN_ID);
    trackTween?.kill();
    trackTween = null;
    gsap.set(gallery, { x: 0 });
    resetCardEffects();
  }

  function announceReady() {
    if (!hasAnnouncedReady) {
      hasAnnouncedReady = true;
      window.dispatchEvent(new CustomEvent(READY_EVENT));
      window.ftScrollPins?.markExperiencesReady();
    } else {
      window.ftScrollPins?.refresh();
    }
  }

  function buildExperiencesScroll() {
    destroyTrack();

    const amount = getScrollAmount();
    if (amount <= 0) {
      announceReady();
      return;
    }

    trackTween = gsap.to(gallery, {
      id: TRACK_ID,
      x: () => -getScrollAmount(),
      ease: 'none',
      scrollTrigger: {
        id: PIN_ID,
        trigger: showcase,
        start: 'top top',
        end: () => `+=${getScrollAmount() * SCROLL_DISTANCE_MULTIPLIER}`,
        pin: showcase,
        pinSpacing: true,
        scrub: SCRUB_SMOOTH,
        invalidateOnRefresh: true,
        anticipatePin: 0,
        fastScrollEnd: true,
        refreshPriority: 10,
        onUpdate: undefined,
        onLeave: undefined,
      },
    });

    announceReady();
  }

  function refreshGallery() {
    buildExperiencesScroll();
  }

  function init() {
    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showcase.classList.add(STATIC_CLASS, 'about-section__showcase--static');
      announceReady();
      return;
    }

    showcase.classList.add(ACTIVE_CLASS, 'about-section__showcase--scroll-driven');
    buildExperiencesScroll();

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
        resizeTimer = setTimeout(refreshGallery, 150);
      },
      { passive: true }
    );

    gallery.querySelectorAll('img').forEach((img) => {
      if (img.complete) return;
      img.addEventListener('load', refreshGallery, { once: true });
    });

    if (document.fonts?.ready) {
      document.fonts.ready.then(refreshGallery);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
