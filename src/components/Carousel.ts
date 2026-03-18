import type { CarouselConfig, CarouselState, PointerEventHandler, MediaEventHandler, SlideItem } from '../types/index.js';
import { createResponsivePictureElement } from '../utils/media.js';

export class Carousel {
  private carousel: HTMLElement;
  private track: HTMLElement;
  private slides: HTMLElement[];
  private btnPrev: HTMLButtonElement;
  private btnNext: HTMLButtonElement;
  private dotsWrap: HTMLElement;
  private dots: HTMLButtonElement[] = [];
  private allSlides: HTMLElement[] = [];
  
  private state: CarouselState;
  private config: CarouselConfig;
  private timerId: number | null = null;

  constructor(selector: string, config: Partial<CarouselConfig> = {}) {
    this.carousel = document.querySelector(selector) as HTMLElement;
    if (!this.carousel) {
      throw new Error(`Carousel element not found: ${selector}`);
    }

    this.track = this.carousel.querySelector('.track') as HTMLElement;
    this.btnPrev = this.carousel.querySelector('.prev') as HTMLButtonElement;
    this.btnNext = this.carousel.querySelector('.next') as HTMLButtonElement;
    this.dotsWrap = this.carousel.querySelector('.dots') as HTMLElement;

    this.config = {
      intervalMs: 3000,
      transitionMs: 450,
      autoPlay: true,
      ...config
    };

    this.state = {
      currentIndex: 0,
      isPlaying: false,
      isPointerDown: false,
      startX: 0,
      deltaX: 0
    };

    // 如果提供了 slides 数据数组，先渲染 slides
    if (this.config.slides && this.config.slides.length > 0) {
      this.renderSlides(this.config.slides);
    }

    // 然后获取渲染后的 slides（如果没有提供数据，使用现有的 HTML）
    this.slides = Array.from(this.track.children) as HTMLElement[];

    this.init();
  }

  private init(): void {
    this.initializeDots();
    this.setupClones();
    this.bindEvents();
    this.goTo(0);
    if (this.config.autoPlay) {
      this.startAuto();
    }
  }

  /**
   * 根据数据数组渲染 slides
   */
  private renderSlides(slides: SlideItem[]): void {
    // 清空现有的 slides
    this.track.innerHTML = '';

    slides.forEach((item, index) => {
      const slideDiv = document.createElement('div');
      slideDiv.className = 'slide';

      if (item.type === 'image') {
        /**
         * 轮播图优化目标：
         * - 首张图通常是首页 LCP 候选，因此设为 eager + high，尽快出图。
         * - 其余 slide 设为 lazy + low，避免抢占首屏带宽。
         * - 使用 <picture> + srcset，让移动端不再下载桌面大图（不改变 CSS 布局）。
         */
        const mediaEl = createResponsivePictureElement({
          src: item.src,
          alt: item.alt || '',
          className: '',
          // 轮播通常占满容器
          sizes: '100vw',
          loading: index === 0 ? 'eager' : 'lazy',
          decoding: 'async',
          fetchPriority: index === 0 ? 'high' : 'low'
        });
        const img =
          mediaEl instanceof HTMLImageElement
            ? mediaEl
            : (mediaEl.querySelector('img') as HTMLImageElement | null);
        
        // 添加图片加载错误处理
        img?.addEventListener('error', (e) => {
          console.error(`轮播图图片加载失败 [${index}]:`, item.src, e);
          // 可选：显示占位符或错误提示
          if (img) {
            img.style.backgroundColor = '#000';
            img.style.display = 'flex';
            img.style.alignItems = 'center';
            img.style.justifyContent = 'center';
            img.style.color = '#fff';
            img.style.fontSize = '14px';
          }
          // 创建一个错误提示元素
          const errorText = document.createElement('span');
          errorText.textContent = '图片加载失败';
          errorText.style.position = 'absolute';
          errorText.style.color = '#fff';
          errorText.style.fontSize = '14px';
          slideDiv.appendChild(errorText);
        });
        
        // 添加图片加载成功日志（仅在开发环境）
        if (import.meta.env.DEV) {
          img?.addEventListener('load', () => {
            console.log(`轮播图图片加载成功 [${index}]:`, item.src);
          });
        }
        
        slideDiv.appendChild(mediaEl);
      } else if (item.type === 'video') {
        const video = document.createElement('video');
        video.src = item.src;
        if (item.poster) {
          video.poster = item.poster;
        }
        video.playsInline = true;
        video.muted = true;
        video.preload = 'metadata';
        video.controls = item.controls !== false;
        
        // 添加视频加载错误处理
        video.addEventListener('error', (e) => {
          console.error(`轮播图视频加载失败 [${index}]:`, item.src, e);
        });
        
        slideDiv.appendChild(video);
      }

      this.track.appendChild(slideDiv);
    });
  }

  private initializeDots(): void {
    this.slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `转到第 ${i + 1} 张`);
      dot.addEventListener('click', () => this.goTo(i));
      this.dotsWrap.appendChild(dot);
    });
    this.dots = Array.from(this.dotsWrap.children) as HTMLButtonElement[];
  }

  private setupClones(): void {
    const firstClone = this.slides[0].cloneNode(true) as HTMLElement;
    const lastClone = this.slides[this.slides.length - 1].cloneNode(true) as HTMLElement;
    this.track.insertBefore(lastClone, this.track.firstChild);
    this.track.appendChild(firstClone);
    this.allSlides = Array.from(this.track.children) as HTMLElement[];
  }

  private bindEvents(): void {
    // 按钮事件
    this.btnNext.addEventListener('click', () => { this.next(); this.startAuto(); });
    this.btnPrev.addEventListener('click', () => { this.prev(); this.startAuto(); });

    // 键盘导航
    this.carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { this.next(); this.startAuto(); }
      if (e.key === 'ArrowLeft') { this.prev(); this.startAuto(); }
    });

    // 悬停/聚焦暂停
    this.carousel.addEventListener('mouseenter', () => this.stopAuto());
    this.carousel.addEventListener('mouseleave', () => this.startAuto());
    this.carousel.addEventListener('focusin', () => this.stopAuto());
    this.carousel.addEventListener('focusout', () => this.startAuto());

    // 触摸/拖拽滑动
    this.track.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.onPointerDown(e.clientX);
    });
    
    const handleMouseMove = (e: MouseEvent) => this.onPointerMove(e.clientX);
    const handleMouseUp = () => {
      this.onPointerUp();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    this.track.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.onPointerDown(e.touches[0].clientX);
    }, { passive: false });
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      this.onPointerMove(e.touches[0].clientX);
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      this.onPointerUp();
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
    
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
  }

  private updateDots(): void {
    this.dots.forEach((d, i) => d.setAttribute('aria-selected', String(i === this.state.currentIndex)));
  }

  private getVisualIndex(): number {
    return this.state.currentIndex + 1;
  }

  private setTransformByVisualIndex(vIndex: number, withTransition: boolean = true): void {
    if (!withTransition) this.track.style.transition = 'none';
    this.track.style.transform = `translateX(-${vIndex * 100}%)`;
    if (!withTransition) {
      void this.track.offsetHeight;
      this.track.style.transition = '';
    }
  }

  public goTo(index: number): void {
    const total = this.slides.length;
    this.state.currentIndex = (index + total) % total;
    this.setTransformByVisualIndex(this.getVisualIndex(), true);
    this.updateDots();
    this.handleMediaPlayback();
  }

  public next(): void {
    const total = this.slides.length;
    if (this.state.currentIndex === total - 1) {
      this.setTransformByVisualIndex(total + 1, true);
      const onEnd = () => {
        this.track.removeEventListener('transitionend', onEnd);
        this.state.currentIndex = 0;
        this.setTransformByVisualIndex(this.getVisualIndex(), false);
        this.updateDots();
        this.handleMediaPlayback();
      };
      this.track.addEventListener('transitionend', onEnd, { once: true });
    } else {
      this.goTo(this.state.currentIndex + 1);
    }
  }

  public prev(): void {
    const total = this.slides.length;
    if (this.state.currentIndex === 0) {
      this.setTransformByVisualIndex(0, true);
      const onEnd = () => {
        this.track.removeEventListener('transitionend', onEnd);
        this.state.currentIndex = total - 1;
        this.setTransformByVisualIndex(this.getVisualIndex(), false);
        this.updateDots();
        this.handleMediaPlayback();
      };
      this.track.addEventListener('transitionend', onEnd, { once: true });
    } else {
      this.goTo(this.state.currentIndex - 1);
    }
  }

  public startAuto(): void {
    this.stopAuto();
    this.timerId = window.setInterval(() => this.next(), this.config.intervalMs);
    this.state.isPlaying = true;
  }

  public stopAuto(): void {
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.state.isPlaying = false;
  }

  private onPointerDown: PointerEventHandler = (x) => {
    this.state.isPointerDown = true;
    this.state.startX = x;
    this.state.deltaX = 0;
    this.stopAuto();
  };

  private onPointerMove: PointerEventHandler = (x) => {
    if (!this.state.isPointerDown) return;
    this.state.deltaX = x - this.state.startX;
    const percent = (this.state.deltaX / this.carousel.clientWidth) * 100;
    this.track.style.transition = 'none';
    
    // 限制滑动范围，防止过度滑动
    const maxPercent = 30; // 最大滑动30%
    const clampedPercent = Math.max(-maxPercent, Math.min(maxPercent, percent));
    
    this.track.style.transform = `translateX(calc(${-this.getVisualIndex() * 100}% + ${-clampedPercent}%))`;
  };

  private onPointerUp = (): void => {
    if (!this.state.isPointerDown) return;
    this.state.isPointerDown = false;
    this.track.style.transition = '';
    
    // 防止在边界位置滑动时出现异常
    const threshold = this.carousel.clientWidth * 0.15; // 降低阈值，提高灵敏度
    
    if (Math.abs(this.state.deltaX) > threshold) {
      if (this.state.deltaX > 0) {
        // 向右滑动，显示上一张
        this.prev();
      } else {
        // 向左滑动，显示下一张
        this.next();
      }
    } else {
      // 滑动距离不够，回到当前位置
      this.goTo(this.state.currentIndex);
    }
    
    // 重置状态
    this.state.deltaX = 0;
    this.state.startX = 0;
    
    this.startAuto();
  };

  private handleMediaPlayback(): void {
    // 暂停所有视频
    this.allSlides.forEach((slide) => {
      const video = slide.querySelector('video') as HTMLVideoElement;
      if (video) video.pause();
    });

    // 当前如包含视频则自动播放并暂停自动轮播
    const currentSlide = this.allSlides[this.getVisualIndex()];
    const video = currentSlide.querySelector('video') as HTMLVideoElement;
    if (video) {
      this.stopAuto();
      if (!video.loop) video.currentTime = 0;
      
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {/* 静默失败 */});
      }

      const onEnded: MediaEventHandler = () => {
        video.removeEventListener('ended', onEnded);
        this.startAuto();
        this.next();
      };
      video.addEventListener('ended', onEnded);

      const onClick: MediaEventHandler = () => { 
        video.muted = !video.muted; 
      };
      video.addEventListener('click', onClick, { once: true });
    }
  }

  public destroy(): void {
    this.stopAuto();
    // 清理事件监听器
    this.dots.forEach(dot => {
      dot.removeEventListener('click', () => this.goTo(0));
    });
  }
}

