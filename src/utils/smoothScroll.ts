export class SmoothScroll {
  constructor() {
    this.init();
  }

  private init(): void {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      });
    });
  }

  public destroy(): void {
    // 清理事件监听器（如果需要的话）
  }
}
