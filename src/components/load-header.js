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
    
    // 统一的语言读取函数（用于更新链接）
    function getCurrentLanguageForLinks() {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && (urlLang === 'zh-CN' || urlLang === 'en')) {
        return urlLang;
      }
      const savedLang = localStorage.getItem('language');
      if (savedLang && (savedLang === 'zh-CN' || savedLang === 'en')) {
        return savedLang;
      }
      return 'zh-CN';
    }
    
    // 为 URL 添加语言参数的辅助函数
    function addLangToUrl(url) {
      const lang = getCurrentLanguageForLinks();
      if (!url) return url;
      
      // 如果是锚点链接（#开头），不需要添加语言参数
      if (url.startsWith('#')) {
        return url;
      }
      
      // 如果已经有语言参数，更新它
      try {
        const urlObj = new URL(url, window.location.origin);
        urlObj.searchParams.set('lang', lang);
        return urlObj.pathname + urlObj.search + (urlObj.hash || '');
      } catch (e) {
        // 如果 URL 解析失败，直接拼接
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}lang=${lang}`;
      }
    }
    
    // 根据当前页面位置更新链接路径，并添加语言参数
    const brandLink = document.getElementById('header-brand');
    const allNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-links a');
    
    if (isIndexPage) {
      // 首页：使用锚点链接（锚点链接不需要语言参数）
      if (brandLink) {
        brandLink.href = '#top';
      }
      
      allNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('index.html#')) {
          link.href = href.replace('index.html#', '#');
        } else if (href && !href.startsWith('#') && !href.startsWith('http')) {
          // 如果不是锚点链接，添加语言参数
          link.href = addLangToUrl(href);
        }
      });
    } else {
      // 非首页：使用绝对路径，并添加语言参数
      if (brandLink) {
        brandLink.href = addLangToUrl('/');
      }
      
      allNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('index.html#')) {
          // 将 index.html#products 改为 /#products（锚点链接不需要语言参数）
          link.href = href.replace('index.html#', '/#');
        } else if (href && href === 'index.html') {
          link.href = addLangToUrl('/');
        } else if (href && !href.startsWith('#') && !href.startsWith('http')) {
          // 如果不是锚点链接或外部链接，添加语言参数
          link.href = addLangToUrl(href);
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
    
    // 统一的语言读取函数（与 i18n.ts 中的逻辑保持一致）
    function getCurrentLanguage() {
      // 1. 优先从 URL 参数读取
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && (urlLang === 'zh-CN' || urlLang === 'en')) {
        return urlLang;
      }
      
      // 2. 从 localStorage 读取
      const savedLang = localStorage.getItem('language');
      if (savedLang && (savedLang === 'zh-CN' || savedLang === 'en')) {
        return savedLang;
      }
      
      // 3. 从浏览器语言读取
      const browserLang = navigator.language.startsWith('zh') ? 'zh-CN' : 'en';
      if (browserLang && (browserLang === 'zh-CN' || browserLang === 'en')) {
        return browserLang;
      }
      
      // 4. 默认返回中文
      return 'zh-CN';
    }
    
    // 立即应用当前语言到 header（不依赖 i18n 初始化）
    function applyCurrentLanguage() {
      // 使用统一的语言读取函数
      const currentLang = getCurrentLanguage();
      
      // 如果 i18n 已初始化，使用它的 updatePageContent（更完整）
      if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.updatePageContent === 'function') {
        try {
          // 确保 i18n 的语言状态与当前读取的语言一致
          if (window.i18n.getLang && window.i18n.getLang() !== currentLang) {
            // 如果语言不一致，更新 i18n 的状态（但不更新 URL，避免循环）
            window.i18n.setLang(currentLang, false);
          } else {
            window.i18n.updatePageContent();
          }
          console.log('Language applied to header via i18n:', currentLang);
          return;
        } catch (e) {
          console.warn('Error applying language via i18n:', e);
        }
      }
      
      // 如果 i18n 未初始化，手动应用语言到 header
      applyLanguageToHeader(currentLang);
    }
    
    // 手动应用语言到 header 的函数
    function applyLanguageToHeader(lang) {
      // 完整的翻译映射（包含 header 需要的所有文本）
      const translations = {
        'zh-CN': {
          'nav.products': '产品',
          'nav.support': '购买与支持',
          'nav.stories': '资讯订阅',
          'common.chinese': '中文',
          'common.english': '英文',
          'common.home': '首页'
        },
        'en': {
          'nav.products': 'Products',
          'nav.support': 'Support',
          'nav.stories': 'Stories',
          'common.chinese': 'Chinese',
          'common.english': 'English',
          'common.home': 'Home'
        }
      };
      
      const texts = translations[lang] || translations['zh-CN'];
      
      // 更新所有带有 data-i18n 属性的元素（包括 header 内的所有元素）
      const header = document.querySelector('header');
      const elementsToUpdate = header ? header.querySelectorAll('[data-i18n]') : document.querySelectorAll('[data-i18n]');
      
      elementsToUpdate.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key && texts[key]) {
          // 跳过语言切换按钮本身（它只包含 SVG 图标，没有文本）
          if (element.id === 'lang-toggle' || element.id === 'lang-toggle-mobile') {
            return; // 跳过，这些按钮只包含 SVG
          }
          
          // 对于链接和普通元素，直接更新文本内容
          if (element.tagName === 'A' || element.tagName === 'SPAN' || element.tagName === 'P') {
            element.textContent = texts[key];
          } else if (element.tagName === 'BUTTON') {
            // 对于按钮，检查是否有 SVG 子元素
            const svg = element.querySelector('svg');
            if (svg) {
              // 如果有 SVG，只更新 SVG 后的文本节点，或创建新的文本节点
              const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
              if (textNodes.length > 0) {
                // 更新现有文本节点
                textNodes.forEach(node => {
                  if (node.textContent.trim()) {
                    node.textContent = texts[key];
                  }
                });
              } else {
                // 如果没有文本节点，在 SVG 后添加
                const textNode = document.createTextNode(texts[key]);
                element.appendChild(textNode);
              }
            } else {
              // 没有 SVG，直接更新文本
              element.textContent = texts[key];
            }
          } else {
            // 其他元素，直接更新文本
            element.textContent = texts[key];
          }
        }
      });
      
      console.log('Language applied to header manually:', lang);
    }
    
    // 立即尝试应用语言
    applyCurrentLanguage();
    
    // 更新导航链接的语言参数（在语言变化时调用）
    function updateNavLinksLanguage() {
      const currentPathname = window.location.pathname;
      const currentIsIndexPage = currentPathname === '/' || currentPathname === '/index.html';
      const brandLink = document.getElementById('header-brand');
      const allNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-links a');
      
      if (currentIsIndexPage) {
        // 首页：锚点链接不需要更新
        // 但如果有非锚点链接，需要更新
        allNavLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href && !href.startsWith('#') && !href.startsWith('http')) {
            link.href = addLangToUrl(href);
          }
        });
      } else {
        // 非首页：更新所有链接
        if (brandLink) {
          brandLink.href = addLangToUrl('/');
        }
        allNavLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href && !href.startsWith('#') && !href.startsWith('http')) {
            link.href = addLangToUrl(href);
          }
        });
      }
    }
    
    // 监听语言变化事件，确保 header 始终显示正确语言
    window.addEventListener('languageChanged', function(e) {
      // 使用统一的语言读取函数，确保语言状态一致
      const lang = (e.detail && e.detail.lang) || getCurrentLanguage();
      applyLanguageToHeader(lang);
      
      // 更新所有导航链接，确保它们包含正确的语言参数
      updateNavLinksLanguage();
      
      // 如果 i18n 已初始化，也调用它的 updatePageContent 确保完整更新
      if (window.i18n && typeof window.i18n.updatePageContent === 'function') {
        window.i18n.updatePageContent();
      }
    });
    
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
    setTimeout(() => {
      ensureLangToggleInit();
      applyCurrentLanguage(); // 最后一次尝试，确保 i18n 初始化后也能应用
    }, 2000); // 再次重试，确保在非常慢的网络下也能工作
    
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

