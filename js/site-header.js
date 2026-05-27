/**
 * Marca fixa da home (texto + logo) — ajuste de cor em seções claras.
 */
(function () {
  const brand = document.getElementById('site-brand-fixed');
  if (!brand) return;

  const lightSections = document.querySelectorAll(
    '.about-section, .impact-section, .about-section__showcase, .diferenciais, .depoimentos, .final-cta'
  );

  if (!lightSections.length) return;

  function updateTheme() {
    const edge = brand.getBoundingClientRect().bottom;
    let onLight = false;

    lightSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top < edge && rect.bottom > 0) {
        onLight = true;
      }
    });

    brand.classList.toggle('site-brand-fixed--on-light', onLight);
  }

  updateTheme();
  window.addEventListener('scroll', updateTheme, { passive: true });
  window.addEventListener('resize', updateTheme, { passive: true });
  window.addEventListener('ft:scroll', updateTheme, { passive: true });
})();
