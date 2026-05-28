/**
 * Entradas suaves — complementa seções que ainda não têm reveal próprio.
 * Exclui: hero, portfólio, final-cta e blocos com pin/scrub ou reveal dedicado.
 */
(function () {
  if (typeof gsap === 'undefined') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const played = new Set();

  const EXCLUDE_ANCESTOR = [
    '.hero-studio',
    '#hero',
    '.cinematic-portfolio',
    '#portfolio',
    '.final-cta',
    '.finale',
    '.about-section__intro',
    '.about-section__gallery-viewport',
    '.about-section__gallery',
    '.diferenciais',
    '.depoimentos',
    '.impact-section',
    '.impact-section__cards',
    '.impact-card',
    '[data-ft-reveal="off"]',
  ];

  const GROUPS = [
    {
      id: 'ftRevealExperiencesIntro',
      trigger: '.about-section__showcase',
      targets:
        '.about-section__manifesto-block .about-section__title-line, .about-section__manifesto-block .btn-hero, .about-section__gallery-hint',
      start: 'top 85%',
    },
  ];

  function isExcluded(el) {
    return EXCLUDE_ANCESTOR.some((sel) => el.closest(sel));
  }

  function collectTargets(selector, root) {
    return gsap.utils.toArray(selector, root).filter((el) => el && !isExcluded(el));
  }

  function markDone(elements) {
    elements.forEach((el) => el.classList.add('ft-reveal--done'));
    const showcase = document.querySelector('.about-section__showcase');
    if (showcase && elements.some((el) => showcase.contains(el))) {
      showcase.classList.add('ft-reveal--ready');
    }
  }

  function revealInstant(elements) {
    gsap.set(elements, { opacity: 1, y: 0, clearProps: 'filter' });
    markDone(elements);
  }

  function playReveal(group, elements) {
    if (played.has(group.id)) return;
    played.add(group.id);

    gsap.fromTo(
      elements,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.09,
        ease: 'power2.out',
        onComplete: () => markDone(elements),
      }
    );
  }

  function bindGroup(group) {
    const triggerEl =
      typeof group.trigger === 'string' ? document.querySelector(group.trigger) : group.trigger;
    if (!triggerEl) return;

    const elements = Array.isArray(group.targets)
      ? group.targets.filter((el) => el && !isExcluded(el))
      : collectTargets(group.targets, triggerEl);
    if (!elements.length) return;

    if (reducedMotion) {
      revealInstant(elements);
      played.add(group.id);
      return;
    }

    gsap.set(elements, { opacity: 0, y: 20 });

    const run = () => playReveal(group, elements);

    if (typeof ScrollTrigger === 'undefined') {
      run();
      return;
    }

    ScrollTrigger.create({
      id: group.id,
      trigger: triggerEl,
      start: group.start || 'top 85%',
      once: true,
      onEnter: run,
    });

    const vh = window.innerHeight || document.documentElement.clientHeight;
    const rect = triggerEl.getBoundingClientRect();
    if (rect.top < vh * 0.85 && rect.bottom > 0) run();
  }

  function bindDataReveals() {
    const nodes = gsap.utils
      .toArray('[data-ft-reveal]:not([data-ft-reveal="off"])')
      .filter((el) => !isExcluded(el) && !el.classList.contains('ft-reveal--done'));

    const byRoot = new Map();

    nodes.forEach((el) => {
      const root =
        el.closest('[data-ft-reveal-group]') ||
        el.closest('section') ||
        el.closest('.about-section') ||
        document.body;
      const key = root.id || root.getAttribute('data-ft-reveal-group') || root.className.split(/\s+/)[0];
      if (!byRoot.has(key)) byRoot.set(key, { root, elements: [] });
      byRoot.get(key).elements.push(el);
    });

    byRoot.forEach((entry, key) => {
      const group = {
        id: `ftRevealData-${key}`,
        trigger: entry.root,
        targets: entry.elements,
        start: entry.root.getAttribute?.('data-ft-reveal-start') || 'top 85%',
      };
      bindGroup(group);
    });
  }

  function init() {
    GROUPS.forEach(bindGroup);
    bindDataReveals();

    const refresh = () => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    };

    window.addEventListener('ft:loader-complete', refresh, { once: true });
    window.addEventListener('ft:cinematic-portfolio-ready', refresh, { once: true });
    window.addEventListener('ft:final-cta-ready', refresh, { once: true });
    window.addEventListener('ft:finale-ready', refresh, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
