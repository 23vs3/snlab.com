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
    // 使用多重检查确保在模块加载后也能初始化
    let retryCount = 0;
    const maxRetries = 50; // 增加重试次数（约 5 秒），确保在慢速网络下也能工作
    
    function ensureLangToggleInit() {
      retryCount++;
      
      // 优先尝试使用 setupLangToggleAfterHeaderLoad（如果可用）
      if (typeof window !== 'undefined' && window.setupLangToggleAfterHeaderLoad) {
        try {
          window.setupLangToggleAfterHeaderLoad();
          console.log('Language toggle initialized via setupLangToggleAfterHeaderLoad');
          return true; // 成功初始化
        } catch (e) {
          console.warn('Error calling setupLangToggleAfterHeaderLoad:', e);
        }
      }
      
      // 备用方案：如果 initI18n 可用，直接调用它
      if (typeof window !== 'undefined' && window.initI18n && typeof window.initI18n === 'function') {
        try {
          window.initI18n();
          console.log('Language toggle initialized via initI18n');
          return true; // 成功初始化
        } catch (e) {
          console.warn('Error calling initI18n:', e);
        }
      }
      
      // 如果 i18n 实例已存在但函数不可用，尝试手动初始化
      if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.setLang === 'function') {
        const langToggleDesktop = document.getElementById('lang-toggle');
        const langToggleMobile = document.getElementById('lang-toggle-mobile');
        const langDropdownDesktop = document.getElementById('lang-dropdown');
        const langDropdownMobile = document.getElementById('lang-dropdown-mobile');
        
        if ((langToggleDesktop && langDropdownDesktop) || (langToggleMobile && langDropdownMobile)) {
          console.log('Attempting manual language toggle initialization...');
          try {
            // 手动绑定事件处理器
            setupLangToggleManually();
            console.log('Language toggle initialized manually');
            return true; // 成功初始化
          } catch (e) {
            console.error('Error in manual initialization:', e);
          }
        }
      }
      
      // 如果函数还没有加载且未超过最大重试次数，继续重试
      if (retryCount < maxRetries) {
        setTimeout(ensureLangToggleInit, 100);
      } else {
        console.warn('Language toggle initialization failed after', maxRetries, 'retries');
        // 最后尝试手动初始化
        const langToggleDesktop = document.getElementById('lang-toggle');
        const langToggleMobile = document.getElementById('lang-toggle-mobile');
        if (langToggleDesktop || langToggleMobile) {
          console.log('Final attempt: manual initialization');
          setupLangToggleManually();
        }
      }
      
      return false;
    }
    
    // 手动初始化语言切换按钮的备用函数
    function setupLangToggleManually() {
      const langToggleDesktop = document.getElementById('lang-toggle');
      const langDropdownDesktop = document.getElementById('lang-dropdown');
      const langToggleMobile = document.getElementById('lang-toggle-mobile');
      const langDropdownMobile = document.getElementById('lang-dropdown-mobile');
      
      if (!window.i18n || typeof window.i18n.setLang !== 'function') {
        console.warn('i18n not available for manual setup');
        return;
      }
      
      // 设置桌面端
      if (langToggleDesktop && langDropdownDesktop && !langToggleDesktop.dataset.langToggleBound) {
        langToggleDesktop.dataset.langToggleBound = 'true';
        langToggleDesktop.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const isOpen = langDropdownDesktop.classList.contains('show');
          if (isOpen) {
            langDropdownDesktop.classList.remove('show');
            langToggleDesktop.setAttribute('aria-expanded', 'false');
          } else {
            // 关闭其他下拉菜单
            if (langDropdownMobile) langDropdownMobile.classList.remove('show');
            if (langToggleMobile) langToggleMobile.setAttribute('aria-expanded', 'false');
            // 打开当前下拉菜单
            langDropdownDesktop.classList.add('show');
            langToggleDesktop.setAttribute('aria-expanded', 'true');
          }
        });
        
        // 绑定语言选项
        const optionsDesktop = langDropdownDesktop.querySelectorAll('.lang-option');
        optionsDesktop.forEach(option => {
          if (!option.dataset.langOptionBound) {
            option.dataset.langOptionBound = 'true';
            option.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              const lang = option.getAttribute('data-lang');
              if (lang && (lang === 'zh-CN' || lang === 'en')) {
                window.i18n.setLang(lang);
                langDropdownDesktop.classList.remove('show');
                langToggleDesktop.setAttribute('aria-expanded', 'false');
              }
            });
          }
        });
      }
      
      // 设置移动端
      if (langToggleMobile && langDropdownMobile && !langToggleMobile.dataset.langToggleBound) {
        langToggleMobile.dataset.langToggleBound = 'true';
        langToggleMobile.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const isOpen = langDropdownMobile.classList.contains('show');
          if (isOpen) {
            langDropdownMobile.classList.remove('show');
            langToggleMobile.setAttribute('aria-expanded', 'false');
          } else {
            // 关闭其他下拉菜单
            if (langDropdownDesktop) langDropdownDesktop.classList.remove('show');
            if (langToggleDesktop) langToggleDesktop.setAttribute('aria-expanded', 'false');
            // 打开当前下拉菜单
            langDropdownMobile.classList.add('show');
            langToggleMobile.setAttribute('aria-expanded', 'true');
          }
        });
        
        // 绑定语言选项
        const optionsMobile = langDropdownMobile.querySelectorAll('.lang-option');
        optionsMobile.forEach(option => {
          if (!option.dataset.langOptionBound) {
            option.dataset.langOptionBound = 'true';
            option.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              const lang = option.getAttribute('data-lang');
              if (lang && (lang === 'zh-CN' || lang === 'en')) {
                window.i18n.setLang(lang);
                langDropdownMobile.classList.remove('show');
                langToggleMobile.setAttribute('aria-expanded', 'false');
              }
            });
          }
        });
      }
      
      // 绑定全局点击处理器（点击外部关闭下拉菜单）
      if (!window.langToggleGlobalClickHandler) {
        window.langToggleGlobalClickHandler = function(e) {
          const target = e.target;
          const langToggleDesktop = document.getElementById('lang-toggle');
          const langDropdownDesktop = document.getElementById('lang-dropdown');
          const langToggleMobile = document.getElementById('lang-toggle-mobile');
          const langDropdownMobile = document.getElementById('lang-dropdown-mobile');
          
          const isInside = 
            (langToggleDesktop && langToggleDesktop.contains(target)) ||
            (langDropdownDesktop && langDropdownDesktop.contains(target)) ||
            (langToggleMobile && langToggleMobile.contains(target)) ||
            (langDropdownMobile && langDropdownMobile.contains(target));
          
          if (!isInside) {
            if (langDropdownDesktop && langToggleDesktop) {
              langDropdownDesktop.classList.remove('show');
              langToggleDesktop.setAttribute('aria-expanded', 'false');
            }
            if (langDropdownMobile && langToggleMobile) {
              langDropdownMobile.classList.remove('show');
              langToggleMobile.setAttribute('aria-expanded', 'false');
            }
          }
        };
        document.addEventListener('click', window.langToggleGlobalClickHandler, true);
      }
    }
    
    // 立即应用当前语言到 header（如果 i18n 已初始化）
    function applyCurrentLanguage() {
      if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.updatePageContent === 'function') {
        try {
          // 立即更新 header 中的文本
          window.i18n.updatePageContent();
          console.log('Language applied to header after load');
        } catch (e) {
          console.warn('Error applying language to header:', e);
        }
      } else {
        // 如果 i18n 还未初始化，稍后重试
        setTimeout(applyCurrentLanguage, 100);
      }
    }
    
    // 立即尝试应用语言
    applyCurrentLanguage();
    
    // 立即尝试一次，然后延迟尝试
    ensureLangToggleInit();
    setTimeout(() => {
      ensureLangToggleInit();
      applyCurrentLanguage(); // 再次应用语言
    }, 150);
    setTimeout(() => {
      ensureLangToggleInit();
      applyCurrentLanguage(); // 再次应用语言
    }, 500); // 额外的重试，确保在慢速加载时也能工作
    setTimeout(() => {
      ensureLangToggleInit();
      applyCurrentLanguage(); // 再次应用语言
    }, 1000); // 再次重试，确保在非常慢的网络下也能工作
    
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

