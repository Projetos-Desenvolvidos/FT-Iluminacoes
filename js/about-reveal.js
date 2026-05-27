/**
 * Sobre — palavras surgindo (GSAP no desktop; CSS no mobile para fluidez).
 */
(function () {
  const intro = document.querySelector('.about-section__intro');
  const label = document.querySelector('.about-section__label');
  const lead = document.querySelector('.about-section__lead');

  if (!intro || !lead || typeof gsap === 'undefined') return;

  let words = [];
  let revealTl = null;
  let scrollTrigger = null;
  let started = false;
  let playTimer = null;

  function isMobileRuntime() {
    return (
      window.matchMedia('(max-width: 900px)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    );
  }

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
        span.setAttribute('aria-hidden', 'true');
        span.style.setProperty('--word-i', String(collected.length));
        parent.insertBefore(span, textNode);
        collected.push(span);
      });

      textNode.remove();
    });

    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    return collected;
  }

  function finishReveal() {
    intro.classList.add('about-section__intro--revealed');
    intro.classList.remove('about-section__intro--playing');
    if (label) gsap.set(label, { clearProps: 'transform,opacity' });
    if (words.length) gsap.set(words, { clearProps: 'transform,opacity' });
  }

  function revealAll() {
    clearTimeout(playTimer);
    killReveal();
    if (label) gsap.set(label, { opacity: 1, y: 0 });
    gsap.set(words, { opacity: 1, y: 0 });
    finishReveal();
  }

  function killReveal() {
    revealTl?.kill();
    revealTl = null;
    clearTimeout(playTimer);
    intro.classList.remove('about-section__intro--playing');
  }

  function resetReveal() {
    killReveal();
    started = false;
    intro.classList.remove('about-section__intro--revealed');
    if (label) gsap.set(label, { opacity: 0, y: 10 });
    gsap.set(words, { opacity: 0, y: 10 });
  }

  function playDesktopReveal() {
    if (started) return;
    started = true;

    revealTl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: finishReveal,
    });

    if (label) {
      revealTl.fromTo(label, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45 });
    }

    revealTl.fromTo(
      words,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.32,
        stagger: 0.038,
      },
      label ? '-=0.12' : 0
    );
  }

  function playMobileReveal() {
    if (started) return;
    started = true;

    if (label) gsap.set(label, { clearProps: 'all' });
    gsap.set(words, { clearProps: 'all' });
    intro.classList.add('about-section__intro--playing');

    const wordDelay = 46;
    const labelMs = 520;
    const wordsMs = 80 + words.length * wordDelay + 420;

    playTimer = setTimeout(finishReveal, Math.max(labelMs, wordsMs));
  }

  function playReveal() {
    requestAnimationFrame(() => {
      if (isMobileRuntime()) playMobileReveal();
      else playDesktopReveal();
    });
  }

  function setupWords() {
    if (!intro.classList.contains('about-section__intro--words')) {
      words = wrapWords(lead);
      intro.classList.add('about-section__intro--words');
    } else if (!words.length) {
      words = Array.from(lead.querySelectorAll('.about-section__word'));
    }

    if (isMobileRuntime()) {
      if (label) gsap.set(label, { opacity: 0, clearProps: 'transform' });
      gsap.set(words, { clearProps: 'all' });
      return;
    }

    if (label) gsap.set(label, { opacity: 0, y: 10 });
    gsap.set(words, { opacity: 0, y: 10 });
  }

  function bindScrollTrigger() {
    const mobile = isMobileRuntime();
    scrollTrigger?.kill();
    scrollTrigger = ScrollTrigger.create({
      id: 'aboutSectionReveal',
      trigger: intro,
      start: mobile ? 'top 86%' : 'top 78%',
      once: mobile,
      onEnter: playReveal,
      onLeaveBack: mobile
        ? undefined
        : () => {
            resetReveal();
          },
    });
  }

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      words = wrapWords(lead);
      intro.classList.add('about-section__intro--words');
      revealAll();
      return;
    }

    if (typeof ScrollTrigger === 'undefined') {
      words = wrapWords(lead);
      intro.classList.add('about-section__intro--words');
      revealAll();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    setupWords();
    bindScrollTrigger();

    let resizeTimer;
    window.addEventListener(
      'resize',
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          killReveal();
          scrollTrigger?.kill();
          scrollTrigger = null;
          started = false;
          setupWords();
          bindScrollTrigger();
          ScrollTrigger.refresh();
        }, 200);
      },
      { passive: true }
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
