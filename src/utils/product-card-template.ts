import { Product } from "@/types";
import { ProductDisplayUtils } from './products-utils.ts';

export type Language = 'zh-CN' | 'en';

/**
 * 生成四图拼接的产品卡片HTML
 * 主图在左侧，右侧三张小图垂直排列
 */
export function generateProductImagesHTML(
  product: Product, 
  lang: Language = 'zh-CN'
): string {
  // 获取展示图片
  const displayImages = ProductDisplayUtils.getProductDisplayImages(product);
  const productName = product.name[lang] || product.name['zh-CN'] || '产品';
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
  
  return `
  <article class="product-image-card" data-product-id="${product.productId}">
    <div class="four-image-collage">
      ${images.map((image, index) => {
        const isMain = index === 0;
        const colorName = image.colorName || '';
        
        return `
          <a 
            href="/products/${product.productId}?sku=${encodeURIComponent(image.skuId)}&lang=${lang}"
            class="collage-image-link ${isMain ? 'main' : ''}"
            title="${colorName ? `${productName} - ${colorName}` : productName}"
            data-product-id="${product.productId}"
            data-sku-id="${image.skuId}"
            data-color-name="${colorName}"
          >
            <img 
              src="${image.imageUrl}" 
              alt="${colorName ? `${productName} - ${colorName}` : productName}"
              loading="lazy"
              class="collage-image"
            />
          </a>
        `;
      }).join('')}
    </div>
  </article>
  `;
}