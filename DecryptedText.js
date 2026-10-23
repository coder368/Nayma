class DecryptedText {
  constructor(element, options = {}) {
    this.el = element;
    this.text = options.text || "";
    this.speed = options.speed || 50;
    this.maxIterations = options.maxIterations || 10;
    this.sequential = options.sequential || false;
    this.revealDirection = options.revealDirection || 'start';
    this.useOriginalCharsOnly = options.useOriginalCharsOnly || false;
    this.characters = options.characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';
    this.className = options.className || '';
    this.parentClassName = options.parentClassName || '';
    this.encryptedClassName = options.encryptedClassName || '';
    this.onComplete = options.onComplete || (() => {});

    this.displayText = "";
    this.isAnimating = false;
    this.revealedIndices = new Set();
    this.availableChars = this.useOriginalCharsOnly
      ? Array.from(new Set(this.text.split(''))).filter(char => char !== ' ')
      : this.characters.split('');

    this.interval = null;
  }

  shuffleText(originalText, currentRevealed) {
    return originalText
      .split('')
      .map((char, i) => {
        if (char === ' ') return ' ';
        if (currentRevealed.has(i)) return originalText[i];
        return this.availableChars[Math.floor(Math.random() * this.availableChars.length)];
      })
      .join('');
  }

  getNextIndex(revealedSet, textLength) {
    switch (this.revealDirection) {
      case 'start':
        return revealedSet.size;
      case 'end':
        return textLength - 1 - revealedSet.size;
      case 'center': {
        const middle = Math.floor(textLength / 2);
        const offset = Math.floor(revealedSet.size / 2);
        const nextIndex = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;

        if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) {
          return nextIndex;
        }

        for (let i = 0; i < textLength; i++) {
          if (!revealedSet.has(i)) return i;
        }
        return 0;
      }
      default:
        return revealedSet.size;
    }
  }

  render() {
    this.el.innerHTML = '';
    const wrapper = document.createElement('span');
    if (this.parentClassName) wrapper.className = this.parentClassName;
    
    // Sr-only text for accessibility
    const srOnly = document.createElement('span');
    srOnly.style.position = 'absolute';
    srOnly.style.width = '1px';
    srOnly.style.height = '1px';
    srOnly.style.padding = '0';
    srOnly.style.margin = '-1px';
    srOnly.style.overflow = 'hidden';
    srOnly.style.clip = 'rect(0,0,0,0)';
    srOnly.style.border = '0';
    srOnly.textContent = this.text;
    wrapper.appendChild(srOnly);

    const visibleSpan = document.createElement('span');
    visibleSpan.setAttribute('aria-hidden', 'true');

    this.displayText.split('').forEach((char, index) => {
      const charSpan = document.createElement('span');
      const isRevealed = this.revealedIndices.has(index) || (!this.isAnimating);
      charSpan.className = isRevealed ? this.className : this.encryptedClassName;
      charSpan.textContent = char;
      visibleSpan.appendChild(charSpan);
    });

    wrapper.appendChild(visibleSpan);
    this.el.appendChild(wrapper);
  }

  start() {
    this.stop();
    this.isAnimating = true;
    this.revealedIndices = new Set();
    this.displayText = this.shuffleText(this.text, this.revealedIndices);
    this.render();

    let currentIteration = 0;

    this.interval = setInterval(() => {
      if (this.sequential) {
        if (this.revealedIndices.size < this.text.length) {
          const nextIndex = this.getNextIndex(this.revealedIndices, this.text.length);
          this.revealedIndices.add(nextIndex);
          this.displayText = this.shuffleText(this.text, this.revealedIndices);
        } else {
          this.finish();
        }
      } else {
        this.displayText = this.shuffleText(this.text, this.revealedIndices);
        currentIteration++;
        if (currentIteration >= this.maxIterations) {
          this.finish();
        }
      }
      this.render();
    }, this.speed);
  }

  finish() {
    this.stop();
    this.displayText = this.text;
    this.revealedIndices = new Set([...Array(this.text.length).keys()]);
    this.render();
    this.onComplete();
  }

  stop() {
    this.isAnimating = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  setText(newText) {
    this.text = newText;
    this.availableChars = this.useOriginalCharsOnly
      ? Array.from(new Set(this.text.split(''))).filter(char => char !== ' ')
      : this.characters.split('');
  }
}

window.DecryptedText = DecryptedText;
