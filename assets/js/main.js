(function(){
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if(!anchor) return;
    const id = anchor.getAttribute('href');
    if(!id || id === '#') return;
    const target = document.querySelector(id);
    if(!target) return;

    event.preventDefault();
    const behavior = prefersReducedMotion.matches ? 'auto' : 'smooth';
    target.scrollIntoView({ behavior, block: 'start' });
  }, { capture: true });

  const year = new Date().getFullYear();
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = year;
  });
})();
