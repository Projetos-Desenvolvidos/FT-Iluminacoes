/**
 * Registro e refresh coordenado dos pins de scroll (experiências + portfólio).
 */
(function () {
  if (typeof window === 'undefined') return;

  const REFRESH_MS = 100;

  window.FT_SCROLL = {
    experiences: {
      pinId: 'ftExperiencesHorizontalPin',
      trackId: 'ftExperiencesGalleryTrack',
      readyEvent: 'ft:experiences-scroll-ready',
      readyFlag: '__ftExperiencesScrollReady',
      activeClass: 'ft-experiences-scroll--active',
      staticClass: 'ft-experiences-scroll--static',
    },
    portfolio: {
      pinId: 'ftPortfolioCinematicPin',
      timelineId: 'ftPortfolioCinematicTimeline',
      readyEvent: 'ft:portfolio-cinematic-ready',
      readyFlag: '__ftPortfolioCinematicReady',
      activeClass: 'ft-portfolio-cinematic-scroll--active',
      staticClass: 'ft-portfolio-cinematic-scroll--static',
    },
  };

  let refreshTimer = null;
  let experiencesReady = false;
  let portfolioReady = false;

  function killById(id) {
    if (typeof ScrollTrigger === 'undefined' || !id) return;
    ScrollTrigger.getById(id)?.kill(true);
  }

  function scheduleRefresh() {
    if (typeof ScrollTrigger === 'undefined') return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, REFRESH_MS);
  }

  function maybeRefreshAll() {
    if (!experiencesReady || !portfolioReady) return;
    scheduleRefresh();
  }

  window.ftScrollPins = {
    kill: killById,
    refresh: scheduleRefresh,
    markExperiencesReady() {
      experiencesReady = true;
      window[FT_SCROLL.experiences.readyFlag] = true;
      maybeRefreshAll();
    },
    markPortfolioReady() {
      portfolioReady = true;
      window[FT_SCROLL.portfolio.readyFlag] = true;
      maybeRefreshAll();
    },
    getExperiencesPin() {
      return ScrollTrigger.getById(FT_SCROLL.experiences.pinId);
    },
  };

  window.addEventListener('ft:scroll-pins-refresh', scheduleRefresh);

  window.addEventListener(FT_SCROLL.experiences.readyEvent, () => {
    experiencesReady = true;
    maybeRefreshAll();
  });

  window.addEventListener(FT_SCROLL.portfolio.readyEvent, () => {
    portfolioReady = true;
    maybeRefreshAll();
  });

  window.ftRefreshScrollPins = scheduleRefresh;
})();
