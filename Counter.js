/**
 * Counter.js
 * Hardware-accelerated and accessible number animator.
 * Uses IntersectionObserver, requestAnimationFrame, and easeOutQuad (1200ms duration) with a counted ref shield.
 */

class Counter {
  constructor(container, options = {}) {
    if (!container) return;
    this.container = container;

    this.options = {
      value: options.value !== undefined ? options.value : 0,
      fontSize: options.fontSize || 24,
      textColor: options.textColor || "inherit",
      fontWeight: options.fontWeight || "bold",
      suffix: options.suffix || "",
      duration: options.duration || 1200,
      triggerOnScroll: options.triggerOnScroll !== undefined ? options.triggerOnScroll : true,
      ...options
    };

    this.hasCounted = false; // counted ref shield to prevent infinite recalculation loops
    this.currentValue = 0;
    this.animationFrameId = null;
    this.init();
  }

  init() {
    this.container.innerHTML = "";
    this.container.classList.add("counter-container");
    this.container.style.fontSize = `${this.options.fontSize}px`;
    this.container.style.color = this.options.textColor;
    this.container.style.fontWeight = this.options.fontWeight;
    this.container.style.display = "inline-flex";
    this.container.style.alignItems = "center";
    this.container.style.lineHeight = "1";

    // Value segment
    this.valueEl = document.createElement("span");
    this.valueEl.className = "counter-value";
    this.valueEl.style.willChange = "transform, opacity";
    this.valueEl.textContent = "0";
    this.container.appendChild(this.valueEl);

    // Suffix segment (e.g. 'k' or 'M')
    if (this.options.suffix) {
      this.suffixEl = document.createElement("span");
      this.suffixEl.className = "counter-suffix";
      this.suffixEl.textContent = this.options.suffix;
      this.suffixEl.style.marginLeft = "2px";
      this.container.appendChild(this.suffixEl);
    }

    if (this.options.triggerOnScroll) {
      this.setupIntersectionObserver();
    } else {
      this.startCountAnimation();
    }
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!this.hasCounted) {
            this.startCountAnimation();
            this.hasCounted = true; // Set counted ref true
          }
        } else {
          // Reset counted state to enable animation replay when entering viewport subsequent times
          this.hasCounted = false;
          this.currentValue = 0;
          this.valueEl.textContent = "0";
          if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
          }
        }
      });
    }, { threshold: 0.15 });

    this.observer.observe(this.container);
  }

  startCountAnimation() {
    const startValue = 0;
    const targetValue = parseFloat(this.options.value);
    const duration = this.options.duration;
    let startTime = null;

    const easeOutQuad = (t) => t * (2 - t);

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      const easedProgress = easeOutQuad(progress);
      this.currentValue = startValue + easedProgress * (targetValue - startValue);

      const decimals = this.options.value.toString().indexOf('.') !== -1 ? 1 : 0;
      this.valueEl.textContent = this.formatNumber(this.currentValue, decimals);

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.valueEl.textContent = this.formatNumber(targetValue, decimals);
        this.valueEl.style.willChange = "auto"; // release hardware resource
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  formatNumber(val, decimals) {
    // Built-in support for scaling standard large numbers with K/M formatting if required
    if (val >= 1000000) {
      return (val / 1000000).toFixed(decimals || 1) + "M";
    } else if (val >= 1000) {
      return (val / 1000).toFixed(decimals || 1) + "K";
    }
    
    // Check if we already have decimals, format float nicely
    if (decimals > 0) {
      return val.toFixed(decimals);
    }
    return Math.floor(val).toString();
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

window.Counter = Counter;
