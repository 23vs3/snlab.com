/**
 * 动态加载共享导航栏组件
 * 参考 Bang & Olufsen 的实现方式
 */
async function loadHeader() {
  try {
    // 获取当前页面路径，判断是否为首页
    // 首页路径：/, /index.html
    const pathname = window.location.pathname;
    const isIndexPage = pathname === '/' || pathname === '/index.html';
    
    // 加载 header HTML
    const response = await fetch('/src/components/header.html');
    if (!response.ok) {
      throw new Error(`Failed to load header: ${response.statusText}`);
    }
    
    const headerHTML = await response.text();
    
    // 创建临时容器来解析 HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = headerHTML.trim();
    const headerElement = tempDiv.firstElementChild;
    
    // 如果页面已经有 header，替换它；否则在 body 开头插入
    const existingHeader = document.querySelector('header');
    if (existingHeader) {
      existingHeader.replaceWith(headerElement);
    } else {
      // 查找 body 开头的插入点
      const topAnchor = document.getElementById('top');
      if (topAnchor) {
        topAnchor.insertAdjacentElement('afterend', headerElement);
      } else {
        document.body.insertBefore(headerElement, document.body.firstChild);
      }
    }
    
    // 根据当前页面位置更新链接路径
    const brandLink = document.getElementById('header-brand');
    const allNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-links a');
    
    if (isIndexPage) {
      // 首页：使用锚点链接
      if (brandLink) {
        brandLink.href = '#top';
      }
      
      allNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('index.html#')) {
          link.href = href.replace('index.html#', '#');
        }
      });
    } else {
      // 非首页：使用绝对路径
      if (brandLink) {
        brandLink.href = '/';
      }
      
      allNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('index.html#')) {
          // 将 index.html#products 改为 /#products
          link.href = href.replace('index.html#', '/#');
        } else if (href && href === 'index.html') {
          link.href = '/';
        }
      });
    }
    
    // 初始化移动端菜单交互（如果还没有初始化）
    initMobileMenu();
    
    // 初始化国际化（header 加载后，延迟一点确保按钮已渲染）
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.setupLangToggleAfterHeaderLoad) {
        window.setupLangToggleAfterHeaderLoad();
      } else {
        // 如果函数还没有加载，再等一会
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.setupLangToggleAfterHeaderLoad) {
            window.setupLangToggleAfterHeaderLoad();
          }
        }, 300);
      }
    }, 150);
    
  } catch (error) {
    console.error('Error loading header:', error);
    // 降级方案：显示一个简单的 header
    const fallbackHeader = document.createElement('header');
    fallbackHeader.innerHTML = `
      <div class="container nav-bar">
        <a href="index.html" class="brand">SINIAN LAB</a>
      </div>
    `;
    const existingHeader = document.querySelector('header');
    if (existingHeader) {
      existingHeader.replaceWith(fallbackHeader);
    } else {
      document.body.insertBefore(fallbackHeader, document.body.firstChild);
    }
  }
}

/**
 * 初始化移动端菜单交互
 */
function initMobileMenu() {
  // 使用 setTimeout 确保 DOM 已经更新
  setTimeout(() => {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!menuToggle || !mobileMenu) {
      console.warn('Menu elements not found, retrying...');
      // 如果元素还没准备好，稍后重试
      setTimeout(initMobileMenu, 100);
      return;
    }
    
    // 避免重复初始化 - 检查是否已经绑定过事件
    if (menuToggle.dataset.initialized === 'true') {
      return;
    }
    menuToggle.dataset.initialized = 'true';
    
    const navLinks = mobileMenu.querySelectorAll('.mobile-nav-links a');
    
    // 切换菜单显示/隐藏
    function toggleMenu() {
      const isActive = mobileMenu.classList.contains('active');
      
      if (isActive) {
        // 关闭菜单
        mobileMenu.classList.add('closing');
        setTimeout(() => {
          mobileMenu.classList.remove('active', 'closing');
          menuToggle.classList.remove('active');
          menuToggle.setAttribute('aria-label', '打开菜单');
          menuToggle.setAttribute('aria-expanded', 'false');
        }, 300);
      } else {
        // 打开菜单
        mobileMenu.classList.add('active');
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-label', '关闭菜单');
        menuToggle.setAttribute('aria-expanded', 'true');
      }
    }
    
    // 点击菜单按钮
    menuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });
    
    // 点击菜单链接后关闭菜单
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.add('closing');
        setTimeout(() => {
          mobileMenu.classList.remove('active', 'closing');
          menuToggle.classList.remove('active');
          menuToggle.setAttribute('aria-label', '打开菜单');
          menuToggle.setAttribute('aria-expanded', 'false');
        }, 300);
      });
    });
    
    // 点击页面其他地方关闭菜单
    document.addEventListener('click', function(e) {
      if (mobileMenu.classList.contains('active') && 
          !mobileMenu.contains(e.target) && 
          !menuToggle.contains(e.target)) {
        toggleMenu();
      }
    });
    
    // 窗口大小改变时重置菜单状态
    window.addEventListener('resize', function() {
      if (window.innerWidth > 680) {
        mobileMenu.classList.remove('active', 'closing');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-label', '打开菜单');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
    
    // 滑动页面时关闭菜单
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      if (mobileMenu.classList.contains('active')) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          mobileMenu.classList.add('closing');
          setTimeout(() => {
            mobileMenu.classList.remove('active', 'closing');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-label', '打开菜单');
            menuToggle.setAttribute('aria-expanded', 'false');
          }, 150);
        }, 50);
      }
    });
  }, 50);
}

// 页面加载完成后自动加载 header
// 确保在 DOM 准备好后执行
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(loadHeader, 0);
    });
  } else {
    // DOM 已经准备好，立即执行
    setTimeout(loadHeader, 0);
  }
})();

