/**
 * Hero — luz da barra RGB expande no scroll → seção Sobre
 */
(function () {
  const transition = document.getElementById('heroTransition');
  const hero = document.querySelector('.hero-studio');
  const fx = document.getElementById('lightBarFx');
  const fill = document.getElementById('lightBarFill');
  const beam = document.querySelector('.light-bar-beam');
  const glowUp = document.querySelector('.light-bar-glow-up');
  const glowDown = document.querySelector('.light-bar-glow-down');
  const bar = document.querySelector('.light-bar');

  if (!transition || !hero || !fx || !fill || typeof gsap === 'undefined') return;

  const fadeTargets = hero.querySelectorAll(
    '.hero-header, .hero-content, .hero-text-wash, .hero-ambient, .hero-scanlines, .hero-cta-platform, .hero-kpis-platform'
  );

  const CONFIG = {
    transitionScrollVh: 110,
    transitionScrollVhMobile: 85,
    scrub: 1.15,
  };

  let scrollTween = null;

  function setPaused(paused) {
    hero.classList.toggle('hero-paused', paused);
  }

  if ('IntersectionObserver' in window) {
    const visibilityObs = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0.08, rootMargin: '40px 0px' }
    );
    visibilityObs.observe(hero);
  }

  document.addEventListener('visibilitychange', () => {
    setPaused(document.hidden);
  });

  function getTransitionScrollVh() {
    return window.matchMedia('(max-width: 768px)').matches
      ? CONFIG.transitionScrollVhMobile
      : CONFIG.transitionScrollVh;
  }

  function getFxStartHeight() {
    return Math.min(window.innerHeight * 0.56, 520);
  }

  function updateTransitionHeight() {
    transition.style.setProperty('--hero-transition-scroll', `${getTransitionScrollVh()}vh`);
  }

  function resetLightFx() {
    gsap.set(fx, { clearProps: 'position,left,right,bottom,top,width,height,zIndex' });
    gsap.set([beam, glowUp, glowDown, bar, fill], {
      clearProps: 'scale,scaleX,scaleY,opacity,filter,transform',
    });
    gsap.set(fadeTargets, { opacity: 1 });
  }

  function buildScroll() {
    if (typeof ScrollTrigger === 'undefined') return;

    scrollTween?.scrollTrigger?.kill();
    scrollTween?.kill();
    resetLightFx();
    updateTransitionHeight();

    const origin = '50% 100%';
    const startH = getFxStartHeight();

    gsap.set([beam, glowUp, glowDown, bar, fill], { transformOrigin: origin });
    gsap.set(fill, { scaleY: 0, opacity: 0 });

    scrollTween = gsap.timeline({
      scrollTrigger: {
        id: 'heroReveal',
        trigger: transition,
        start: 'top top',
        end: 'bottom top',
        scrub: CONFIG.scrub,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          hero.classList.toggle('hero-is-revealing', p > 0.02);
          hero.classList.toggle('hero-reveal-done', p >= 0.98);
          document.dispatchEvent(
            new CustomEvent('hero-scroll', {
              detail: { progress: p, phase: 'transition' },
            })
          );
        },
      },
    });

    scrollTween.fromTo(
      fx,
      {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: startH,
        zIndex: 55,
        overflow: 'visible',
      },
      { height: '100vh', ease: 'power2.inOut', duration: 1 },
      0
    );

    scrollTween.fromTo(
      beam,
      { scaleY: 1, scaleX: 1, filter: 'blur(44px)' },
      { scaleY: 7.5, scaleX: 2.4, filter: 'blur(72px)', ease: 'power2.inOut', duration: 1 },
      0
    );

    scrollTween.fromTo(
      glowUp,
      { scaleY: 1, scaleX: 1, opacity: 1 },
      { scaleY: 9, scaleX: 2.8, opacity: 0.85, ease: 'power2.inOut', duration: 1 },
      0
    );

    scrollTween.fromTo(
      glowDown,
      { scaleY: 1, scaleX: 1, opacity: 1 },
      { scaleY: 4, scaleX: 2, opacity: 0, ease: 'power2.inOut', duration: 0.6 },
      0
    );

    scrollTween.fromTo(
      bar,
      { scaleY: 1, scaleX: 1 },
      { scaleY: 280, scaleX: 2.2, ease: 'power2.inOut', duration: 1 },
      0
    );

    scrollTween.fromTo(
      fill,
      { scaleY: 0, opacity: 0 },
      { scaleY: 1.08, opacity: 1, ease: 'power2.inOut', duration: 0.85 },
      0.12
    );

    scrollTween.to(fadeTargets, { opacity: 0, ease: 'power2.inOut', duration: 0.5 }, 0.08);
  }

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(fadeTargets, { opacity: 0 });
      gsap.set(fill, { scaleY: 1, opacity: 1 });
      hero.classList.add('hero-reveal-done');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    buildScroll();

    window.addEventListener(
      'resize',
      () => {
        buildScroll();
        ScrollTrigger.refresh();
      },
      { passive: true }
    );
  }

  init();
})();
