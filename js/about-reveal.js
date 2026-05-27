/**
 * Sobre — reveal do texto (palavra a palavra no desktop; fade suave no mobile).
 */
(function () {
  const intro = document.querySelector('.about-section__intro');
  const label = document.querySelector('.about-section__label');
  const lead = document.querySelector('.about-section__lead');

  if (!intro || !lead || typeof gsap === 'undefined') return;

  const WORD_STAGGER_DESKTOP = 0.038;
  let words = [];
  let revealTl = null;
  let scrollTrigger = null;
  let started = false;

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
        parent.insertBefore(span, textNode);
        collected.push(span);
      });

      textNode.remove();
    });

    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    return collected;
  }

  function revealAll() {
    if (label) gsap.set(label, { opacity: 1, y: 0, clearProps: 'transform' });
    if (words.length) {
      gsap.set(words, { opacity: 1, y: 0, clearProps: 'transform' });
    } else {
      gsap.set(lead, { opacity: 1, clearProps: 'opacity' });
    }
    intro.classList.add('about-section__intro--revealed');
  }

  function killReveal() {
    revealTl?.kill();
    revealTl = null;
  }

  function resetDesktopReveal() {
    killReveal();
    started = false;
    intro.classList.remove('about-section__intro--revealed');
    if (label) gsap.set(label, { opacity: 0, y: 10 });
    if (words.length) gsap.set(words, { opacity: 0, y: 10 });
  }

  function playDesktopReveal() {
    if (started) return;
    started = true;

    revealTl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => {
        intro.classList.add('about-section__intro--revealed');
        if (label) gsap.set(label, { clearProps: 'transform' });
        gsap.set(words, { clearProps: 'transform' });
      },
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
        stagger: WORD_STAGGER_DESKTOP,
      },
      label ? '-=0.12' : 0
    );
  }

  function playMobileReveal() {
    if (started) return;
    started = true;

    revealTl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => {
        intro.classList.add('about-section__intro--revealed');
        if (label) gsap.set(label, { clearProps: 'opacity' });
        gsap.set(lead, { clearProps: 'opacity' });
      },
    });

    if (label) {
      revealTl.fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    }

    revealTl.fromTo(lead, { opacity: 0 }, { opacity: 1, duration: 0.55 }, label ? '-=0.28' : 0);
  }

  function bindScrollTrigger(desktop) {
    scrollTrigger?.kill();
    scrollTrigger = ScrollTrigger.create({
      id: 'aboutSectionReveal',
      trigger: intro,
      start: desktop ? 'top 78%' : 'top 88%',
      once: !desktop,
      onEnter: () => {
        requestAnimationFrame(() => {
          if (desktop) playDesktopReveal();
          else playMobileReveal();
        });
      },
      onLeaveBack: desktop
        ? () => {
            resetDesktopReveal();
          }
        : undefined,
    });
  }

  function initDesktop() {
    intro.classList.add('about-section__intro--words');
    words = wrapWords(lead);
    if (label) gsap.set(label, { opacity: 0, y: 10 });
    gsap.set(words, { opacity: 0, y: 10 });
    bindScrollTrigger(true);
  }

  function initMobile() {
    intro.classList.remove('about-section__intro--words');
    if (label) gsap.set(label, { opacity: 0 });
    gsap.set(lead, { opacity: 0 });
    bindScrollTrigger(false);
  }

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealAll();
      return;
    }

    if (typeof ScrollTrigger === 'undefined') {
      revealAll();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (isMobileRuntime()) {
      initMobile();
    } else {
      initDesktop();
    }

    let resizeTimer;
    window.addEventListener(
      'resize',
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          const mobile = isMobileRuntime();
          const hasWords = intro.classList.contains('about-section__intro--words');
          if ((!mobile && hasWords) || (mobile && !hasWords)) return;

          killReveal();
          scrollTrigger?.kill();
          scrollTrigger = null;
          started = false;

          if (mobile) {
            if (hasWords && lead.querySelector('.about-section__word')) {
              const text = lead.getAttribute('aria-label') || lead.textContent;
              lead.textContent = text;
              lead.removeAttribute('aria-label');
            }
            initMobile();
          } else {
            initDesktop();
          }

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
