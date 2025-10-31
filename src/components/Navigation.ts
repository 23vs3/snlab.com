export class Navigation {
  private menuBtn: HTMLButtonElement | null;
  private navLinks: HTMLElement | null;

  constructor() {
    this.menuBtn = document.querySelector('.menu-btn');
    this.navLinks = document.querySelector('.nav-links');
    this.init();
  }

  private init(): void {
    if (!this.menuBtn || !this.navLinks) return;

    this.menuBtn.addEventListener('click', () => {
      const isOpen = getComputedStyle(this.navLinks as HTMLElement).display !== 'none';
      (this.navLinks as HTMLElement).style.display = isOpen ? 'none' : 'flex';
    });
  }

  public destroy(): void {
    if (this.menuBtn) {
      this.menuBtn.removeEventListener('click', () => {});
    }
  }
}


