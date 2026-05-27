/**
 * Experiências — desktop: galeria horizontal com pin; mobile: carrossel com snap (modo leve).
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
  const cards = gsap.utils.toArray('.about-section__card', gallery);

  function isMobileRuntime() {
    return (
      window.matchMedia('(max-width: 900px)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    );
  }

  function prefersStaticGallery() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches || isMobileRuntime();
  }

  function getScrollAmount() {
    const viewportWidth = viewport.clientWidth;
    const maxScroll = Math.max(0, gallery.scrollWidth - viewportWidth);

    if (cards.length <= 1) {
      return 0;
    }

    if (cards.length <= 2) {
      return maxScroll;
    }

    const secondLast = cards[cards.length - 2];
    const stopAt = secondLast.offsetLeft;

    return Math.min(maxScroll, Math.max(0, stopAt));
  }

  function destroyTrack() {
    window.ftScrollPins?.kill(PIN_ID);
    trackTween?.kill();
    trackTween = null;
    gsap.set(gallery, { x: 0 });
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
        end: () => `+=${getScrollAmount() * 1.2}`,
        pin: showcase,
        pinSpacing: true,
        scrub: 1.35,
        invalidateOnRefresh: true,
        anticipatePin: 0,
        fastScrollEnd: true,
        refreshPriority: 10,
      },
    });

    announceReady();
  }

  function enableStaticGallery() {
    showcase.classList.remove(ACTIVE_CLASS, 'about-section__showcase--scroll-driven');
    showcase.classList.add(STATIC_CLASS, 'about-section__showcase--static');
    destroyTrack();
    announceReady();
  }

  function enableScrollGallery() {
    showcase.classList.remove(STATIC_CLASS, 'about-section__showcase--static');
    showcase.classList.add(ACTIVE_CLASS, 'about-section__showcase--scroll-driven');
    buildExperiencesScroll();
  }

  function applyGalleryMode() {
    if (prefersStaticGallery()) {
      enableStaticGallery();
    } else {
      enableScrollGallery();
    }
  }

  function onResize() {
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
    resizeTimer = setTimeout(applyGalleryMode, 150);
  }

  function init() {
    gsap.registerPlugin(ScrollTrigger);
    applyGalleryMode();

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('ft:scroll-mode-changed', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(applyGalleryMode, 80);
    });

    gallery.querySelectorAll('img').forEach((img) => {
      if (img.complete) return;
      img.addEventListener('load', applyGalleryMode, { once: true });
    });

    if (document.fonts?.ready) {
      document.fonts.ready.then(applyGalleryMode);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
