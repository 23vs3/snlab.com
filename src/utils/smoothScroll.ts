export class SmoothScroll {
  constructor() {
    this.init();
  }

  private init(): void {
    // 动态设置 section 的 scroll-margin-top
    this.updateScrollMargin();
    
    // 处理页面加载时的锚点滚动
    const handleInitialHash = () => {
      const hash = window.location.hash;
      if (hash && hash !== '#') {
        let scrollToAnchor = hash;
        try {
          if (typeof Storage !== 'undefined' && window.sessionStorage) {
            const storedAnchor = sessionStorage.getItem('scrollToAnchor');
            if (storedAnchor) {
              scrollToAnchor = storedAnchor;
              sessionStorage.removeItem('scrollToAnchor');
            }
          }
        } catch (e) {
          // sessionStorage 不可用，使用 hash
          console.warn('[smoothScroll] sessionStorage not available');
        }
        
        // 延迟一点，确保页面完全加载（包括 header）
        setTimeout(() => {
          const target = document.querySelector(scrollToAnchor);
          if (target) {
            const header = document.querySelector('header');
            const headerHeight = header ? header.getBoundingClientRect().height : 0;
            const isMobile = window.innerWidth <= 680;
            const extraMargin = isMobile ? 24 : 20;
            const offset = headerHeight + extraMargin;
            const targetRect = target.getBoundingClientRect();
            const currentScrollY = window.scrollY || document.documentElement.scrollTop;
            const targetScrollY = currentScrollY + targetRect.top - offset;
            // 平滑滚动（检查浏览器支持）
            if (CSS.supports('scroll-behavior', 'smooth')) {
              window.scrollTo({
                top: Math.max(0, targetScrollY),
                behavior: 'smooth'
              });
            } else {
              // 降级为即时滚动（Safari 14 等旧浏览器）
              window.scrollTo(0, Math.max(0, targetScrollY));
            }
          }
        }, 500); // 增加延迟，确保 header 已加载
      }
    };
    
    // 检查是否有需要滚动的锚点（从其他页面跳转过来或页面加载时的 hash）
    handleInitialHash();
    
    // 如果 header 还未加载，等待 header 加载完成后再处理
    if (!document.querySelector('header')) {
      window.addEventListener('headerLoaded', handleInitialHash, { once: true });
    }
    
    // 监听窗口大小变化，更新 scroll-margin-top
    window.addEventListener('resize', () => {
      this.updateScrollMargin();
    });
    
    // 监听 header 加载完成事件，更新 scroll-margin-top
    window.addEventListener('headerLoaded', () => {
      setTimeout(() => {
        this.updateScrollMargin();
      }, 100);
    });
    
    // 使用事件委托，监听所有包含锚点的链接点击
    document.addEventListener('click', (e) => {
      const link = (e.target as HTMLElement).closest('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href || !href.includes('#')) return;
      
      // 检查是否是外部链接（包含 http:// 或 https://）
      if (href.startsWith('http://') || href.startsWith('https://')) {
        // 外部链接，不处理
        return;
      }
      
      // 检查是否是跨页面导航（如 /#products 或 index.html#products）
      const currentPath = window.location.pathname;
      const isIndexPage = currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/index.html');
      
      // 提取锚点部分（支持 #products 和 /#products 和 index.html#products）
      const hashIndex = href.indexOf('#');
      const anchor = href.substring(hashIndex);
      if (!anchor || anchor === '#') return;
      
      // 如果链接包含路径（如 /#products 或 index.html#products），且不在首页，需要先跳转
      const pathBeforeHash = href.substring(0, hashIndex);
      if (pathBeforeHash && !isIndexPage) {
        // 跨页面导航，让浏览器默认行为处理（跳转到首页后再滚动）
        // 但我们需要在目标页面加载后滚动
        if (pathBeforeHash === '/' || pathBeforeHash === '/index.html' || pathBeforeHash === 'index.html') {
          // 保存锚点信息，让目标页面加载后滚动
          try {
            if (typeof Storage !== 'undefined' && window.sessionStorage) {
              sessionStorage.setItem('scrollToAnchor', anchor);
            }
          } catch (e) {
            // sessionStorage 不可用，降级处理
            console.warn('[smoothScroll] sessionStorage not available');
          }
        }
        return; // 不阻止默认行为，让页面跳转
      }

      // 同页面的锚点链接，处理平滑滚动
      const target = document.querySelector(anchor);
      if (!target) {
        return; // 目标不存在，让浏览器默认行为处理
      }

      e.preventDefault();
      
      // 更新 URL hash（保持浏览器历史记录）
      if (window.history.pushState) {
        window.history.pushState(null, '', anchor);
      } else {
        window.location.hash = anchor;
      }
      
      // 计算 header 高度和额外边距
      const header = document.querySelector('header');
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const isMobile = window.innerWidth <= 680;
      const extraMargin = isMobile ? 24 : 20;
      const offset = headerHeight + extraMargin;
      
      // 获取目标元素的位置
      const targetRect = target.getBoundingClientRect();
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;
      
      // 计算目标滚动位置
      const targetScrollY = currentScrollY + targetRect.top - offset;
      const finalScrollY = Math.max(0, targetScrollY);
      
      // 平滑滚动（检查浏览器支持）
      if (CSS.supports('scroll-behavior', 'smooth')) {
        window.scrollTo({
          top: finalScrollY,
          behavior: 'smooth'
        });
      } else {
        // 降级为即时滚动（Safari 14 等旧浏览器）
        window.scrollTo(0, finalScrollY);
      }
    });
  }
  
  private updateScrollMargin(): void {
    const header = document.querySelector('header');
    if (!header) return;
    
    const headerHeight = header.getBoundingClientRect().height;
    const isMobile = window.innerWidth <= 680;
    const extraMargin = isMobile ? 24 : 20;
    const scrollMargin = headerHeight + extraMargin;
    
    // 为所有 section 设置 scroll-margin-top
    document.querySelectorAll('section[id]').forEach((section) => {
      (section as HTMLElement).style.scrollMarginTop = `${scrollMargin}px`;
    });
  }

  public destroy(): void {
    // 清理事件监听器（如果需要的话）
  }
}
