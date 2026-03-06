import type { Product, ProductSKU, ProductSpecs } from '@/types/index.js';
import { products } from '../config/products-data.js';
import { i18n } from '../i18n/i18n.js';
import type { Language } from '../i18n/locales.js';

/** 按产品与属性维度的选中规格（productId -> attributeId -> optionId），用于切换规格时保持选中状态 */
const selectedOptionsByProduct: Record<string, Record<string, string>> = {};

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

/**
 * 根据当前选中的属性选项或 defaultSkuId 解析出当前 SKU
 */
function getSelectedSku(
  product: Product,
  selectedOverrides?: Record<string, string>
): ProductSKU | null {
  if (!product.skus?.length) return null;
  const attrMap = selectedOverrides ?? (selectedOptionsByProduct[product.productId] ?? {});

  // 若没有选中覆盖，先用 defaultSkuId
  if (Object.keys(attrMap).length === 0 && product.defaultSkuId) {
    const defaultSku = product.skus.find(s => s.skuId === product.defaultSkuId);
    if (defaultSku) return defaultSku;
  }

  // 根据 attributes 的 selectedOptionId 构建选中映射（用于初始化）
  if (Object.keys(attrMap).length === 0 && product.attributes?.length) {
    for (const set of product.attributes) {
      const opt = set.selectedOptionId ?? set.options?.[0]?.optionId;
      if (set.attribute?.attributeId && opt) {
        attrMap[set.attribute.attributeId] = opt;
      }
    }
  }

  const match = product.skus.find(sku => {
    const skuAttrs = sku.attributes || {};
    for (const [attrId, optionId] of Object.entries(attrMap)) {
      if (skuAttrs[attrId] !== optionId) return false;
    }
    return true;
  });
  return match ?? null;
}

export function renderProductDetail(productId: string | null): void {
  console.log('[renderProductDetail] Start, productId:', productId);
  
  if (!productId) {
    console.error('[renderProductDetail] Product ID not found in URL');
    // 默认显示第一个产品
    if (products.length > 0) {
      console.log('[renderProductDetail] Using default product:', products[0].productId);
      renderProductDetail(products[0].productId);
    } else {
      console.error('[renderProductDetail] No products available');
    }
    return;
  }
  
  console.log('[renderProductDetail] Looking for product:', productId);
  const product = products.find(p => p.productId === productId);
  if (!product) {
    console.error(`[renderProductDetail] Product not found: ${productId}. Available products:`, products.map(p => p.productId));
    // 显示404或重定向到首页
    if (products.length > 0) {
      console.log('[renderProductDetail] Redirecting to home page');
      window.location.href = '/';
    }
    return;
  }
  
  console.log('[renderProductDetail] Product found:', product.name);

  // 获取语言，如果 i18n 未初始化则使用默认语言 'zh-CN'
  let currentLang: Language = 'zh-CN';
  try {
    const i18nInstance = (window as any).i18n || i18n;
    if (i18nInstance && i18nInstance.getLang) {
      currentLang = i18nInstance.getLang() as Language;
      console.log('[renderProductDetail] Using language:', currentLang);
    } else {
      console.warn('[renderProductDetail] i18n not available, using default language zh-CN');
    }
  } catch (e) {
    console.warn('[renderProductDetail] Error getting language, using default:', e);
  }

  // 更新页面标题
  document.title = `${product.name[currentLang]} - SNILAB`;

  // 更新面包屑导航
  const productNameSpan = document.getElementById('product-name');
  if (productNameSpan) {
    productNameSpan.textContent = product.name[currentLang];
    console.log('[renderProductDetail] Updated product-name:', product.name[currentLang]);
  } else {
    console.warn('[renderProductDetail] product-name element not found');
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

  // 初始化选中规格：若尚未有记录则从 defaultSkuId 对应 SKU 反推
  if (!selectedOptionsByProduct[product.productId] && product.defaultSkuId && product.skus?.length) {
    const defaultSku = product.skus.find(s => s.skuId === product.defaultSkuId);
    if (defaultSku?.attributes) {
      selectedOptionsByProduct[product.productId] = { ...defaultSku.attributes };
    }
  }

  const selectedSku = getSelectedSku(product);
  const images = selectedSku?.images?.length
    ? selectedSku.images
    : product.defaultImages?.length
      ? product.defaultImages
      : product.mainImage
        ? [product.mainImage]
        : [];

  const productImage = document.getElementById('product-image') as HTMLImageElement | null;
  const productVideo = document.getElementById('product-video') as HTMLVideoElement | null;
  const thumbsContainer = document.getElementById('product-gallery-thumbs');
  const tabsContainer = document.getElementById('product-gallery-tabs');

  if (productImage) {
    productImage.src = images[0] || '';
    productImage.alt = product.name[currentLang];
    productImage.style.display = 'block';
  }
  if (productVideo) {
    const hasVideo = Array.isArray(product.videos) && product.videos.length > 0;
    if (hasVideo) {
      productVideo.src = product.videos![0];
      productVideo.style.display = 'none'; // 默认显示图集
      productVideo.pause();
    } else {
      productVideo.removeAttribute('src');
      productVideo.style.display = 'none';
    }
  }

  if (thumbsContainer) {
    if (images.length <= 1) {
      thumbsContainer.innerHTML = '';
    } else {
      thumbsContainer.innerHTML = images.map((src, i) => `
        <button type="button" class="${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="缩略图 ${i + 1}">
          <img src="${src}" alt="" />
        </button>
      `).join('');
      thumbsContainer.querySelectorAll('button').forEach((btn, i) => {
        btn.addEventListener('click', () => {
          if (!productImage) return;
          if (images[i]) {
            productImage.src = images[i];
            thumbsContainer.querySelectorAll('button').forEach((b, j) => b.classList.toggle('active', j === i));
          }
        });
      });
    }
  }

  // 图文详情：longImages 竖向无缝排列
  const longImagesInner = document.getElementById('product-long-images-inner');
  const longImagesSection = document.getElementById('product-long-images');
  if (longImagesInner && longImagesSection) {
    const longImages = product.longImages && Array.isArray(product.longImages) ? product.longImages : [];
    if (longImages.length > 0) {
      longImagesInner.innerHTML = longImages.map(src => `<img src="${src}" alt="" loading="lazy" />`).join('');
      longImagesSection.style.display = '';
    } else {
      longImagesInner.innerHTML = '';
      longImagesSection.style.display = 'none';
    }
  }

  // 图集上方“视频 / 图集 / 参数”切换
  if (tabsContainer) {
    const hasVideo = Array.isArray(product.videos) && product.videos.length > 0;
    tabsContainer.innerHTML = `
      <button type="button" class="gallery-tab" data-mode="video" ${hasVideo ? '' : 'disabled'}>视频</button>
      <button type="button" class="gallery-tab active" data-mode="images">图集</button>
      <button type="button" class="gallery-tab" data-mode="specs">参数</button>
    `;

    const updateMode = (mode: 'video' | 'images' | 'specs') => {
      if (mode === 'video') {
        if (!hasVideo || !productVideo) return;
        if (productImage) productImage.style.display = 'none';
        if (thumbsContainer) (thumbsContainer as HTMLElement).style.display = 'none';
        productVideo.style.display = 'block';
        productVideo.play().catch(() => {});
      } else {
        if (productVideo) {
          productVideo.pause();
          productVideo.style.display = 'none';
        }
        if (productImage) productImage.style.display = 'block';
        if (thumbsContainer) (thumbsContainer as HTMLElement).style.display = images.length > 1 ? 'flex' : 'none';
        if (mode === 'specs') {
          const paramsSection = document.getElementById('product-params');
          if (paramsSection) {
            paramsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
      tabsContainer.querySelectorAll<HTMLButtonElement>('.gallery-tab').forEach(btn => {
        const btnMode = btn.dataset.mode as 'video' | 'images' | 'specs' | undefined;
        btn.classList.toggle('active', btnMode === mode);
      });
    };

    tabsContainer.querySelectorAll<HTMLButtonElement>('.gallery-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode as 'video' | 'images' | 'specs' | undefined;
        if (!mode || btn.disabled) return;
        updateMode(mode);
      });
    });
  }

  // 更新产品信息
  const productTitle = document.getElementById('product-title');
  const productTagline = document.getElementById('product-tagline');
  const productPriceEl = document.getElementById('product-price');

  if (productTitle) productTitle.textContent = product.name[currentLang];
  if (productTagline && product.tagline) productTagline.textContent = product.tagline[currentLang];

  if (productPriceEl) {
    if (selectedSku != null) {
      productPriceEl.textContent = `¥${selectedSku.price}`;
    } else if (product.priceDisplay?.[currentLang]) {
      productPriceEl.textContent = product.priceDisplay[currentLang];
    } else {
      productPriceEl.textContent = product.basePrice != null ? `¥${product.basePrice}` : '';
    }
  }

  // 规格选择器
  const specsSelectorEl = document.getElementById('product-specs-selector');
  if (specsSelectorEl && product.attributes?.length) {
    const currentSelected = selectedOptionsByProduct[product.productId] ?? {};
    let html = '';
    for (const attrSet of product.attributes) {
      const attr = attrSet.attribute;
      const attrId = attr.attributeId;
      const label = attr.attributeName?.[currentLang] ?? attrId;
      const help = attr.helpText?.[currentLang];
      const selectedId = currentSelected[attrId] ?? attrSet.selectedOptionId ?? attrSet.options?.[0]?.optionId;
      html += `<div class="spec-attr-label">${label}${help ? ` · ${help}` : ''}</div>`;
      html += '<div class="spec-options">';
      for (const opt of attrSet.options || []) {
        const isActive = opt.optionId === selectedId;
        const name = opt.optionName?.[currentLang] ?? opt.optionId;
        if (attr.type === 'color') {
          const thumb = opt.previewImage
            ? `<span class="spec-option-thumb"><img src="${opt.previewImage}" alt="" /></span>`
            : `<span class="spec-option-thumb is-color" style="background:${opt.value || '#ccc'}"></span>`;
          html += `<button type="button" class="spec-option spec-option--color ${isActive ? 'active' : ''}" data-attr-id="${attrId}" data-option-id="${opt.optionId}">${thumb}<span class="spec-option-label">${name}</span></button>`;
        } else {
          html += `<button type="button" class="spec-option ${isActive ? 'active' : ''}" data-attr-id="${attrId}" data-option-id="${opt.optionId}"><span class="spec-option-label">${name}</span></button>`;
        }
      }
      html += '</div>';
    }
    specsSelectorEl.innerHTML = html;
    specsSelectorEl.querySelectorAll('.spec-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const attrId = (btn as HTMLElement).dataset.attrId;
        const optionId = (btn as HTMLElement).dataset.optionId;
        if (!attrId || !optionId) return;
        if (!selectedOptionsByProduct[product.productId]) selectedOptionsByProduct[product.productId] = {};
        selectedOptionsByProduct[product.productId][attrId] = optionId;
        const nextSku = getSelectedSku(product);
        const nextImages = nextSku?.images?.length ? nextSku.images : product.defaultImages || (product.mainImage ? [product.mainImage] : []);
        const mainImg = document.getElementById('product-image') as HTMLImageElement;
        if (mainImg && nextImages[0]) mainImg.src = nextImages[0];
        const priceEl = document.getElementById('product-price');
        if (priceEl) priceEl.textContent = nextSku != null ? `¥${nextSku.price}` : (product.priceDisplay?.[currentLang] ?? '');
        const thumbs = document.getElementById('product-gallery-thumbs');
        if (thumbs && nextImages.length > 1) {
          thumbs.innerHTML = nextImages.map((src, i) => `
            <button type="button" class="${i === 0 ? 'active' : ''}" data-index="${i}">
              <img src="${src}" alt="" />
            </button>
          `).join('');
          thumbs.querySelectorAll('button').forEach((b, i) => {
            b.addEventListener('click', () => {
              if (mainImg && nextImages[i]) mainImg.src = nextImages[i];
              thumbs.querySelectorAll('button').forEach((x, j) => x.classList.toggle('active', j === i));
            });
          });
        }
        specsSelectorEl.querySelectorAll('.spec-option').forEach(b => {
          const a = (b as HTMLElement).dataset.attrId;
          const o = (b as HTMLElement).dataset.optionId;
          b.classList.toggle('active', a === attrId && o === optionId);
        });
      });
    });
  } else if (specsSelectorEl) {
    specsSelectorEl.innerHTML = '';
  }

  /// 店铺信息区 ???
  // const shopBrandEl = document.getElementById('product-shop-brand');
  // if (shopBrandEl && product.brand) {
  //   shopBrandEl.textContent = product.brand;
  //   if (shopBrandEl.tagName === 'A') {
  //     (shopBrandEl as HTMLAnchorElement).href = '/#products';
  //   }
  // }

  // 更新产品特性
  const featuresGrid = document.getElementById('features-grid');
  if (featuresGrid && product.features) {
    featuresGrid.innerHTML = product.features.map(feature => `
      <div class="feature-card">
        <div class="feature-icon">${feature.icon}</div>
        <h3>${feature.title[currentLang]}</h3>
        <p>${feature.description[currentLang]}</p>
      </div>
    `).join('');
    console.log('[renderProductDetail] Updated features-grid with', product.features.length, 'features');
  } else {
    console.warn('[renderProductDetail] features-grid element not found');
  }

  // // 更新产品规格
  // const specsGrid = document.getElementById('specs-grid');
  // if (specsGrid && product.specs) {
  //   specsGrid.innerHTML = `
  //     <div class="spec-group">
  //       <h3>${product.specs.audio.label[currentLang]}</h3>
  //       <ul class="spec-list">
  //         ${product.specs.audio.items.map(item => `
  //           <li>
  //             <span class="spec-label">${item.name[currentLang]}</span>
  //             <span class="spec-value">${item.value[currentLang]}</span>
  //           </li>
  //         `).join('')}
  //       </ul>
  //     </div>
  //     <div class="spec-group">
  //       <h3>${product.specs.physical.label[currentLang]}</h3>
  //       <ul class="spec-list">
  //         ${product.specs.physical.items.map(item => `
  //           <li>
  //             <span class="spec-label">${item.name[currentLang]}</span>
  //             <span class="spec-value">${item.value[currentLang]}</span>
  //           </li>
  //         `).join('')}
  //       </ul>
  //     </div>
  //   `;
  //   console.log('[renderProductDetail] Updated specs-grid');
  // } else {
  //   console.warn('[renderProductDetail] specs-grid element not found');
  // }

  // 辅助函数：安全地渲染规格组
function renderSpecGroup(specs: ProductSpecs | undefined, groupKey: string, currentLang: Language) {
  // 检查规格组是否存在且有数据
  if (!specs?.[groupKey]?.label?.[currentLang]) return '';
  if (!Array.isArray(specs[groupKey].items) || specs[groupKey].items.length === 0) return '';
  
  const group = specs[groupKey];
  const items = group.items
    .filter(item => item && typeof item === 'object')
    .filter(item => item?.name?.[currentLang] || item?.value?.[currentLang])
    .map(item => `
      <li>
        <span class="spec-label">${item.name?.[currentLang] || ''}</span>
        <span class="spec-value">${item.value?.[currentLang] || ''}</span>
      </li>
    `)
    .join('');
  
  // 如果没有有效的项目，则不渲染整个组
  if (!items) return '';
  
  return `
    <div class="spec-group ${groupKey}-specs">
      <h3>${group.label[currentLang]}</h3>
      <ul class="spec-list">${items}</ul>
    </div>
  `;
}

// 更新产品规格
const specsGrid = document.getElementById('specs-grid');
if (specsGrid) {
  let specsHTML = '';
  
  // 只有product.specs存在时才尝试渲染
  if (product?.specs) {
    // 尝试渲染各种规格组
    const specGroups = ['audio', 'physical', 'technical', 'specifications'];
    specGroups.forEach(groupKey => {
      specsHTML += renderSpecGroup(product.specs, groupKey, currentLang);
    });
  }
  
  // 根据是否有内容来显示
  if (specsHTML) {
    specsGrid.innerHTML = specsHTML;
    console.log(`[renderProductDetail] Rendered ${document.querySelectorAll('.spec-group').length} spec groups`);
  } else {
    specsGrid.innerHTML = '<div class="no-data">暂无规格信息</div>';
    console.log('[renderProductDetail] No specs to display');
  }
} else {
  console.warn('[renderProductDetail] specs-grid element not found');
}

  console.log('[renderProductDetail] Rendering completed for product:', productId);

  // 监听语言变化，重新渲染（避免重复绑定）
  const eventKey = `languageChanged_${productId}`;
  if (!(window as any)[eventKey]) {
    (window as any)[eventKey] = true;
    window.addEventListener('languageChanged', () => {
      renderProductDetail(productId);
    });
  }
}

// 初始化产品详情页
export function initProductDetail(): void {
  // 确保 i18n 已初始化后再渲染
  const render = () => {
    // 检查 i18n 是否已初始化（通过检查 window.i18n 或直接检查）
    try {
      // 优先检查 window.i18n（i18n.ts 中会将实例暴露到 window）
      const i18nInstance = (window as any).i18n || i18n;
      if (!i18nInstance || !i18nInstance.getLang) {
        // i18n 还未初始化，等待
        setTimeout(render, 100);
        return;
      }
      
      const currentLang = i18nInstance.getLang();
      if (!currentLang) {
        // i18n 还未初始化，等待
        setTimeout(render, 100);
        return;
      }
    } catch (e) {
      // i18n 还未初始化，等待
      console.warn('i18n not ready yet, retrying...', e);
      setTimeout(render, 100);
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

  // 增加重试次数和延迟，确保所有依赖都已加载
  const maxRetries = 30; // 最多重试 30 次（约 3 秒）
  let retryCount = 0;
  
  const tryRender = () => {
    retryCount++;
    
    if (retryCount > maxRetries) {
      console.error('Failed to initialize product detail after max retries');
      // 即使 i18n 未初始化，也尝试渲染（使用默认语言）
      const productId = getProductIdFromUrl();
      if (productId) {
        renderProductDetail(productId);
      } else if (products.length > 0) {
        renderProductDetail(products[0].productId);
      }
      return;
    }
    
    try {
      render();
    } catch (e) {
      console.error('Error in render:', e);
      setTimeout(tryRender, 100);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(tryRender, 200);
    });
  } else {
    // DOM 已准备好，等待所有依赖加载
    setTimeout(tryRender, 300);
  }
}

