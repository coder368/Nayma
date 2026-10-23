/**
 * customCursor.js
 * Desktop-only custom twin-cursor with lerp tracking and hover expansion.
 * Employs hardware-accelerated translate3d on requestAnimationFrame loops.
 */

class CustomCursor {
  constructor() {
    // Only initialize if device has fine pointer controls (desktop mouse / trackpad)
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }
    
    this.dot = document.createElement('div');
    this.ring = document.createElement('div');
    
    this.dot.className = 'custom-cursor-dot';
    this.ring.className = 'custom-cursor-ring';
    
    document.body.appendChild(this.dot);
    document.body.appendChild(this.ring);
    
    this.mouse = { x: -200, y: -200 };
    this.dotPos = { x: -200, y: -200 };
    this.ringPos = { x: -200, y: -200 };
    
    this.init();
  }
  
  init() {
    this.dotGrid = document.querySelector('.dot-grid-layer');
    
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      
      if (this.dotGrid) {
        const dx = (e.clientX - window.innerWidth / 2) * -0.02;
        const dy = (e.clientY - window.innerHeight / 2) * -0.02;
        requestAnimationFrame(() => {
          this.dotGrid.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        });
      }
    });
    
    document.addEventListener('mousedown', () => {
      requestAnimationFrame(() => {
        this.dot.classList.add('clicking');
        this.ring.classList.add('clicking');
      });
    });
    
    document.addEventListener('mouseup', () => {
      requestAnimationFrame(() => {
        this.dot.classList.remove('clicking');
        this.ring.classList.remove('clicking');
      });
    });
    
    // Smooth hover reactions
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, [role="button"], .folder, .anime-item, .trait-tag');
      if (target) {
        requestAnimationFrame(() => {
          this.ring.classList.add('hovered');
        });
      } else {
        requestAnimationFrame(() => {
          this.ring.classList.remove('hovered');
        });
      }
    });

    const update = () => {
      const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
      
      // Accelerating interpolations
      this.dotPos.x = lerp(this.dotPos.x, this.mouse.x, 0.28);
      this.dotPos.y = lerp(this.dotPos.y, this.mouse.y, 0.28);
      
      this.ringPos.x = lerp(this.ringPos.x, this.mouse.x, 0.16);
      this.ringPos.y = lerp(this.ringPos.y, this.mouse.y, 0.16);
      
      // Hardware-accelerated transforms
      this.dot.style.transform = `translate3d(${this.dotPos.x}px, ${this.dotPos.y}px, 0)`;
      this.ring.style.transform = `translate3d(${this.ringPos.x}px, ${this.ringPos.y}px, 0)`;
      
      requestAnimationFrame(update);
    };
    
    requestAnimationFrame(update);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CustomCursor();
});
