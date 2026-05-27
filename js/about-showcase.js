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
  const SCRUB_SMOOTH = 1.35;
  const SCROLL_DISTANCE_MULTIPLIER = 1.2;
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
    gsap.set(cards, { clearProps: 'transform,opacity,zIndex' });
    gsap.set(images, { clearProps: 'transform,opacity,clipPath,filter' });
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
    const viewportRect = viewport.getBoundingClientRect();
    const focusX = viewportRect.left + viewportRect.width * 0.34;
    const influence = viewportRect.width * 0.52;
    const scrollProgress = getScrollProgress();
    const introFocus = gsap.utils.clamp(0, 1, (0.48 - scrollProgress) / 0.48);
    const introReveal = gsap.utils.clamp(0, 1, (0.55 - scrollProgress) / 0.55);
    const finaleFocus = gsap.utils.clamp(0, 1, (scrollProgress - 0.52) / 0.48);
    const finaleReveal = gsap.utils.clamp(0, 1, (scrollProgress - 0.45) / 0.55);

    let introGroupFocus = 0;
    if (cards.length >= 1) {
      const first = cards[0];
      const firstRect = first.getBoundingClientRect();
      const firstCenter = firstRect.left + firstRect.width * 0.5;
      const firstDistance = Math.abs(firstCenter - focusX);
      const firstProgress = gsap.utils.clamp(0, 1, 1 - firstDistance / (influence * 1.15));
      introGroupFocus = Math.max(introFocus, firstProgress);
    }

    let finaleGroupFocus = 0;
    if (cards.length >= 2) {
      const secondLast = cards[cards.length - 2];
      const last = cards[cards.length - 1];
      const groupRect = {
        left: secondLast.getBoundingClientRect().left,
        right: last.getBoundingClientRect().right,
      };
      const groupCenter = (groupRect.left + groupRect.right) * 0.5;
      const groupDelta = groupCenter - focusX;
      const groupDistance = Math.abs(groupDelta);
      const groupInfluence = influence * 1.15;
      const groupProgress = gsap.utils.clamp(0, 1, 1 - groupDistance / groupInfluence);
      finaleGroupFocus = Math.max(finaleFocus, groupProgress);
    }

    cards.forEach((card, index) => {
      const img = card.querySelector('img');
      if (!img) return;

      const isFirst = index === 0;
      const isLastTwo = index >= cards.length - 2;
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width * 0.5;
      const delta = cardCenter - focusX;
      const distance = Math.abs(delta);
      const progress = gsap.utils.clamp(0, 1, 1 - distance / influence);
      const direction = distance === 0 ? 0 : delta / distance;

      let focus = progress;
      let reveal = progress;

      if (isFirst) {
        focus = Math.max(focus, introGroupFocus, introFocus);
        reveal = Math.max(reveal, introGroupFocus, introReveal);

        if (scrollProgress <= 0.08) {
          focus = 1;
          reveal = 1;
        }
      }

      if (isLastTwo) {
        focus = Math.max(focus, finaleGroupFocus, finaleFocus);
        reveal = Math.max(reveal, finaleGroupFocus, finaleReveal);

        if (scrollProgress >= 0.92) {
          focus = 1;
          reveal = 1;
        }
      }

      applyCardVisuals(card, img, focus, reveal, direction);
    });
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
        onUpdate: updateCardEffects,
        onLeave: () => resetCardEffects(),
      },
    });

    updateCardEffects();
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
