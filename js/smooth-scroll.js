/**
 * Smooth navigation for whole site.
 */
(function () {
  if (typeof window === 'undefined') return;
  if (window.__ftSmoothScrollInitialized) return;
  window.__ftSmoothScrollInitialized = true;

  let lenisInstance = null;

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

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      smoothTouch: true,
      syncTouch: true,
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
        lenis.on('scroll', () => {
          ScrollTrigger.update();
          window.dispatchEvent(new CustomEvent('ft:scroll'));
        });

        ScrollTrigger.addEventListener('refresh', () => {
          lenis.resize();
        });
      }

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

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
