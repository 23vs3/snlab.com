import { products } from '../config/products-data.js';
import { i18n } from '../i18n/i18n.js';
import type { Language } from '../i18n/locales.js';

export function renderProductsList(containerSelector: string = '#products-grid'): void {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn(`Products container not found: ${containerSelector}`);
    return;
  }

  // 清空现有内容
  container.innerHTML = '';

  const currentLang = i18n.getLang() as Language;

  products.forEach(product => {
    const article = document.createElement('article');
    article.className = 'card';
    
    // 获取国际化文本
    const learnMoreText = i18n.t('sections.products.learnMore');
    
    article.innerHTML = `
      <div class="card-media">
        <img src="${product.image}" alt="${product.name[currentLang]}" />
      </div>
      <div class="card-body">
        <h3>${product.name[currentLang]}</h3>
        <p>${product.description[currentLang]}</p>
        <a class="btn" href="/products/${product.productId}" data-i18n="sections.products.learnMore">
          ${learnMoreText}
        </a>
      </div>
    `;
    
    container.appendChild(article);
  });
  
  // 使用 i18n 更新新创建的元素（确保所有 data-i18n 属性都被处理）
  // 这样即使后续 i18n.updatePageContent() 被调用，也能正确更新
  container.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      const text = i18n.t(key);
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        // 处理 placeholder
        if (element.hasAttribute('data-i18n-placeholder')) {
          (element as HTMLInputElement).placeholder = text;
        }
      } else {
        element.textContent = text;
      }
    }
  });

  // 监听语言变化，更新产品列表
  window.addEventListener('languageChanged', () => {
    renderProductsList(containerSelector);
  });
}

