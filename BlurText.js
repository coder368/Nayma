/**
 * BlurText.js
 * High-performance Vanilla JS equivalent of the React BlurText component.
 * Uses IntersectionObserver and direct CSS transition attributes for modern, hardware-accelerated animations.
 */

class BlurText {
  constructor(element, options = {}) {
    if (!element) return;
    this.el = element;

    this.options = {
      text: options.text || element.textContent || "",
      delay: options.delay !== undefined ? options.delay : 120,
      className: options.className || "",
      animateBy: options.animateBy || "words",
      direction: options.direction || "top",
      threshold: options.threshold !== undefined ? options.threshold : 0,
      rootMargin: options.rootMargin || "0px",
      stepDuration: options.stepDuration || 0.4,
      onComplete: options.onComplete || (() => {}),
      ...options
    };

    this.inView = false;
    this.completeTimeout = null;
    this.init();
  }

  init() {
    if (this.options.threshold !== undefined) {
      this.setupIntersectionObserver();
    } else {
      this.inView = true;
      this.startAnimation();
    }
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.inView = true;
        this.startAnimation();
        if (this.observer) {
          this.observer.unobserve(this.el);
        }
      }
    }, {
      threshold: this.options.threshold,
      rootMargin: this.options.rootMargin
    });
    this.observer.observe(this.el);
  }

  setText(newText) {
    this.options.text = newText;
    if (this.inView) {
      this.startAnimation();
    }
  }

  startAnimation() {
    // Clear previous elements
    this.el.innerHTML = "";

    const text = this.options.text;
    const elements = this.options.animateBy === "words" ? text.split(" ") : text.split("");
    const yStart = this.options.direction === "top" ? "-30px" : "30px";
    const totalElements = elements.length;

    elements.forEach((segment, index) => {
      const span = document.createElement("span");
      span.className = `blur-text-char inline-block ${this.options.className}`;
      span.style.display = "inline-block";
      span.style.willChange = "transform, filter, opacity";
      
      // Preserve double/single spaces or empty characters
      if (segment === "" || segment === " ") {
        span.textContent = "\u00A0";
      } else {
        span.textContent = segment;
      }

      // Initial state
      span.style.filter = "blur(10px)";
      span.style.opacity = "0";
      span.style.transform = `translate3d(0, ${yStart}, 0)`;
      span.style.transition = `filter ${this.options.stepDuration}s cubic-bezier(0.25, 1, 0.5, 1), opacity ${this.options.stepDuration}s cubic-bezier(0.25, 1, 0.5, 1), transform ${this.options.stepDuration}s cubic-bezier(0.25, 1, 0.5, 1)`;
      
      this.el.appendChild(span);

      // Suffix space for words
      if (this.options.animateBy === "words" && index < totalElements - 1) {
        const spaceSpan = document.createElement("span");
        spaceSpan.textContent = "\u00A0";
        spaceSpan.style.display = "inline-block";
        this.el.appendChild(spaceSpan);
      }

      // Trigger transition with stagger delay
      const staggerDelay = index * this.options.delay;
      setTimeout(() => {
        requestAnimationFrame(() => {
          span.style.filter = "blur(0px)";
          span.style.opacity = "1";
          span.style.transform = "translate3d(0, 0, 0)";
          
          // Clear will-change after transition is finished
          setTimeout(() => {
            span.style.willChange = "auto";
          }, this.options.stepDuration * 1000);
        });
      }, staggerDelay);
    });

    // Fire onComplete once the last element finishes transition
    const totalDuration = (totalElements - 1) * this.options.delay + (this.options.stepDuration * 1000);
    if (this.completeTimeout) clearTimeout(this.completeTimeout);
    this.completeTimeout = setTimeout(() => {
      this.options.onComplete();
    }, totalDuration);
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.completeTimeout) {
      clearTimeout(this.completeTimeout);
    }
  }
}

window.BlurText = BlurText;
