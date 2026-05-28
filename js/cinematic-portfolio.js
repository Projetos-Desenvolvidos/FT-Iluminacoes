/**
 * Portfólio — slideshow fullscreen com pin exclusivo (ftPortfolio*)
 */
(function () {
  const NS = window.FT_SCROLL?.portfolio;
  const section =
    document.querySelector('[data-ft-scroll="portfolio"]') || document.querySelector('.cinematic-portfolio');

  if (!section || typeof gsap === 'undefined') return;

  const PIN_ID = NS?.pinId || 'ftPortfolioCinematicPin';
  const TIMELINE_ID = NS?.timelineId || 'ftPortfolioCinematicTimeline';
  const ACTIVE_CLASS = NS?.activeClass || 'ft-portfolio-cinematic-scroll--active';
  const STATIC_CLASS = NS?.staticClass || 'ft-portfolio-cinematic-scroll--static';
  const READY_EVENT = NS?.readyEvent || 'ft:portfolio-cinematic-ready';
  const EXPERIENCES_READY = window.FT_SCROLL?.experiences?.readyFlag || '__ftExperiencesScrollReady';
  const EXPERIENCES_READY_EVENT = window.FT_SCROLL?.experiences?.readyEvent || 'ft:experiences-scroll-ready';

  const pin = section.querySelector('.cinematic-portfolio__pin');
  const slides = gsap.utils.toArray('.cinematic-slide', section);
  const progressFill = section.querySelector('.cinematic-portfolio__progress-fill');
  const counterCurrent = section.querySelector('.cinematic-portfolio__counter-current');
  const counterTotal = section.querySelector('.cinematic-portfolio__counter-total');
  const hint = section.querySelector('.cinematic-portfolio__hint');

  if (!slides.length || !pin) return;

  let portfolioTimeline = null;
  let hasAnnouncedReady = false;
  let lastViewportWidth = window.innerWidth;
  let lastViewportHeight = window.innerHeight;

  function isMobileRuntime() {
    return (
      window.matchMedia('(max-width: 900px)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    );
  }

  function getScrub() {
    return isMobileRuntime() ? 0.95 : 1.35;
  }

  function getSlideScrollVh() {
    return isMobileRuntime() ? 0.55 : 1;
  }

  function isLowPerf() {
    return Boolean(window.__ftLowPerfMode) || isMobileRuntime();
  }

  function frameLabel(index) {
    return `ftPortfolioFrame${String(index).padStart(2, '0')}`;
  }

  function setAccent(color) {
    if (!color) return;
    section.style.setProperty('--portfolio-accent', color);
  }

  function getSlideParts(slide) {
    return {
      slide,
      media: slide.querySelector('.cinematic-slide__media img'),
      content: gsap.utils.toArray('.cinematic-slide__content > *', slide),
    };
  }

  function setSlideInitialState() {
    slides.forEach((slide, index) => {
      const { media, content } = getSlideParts(slide);
      slide.classList.toggle('is-active', index === 0);

      if (index === 0) {
        gsap.set(slide, { autoAlpha: 1, visibility: 'visible', zIndex: 2 });
        if (media) {
          gsap.set(media, { opacity: 1, scale: 1, y: 0, filter: 'none', force3D: true });
        }
        gsap.set(content, { autoAlpha: 1, y: 0 });
        setAccent(slide.dataset.accent);
      } else {
        gsap.set(slide, { autoAlpha: 0, visibility: 'hidden', zIndex: 1 });
        if (media) {
          gsap.set(media, { opacity: 1, scale: 1.04, y: 24, filter: 'none', force3D: true });
        }
        gsap.set(content, { autoAlpha: 0, y: 32 });
      }
    });

    if (counterTotal) {
      counterTotal.textContent = String(slides.length).padStart(2, '0');
    }
    if (counterCurrent) {
      counterCurrent.textContent = '01';
    }
    if (progressFill) {
      gsap.set(progressFill, { scaleX: 0 });
    }
  }

  function updateUi(progress) {
    const maxIndex = slides.length - 1;
    const index = maxIndex === 0 ? 0 : Math.round(progress * maxIndex);

    if (progressFill) {
      gsap.set(progressFill, { scaleX: progress });
    }
    if (counterCurrent) {
      counterCurrent.textContent = String(index + 1).padStart(2, '0');
    }

    const active = slides[index];
    if (active) {
      setAccent(active.dataset.accent);
      slides.forEach((s) => s.classList.toggle('is-active', s === active));
    }

    if (hint && progress > 0.04) {
      gsap.to(hint, { autoAlpha: 0, duration: 0.6, ease: 'power2.out', overwrite: true });
    }
  }

  function destroyPortfolioScroll() {
    window.ftScrollPins?.kill(PIN_ID);
    portfolioTimeline?.scrollTrigger?.kill();
    portfolioTimeline?.kill();
    portfolioTimeline = null;
  }

  function applyTimelineProgress(tl, st) {
    if (!st || !st.isActive) {
      tl.progress(0);
      setSlideInitialState();
      return;
    }
    tl.progress(st.progress);
    updateUi(st.progress);
  }

  function buildPortfolioScroll() {
    destroyPortfolioScroll();

    const tl = gsap.timeline({
      id: TIMELINE_ID,
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        id: PIN_ID,
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * (slides.length - 1) * getSlideScrollVh()}`,
        pin: section,
        pinSpacing: true,
        scrub: getScrub(),
        anticipatePin: 0,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
        refreshPriority: 5,
        onUpdate: (self) => updateUi(self.progress),
        onEnter: (self) => applyTimelineProgress(tl, self),
        onEnterBack: (self) => applyTimelineProgress(tl, self),
        onLeaveBack: () => setSlideInitialState(),
      },
    });

    portfolioTimeline = tl;

    slides.forEach((slide, index) => {
      if (index === 0) return;

      const prev = getSlideParts(slides[index - 1]);
      const curr = getSlideParts(slide);
      const label = frameLabel(index);

      tl.addLabel(label);

      tl.set(curr.slide, { zIndex: 3 }, label);
      tl.set(prev.slide, { zIndex: 1 }, label);

      tl.to(
        prev.content,
        {
          autoAlpha: 0,
          y: -28,
          stagger: 0.05,
          duration: 0.55,
          ease: 'power2.in',
        },
        label
      );

      tl.to(
        prev.media,
        {
          scale: 1.02,
          y: -14,
          filter: 'none',
          duration: 0.9,
          ease: 'power2.inOut',
          force3D: true,
        },
        label
      );

      tl.to(
        prev.slide,
        {
          autoAlpha: 0,
          duration: 0.75,
          ease: 'power2.inOut',
        },
        `${label}+=0.15`
      );

      tl.fromTo(
        curr.slide,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.85, ease: 'power2.inOut' },
        `${label}+=0.2`
      );

      tl.fromTo(
        curr.media,
        {
          scale: 1.04,
          y: 28,
          filter: 'none',
        },
        {
          scale: 1,
          y: 0,
          filter: 'none',
          duration: 1.15,
          ease: 'power3.out',
          force3D: true,
        },
        `${label}+=0.22`
      );

      tl.fromTo(
        curr.content,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.85,
          ease: 'power3.out',
        },
        `${label}+=0.35`
      );
    });

    applyTimelineProgress(tl, tl.scrollTrigger);
    return tl;
  }

  function announceReady() {
    if (!hasAnnouncedReady) {
      hasAnnouncedReady = true;
      window.dispatchEvent(new CustomEvent(READY_EVENT));
      window.ftScrollPins?.markPortfolioReady();
    } else {
      window.ftScrollPins?.refresh();
    }
  }

  function initStatic() {
    section.classList.add(STATIC_CLASS, 'cinematic-portfolio--static');
    setSlideInitialState();
    slides.forEach((slide, i) => {
      if (i > 0) gsap.set(slide, { display: 'none' });
    });
    if (progressFill) gsap.set(progressFill, { scaleX: 1 });
    announceReady();
  }

  function startPortfolioScroll() {
    gsap.registerPlugin(ScrollTrigger);
    section.classList.add(ACTIVE_CLASS, 'cinematic-portfolio--active');
    setSlideInitialState();
    buildPortfolioScroll();
    announceReady();
  }

  function scheduleStart() {
    const run = () => requestAnimationFrame(startPortfolioScroll);

    if (window[EXPERIENCES_READY]) {
      setTimeout(run, 80);
      return;
    }

    const fallback = setTimeout(run, 600);
    window.addEventListener(
      EXPERIENCES_READY_EVENT,
      () => {
        clearTimeout(fallback);
        setTimeout(run, 80);
      },
      { once: true }
    );
  }

  function init() {
    if (typeof ScrollTrigger === 'undefined') {
      initStatic();
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      initStatic();
      return;
    }

    const boot = () => scheduleStart();

    if (document.readyState === 'complete') {
      setTimeout(boot, 100);
    } else {
      window.addEventListener('load', () => setTimeout(boot, 100), { once: true });
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
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
      resizeTimer = setTimeout(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          initStatic();
          return;
        }
        setSlideInitialState();
        buildPortfolioScroll();
      }, 200);
    });

    window.addEventListener('ft:scroll-mode-changed', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (section.classList.contains(STATIC_CLASS)) return;
        setSlideInitialState();
        buildPortfolioScroll();
      }, 80);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
