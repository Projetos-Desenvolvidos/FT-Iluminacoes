/**
 * Depoimentos — padrão diferenciais / impact-cards + transição suave entre slides
 */
(function () {
  const section = document.querySelector('.depoimentos');
  if (!section || typeof gsap === 'undefined') return;

  const showcase = section.querySelector('[data-depoimentos-showcase]');
  const visuals = gsap.utils.toArray('.depoimentos__visual', section);
  const slides = gsap.utils.toArray('.depoimentos__slide', section);
  const btnPrev = section.querySelector('.depoimentos__ctrl--prev');
  const btnNext = section.querySelector('.depoimentos__ctrl--next');
  const counterCurrent = section.querySelector('.depoimentos__counter-current');
  const titleLines = gsap.utils.toArray('.depoimentos__title-line', section);
  const label = section.querySelector('.depoimentos__label');

  if (!slides.length || !visuals.length) return;

  let index = 0;
  let transitioning = false;
  const total = slides.length;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const transitionDuration = reducedMotion ? 0.35 : 0.9;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function getVisual(i) {
    return visuals.find((v) => Number(v.dataset.index) === i) || visuals[i];
  }

  function getSlide(i) {
    return slides.find((s) => Number(s.dataset.index) === i) || slides[i];
  }

  function updateCounter(next) {
    if (counterCurrent) counterCurrent.textContent = pad(next + 1);
  }

  function setActiveState(next) {
    visuals.forEach((v) => {
      v.classList.toggle('is-active', Number(v.dataset.index) === next);
    });
    slides.forEach((s) => {
      s.classList.toggle('is-active', Number(s.dataset.index) === next);
    });
    updateCounter(next);
    index = next;
  }

  function animateTo(next) {
    if (transitioning || next === index) return;
    transitioning = true;

    const outSlide = getSlide(index);
    const inSlide = getSlide(next);
    const outVisual = getVisual(index);
    const inVisual = getVisual(next);
    const outImg = outVisual?.querySelector('img');
    const inImg = inVisual?.querySelector('img');
    const quoteOut = outSlide?.querySelector('.depoimentos__quote p');
    const metaOut = outSlide?.querySelectorAll('.depoimentos__name, .depoimentos__event');
    const quoteIn = inSlide?.querySelector('.depoimentos__quote p');
    const metaIn = inSlide?.querySelectorAll('.depoimentos__name, .depoimentos__event');

    if (reducedMotion) {
      setActiveState(next);
      transitioning = false;
      return;
    }

    gsap.set(inVisual, { visibility: 'visible', zIndex: 2 });
    gsap.set(outVisual, { zIndex: 1 });
    gsap.set(inSlide, { visibility: 'visible', pointerEvents: 'none', position: 'absolute', inset: 0 });
    gsap.set(outSlide, { position: 'absolute', inset: 0 });

    inVisual.classList.add('is-active');
    inSlide.classList.add('is-active');
    outSlide.classList.remove('is-active');
    updateCounter(next);

    gsap.set(inVisual, { opacity: 0 });
    gsap.set(inImg, { scale: 1.04 });
    gsap.set(inSlide, { opacity: 0 });
    gsap.set(quoteIn, { opacity: 0, y: 24 });
    gsap.set(metaIn, { opacity: 0, y: 18 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        setActiveState(next);
        gsap.set([outSlide, inSlide], { clearProps: 'position,inset,visibility,pointerEvents,opacity,transform' });
        gsap.set([outVisual, inVisual], { clearProps: 'zIndex,opacity,visibility' });
        if (outImg) gsap.set(outImg, { clearProps: 'scale,transform' });
        if (inImg) gsap.set(inImg, { clearProps: 'scale,transform' });
        outVisual?.classList.remove('is-active');
        transitioning = false;
      },
    });

    tl.to(outVisual, { opacity: 0, duration: transitionDuration * 0.5, ease: 'power2.inOut' }, 0)
      .to(
        [quoteOut, ...metaOut].filter(Boolean),
        { opacity: 0, y: -14, duration: transitionDuration * 0.4, stagger: 0.06, ease: 'power2.in' },
        0
      )
      .to(inVisual, { opacity: 1, duration: transitionDuration * 0.65, ease: 'power2.inOut' }, transitionDuration * 0.2)
      .to(inImg, { scale: 1, duration: transitionDuration * 0.75 }, transitionDuration * 0.15)
      .to(inSlide, { opacity: 1, duration: transitionDuration * 0.45 }, transitionDuration * 0.28)
      .to(quoteIn, { opacity: 1, y: 0, duration: transitionDuration * 0.55 }, transitionDuration * 0.35)
      .to(metaIn, { opacity: 1, y: 0, duration: transitionDuration * 0.5, stagger: 0.08 }, transitionDuration * 0.42);
  }

  function go(delta) {
    animateTo((index + delta + total) % total);
  }

  function revealStatic() {
    if (label) gsap.set(label, { opacity: 1, y: 0 });
    gsap.set(titleLines, { opacity: 1, y: 0 });
    if (showcase) gsap.set(showcase, { opacity: 1, y: 0 });
    section.classList.add('depoimentos--revealed');
  }

  function playReveal() {
    const targets = [label, ...titleLines].filter(Boolean);

    if (targets.length) {
      gsap.fromTo(
        targets,
        { opacity: 0, y: 36, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
        }
      );
    }

    if (showcase) {
      gsap.fromTo(
        showcase,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          delay: 0.1,
          onComplete: () => section.classList.add('depoimentos--revealed'),
        }
      );
    } else {
      section.classList.add('depoimentos--revealed');
    }
  }

  function bindNav() {
    btnPrev?.addEventListener('click', () => go(-1));
    btnNext?.addEventListener('click', () => go(1));

    section.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
    });
  }

  function init() {
    bindNav();
    updateCounter(0);

    if (reducedMotion) {
      revealStatic();
      return;
    }

    if (label) gsap.set(label, { opacity: 0, y: 24 });
    gsap.set(titleLines, { opacity: 0, y: 36 });
    if (showcase) gsap.set(showcase, { opacity: 0, y: 40 });

    if (typeof ScrollTrigger === 'undefined') {
      playReveal();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      id: 'ftDepoimentosReveal',
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
