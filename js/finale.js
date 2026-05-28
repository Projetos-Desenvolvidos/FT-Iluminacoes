/**
 * Finale — texto surge ao entrar na viewport (sem pin/scrub)
 */
(function () {
  const section = document.querySelector('.finale');
  if (!section || typeof gsap === 'undefined') return;

  const lineGhost = section.querySelector('.finale__line--ghost');
  const lineHero = section.querySelector('.finale__line--hero');
  const ctaTitle = section.querySelector('.finale__cta-title');
  const ctaSub = section.querySelector('.finale__cta-sub');
  const actions = section.querySelector('.finale__actions');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let played = false;

  const revealTargets = [lineGhost, lineHero, ctaTitle, ctaSub, actions].filter(Boolean);

  function revealAll() {
    gsap.set(revealTargets, { opacity: 1, y: 0 });
    if (lineGhost) gsap.set(lineGhost, { opacity: 0.38 });
    section.classList.add('finale--revealed', 'finale--ready');
    window.dispatchEvent(new CustomEvent('ft:finale-ready'));
  }

  function prepareHidden() {
    gsap.set(revealTargets, { opacity: 0, y: 18 });
  }

  function playReveal() {
    if (played) return;
    played = true;
    section.classList.add('finale--ready', 'finale--revealed');

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => window.dispatchEvent(new CustomEvent('ft:finale-ready')),
    });

    if (lineGhost) {
      tl.to(lineGhost, { opacity: 0.38, y: 0, duration: 0.55 });
    }
    if (lineHero) {
      tl.to(lineHero, { opacity: 1, y: 0, duration: 0.6 }, lineGhost ? '-=0.32' : 0);
    }
    if (ctaTitle) {
      tl.to(ctaTitle, { opacity: 1, y: 0, duration: 0.5 }, '-=0.22');
    }
    if (ctaSub) {
      tl.to(ctaSub, { opacity: 1, y: 0, duration: 0.45 }, '-=0.35');
    }
    if (actions) {
      tl.to(actions, { opacity: 1, y: 0, duration: 0.5 }, '-=0.28');
    }
  }

  function init() {
    if (reducedMotion) {
      revealAll();
      return;
    }

    if (typeof ScrollTrigger === 'undefined') {
      revealAll();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    prepareHidden();

    ScrollTrigger.create({
      id: 'ftFinaleReveal',
      trigger: section,
      start: 'top 82%',
      onEnter: playReveal,
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('ft:loader-complete', refresh, { once: true });
    window.addEventListener('ft:final-cta-ready', refresh, { once: true });

    requestAnimationFrame(() => {
      refresh();
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh * 0.82 && rect.bottom > 0) playReveal();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
