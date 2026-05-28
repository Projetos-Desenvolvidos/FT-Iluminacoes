/**
 * Diferenciais — mesmo padrão de reveal dos impact-cards + ScrollTrigger
 */
(function () {
  const section = document.querySelector('.diferenciais');
  if (!section || typeof gsap === 'undefined') return;

  const titleLines = gsap.utils.toArray('.diferenciais__title-line', section);
  const label = section.querySelector('.diferenciais__label');
  const cards = gsap.utils.toArray('.diferenciais-card', section);

  if (!cards.length) return;

  cards.forEach((card) => {
    const accent = card.dataset.accent;
    if (accent) card.style.setProperty('--card-accent', accent);
  });

  function revealStatic() {
    if (label) gsap.set(label, { opacity: 1, y: 0 });
    gsap.set(titleLines, { opacity: 1, y: 0 });
    gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
    section.classList.add('diferenciais--revealed');
  }

  function playReveal() {
    const targets = [label, ...titleLines].filter(Boolean);
    const lowPerf = Boolean(window.__ftLowPerfMode) || window.matchMedia('(max-width: 900px)').matches;

    if (targets.length) {
      gsap.fromTo(
        targets,
        { opacity: 0, y: 36, filter: lowPerf ? 'none' : 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'none',
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
        }
      );
    }

    gsap.fromTo(
      cards,
      { opacity: 0, y: 40, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.1,
        onComplete: () => section.classList.add('diferenciais--revealed'),
      }
    );
  }

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealStatic();
      return;
    }

    gsap.set(cards, { opacity: 0, y: 40, scale: 0.94 });
    if (label) gsap.set(label, { opacity: 0, y: 24 });
    gsap.set(titleLines, { opacity: 0, y: 36 });

    if (typeof ScrollTrigger === 'undefined') {
      playReveal();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      id: 'ftDiferenciaisReveal',
      trigger: section,
      start: 'top 72%',
      once: true,
      onEnter: () => playReveal(),
    });

    const refresh = () => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    };

    window.addEventListener('ft:loader-complete', refresh, { once: true });
    window.addEventListener('ft:cinematic-portfolio-ready', refresh, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
