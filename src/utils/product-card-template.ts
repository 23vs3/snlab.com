import { Product } from "@/types";
import { ProductDisplayUtils } from './products-utils.ts';
import { responsivePictureHTML } from './media.ts';

export type Language = 'zh-CN' | 'en';

/**
 * 生成完整的产品卡片HTML
 * 包含产品信息区域和四图拼接区域
 */
export function generateProductItemHTML(
  product: Product, 
  lang: Language = 'zh-CN'
): string {
  // 获取展示图片
  const displayImages = ProductDisplayUtils.getProductDisplayImages(product);
  const productName = product.name[lang] || product.name['zh-CN'] || '产品';
  const productDescription = product.description?.[lang] || product.description?.['zh-CN'] || '';
  const images = displayImages.slice(0, 4);
  
  // 补全4张图片
  while (images.length < 4) {
    images.push({
      imageUrl: '/images/placeholder.jpg',
      skuId: `${product.productId}-placeholder-${images.length}`,
      isMain: false
    });
  }
  
  // 确保第一个图片是主图
  const mainImageIndex = images.findIndex(img => img.isMain);
  if (mainImageIndex > 0) {
    const [mainImage] = images.splice(mainImageIndex, 1);
    images.unshift(mainImage);
  } else if (mainImageIndex === -1) {
    images[0].isMain = true;
  }
  
  // 生成四图拼接的HTML
  const fourImagesHTML = generateFourImagesHTML(product, images, productName, lang);
  
  // 生成"了解更多"按钮的国际化文本
  const moreText = getLocalizedText(lang, '了解更多', 'Learn More');
  
  return `
  <article class="product-item-card" data-product-id="${product.productId}">
    <div class="product-info">
      <h3 class="product-name" data-i18n="products.${product.productId}.name">${escapeHtml(productName)}</h3>
      ${productDescription ? `<p class="product-description" data-i18n="products.${product.productId}.description">${escapeHtml(productDescription)}</p>` : ''}
      <a href="/products/${product.productId}?lang=${lang}" class="product-more-button" data-i18n="products.${product.productId}.learnMore">${escapeHtml(moreText)}</a>
    </div>
    <div class="product-images">
      ${fourImagesHTML}
    </div>
  </article>
  `;
}

/**
 * 生成四图拼接的HTML
 */
function generateFourImagesHTML(
  product: Product, 
  images: any[],
  productName: string,
  lang: Language
): string {
  return `
    <div class="four-image-collage">
      ${images.map((image, index) => {
        const isMain = index === 0;
        const colorName = image.colorName || '';
        const titleText = colorName ? `${productName} - ${colorName}` : productName;
        
        return `
          <a 
            href="/products/${product.productId}?sku=${encodeURIComponent(image.skuId)}&lang=${lang}"
            class="collage-image-link ${isMain ? 'main' : ''}"
            title="${escapeHtml(titleText)}"
            data-product-id="${product.productId}"
            data-sku-id="${image.skuId}"
            data-color-name="${escapeHtml(colorName)}"
          >
            ${responsivePictureHTML({
              src: String(image.imageUrl || ''),
              alt: titleText,
              className: 'collage-image',
              /**
               * sizes 决定 srcset 会选多大尺寸的图片：
               * - 你的卡片本质上是 1/3 宽（4/12 列），如果写成 75vw 会明显高估，
               *   导致桌面端下载过大的变体（在慢网下体验更差）。
               * - 移动端仍使用 100vw。
               */
              // 桌面端卡片内容区宽度受 `--max-w(1200px)` 约束，使用固定值避免 33vw 在大屏上高估。
              sizes: '(max-width: 768px) 100vw, 420px',
              loading: 'lazy',
              decoding: 'async',
              // 列表中图片数量密集，全部保持 low，避免挤占首屏 LCP（轮播/主图）带宽
              fetchPriority: 'low',
              // 收紧候选宽度，避免慢网下拉取过大的变体
              widths: [160, 240, 320, 480, 640]
            })}
          </a>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * 根据语言获取本地化文本
 */
function getLocalizedText(lang: Language, zhText: string, enText: string): string {
  return lang === 'zh-CN' ? zhText : enText;
}

/**
 * 转义HTML特殊字符
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}