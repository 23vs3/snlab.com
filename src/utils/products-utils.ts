// products/utils.ts
import type {
    Product,
    ProductSKU,
    AttributeSet,
    AttributeOption,
    ProductFeature,
    SpecItem,
    ProductSpecs,
    Variant,
    ProductReview
  } from "@/types";
  
  // ========== 基础工具函数 ==========
  export class BaseUtils {
    /**
     * 安全的获取对象值
     */
    static get<T>(obj: any, path: string, defaultValue?: T): T | undefined {
      if (!obj || typeof obj !== 'object') return defaultValue;
      
      const keys = path.split('.');
      let result: any = obj;
      
      for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
          result = result[key];
        } else {
          return defaultValue;
        }
      }
      
      return result as T;
    }
    
    /**
     * 深拷贝对象
     */
    static deepClone<T>(obj: T): T {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj.getTime()) as T;
      if (Array.isArray(obj)) return obj.map(item => this.deepClone(item)) as T;
      
      const clonedObj: Record<string, any> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          clonedObj[key] = this.deepClone((obj as any)[key]);
        }
      }
      return clonedObj as T;
    }
  }
  
  // ========== 产品工具函数 ==========
  export class ProductUtils {
    /**
     * 根据属性组合查找SKU
     */
    static findSkuByAttributes(
      product: Product,
      selectedAttributes: Record<string, string>
    ): ProductSKU | undefined {
      if (!product.skus || product.skus.length === 0) return undefined;
      
      return product.skus.find((sku: ProductSKU) => {
        return Object.entries(selectedAttributes).every(
          ([attrId, optionId]) => sku.attributes[attrId] === optionId
        );
      });
    }
  
    /**
     * 计算当前配置的价格
     */
    static calculatePrice(
      product: Product,
      selectedAttributes: Record<string, string>
    ): number {
      let price = product.basePrice;
      
      Object.entries(selectedAttributes).forEach(([attrId, optionId]) => {
        const attributeSet = product.attributes.find(
          attr => attr.attribute.attributeId === attrId
        );
        
        if (attributeSet) {
          const option = attributeSet.options.find(opt => opt.optionId === optionId);
          if (option?.priceAdjustment) {
            price += option.priceAdjustment;
          }
        }
      });
      
      return price;
    }
  
    /**
     * 获取可用的属性组合
     */
    static getAvailableAttributeCombinations(
      product: Product
    ): Record<string, string[]> {
      const result: Record<string, string[]> = {};
      
      if (!product.attributes || !product.skus) return result;
      
      product.attributes.forEach((attrSet: AttributeSet) => {
        const attrId = attrSet.attribute.attributeId;
        result[attrId] = [];
        
        attrSet.options.forEach((option: AttributeOption) => {
          const hasSku = product.skus.some((sku: ProductSKU) => 
            sku.attributes[attrId] === option.optionId &&
            sku.isActive !== false &&
            sku.stockCount > 0
          );
          
          if (hasSku) {
            result[attrId].push(option.optionId);
          }
        });
      });
      
      return result;
    }
  
    /**
     * 获取排序后的属性列表
     */
    static getSortedAttributes(product: Product): AttributeSet[] {
      if (!product.attributes) return [];
      
      return [...product.attributes].sort(
        (a: AttributeSet, b: AttributeSet) => a.attribute.displayOrder - b.attribute.displayOrder
      );
    }
  
    /**
     * 获取SKU图片
     */
    static getSkuImages(product: Product, sku: ProductSKU): string[] {
      if (sku.images && sku.images.length > 0) {
        return sku.images;
      }
      
      if (product.attributes) {
        const colorAttr = product.attributes.find(
          attr => attr.attribute.attributeId === 'color'
        );
        
        if (colorAttr) {
          const colorOptionId = sku.attributes['color'];
          const colorOption = colorAttr.options.find(opt => opt.optionId === colorOptionId);
          
          if (colorOption?.previewImage) {
            return [colorOption.previewImage];
          }
        }
      }
      
      return product.defaultImages || [];
    }
  
    /**
     * 获取产品主图
     */
    static getMainImage(product: Product, selectedSku?: ProductSKU): string {
      if (selectedSku && selectedSku.images && selectedSku.images.length > 0) {
        return selectedSku.images[0];
      }
      
      if (product.mainImage) {
        return product.mainImage;
      }
      
      if (product.defaultImages && product.defaultImages.length > 0) {
        return product.defaultImages[0];
      }
      
      return '/images/placeholder-product.jpg';
    }
  
    /**
     * 获取产品所有图片
     */
    static getAllProductImages(product: Product, selectedSku?: ProductSKU): string[] {
      if (selectedSku && selectedSku.images && selectedSku.images.length > 0) {
        return selectedSku.images;
      }
      
      if (product.defaultImages && product.defaultImages.length > 0) {
        return product.defaultImages;
      }
      
      return ['/images/placeholder-product.jpg'];
    }
  
    /**
     * 获取产品价格区间
     */
    static getPriceRange(product: Product): { 
      min: number; 
      max: number; 
      hasDiscount: boolean;
    } {
      if (!product.skus || product.skus.length === 0) {
        return {
          min: product.basePrice,
          max: product.basePrice,
          hasDiscount: product.compareAtPrice !== undefined && product.compareAtPrice > product.basePrice
        };
      }
      
      const activeSkus = product.skus.filter(sku => sku.isActive !== false);
      
      if (activeSkus.length === 0) {
        return {
          min: product.basePrice,
          max: product.basePrice,
          hasDiscount: product.compareAtPrice !== undefined && product.compareAtPrice > product.basePrice
        };
      }
      
      const prices = activeSkus.map(sku => sku.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      return {
        min: minPrice,
        max: maxPrice,
        hasDiscount: product.compareAtPrice !== undefined && product.compareAtPrice > minPrice
      };
    }
  
    /**
     * 获取默认SKU
     */
    static getDefaultSku(product: Product): ProductSKU | undefined {
      if (!product.skus || product.skus.length === 0) return undefined;
      
      if (product.defaultSkuId) {
        return product.skus.find(sku => sku.skuId === product.defaultSkuId);
      }
      
      const defaultSku = product.skus.find(sku => sku.isDefault);
      if (defaultSku) return defaultSku;
      
      return product.skus.find(sku => sku.isActive !== false && sku.stockCount > 0) ||
             product.skus[0];
    }
  
    /**
     * 检查产品是否有库存
     */
    static isProductInStock(product: Product): boolean {
      if (!product.skus) return false;
      
      return product.skus.some(sku => 
        sku.isActive !== false && sku.stockCount > 0
      );
    }
  
    /**
     * 获取可用的SKU列表
     */
    static getAvailableSkus(product: Product): ProductSKU[] {
      if (!product.skus) return [];
      
      return product.skus.filter(sku => 
        sku.isActive !== false && sku.stockCount > 0
      );
    }
  
    /**
     * 检查属性选项是否有货
     */
    static isAttributeOptionAvailable(
      product: Product,
      attributeId: string,
      optionId: string
    ): boolean {
      if (!product.skus) return false;
      
      return product.skus.some((sku: ProductSKU) =>
        sku.attributes[attributeId] === optionId &&
        sku.isActive !== false &&
        sku.stockCount > 0
      );
    }
  
    /**
     * 对产品特性按 order 排序
     */
    static sortFeatures(features?: ProductFeature[]): ProductFeature[] {
      if (!features) return [];
      
      return [...features].sort((a: ProductFeature, b: ProductFeature) => 
        (a.order || 0) - (b.order || 0)
      );
    }
    
    /**
     * 对规格项按 order 排序
     */
    static sortSpecItems(items?: SpecItem[]): SpecItem[] {
      if (!items) return [];
      
      return [...items].sort((a: SpecItem, b: SpecItem) => 
        (a.order || 0) - (b.order || 0)
      );
    }
    
    /**
     * 获取排序后的完整规格信息
     */
    static getSortedSpecifications(specs?: ProductSpecs): ProductSpecs | undefined {
      if (!specs) return undefined;
      
      const sortedSpecs: ProductSpecs = {};
      
      Object.entries(specs).forEach(([category, specGroup]) => {
        sortedSpecs[category] = {
          ...specGroup,
          items: this.sortSpecItems(specGroup.items)
        };
      });
      
      return sortedSpecs;
    }
  }
  
  // ========== 本地化工具函数 ==========
  export class LocalizationUtils {
    /**
     * 获取本地化文本
     */
    static getText(
      text: { [key: string]: string } | undefined,
      locale: 'zh-CN' | 'en' = 'zh-CN'
    ): string {
      if (!text) return '';
      
      return text[locale] || text['zh-CN'] || text['en'] || '';
    }
  
    /**
     * 格式化价格
     */
    static formatPrice(price: number, locale: 'zh-CN' | 'en' = 'zh-CN'): string {
      if (locale === 'zh-CN') {
        return `¥${price.toLocaleString('zh-CN')}`;
      } else {
        return `¥${price.toLocaleString('en-US')}`;
      }
    }
  
    /**
     * 格式化日期
     */
    static formatDate(date: Date, locale: 'zh-CN' | 'en' = 'zh-CN'): string {
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // /**
    //  * 获取当前语言
    //  */
    // static getCurrentLocale(): keyof LocalizedText {
    //   if (typeof window !== 'undefined') {
    //     const browserLang = navigator.language;
    //     if (browserLang.startsWith('zh')) {
    //       return 'zh-CN';
    //     } else if (browserLang.startsWith('en')) {
    //       return 'en';
    //     }
    //   }
    //   return 'zh-CN';
    // }
  }
  
  // ========== 变体工具函数 ==========
  export class VariantUtils {
    /**
     * 根据属性组合查找匹配的变体
     */
    static findMatchingVariant(
      product: Product,
      attributes: Record<string, string>
    ): Variant | undefined {
      if (!product.variants || product.variants.length === 0) return undefined;
      
      return product.variants.find((variant: Variant) => {
        return Object.entries(variant.attributes).every(
          ([attrId, value]) => attributes[attrId] === value
        );
      });
    }
    
    /**
     * 获取变体的所有SKU
     */
    static getSkusForVariant(
      product: Product,
      variant: Variant
    ): ProductSKU[] {
      if (!product.skus) return [];
      
      if (!variant.skuIds || variant.skuIds.length === 0) {
        // 如果没有指定SKU IDs，查找匹配的SKU
        return product.skus.filter((sku: ProductSKU) => {
          return Object.entries(variant.attributes).every(
            ([attrId, value]) => sku.attributes[attrId] === value
          );
        });
      }
      
      // 如果有指定SKU IDs，直接查找
      return product.skus.filter(sku => 
        variant.skuIds!.includes(sku.skuId)
      );
    }
    
    /**
     * 变体是否可用（有库存）
     */
    static isVariantAvailable(
      product: Product,
      variant: Variant
    ): boolean {
      const skus = this.getSkusForVariant(product, variant);
      return skus.some(sku => sku.stockCount > 0);
    }
    
    /**
     * 获取变体的价格范围
     */
    static getVariantPriceRange(
      product: Product,
      variant: Variant
    ): { min: number; max: number } {
      const skus = this.getSkusForVariant(product, variant);
      
      if (skus.length === 0) {
        return { min: variant.price, max: variant.price };
      }
      
      const prices = skus.map(sku => sku.price);
      return {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
    }
    
    /**
     * 选择变体后自动选择对应的属性
     */
    static getAttributesFromVariant(variant: Variant): Record<string, string> {
      return { ...variant.attributes };
    }
  }
  
  // ========== 评价工具函数 ==========
  export class ReviewUtils {
    /**
     * 计算平均评分
     */
    static calculateAverageRating(reviews?: ProductReview[]): number {
      if (!reviews || reviews.length === 0) return 0;
      
      const total = reviews.reduce((sum, review) => sum + review.rating, 0);
      return parseFloat((total / reviews.length).toFixed(1));
    }
    
    /**
     * 获取评分分布
     */
    static getRatingDistribution(reviews?: ProductReview[]): Record<number, { 
      count: number; 
      percentage: number; 
    }> {
      const distribution: Record<number, { count: number; percentage: number }> = {
        1: { count: 0, percentage: 0 },
        2: { count: 0, percentage: 0 },
        3: { count: 0, percentage: 0 },
        4: { count: 0, percentage: 0 },
        5: { count: 0, percentage: 0 }
      };
      
      if (!reviews) return distribution;
      
      reviews.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
          const rating = Math.round(review.rating);
          distribution[rating].count++;
        }
      });
      
      const total = reviews.length;
      [1, 2, 3, 4, 5].forEach(rating => {
        distribution[rating].percentage = total > 0 
          ? Math.round((distribution[rating].count / total) * 100) 
          : 0;
      });
      
      return distribution;
    }
    
    /**
     * 获取有图的评价
     */
    static getReviewsWithImages(reviews?: ProductReview[]): ProductReview[] {
      if (!reviews) return [];
      
      return reviews.filter(review => 
        review.images && review.images.length > 0
      );
    }
    
    /**
     * 获取已验证购买的评价
     */
    static getVerifiedReviews(reviews?: ProductReview[]): ProductReview[] {
      if (!reviews) return [];
      
      return reviews.filter(review => review.verifiedPurchase === true);
    }
    
    /**
     * 排序评价
     */
    static sortReviews(
      reviews: ProductReview[],
      sortBy: 'date' | 'rating' | 'helpful' = 'date',
      order: 'asc' | 'desc' = 'desc'
    ): ProductReview[] {
      const sorted = [...reviews];
      
      switch (sortBy) {
        case 'date':
          sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
          break;
        case 'rating':
          sorted.sort((a, b) => b.rating - a.rating);
          break;
        case 'helpful':
          sorted.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
          break;
      }
      
      if (order === 'asc') {
        sorted.reverse();
      }
      
      return sorted;
    }
    
    /**
     * 格式化评价日期
     */
    static formatReviewDate(date: Date, locale: 'zh-CN' | 'en' = 'zh-CN'): string {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return locale === 'zh-CN' ? '今天' : 'Today';
      } else if (diffDays === 1) {
        return locale === 'zh-CN' ? '昨天' : 'Yesterday';
      } else if (diffDays < 7) {
        return locale === 'zh-CN' ? `${diffDays}天前` : `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return locale === 'zh-CN' ? `${weeks}周前` : `${weeks} weeks ago`;
      } else {
        return date.toLocaleDateString(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    }
    
    /**
     * 生成星级显示
     */
    static renderStars(rating: number, maxStars: number = 5): string {
      const fullStar = '★';
      const emptyStar = '☆';
      
      let stars = '';
      for (let i = 1; i <= maxStars; i++) {
        stars += i <= Math.floor(rating) ? fullStar : emptyStar;
      }
      
      // 处理半星
      if (rating % 1 >= 0.5) {
        const starsArray = stars.split('');
        const starIndex = Math.floor(rating);
        if (starIndex < maxStars) {
          starsArray[starIndex] = '⯨'; // 半星符号
        }
        stars = starsArray.join('');
      }
      
      return stars;
    }
  }
  
  // ========== 元数据工具函数 ==========
  export class MetadataUtils {
    /**
     * 安全的获取 metadata 值
     */
    static getMetadataValue<T = any>(
      option: AttributeOption,
      key: string,
      defaultValue?: T
    ): T | undefined {
      if (!option.metadata) return defaultValue;
      return (option.metadata as Record<string, T>)[key] || defaultValue;
    }
    
    /**
     * 获取颜色元数据
     */
    static getColorMetadata(option: AttributeOption): {
      hex?: string;
      rgb?: { r: number; g: number; b: number };
      pantone?: string;
      isNew?: boolean;
    } {
      if (!option.metadata) return {};
      
      return {
        hex: (option.metadata as any).hex as string || option.value,
        rgb: (option.metadata as any).rgb as { r: number; g: number; b: number },
        pantone: (option.metadata as any).pantone as string,
        isNew: (option.metadata as any).isNew as boolean
      };
    }
    
    /**
     * 获取尺码元数据
     */
    static getSizeMetadata(option: AttributeOption): {
      measurements?: Record<string, any>;
      recommended?: Record<string, any>;
      international?: Record<string, string>;
    } {
      if (!option.metadata) return {};
      
      return {
        measurements: (option.metadata as any).measurements as Record<string, any>,
        recommended: (option.metadata as any).recommended as Record<string, any>,
        international: (option.metadata as any).international as Record<string, string>
      };
    }
    
    /**
     * 检查是否是限量款
     */
    static isLimitedEdition(option: AttributeOption): boolean {
      return this.getMetadataValue(option, 'isLimited', false) as boolean;
    }
    
    /**
     * 获取限量信息
     */
    static getLimitedInfo(option: AttributeOption): {
      isLimited: boolean;
      limitedStock?: number;
      limitedUntil?: string;
    } | null {
      if (!this.isLimitedEdition(option)) return null;
      
      return {
        isLimited: true,
        limitedStock: this.getMetadataValue(option, 'limitedStock') as number,
        limitedUntil: this.getMetadataValue(option, 'limitedUntil') as string
      };
    }
    
    /**
     * 获取季节信息
     */
    static getSeasonInfo(option: AttributeOption): string[] {
      return this.getMetadataValue(option, 'season', []) as string[];
    }
    
    /**
     * 获取技术规格
     */
    static getTechSpecs(option: AttributeOption): Record<string, any> {
      if (!option.metadata) return {};
      
      const { season, isLimited, isNew, ...techSpecs } = option.metadata as Record<string, any>;
      return techSpecs;
    }
  }
  
  // ========== 数据查询工具函数 ==========
  export class ProductQueries {
    /**
     * 根据ID获取产品
     */
    static getProductById(products: Product[], productId: string): Product | undefined {
      return products.find(product => product.productId === productId);
    }
  
    /**
     * 根据产品编码获取产品
     */
    static getProductByCode(products: Product[], productCode: string): Product | undefined {
      return products.find(product => product.productCode === productCode);
    }
  
    /**
     * 获取所有产品
     */
    static getAllProducts(products: Product[]): Product[] {
      return products;
    }
  
    /**
     * 获取推荐产品
     */
    static getFeaturedProducts(products: Product[]): Product[] {
      return products.filter(product => product.isFeatured === true);
    }
  
    /**
     * 根据分类获取产品
     */
    static getProductsByCategory(products: Product[], category: string): Product[] {
      return products.filter(product => 
        product.category.startsWith(category)
      );
    }
  
    /**
     * 根据品牌获取产品
     */
    static getProductsByBrand(products: Product[], brand: string): Product[] {
      return products.filter(product => product.brand === brand);
    }
  
    /**
     * 获取在售产品
     */
    static getActiveProducts(products: Product[]): Product[] {
      return products.filter(product => product.status === 'active');
    }
  
    /**
     * 搜索产品
     */
    static searchProducts(
      products: Product[],
      query: string,
      locale: 'zh-CN' | 'en' = 'zh-CN'
    ): Product[] {
      const lowerQuery = query.toLowerCase();
      
      return products.filter(product => {
        const name = LocalizationUtils.getText(product.name, locale);
        const description = LocalizationUtils.getText(product.description, locale);
        const shortDescription = product.shortDescription
          ? LocalizationUtils.getText(product.shortDescription, locale)
          : '';
        
        return (
          name.toLowerCase().includes(lowerQuery) ||
          description.toLowerCase().includes(lowerQuery) ||
          shortDescription.toLowerCase().includes(lowerQuery) ||
          product.productCode.toLowerCase().includes(lowerQuery) ||
          product.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      });
    }
  
    /**
     * 按价格筛选产品
     */
    static filterByPriceRange(
      products: Product[],
      minPrice?: number,
      maxPrice?: number
    ): Product[] {
      return products.filter(product => {
        const priceRange = ProductUtils.getPriceRange(product);
        
        if (minPrice !== undefined && priceRange.min < minPrice) return false;
        if (maxPrice !== undefined && priceRange.max > maxPrice) return false;
        
        return true;
      });
    }
  
    /**
     * 按库存状态筛选产品
     */
    static filterByStockStatus(
      products: Product[],
      inStockOnly: boolean = true
    ): Product[] {
      if (!inStockOnly) return products;
      
      return products.filter(product => ProductUtils.isProductInStock(product));
    }
  }
  
  // ========== 数据管理工具 ==========
  export class ProductDataManager {
    /**
     * 导出产品数据为JSON
     */
    static exportToJson(products: Product[]): string {
      return JSON.stringify(products, null, 2);
    }
  
    /**
     * 从JSON导入产品数据
     */
    static importFromJson(json: string): Product[] {
      try {
        const parsed = JSON.parse(json);
        
        if (!Array.isArray(parsed)) {
          throw new Error('产品数据必须是数组');
        }
        
        // 转换日期字符串为Date对象
        const processed = parsed.map((product: any) => {
          const processedProduct = { ...product };
          
          // 处理创建和更新日期
          if (processedProduct.createdAt) {
            processedProduct.createdAt = new Date(processedProduct.createdAt);
          }
          if (processedProduct.updatedAt) {
            processedProduct.updatedAt = new Date(processedProduct.updatedAt);
          }
          
          // 处理SKU的日期
          if (processedProduct.skus) {
            processedProduct.skus = processedProduct.skus.map((sku: any) => {
              if (sku.createdAt) sku.createdAt = new Date(sku.createdAt);
              if (sku.updatedAt) sku.updatedAt = new Date(sku.updatedAt);
              return sku;
            });
          }
          
          // 处理评价的日期
          if (processedProduct.reviews) {
            processedProduct.reviews = processedProduct.reviews.map((review: any) => {
              if (review.date) review.date = new Date(review.date);
              return review;
            });
          }
          
          return processedProduct as Product;
        });
        
        return processed;
      } catch (error) {
        console.error('导入产品数据失败:', error);
        return [];
      }
    }
  
    /**
     * 验证产品数据
     */
    static validateProduct(product: Product): string[] {
      const errors: string[] = [];
      
      if (!product.productId) errors.push('缺少产品ID');
      if (!product.productCode) errors.push('缺少产品编码');
      if (!product.name || !product.name['zh-CN']) errors.push('缺少产品名称');
      if (!product.basePrice || product.basePrice <= 0) errors.push('价格无效');
      if (!product.category) errors.push('缺少分类');
      if (!product.brand) errors.push('缺少品牌');
      
      // 验证SKU
      if (!product.skus || product.skus.length === 0) {
        errors.push('至少需要一个SKU');
      } else {
        product.skus.forEach((sku: ProductSKU, index: number) => {
          if (!sku.skuId) errors.push(`SKU ${index}: 缺少SKU ID`);
          if (!sku.skuCode) errors.push(`SKU ${index}: 缺少SKU编码`);
          if (!sku.price || sku.price <= 0) errors.push(`SKU ${index}: 价格无效`);
          if (sku.stockCount === undefined || sku.stockCount < 0) {
            errors.push(`SKU ${index}: 库存数量无效`);
          }
        });
      }
      
      return errors;
    }
  
    /**
     * 获取产品统计数据
     */
    static getProductStats(products: Product[]): {
      totalProducts: number;
      activeProducts: number;
      featuredProducts: number;
      outOfStockProducts: number;
      totalCategories: number;
      totalBrands: number;
      totalSkus: number;
      totalInStock: number;
      categories: string[];
      brands: string[];
    } {
      const totalProducts = products.length;
      const activeProducts = products.filter(p => p.status === 'active').length;
      const featuredProducts = products.filter(p => p.isFeatured).length;
      const outOfStockProducts = products.filter(p => !ProductUtils.isProductInStock(p)).length;
      
      const categories = new Set(products.map(p => p.category));
      const brands = new Set(products.map(p => p.brand));
      
      const totalSkus = products.reduce((sum, p) => sum + (p.skus?.length || 0), 0);
      const totalInStock = products.reduce((sum, p) => {
        return sum + (p.skus?.reduce((skuSum, sku) => skuSum + (sku.stockCount || 0), 0) || 0);
      }, 0);
      
      return {
        totalProducts,
        activeProducts,
        featuredProducts,
        outOfStockProducts,
        totalCategories: categories.size,
        totalBrands: brands.size,
        totalSkus,
        totalInStock,
        categories: Array.from(categories),
        brands: Array.from(brands)
      };
    }
  }
  
  // 默认导出所有工具类
  export default {
    BaseUtils,
    ProductUtils,
    LocalizationUtils,
    VariantUtils,
    ReviewUtils,
    MetadataUtils,
    ProductQueries,
    ProductDataManager
  };