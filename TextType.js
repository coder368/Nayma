/**
 * TextType.js
 * High-performance Vanilla JS typewriter effect.
 * Directly replaces BlurText or DecryptedText roles with typing, deleting, and blinking cursor capabilities.
 */

class TextType {
  constructor(element, options = {}) {
    if (!element) return;
    this.el = element;

    this.options = {
      text: options.text || "",
      typingSpeed: options.typingSpeed !== undefined ? options.typingSpeed : 60,
      deletingSpeed: options.deletingSpeed !== undefined ? options.deletingSpeed : 35,
      pauseDuration: options.pauseDuration !== undefined ? options.pauseDuration : 1800,
      initialDelay: options.initialDelay !== undefined ? options.initialDelay : 0,
      loop: options.loop !== undefined ? options.loop : true,
      showCursor: options.showCursor !== undefined ? options.showCursor : true,
      cursorCharacter: options.cursorCharacter || "|",
      className: options.className || "",
      onSentenceComplete: options.onSentenceComplete || null,
      ...options
    };

    this.textArray = Array.isArray(this.options.text) 
      ? this.options.text 
      : [this.options.text];

    this.currentTextIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.displayedText = "";
    this.timeout = null;

    this.init();
  }

  init() {
    // Wrap element content
    this.el.innerHTML = "";
    
    this.contentSpan = document.createElement("span");
    this.contentSpan.className = "text-type__content";
    this.el.appendChild(this.contentSpan);

    if (this.options.showCursor) {
      this.cursorSpan = document.createElement("span");
      this.cursorSpan.className = "text-type__cursor";
      this.cursorSpan.textContent = this.options.cursorCharacter;
      this.cursorSpan.style.marginLeft = "0.15rem";
      this.cursorSpan.style.display = "inline-block";
      this.el.appendChild(this.cursorSpan);
      
      // Infinite cursor blink
      const blinkMs = (this.options.cursorBlinkDuration || 0.5) * 1000;
      this.blinkInterval = setInterval(() => {
        if (this.cursorSpan) {
          this.cursorSpan.style.opacity = this.cursorSpan.style.opacity === "0" ? "1" : "0";
        }
      }, blinkMs);
    }

    if (this.options.className) {
      this.el.classList.add(...this.options.className.split(" ").filter(Boolean));
    }

    // Start with initial delay
    this.timeout = setTimeout(() => {
      this.tick();
    }, this.options.initialDelay);
  }

  tick() {
    const currentText = this.textArray[this.currentTextIndex];

    if (this.isDeleting) {
      if (this.currentCharIndex > 0) {
        this.currentCharIndex--;
        this.displayedText = currentText.substring(0, this.currentCharIndex);
        this.contentSpan.textContent = this.displayedText;
        this.timeout = setTimeout(() => this.tick(), this.options.deletingSpeed);
      } else {
        // Finished deleting
        this.isDeleting = false;
        if (this.currentTextIndex === this.textArray.length - 1 && !this.options.loop) {
          return; // Stop if loop = false and finished last item
        }
        if (this.options.onSentenceComplete) {
          this.options.onSentenceComplete(currentText, this.currentTextIndex);
        }
        this.currentTextIndex = (this.currentTextIndex + 1) % this.textArray.length;
        this.timeout = setTimeout(() => this.tick(), 500); // Wait briefly before starting next typing
      }
    } else {
      if (this.currentCharIndex < currentText.length) {
        this.currentCharIndex++;
        this.displayedText = currentText.substring(0, this.currentCharIndex);
        this.contentSpan.textContent = this.displayedText;
        this.timeout = setTimeout(() => this.tick(), this.options.typingSpeed);
      } else {
        // Finished typing one full sentence
        if (this.textArray.length > 1 || this.options.loop) {
          this.timeout = setTimeout(() => {
            this.isDeleting = true;
            this.tick();
          }, this.options.pauseDuration);
        } else {
          if (this.options.onSentenceComplete) {
            this.options.onSentenceComplete(currentText, this.currentTextIndex);
          }
        }
      }
    }
  }

  destroy() {
    if (this.timeout) clearTimeout(this.timeout);
    if (this.blinkInterval) clearInterval(this.blinkInterval);
  }
}

window.TextType = TextType;
