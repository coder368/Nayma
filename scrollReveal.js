/**
 * ScrollRevealManager - Vanilla JS scroll reveal utility powered by IntersectionObserver.
 * Triggers hardware-accelerated entry animations when elements enter the viewport.
 */

class ScrollRevealManager {
  constructor(options = {}) {
    this.revealSelector = options.selector || '.reveal-on-scroll';
    this.threshold = options.threshold || 0.08; // slightly sensitive threshold for immediate feedback
    this.rootMargin = options.rootMargin || '0px 0px -30px 0px';
    
    this.init();
  }
  
  init() {
    const revealElements = document.querySelectorAll(this.revealSelector);
    if (revealElements.length === 0) return;
    
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Trigger animations on frame boundaries
          requestAnimationFrame(() => {
            entry.target.classList.add('revealed');
          });
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: this.threshold,
      rootMargin: this.rootMargin
    });
    
    revealElements.forEach(el => {
      // Add hardware-acceleration hints early on
      el.style.willChange = 'transform, opacity';
      observer.observe(el);
    });
  }
}

// Automatically bind scroll reveal sequences on load
document.addEventListener('DOMContentLoaded', () => {
  new ScrollRevealManager();
});
