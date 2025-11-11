import type { Language } from './locales.js';
import { translations } from './locales.js';

class I18n {
  private currentLang: Language = 'zh-CN';

  constructor() {
    // 检测语言优先级：URL 参数 > localStorage > 浏览器语言 > 默认中文
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang') as Language;
    
    if (urlLang && (urlLang === 'zh-CN' || urlLang === 'en')) {
      this.currentLang = urlLang;
    } else {
      const savedLang = localStorage.getItem('language') as Language;
      if (savedLang && (savedLang === 'zh-CN' || savedLang === 'en')) {
        this.currentLang = savedLang;
      } else {
        const browserLang = navigator.language.startsWith('zh') ? 'zh-CN' : 'en';
        this.currentLang = browserLang || 'zh-CN';
      }
    }
  }

  getLang(): Language {
    return this.currentLang;
  }

  setLang(lang: Language, updateUrl: boolean = true): void {
    this.currentLang = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    
    if (updateUrl) {
      // 更新 URL 参数，但不刷新页面
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      window.history.replaceState({}, '', url.toString());
    }
    
    this.updatePageContent();
    
    // 触发语言变化事件，确保所有组件都能响应
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { lang: lang }
    }));
  }

  t(key: string): string {
    const keys = key.split('.');
    let value: any = translations[this.currentLang];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return value || key;
  }

  updatePageContent(): void {
    // 更新所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (!key) return;

      // 跳过语言切换按钮本身（它们只包含 SVG 图标，没有文本）
      const elementId = element.id;
      if (elementId === 'lang-toggle' || elementId === 'lang-toggle-mobile') {
        return;
      }

      const text = this.t(key);
      const tagName = element.tagName;

      // 处理 INPUT 和 TEXTAREA
      if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
        if (element.hasAttribute('placeholder')) {
          (element as HTMLInputElement).placeholder = text;
        } else {
          (element as HTMLInputElement).value = text;
        }
        return;
      }

      // 处理 BUTTON 元素（可能包含 SVG 图标）
      if (tagName === 'BUTTON') {
        const svg = element.querySelector('svg');
        if (svg) {
          // 如果有 SVG，保留 SVG，只更新文本节点
          // 查找所有文本节点（排除 SVG 内的文本）
          const textNodes: Text[] = [];
          const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: (node) => {
                // 跳过 SVG 内的文本节点
                if (node.parentElement && node.parentElement.closest('svg')) {
                  return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
              }
            }
          );
          
          let node;
          while (node = walker.nextNode()) {
            if (node.textContent && node.textContent.trim()) {
              textNodes.push(node as Text);
            }
          }

          if (textNodes.length > 0) {
            // 更新第一个非空文本节点
            textNodes[0].textContent = text;
            // 移除其他文本节点（避免重复）
            for (let i = 1; i < textNodes.length; i++) {
              textNodes[i].remove();
            }
          } else {
            // 如果没有文本节点，在 SVG 后添加文本
            const textNode = document.createTextNode(text);
            element.appendChild(textNode);
          }
        } else {
          // 没有 SVG，直接更新文本内容
          element.textContent = text;
        }
        return;
      }

      // 处理链接和其他元素
      if (tagName === 'A' || tagName === 'SPAN' || tagName === 'P' || tagName === 'DIV' || tagName === 'H1' || tagName === 'H2' || tagName === 'H3' || tagName === 'H4' || tagName === 'H5' || tagName === 'H6') {
        element.textContent = text;
        return;
      }

      // 默认情况：直接更新文本内容
      element.textContent = text;
    });

    // 更新带有 data-i18n-attr 属性的元素（用于 title, alt, aria-label 等）
    document.querySelectorAll('[data-i18n-attr]').forEach(element => {
      const attrConfig = element.getAttribute('data-i18n-attr');
      if (attrConfig) {
        const [key, attr] = attrConfig.split(':');
        const text = this.t(key);
        element.setAttribute(attr, text);
      }
    });
    
    // 更新带有 data-i18n-placeholder 属性的 input/textarea 元素
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      if (key && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
        const text = this.t(key);
        (element as HTMLInputElement).placeholder = text;
      }
    });
  }

  // 初始化时更新页面
  init(): void {
    document.documentElement.lang = this.currentLang;
    this.updatePageContent();
    // 将 i18n 实例暴露到 window，方便其他脚本使用
    (window as any).i18n = this;
  }
}

/**
 * 统一的语言读取函数
 * 优先级：URL 参数 > localStorage > 浏览器语言 > 默认中文
 * 这个函数可以被所有页面和组件使用，确保语言读取的一致性
 */
export function getCurrentLanguage(): Language {
  // 1. 优先从 URL 参数读取
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang') as Language;
  if (urlLang && (urlLang === 'zh-CN' || urlLang === 'en')) {
    return urlLang;
  }
  
  // 2. 从 localStorage 读取
  const savedLang = localStorage.getItem('language') as Language;
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

/**
 * 获取当前语言的 URL 参数字符串（用于构建链接）
 * 例如：?lang=en 或 ?lang=zh-CN
 */
export function getLanguageUrlParam(): string {
  const lang = getCurrentLanguage();
  return `?lang=${lang}`;
}

/**
 * 为 URL 添加或更新语言参数
 */
export function addLanguageToUrl(url: string): string {
  const lang = getCurrentLanguage();
  try {
    const urlObj = new URL(url, window.location.origin);
    urlObj.searchParams.set('lang', lang);
    return urlObj.pathname + urlObj.search;
  } catch (e) {
    // 如果 URL 解析失败，直接拼接
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}lang=${lang}`;
  }
}

export const i18n = new I18n();

