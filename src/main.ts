import { Carousel } from './components/Carousel.js';
import { Navigation } from './components/Navigation.js';
import { SmoothScroll } from './utils/smoothScroll.js';
import { carouselSlides } from './config/carousel-data.js';
import { initI18n } from './i18n/init-i18n.js';
import { renderProductsList } from './components/render-products.js';

class App {
  private carousel: Carousel | null = null;
  private navigation: Navigation | null = null;
  private smoothScroll: SmoothScroll | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    // 先初始化国际化，确保语言切换按钮可用
    initI18n();
    this.initializeCarousel();
    this.initializeNavigation();
    this.initializeSmoothScroll();
    this.initializeProducts();
  }

  private initializeProducts(): void {
    // 只在 index.html 页面渲染产品列表
    if (document.querySelector('#products-grid')) {
      renderProductsList();
    }
  }

  private initializeCarousel(): void {
    const carouselElement = document.querySelector('.carousel');
    if (carouselElement) {
      this.carousel = new Carousel('.carousel', {
        intervalMs: 3000,
        transitionMs: 450,
        autoPlay: true,
        slides: carouselSlides // 传入数据数组
      });
    }
  }

  private initializeNavigation(): void {
    this.navigation = new Navigation();
  }

  private initializeSmoothScroll(): void {
    this.smoothScroll = new SmoothScroll();
  }

  public destroy(): void {
    this.carousel?.destroy();
    this.navigation?.destroy();
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

// 导出供其他模块使用
export { App };

