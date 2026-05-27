/**
 * Smooth navigation — Lenis no desktop; scroll nativo no mobile (modo leve).
 */
(function () {
  if (typeof window === 'undefined') return;
  if (window.__ftSmoothScrollInitialized) return;
  window.__ftSmoothScrollInitialized = true;

  let lenisInstance = null;
  let lenisTickerFn = null;
  let nativeScrollBound = false;

  const MOBILE_QUERY = '(max-width: 900px)';
  const COARSE_POINTER_QUERY = '(pointer: coarse)';

  function isMobileRuntime() {
    return (
      window.matchMedia(MOBILE_QUERY).matches ||
      window.matchMedia(COARSE_POINTER_QUERY).matches
    );
  }

  function setLiteModeFlag() {
    const lite = isMobileRuntime();
    window.__ftLowPerfMode = lite;
    document.documentElement.classList.toggle('ft-lite-mobile', lite);
  }

  function setupAnchorSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();
        if (lenisInstance) {
          lenisInstance.scrollTo(target, {
            duration: 1,
            easing: (t) => 1 - Math.pow(1 - t, 3),
          });
          return;
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function bindNativeScroll() {
    if (nativeScrollBound) return;
    nativeScrollBound = true;

    let scrollTicking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
          scrollTicking = false;
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.update();
          }
          window.dispatchEvent(new CustomEvent('ft:scroll'));
        });
      },
      { passive: true }
    );
  }

  function setupNativeScroll() {
    setLiteModeFlag();
    bindNativeScroll();

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.defaults({ scroller: window });
      ScrollTrigger.refresh();
    }
  }

  function destroyLenis() {
    if (!lenisInstance) return;

    if (lenisTickerFn && typeof gsap !== 'undefined') {
      gsap.ticker.remove(lenisTickerFn);
    }

    lenisInstance.destroy();
    lenisInstance = null;
    lenisTickerFn = null;
    window.__ftLenis = null;

    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.scrollerProxy(document.documentElement);
      ScrollTrigger.defaults({ scroller: window });
      ScrollTrigger.refresh(true);
    }
  }

  function setupLenis() {
    if (typeof Lenis === 'undefined') {
      setupNativeScroll();
      return;
    }

    if (isMobileRuntime()) {
      setupNativeScroll();
      return;
    }

    setLiteModeFlag();

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      smoothTouch: false,
      syncTouch: false,
      wheelMultiplier: 0.88,
      touchMultiplier: 0.9,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    lenisInstance = lenis;
    window.__ftLenis = lenis;

    if (typeof gsap !== 'undefined') {
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const scrollRoot = document.documentElement;

        ScrollTrigger.scrollerProxy(scrollRoot, {
          scrollTop(value) {
            if (arguments.length) {
              lenis.scrollTo(value, { immediate: true });
            }
            return lenis.scroll;
          },
          getBoundingClientRect() {
            return {
              top: 0,
              left: 0,
              width: window.innerWidth,
              height: window.innerHeight,
            };
          },
          pinType: 'fixed',
        });

        ScrollTrigger.defaults({ scroller: scrollRoot });
        let scrollTicking = false;
        lenis.on('scroll', () => {
          if (scrollTicking) return;
          scrollTicking = true;
          requestAnimationFrame(() => {
            scrollTicking = false;
            ScrollTrigger.update();
            window.dispatchEvent(new CustomEvent('ft:scroll'));
          });
        });

        ScrollTrigger.addEventListener('refresh', () => {
          lenis.resize();
        });
      }

      lenisTickerFn = (time) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(lenisTickerFn);
      gsap.ticker.lagSmoothing(500, 33);

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    if (typeof ScrollTrigger !== 'undefined' && typeof gsap === 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      ScrollTrigger.refresh();
    }
  }

  function applyScrollMode() {
    const mobile = isMobileRuntime();
    if (mobile && lenisInstance) {
      destroyLenis();
      setupNativeScroll();
      window.dispatchEvent(new CustomEvent('ft:scroll-mode-changed', { detail: { mobile: true } }));
      return;
    }
    if (!mobile && !lenisInstance && typeof Lenis !== 'undefined') {
      setupLenis();
      window.dispatchEvent(new CustomEvent('ft:scroll-mode-changed', { detail: { mobile: false } }));
    }
  }

  setupAnchorSmoothScroll();
  setupLenis();

  let modeTimer;
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(modeTimer);
      modeTimer = setTimeout(applyScrollMode, 200);
    },
    { passive: true }
  );

  window.matchMedia(MOBILE_QUERY).addEventListener('change', applyScrollMode);
})();
