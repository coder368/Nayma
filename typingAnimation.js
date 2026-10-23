/**
 * TerminalTypewriter - Vanilla JS terminal typing animation with IntersectionObserver.
 * Features high mobile performance, hardware-accelerating opacity transitions,
 * and elegant step-by-step rendering.
 */

class TerminalTypewriter {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;
    
    this.speed = options.speed || 15; // ms per character typing
    this.lineDelay = options.lineDelay || 150; // ms delay between lines
    
    // Select all terminal lines except the cursor
    this.lines = Array.from(this.container.querySelectorAll('.term-line, .term-row')).filter(
      line => !line.classList.contains('term-line-cursor')
    );
    this.cursor = this.container.querySelector('.term-line-cursor');
    
    this.lineData = this.lines.map(line => {
      return {
        element: line,
        html: line.innerHTML,
        display: window.getComputedStyle(line).display || 'flex'
      };
    });
    
    this.init();
  }
  
  init() {
    // Pre-calculate full height before hiding lines to prevent layout shift on mobile
    const rect = this.container.getBoundingClientRect();
    if (rect.height > 0) {
      this.container.style.minHeight = `${rect.height}px`;
    }

    // Hide all lines initially to prepare for typing sequences
    this.lineData.forEach(data => {
      data.element.style.opacity = '0';
      data.element.style.display = 'none';
      data.element.style.transition = 'opacity 0.2s ease-out';
      data.element.style.willChange = 'opacity';
    });
    
    if (this.cursor) {
      this.cursor.style.display = 'none';
    }
    
    // Initialize standard fast IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.startTyping();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    
    observer.observe(this.container);
  }
  
  async startTyping() {
    for (let i = 0; i < this.lineData.length; i++) {
      const data = this.lineData[i];
      const el = data.element;
      el.style.display = data.display;
      
      // Let's fade in and type
      requestAnimationFrame(() => {
        el.style.opacity = '1';
      });
      
      if (el.classList.contains('term-row')) {
        const label = el.querySelector('.term-label');
        const val = el.querySelector('.term-value');
        if (label && val) {
          const originalLabel = label.textContent || '';
          const originalVal = val.textContent || '';
          
          label.textContent = '';
          val.textContent = '';
          
          await this.typeText(label, originalLabel);
          await this.typeText(val, originalVal);
        } else {
          el.innerHTML = data.html; 
        }
      } else if (el.classList.contains('term-line')) {
        const span = el.querySelector('span');
        if (span) {
          const originalSpanHtml = span.outerHTML;
          const fullText = el.textContent || '';
          const spanText = span.textContent || '';
          const remainingText = fullText.slice(spanText.length);
          
          el.innerHTML = '';
          el.insertAdjacentHTML('beforeend', originalSpanHtml);
          const activeSpan = el.querySelector('span');
          if (activeSpan) {
            activeSpan.textContent = '';
            await this.typeText(activeSpan, spanText);
          }
          
          const textNode = document.createTextNode('');
          el.appendChild(textNode);
          await this.typeText(textNode, remainingText);
        } else {
          const originalText = el.textContent || '';
          el.textContent = '';
          await this.typeText(el, originalText);
        }
      } else {
        el.innerHTML = data.html;
      }
      
      // Remove will-change to release resource after animations conclude
      el.style.willChange = 'auto';
      await this.sleep(this.lineDelay);
    }
    
    if (this.cursor) {
      this.cursor.style.display = 'block';
      this.cursor.style.opacity = '1';
    }
  }
  
  typeText(element, text) {
    if (!text) return Promise.resolve();
    return new Promise(resolve => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          const char = text[index];
          if (element.nodeType === Node.TEXT_NODE) {
            element.appendData(char);
          } else {
            element.textContent += char;
          }
          index++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, this.speed);
    });
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Auto-boot typewriter sequence when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  const terminalBody = document.querySelector('.tech-terminal-body');
  if (terminalBody) {
    new TerminalTypewriter('.tech-terminal-body', { speed: 10, lineDelay: 150 });
  }
});
