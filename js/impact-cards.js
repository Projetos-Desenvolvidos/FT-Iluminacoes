/**
 * Cards de impacto — entrada stagger + contador animado
 */
(function () {
  const section = document.querySelector('.impact-section');
  const cards = document.querySelectorAll('.impact-card');
  const headerLines = gsap.utils.toArray('.impact-section__header .impact-section__line');
  const headerButtons = gsap.utils.toArray('.impact-section__header .btn-hero');
  const headerTargets = [...headerLines, ...headerButtons];

  if (!section || !cards.length || typeof gsap === 'undefined') return;

  function formatNumber(value, card) {
    const suffix = card.dataset.suffix || '';
    const rounded = Math.round(value);

    if (suffix === '%') {
      return String(rounded);
    }

    if (rounded >= 1000) {
      const k = rounded / 1000;
      return Number.isInteger(k) ? String(k) : k.toFixed(1).replace(/\.0$/, '');
    }

    return String(rounded);
  }

  function getSuffix(value, card) {
    const suffix = card.dataset.suffix || '';
    if (suffix === '%') return '%';
    if (Math.round(value) >= 1000) return 'K+';
    return suffix;
  }

  function setCardValue(card, value) {
    const numberEl = card.querySelector('.impact-card__number');
    const suffixEl = card.querySelector('.impact-card__suffix');
    if (!numberEl || !suffixEl) return;

    numberEl.textContent = formatNumber(value, card);
    suffixEl.textContent = getSuffix(value, card);
  }

  function revealStatic() {
    if (headerTargets.length) gsap.set(headerTargets, { opacity: 1, y: 0 });
    cards.forEach((card) => {
      const target = Number(card.dataset.value) || 0;
      setCardValue(card, target);
      gsap.set(card, { opacity: 1, y: 0, scale: 1 });
    });
    section.classList.add('impact-section--revealed');
  }

  function animateCounters() {
    cards.forEach((card, index) => {
      const target = Number(card.dataset.value) || 0;
      const counter = { value: 0 };

      gsap.to(counter, {
        value: target,
        duration: 1.8,
        delay: 0.15 + index * 0.12,
        ease: 'power2.out',
        onUpdate: () => setCardValue(card, counter.value),
      });
    });
  }

  function playReveal() {
    const tl = gsap.timeline({
      onComplete: () => {
        section.classList.add('impact-section--revealed');
        animateCounters();
      },
    });

    if (headerTargets.length) {
      tl.fromTo(
        headerTargets,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    }

    tl.fromTo(
      cards,
      { opacity: 0, y: 40, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.85,
        stagger: 0.14,
        ease: 'power3.out',
      },
      headerTargets.length ? '-=0.25' : 0
    );
  }

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealStatic();
      return;
    }

    if (headerTargets.length) gsap.set(headerTargets, { opacity: 0, y: 24 });
    gsap.set(cards, { opacity: 0, y: 40, scale: 0.94 });

    if (typeof ScrollTrigger === 'undefined') {
      playReveal();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      id: 'impactCardsReveal',
      trigger: section,
      start: 'top 72%',
      once: true,
      onEnter: () => playReveal(),
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
