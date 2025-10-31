import { products } from '../config/products-data.js';
import { i18n } from '../i18n/i18n.js';
import type { Language } from '../i18n/locales.js';

/**
 * 从 URL 路径获取 productId
 * 支持格式：
 * - /products/a1 (不带尾部斜杠)
 * - /products/a1/ (带尾部斜杠，会被重定向)
 * - /products/index.html?productId=a1 (开发环境)
 * - /products/?productId=a1
 */
export function getProductIdFromUrl(): string | null {
  const pathname = window.location.pathname;
  const search = window.location.search;
  
  // 方法1: 从路径获取 (products/{productId} 或 products/{productId}/)
  // 匹配 /products/{productId} 或 /products/{productId}/
  const pathMatch = pathname.match(/\/products\/([^\/\?]+)\/?$/);
  if (pathMatch && pathMatch[1] && pathMatch[1] !== 'index.html' && !pathMatch[1].includes('.')) {
    return pathMatch[1];
  }

  // 方法2: 如果路径是 /products/ 或 /products/index.html，从查询参数获取
  if (pathname.match(/\/products\/?(index\.html)?$/)) {
    const urlParams = new URLSearchParams(search);
    const productId = urlParams.get('productId');
    if (productId) {
      return productId;
    }
    
    // 如果没有 productId 参数，尝试从 hash 获取（兼容旧链接）
    const hash = window.location.hash.slice(1);
    if (hash) {
      return hash;
    }
  }

  return null;
}

export function renderProductDetail(productId: string | null): void {
  if (!productId) {
    console.error('Product ID not found in URL');
    // 默认显示第一个产品
    if (products.length > 0) {
      console.log('Using default product:', products[0].productId);
      renderProductDetail(products[0].productId);
    } else {
      console.error('No products available');
    }
    return;
  }

  console.log('Rendering product:', productId);
  const product = products.find(p => p.productId === productId);
  if (!product) {
    console.error(`Product not found: ${productId}. Available products:`, products.map(p => p.productId));
    // 显示404或重定向到首页
    if (products.length > 0) {
      console.log('Redirecting to home page');
      window.location.href = '/';
    }
    return;
  }
  
  console.log('Product found:', product.name);

  const currentLang = i18n.getLang() as Language;

  // 更新页面标题
  document.title = `${product.name[currentLang]} - SINIAN LAB`;

  // 更新面包屑导航
  const productNameSpan = document.getElementById('product-name');
  if (productNameSpan) {
    productNameSpan.textContent = product.name[currentLang];
  }
  
  // 更新面包屑中的链接（如果存在）
  const breadcrumb = document.querySelector('.breadcrumb');
  if (breadcrumb) {
    const homeLink = breadcrumb.querySelector('a[href]') as HTMLAnchorElement;
    const allLinks = breadcrumb.querySelectorAll('a');
    const productsLink = allLinks[1] as HTMLAnchorElement;
    
    if (homeLink) homeLink.href = '/';
    if (productsLink) {
      productsLink.href = '/#products';
      // 确保国际化属性存在
      if (!productsLink.hasAttribute('data-i18n')) {
        productsLink.setAttribute('data-i18n', 'nav.products');
      }
    }
  }

  // 更新产品图片
  const productImage = document.getElementById('product-image') as HTMLImageElement;
  if (productImage) {
    productImage.src = product.image;
    productImage.alt = product.name[currentLang];
  }

  // 更新产品信息
  const productTitle = document.getElementById('product-title');
  const productTagline = document.getElementById('product-tagline');
  const productPrice = document.getElementById('product-price');
  
  if (productTitle) productTitle.textContent = product.name[currentLang];
  if (productTagline) productTagline.textContent = product.tagline[currentLang];
  if (productPrice) productPrice.textContent = product.price[currentLang];

  // 更新产品特性
  const featuresGrid = document.getElementById('features-grid');
  if (featuresGrid) {
    featuresGrid.innerHTML = product.features.map(feature => `
      <div class="feature-card">
        <div class="feature-icon">${feature.icon}</div>
        <h3>${feature.title[currentLang]}</h3>
        <p>${feature.description[currentLang]}</p>
      </div>
    `).join('');
  }

  // 更新产品规格
  const specsGrid = document.getElementById('specs-grid');
  if (specsGrid) {
    specsGrid.innerHTML = `
      <div class="spec-group">
        <h3>${product.specs.audio.label[currentLang]}</h3>
        <ul class="spec-list">
          ${product.specs.audio.items.map(item => `
            <li>
              <span class="spec-label">${item.name[currentLang]}</span>
              <span class="spec-value">${item.value[currentLang]}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="spec-group">
        <h3>${product.specs.physical.label[currentLang]}</h3>
        <ul class="spec-list">
          ${product.specs.physical.items.map(item => `
            <li>
              <span class="spec-label">${item.name[currentLang]}</span>
              <span class="spec-value">${item.value[currentLang]}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  // 监听语言变化，重新渲染
  window.addEventListener('languageChanged', () => {
    renderProductDetail(productId);
  });
}

// 初始化产品详情页
export function initProductDetail(): void {
  // 确保 i18n 已初始化后再渲染
  const render = () => {
    // 检查 i18n 是否已初始化（通过检查 getLang 方法）
    try {
      const currentLang = i18n.getLang();
      if (!currentLang) {
        // i18n 还未初始化，等待
        setTimeout(render, 50);
        return;
      }
    } catch (e) {
      // i18n 还未初始化，等待
      setTimeout(render, 50);
      return;
    }

    const productId = getProductIdFromUrl();
    console.log('Product ID from URL:', productId, 'Pathname:', window.location.pathname, 'Search:', window.location.search);
    
    if (productId) {
      console.log('Calling renderProductDetail with productId:', productId);
      renderProductDetail(productId);
    } else {
      console.warn('No productId found in URL. Pathname:', window.location.pathname, 'Search:', window.location.search);
      console.log('Available products:', products.map(p => p.productId));
      // 如果没有找到 productId，尝试默认产品
      if (products.length > 0) {
        console.log('Using first product as fallback');
        renderProductDetail(products[0].productId);
      } else {
        // 如果还是没有，重定向到首页
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(render, 100);
    });
  } else {
    // DOM 已准备好，等待 i18n 初始化
    setTimeout(render, 100);
  }
}

