/* ===== BRANCH PAGES ANIMATIONS ===== */

(function() {
  'use strict';
  
  // Inicializar animação do hero
  function initHeroAnimation() {
    const hero = document.querySelector('.hero--branch');
    if (!hero) return;
    
    // Adicionar classe para indicar que JS está pronto
    document.documentElement.classList.add('js-ready');
    
    // Verificar se o usuário prefere movimento reduzido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Mostrar tudo imediatamente sem animação
      hero.classList.add('reveal-in');
      document.documentElement.classList.add('is-mounted');
      return;
    }
    
    // Adicionar is-mounted imediatamente
    document.documentElement.classList.add('is-mounted');
    
    // Animar quando o hero estiver visível
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
          entry.target.classList.add('reveal-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px'
    });
    
    observer.observe(hero);
    
    // Fallback: se após 500ms não animou, mostrar de qualquer forma
    setTimeout(() => {
      if (!hero.classList.contains('reveal-in')) {
        hero.classList.add('reveal-in');
      }
    }, 500);
  }
  
  // Inicializar animações de scroll para outros elementos
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .timeline-item, .cta-section__card');
    if (animatedElements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
      el.classList.add('scroll-animate');
      observer.observe(el);
    });
  }
  
  // Inicializar tudo
  function init() {
    initHeroAnimation();
    initScrollAnimations();
  }
  
  // Executar assim que possível
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

