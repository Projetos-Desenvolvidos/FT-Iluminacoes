/**
 * Sobre — texto aparecendo aos poucos (palavra a palavra)
 */
(function () {
  const intro = document.querySelector('.about-section__intro');
  const label = document.querySelector('.about-section__label');
  const lead = document.querySelector('.about-section__lead');

  if (!intro || !lead || typeof gsap === 'undefined') return;

  const WORD_STAGGER = 0.045;

  let words = [];
  let revealTl = null;
  let started = false;

  function wrapWords(el) {
    const collected = [];
    const textNodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;

    while ((node = walker.nextNode())) {
      if (node.textContent.trim()) textNodes.push(node);
    }

    textNodes.forEach((textNode) => {
      const parent = textNode.parentElement;
      const chunks = textNode.textContent.split(/(\s+)/);

      chunks.forEach((chunk) => {
        if (!chunk) return;
        if (/^\s+$/.test(chunk)) {
          parent.insertBefore(document.createTextNode(chunk), textNode);
          return;
        }

        const span = document.createElement('span');
        span.className = 'about-section__word';
        span.textContent = chunk;
        parent.insertBefore(span, textNode);
        collected.push(span);
      });

      textNode.remove();
    });

    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    return collected;
  }

  function revealAll() {
    if (label) gsap.set(label, { opacity: 1, y: 0 });
    gsap.set(words, { opacity: 1, y: 0 });
    intro.classList.add('about-section__intro--revealed');
  }

  function resetReveal() {
    revealTl?.kill();
    revealTl = null;
    started = false;
    intro.classList.remove('about-section__intro--revealed');
    if (label) gsap.set(label, { opacity: 0, y: 12 });
    gsap.set(words, { opacity: 0, y: 12 });
  }

  function playReveal() {
    if (started) return;
    started = true;

    revealTl = gsap.timeline({
      onComplete: () => intro.classList.add('about-section__intro--revealed'),
    });

    if (label) {
      revealTl.fromTo(
        label,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }

    revealTl.fromTo(
      words,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.38,
        stagger: WORD_STAGGER,
        ease: 'power2.out',
      },
      label ? '+=0.06' : 0
    );
  }

  function init() {
    words = wrapWords(lead);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealAll();
      return;
    }

    if (typeof ScrollTrigger === 'undefined') {
      revealAll();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (label) gsap.set(label, { opacity: 0, y: 12 });
    gsap.set(words, { opacity: 0, y: 12 });

    ScrollTrigger.create({
      id: 'aboutSectionReveal',
      trigger: intro,
      start: 'top 78%',
      onEnter: () => playReveal(),
      onLeaveBack: () => resetReveal(),
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
