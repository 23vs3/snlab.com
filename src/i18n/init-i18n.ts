import { i18n } from './i18n.js';
import type { Language } from './locales.js';

// 防止重复初始化的标记
let langToggleInitialized = false;
let globalClickHandler: ((e: MouseEvent) => void) | null = null;

export function initI18n(): void {
  // 初始化 i18n
  i18n.init();

  // 设置语言切换按钮
  setupLangToggle();
}

function setupLangToggle(): void {
  // 获取桌面端和移动端的按钮和下拉菜单
  const langToggleDesktop = document.getElementById('lang-toggle');
  const langDropdownDesktop = document.getElementById('lang-dropdown');
  const langToggleMobile = document.getElementById('lang-toggle-mobile');
  const langDropdownMobile = document.getElementById('lang-dropdown-mobile');
  
  if ((!langToggleDesktop || !langDropdownDesktop) && (!langToggleMobile || !langDropdownMobile)) {
    // 如果按钮不存在，稍后重试（可能是动态加载的 header）
    setTimeout(setupLangToggle, 100);
    return;
  }

  // 设置全局点击处理器（只绑定一次）
  if (!langToggleInitialized) {
    langToggleInitialized = true;
    setupGlobalClickHandler();
  }

  // 初始化下拉菜单状态
  updateLangDropdown();

  // 为桌面端和移动端分别设置事件（如果还没有绑定）
  if (langToggleDesktop && langDropdownDesktop) {
    setupLangToggleForElement(langToggleDesktop, langDropdownDesktop);
  }
  
  if (langToggleMobile && langDropdownMobile) {
    setupLangToggleForElement(langToggleMobile, langDropdownMobile);
  }
}

function setupLangToggleForElement(langToggle: HTMLElement, langDropdown: HTMLElement): void {
  // 检查是否已经绑定过事件（使用 dataset 标记）
  if (langToggle.dataset.langToggleBound === 'true') {
    return;
  }

  // 标记为已绑定
  langToggle.dataset.langToggleBound = 'true';

  // 点击按钮显示/隐藏下拉菜单
  langToggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 关闭其他下拉菜单
    closeAllLangDropdowns(langDropdown);
    
    const isOpen = langDropdown.classList.contains('show');
    if (isOpen) {
      closeLangDropdown(langDropdown, langToggle);
    } else {
      openLangDropdown(langDropdown, langToggle);
    }
  });

  // 点击下拉菜单选项切换语言
  const langOptions = langDropdown.querySelectorAll('.lang-option');
  langOptions.forEach(option => {
    // 检查是否已经绑定过
    if ((option as HTMLElement).dataset.langOptionBound === 'true') {
      return;
    }
    
    // 标记为已绑定
    (option as HTMLElement).dataset.langOptionBound = 'true';
    
    option.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const lang = option.getAttribute('data-lang') as Language;
      if (lang && (lang === 'zh-CN' || lang === 'en')) {
        i18n.setLang(lang);
        updateLangDropdown();
        closeAllLangDropdowns();
        updateDynamicTexts();
      }
    });
  });
}

function setupGlobalClickHandler(): void {
  // 如果已经有全局处理器，先移除
  if (globalClickHandler) {
    document.removeEventListener('click', globalClickHandler, true);
  }

  // 创建新的全局点击处理器
  globalClickHandler = (e: MouseEvent) => {
    const target = e.target as Node;
    const langToggleDesktop = document.getElementById('lang-toggle');
    const langDropdownDesktop = document.getElementById('lang-dropdown');
    const langToggleMobile = document.getElementById('lang-toggle-mobile');
    const langDropdownMobile = document.getElementById('lang-dropdown-mobile');

    // 检查点击是否在语言切换相关元素内部
    const isInsideLangToggle = 
      (langToggleDesktop && langToggleDesktop.contains(target)) ||
      (langDropdownDesktop && langDropdownDesktop.contains(target)) ||
      (langToggleMobile && langToggleMobile.contains(target)) ||
      (langDropdownMobile && langDropdownMobile.contains(target));

    // 如果点击在外部，关闭所有下拉菜单
    if (!isInsideLangToggle) {
      if (langDropdownDesktop && langToggleDesktop) {
        closeLangDropdown(langDropdownDesktop, langToggleDesktop);
      }
      if (langDropdownMobile && langToggleMobile) {
        closeLangDropdown(langDropdownMobile, langToggleMobile);
      }
    }
  };

  // 绑定全局点击事件
  document.addEventListener('click', globalClickHandler, true);
}

function openLangDropdown(langDropdown?: HTMLElement, langToggle?: HTMLElement): void {
  if (!langDropdown) langDropdown = document.getElementById('lang-dropdown') || document.getElementById('lang-dropdown-mobile');
  if (!langToggle) langToggle = document.getElementById('lang-toggle') || document.getElementById('lang-toggle-mobile');
  
  if (langDropdown && langToggle) {
    langDropdown.classList.add('show');
    langToggle.setAttribute('aria-expanded', 'true');
  }
}

function closeLangDropdown(langDropdown?: HTMLElement, langToggle?: HTMLElement): void {
  if (langDropdown && langToggle) {
    langDropdown.classList.remove('show');
    langToggle.setAttribute('aria-expanded', 'false');
  }
}

function closeAllLangDropdowns(except?: HTMLElement): void {
  const dropdowns = [
    document.getElementById('lang-dropdown'),
    document.getElementById('lang-dropdown-mobile')
  ];
  const toggles = [
    document.getElementById('lang-toggle'),
    document.getElementById('lang-toggle-mobile')
  ];
  
  dropdowns.forEach((dropdown, index) => {
    if (dropdown && dropdown !== except) {
      dropdown.classList.remove('show');
      if (toggles[index]) {
        toggles[index]!.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

function updateLangDropdown(): void {
  const langDropdowns = [
    document.getElementById('lang-dropdown'),
    document.getElementById('lang-dropdown-mobile')
  ];
  
  const currentLang = i18n.getLang();
  
  langDropdowns.forEach(langDropdown => {
    if (!langDropdown) return;
    
    const langOptions = langDropdown.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
      const lang = option.getAttribute('data-lang');
      if (lang === currentLang) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  });
}

function updateDynamicTexts(): void {
  // 更新 toast 消息（会在相关脚本中处理）
  // 这里可以触发自定义事件，让其他模块响应语言变化
  window.dispatchEvent(new CustomEvent('languageChanged', {
    detail: { lang: i18n.getLang() }
  }));
}

// 导出函数供外部调用（例如在 header 加载后）
export function setupLangToggleAfterHeaderLoad(): void {
  // 重置初始化标记，允许重新绑定（因为 header 是动态加载的）
  // 但是使用 dataset 标记来防止单个元素重复绑定
  setTimeout(() => {
    setupLangToggle();
  }, 200);
}

// 将函数暴露到 window，供 load-header.js 调用
if (typeof window !== 'undefined') {
  (window as any).setupLangToggleAfterHeaderLoad = setupLangToggleAfterHeaderLoad;
}

