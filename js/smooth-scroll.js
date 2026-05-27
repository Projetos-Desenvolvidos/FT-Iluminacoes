/**
 * Smooth navigation for whole site.
 */
(function () {
  if (typeof window === 'undefined') return;
  if (window.__ftSmoothScrollInitialized) return;
  window.__ftSmoothScrollInitialized = true;

  let lenisInstance = null;
  const MOBILE_QUERY = '(max-width: 900px)';
  const COARSE_POINTER_QUERY = '(pointer: coarse)';

  function isMobileRuntime() {
    return (
      window.matchMedia(MOBILE_QUERY).matches ||
      window.matchMedia(COARSE_POINTER_QUERY).matches
    );
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

  function setupLenis() {
    if (typeof Lenis === 'undefined') return;
    const isMobile = isMobileRuntime();
    window.__ftLowPerfMode = isMobile;

    const lenis = new Lenis({
      duration: isMobile ? 0.72 : 1.05,
      smoothWheel: true,
      smoothTouch: true,
      syncTouch: false,
      wheelMultiplier: isMobile ? 0.78 : 0.88,
      touchMultiplier: isMobile ? 0.72 : 0.9,
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

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
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

  setupAnchorSmoothScroll();
  setupLenis();
})();
