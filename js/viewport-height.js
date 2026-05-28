/**
 * Altura visível real no iOS (igual área útil do Android).
 * Atualiza --ft-vh quando a barra do Safari muda de tamanho.
 */
(function () {
  if (typeof window === 'undefined') return;

  function setViewportHeight() {
    const unit = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--ft-vh', `${unit}px`);
  }

  setViewportHeight();

  window.addEventListener('DOMContentLoaded', setViewportHeight, { passive: true });
  window.addEventListener('pageshow', setViewportHeight, { passive: true });
  window.addEventListener('resize', setViewportHeight, { passive: true });
  window.addEventListener('orientationchange', setViewportHeight, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setViewportHeight, { passive: true });
  }

  window.addEventListener('ft:scroll-mode-changed', setViewportHeight, { passive: true });
})();
