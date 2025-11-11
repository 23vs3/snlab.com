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
      if (key) {
        const text = this.t(key);
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          // 检查是否有 placeholder 属性
          if (element.hasAttribute('placeholder')) {
            (element as HTMLInputElement).placeholder = text;
          } else {
            // 如果没有 placeholder 属性，更新 value 或其他内容
            element.textContent = text;
          }
        } else {
          element.textContent = text;
        }
      }
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

export const i18n = new I18n();

