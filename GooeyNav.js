// ── GooeyNav Component (Vanilla JS) ──
// Converted from React Bits <GooeyNav /> component

class GooeyNav {
  constructor(container, options = {}) {
    this.container = container;
    this.items = options.items || [];
    this.animationTime = options.animationTime || 600;
    this.particleCount = options.particleCount || 15;
    this.particleDistances = options.particleDistances || [90, 10];
    this.particleR = options.particleR || 100;
    this.timeVariance = options.timeVariance || 300;
    this.colors = options.colors || [1, 2, 3, 1, 2, 3, 1, 4];
    this.activeIndex = options.initialActiveIndex || 0;
    this.onItemClick = options.onItemClick || null;

    this.containerEl = null;
    this.navRef = null;
    this.filterRef = null;

    this.init();
  }

  noise(n = 1) {
    return n / 2 - Math.random() * n;
  }

  getXY(distance, pointIndex, totalPoints) {
    const angle = ((360 + this.noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  }

  createParticle(i, t, d, r) {
    let rotate = this.noise(r / 10);
    return {
      start: this.getXY(d[0], this.particleCount - i, this.particleCount),
      end: this.getXY(d[1] + this.noise(7), this.particleCount - i, this.particleCount),
      time: t,
      scale: 1 + this.noise(0.2),
      color: 0, // removed random colors, use white
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  }

  makeParticles(element) {
    const isMobile = window.innerWidth < 768;
    const activeParticleCount = isMobile ? Math.floor(this.particleCount / 2) : this.particleCount;
    if (activeParticleCount === 0) return;
    const d = this.particleDistances;
    const r = this.particleR;
    const bubbleTime = this.animationTime * 2 + this.timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);

    for (let i = 0; i < activeParticleCount; i++) {
      const t = this.animationTime * 2 + this.noise(this.timeVariance * 2);
      const p = this.createParticle(i, t, d, r);
      element.classList.remove('active');

      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('gooey-particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `white`); // Fixed to white colors
        particle.style.setProperty('--rotate', `${p.rotate}deg`);

        point.classList.add('gooey-point');
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => {
          element.classList.add('active');
        });
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            // particle already removed
          }
        }, t);
      }, 30);
    }
  }

  updateEffectPosition(element) {
    if (!this.filterRef) return;
    
    // Position relative to the parent UL (navRef) which has position: relative
    const styles = {
      left: `${element.offsetLeft}px`,
      top: `${element.offsetTop}px`,
      width: `${element.offsetWidth}px`,
      height: `${element.offsetHeight}px`
    };
    Object.assign(this.filterRef.style, styles);
  }

  handleClick(liEl, index, isProgrammatic = false) {
    if (this.activeIndex === index) return;

    // Remove old active
    const allLi = this.navRef.querySelectorAll('li');
    allLi.forEach(li => li.classList.remove('active'));

    this.activeIndex = index;
    liEl.classList.add('active');
    this.updateEffectPosition(liEl);

    // Clear old particles
    if (this.filterRef) {
      const particles = this.filterRef.querySelectorAll('.gooey-particle');
      particles.forEach(p => this.filterRef.removeChild(p));
    }

    // Create new particles
    if (this.filterRef) {
      this.makeParticles(this.filterRef);
    }

    // Callback
    if (this.onItemClick && !isProgrammatic) {
      this.onItemClick(this.items[index], index);
    }
  }

  init() {
    // Create main container
    this.containerEl = document.createElement('div');
    this.containerEl.className = 'gooey-nav-container';

    // Create nav
    const nav = document.createElement('nav');
    this.navRef = document.createElement('ul');

    this.items.forEach((item, index) => {
      const li = document.createElement('li');
      if (index === this.activeIndex) li.classList.add('active');

      const a = document.createElement('a');
      a.href = item.href || '#';
      a.innerHTML = item.label;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleClick(li, index);
      });
      a.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleClick(li, index);
        }
      });

      li.appendChild(a);
      this.navRef.appendChild(li);
    });

    nav.appendChild(this.navRef);
    this.containerEl.appendChild(nav);

    // Create effect spans
    this.filterRef = document.createElement('span');
    this.filterRef.className = 'effect filter';
    // Append to navRef so it scrolls with the items
    this.navRef.appendChild(this.filterRef);

    this.container.appendChild(this.containerEl);

    // Initial position after render
    requestAnimationFrame(() => {
      setTimeout(() => {
        const activeLi = this.navRef.querySelectorAll('li')[this.activeIndex];
        if (activeLi) {
          this.updateEffectPosition(activeLi);
        }
      }, 100);
    });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = this.navRef.querySelectorAll('li')[this.activeIndex];
      if (currentActiveLi) {
        this.updateEffectPosition(currentActiveLi);
      }
    });
    resizeObserver.observe(this.containerEl);
  }
}
