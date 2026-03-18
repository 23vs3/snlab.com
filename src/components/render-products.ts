import { products } from '../config/products-data.js';
import { i18n } from '../i18n/i18n.js';
import type { Language } from '../i18n/locales.js';
import '../styles/product-item.css';
// 更新导入的模板函数名称
import { generateProductItemHTML } from '../utils/product-card-template.js';

export function renderProductsList(containerSelector: string = '#products-grid'): void {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn(`Products container not found: ${containerSelector}`);
    return;
  }

  // 检查容器是否已经有内容
  const existingCards = container.querySelectorAll('.product-item-card');
  if (existingCards.length > 0) {
    console.log('[render-products] 检测到已内联的产品列表，跳过重新渲染');
    return;
  }

  // 清空现有内容
  container.innerHTML = '';

  const currentLang = i18n.getLang() as Language;

  // 使用新的模板函数生成产品卡片HTML
  const productsHTML = products
    .filter(product => product.status === 'active')
    .map(product => generateProductItemHTML(product, currentLang))
    .join('');
  
  container.innerHTML = productsHTML;
  
  // 添加图片悬停效果
  addImageHoverEffects();
  
  // 监听语言变化
  window.addEventListener('languageChanged', () => {
    renderProductsList(containerSelector);
  });
}

function addImageHoverEffects(): void {
  const container = document.getElementById('products-grid');
  if (!container) return;
  
  const imageLinks = container.querySelectorAll('.collage-image-link');
  
  imageLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.classList.add('hovered');
    });
    
    link.addEventListener('mouseleave', () => {
      link.classList.remove('hovered');
    });
  });
}

