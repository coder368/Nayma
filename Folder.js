// ── Folder Component (Vanilla JS) ──
// Converted from React Bits <Folder /> component

class FolderComponent {
  constructor(container, options = {}) {
    this.container = container;
    this.color = options.color || '#b588f7';
    this.size = options.size || 1;
    this.items = options.items || [];
    this.className = options.className || '';
    this.open = false;
    this.maxItems = 3;
    this.paperOffsets = Array.from({ length: this.maxItems }, () => ({ x: 0, y: 0 }));

    this.init();
  }

  darkenColor(hex, percent) {
    let color = hex.startsWith('#') ? hex.slice(1) : hex;
    if (color.length === 3) {
      color = color.split('').map(c => c + c).join('');
    }
    const num = parseInt(color, 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;
    r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
    g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
    b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  init() {
    const papers = this.items.slice(0, this.maxItems);
    while (papers.length < this.maxItems) {
      papers.push(null);
    }

    const folderBackColor = this.darkenColor(this.color, 0.08);
    const paper1 = this.darkenColor('#ffffff', 0.1);
    const paper2 = this.darkenColor('#ffffff', 0.05);
    const paper3 = '#ffffff';

    // Create wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = `folder-wrapper ${this.className}`;
    this.wrapper.style.transform = `scale(${this.size})`;

    // Create folder
    this.folderEl = document.createElement('div');
    this.folderEl.className = 'folder';
    this.folderEl.style.setProperty('--folder-color', this.color);
    this.folderEl.style.setProperty('--folder-back-color', folderBackColor);
    this.folderEl.style.setProperty('--paper-1', paper1);
    this.folderEl.style.setProperty('--paper-2', paper2);
    this.folderEl.style.setProperty('--paper-3', paper3);

    // Create folder back
    this.folderBack = document.createElement('div');
    this.folderBack.className = 'folder__back';

    // Create papers
    this.paperEls = [];
    papers.forEach((item, i) => {
      const paper = document.createElement('div');
      paper.className = `folder-paper folder-paper-${i + 1}`;

      if (item) {
        const content = document.createElement('div');
        content.className = 'paper-content';
        content.innerHTML = item;
        paper.appendChild(content);
      }

      paper.addEventListener('mousemove', (e) => this.handlePaperMouseMove(e, i));
      paper.addEventListener('mouseleave', (e) => this.handlePaperMouseLeave(e, i));

      this.paperEls.push(paper);
      this.folderBack.appendChild(paper);
    });

    // Create folder front panels
    const frontLeft = document.createElement('div');
    frontLeft.className = 'folder__front';

    const frontRight = document.createElement('div');
    frontRight.className = 'folder__front right';

    this.folderBack.appendChild(frontLeft);
    this.folderBack.appendChild(frontRight);

    this.folderEl.appendChild(this.folderBack);
    this.wrapper.appendChild(this.folderEl);

    // Click handler
    this.folderEl.addEventListener('click', () => this.handleClick());

    this.container.appendChild(this.wrapper);
  }

  handleClick() {
    this.open = !this.open;

    if (this.open) {
      this.folderEl.classList.add('open');
    } else {
      this.folderEl.classList.remove('open');
      this.paperOffsets = Array.from({ length: this.maxItems }, () => ({ x: 0, y: 0 }));
      this.paperEls.forEach(paper => {
        paper.style.removeProperty('--magnet-x');
        paper.style.removeProperty('--magnet-y');
      });
    }
  }

  handlePaperMouseMove(e, index) {
    if (!this.open) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) * 0.15;
    const offsetY = (e.clientY - centerY) * 0.15;
    this.paperOffsets[index] = { x: offsetX, y: offsetY };
    e.currentTarget.style.setProperty('--magnet-x', `${offsetX}px`);
    e.currentTarget.style.setProperty('--magnet-y', `${offsetY}px`);
  }

  handlePaperMouseLeave(e, index) {
    this.paperOffsets[index] = { x: 0, y: 0 };
    e.currentTarget.style.setProperty('--magnet-x', '0px');
    e.currentTarget.style.setProperty('--magnet-y', '0px');
  }
}
