// 轮播组件相关类型
export interface SlideItem {
  type: 'image' | 'video';
  src: string;
  alt?: string; // 图片的 alt 文本
  poster?: string; // 视频的 poster
  controls?: boolean; // 视频是否显示控制条
}

export interface CarouselConfig {
  intervalMs: number;
  transitionMs: number;
  autoPlay: boolean;
  slides?: SlideItem[]; // 可选的 slides 数据数组
}

export interface CarouselState {
  currentIndex: number;
  isPlaying: boolean;
  isPointerDown: boolean;
  startX: number;
  deltaX: number;
}

// 产品相关类型
// export interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: string;
//   image: string;
//   features: string[];
//   specs: ProductSpec[];
// }

// export interface ProductSpec {
//   label: string;
//   value: string;
// }
export interface ProductAttribute {
  attributeId: string;
  attributeName: {[key: string]: string};
  type: 'color' | 'text' | 'image' | 'select';
  isRequired: boolean;
  displayOrder: number;
  description?: {[key: string]: string};
  helpText?: {[key: string]: string};
  icon?: string;
}

export interface AttributeOption {
  optionId: string;
  optionName: {[key: string]: string};
  value: string;
  previewImage?: string;
  description?: {[key: string]: string};
  priceAdjustment?: number;
  inStock?: boolean;
  stockCount?: number;
  displayOrder?: number;
  metadata?: Record<string, any>;
}

export interface AttributeSet {
  attribute: ProductAttribute;
  options: AttributeOption[];
  selectedOptionId?: string;
}

export interface ProductFeature {
  icon: string;
  title: {[key: string]: string};
  description: {[key: string]: string};
  order?: number;
}

export interface SpecItem {
  name: {[key: string]: string};
  value: {[key: string]: string};
  unit?: string;
  order?: number;
}

export interface ProductSpecs {
  [category: string]: {
    label: {[key: string]: string};
    items: SpecItem[];
  };
}

export interface Variant {
  variantId: string;
  name: {[key: string]: string};
  description?: {[key: string]: string};
  attributes: Record<string, string>;
  price: number;
  skuIds?: string[];
}

export interface ProductSKU {
  skuId: string;
  skuCode: string;
  attributes: Record<string, string>;
  price: number;
  originalPrice?: number;
  stockCount: number;
  images: string[];
  isDefault?: boolean;
  isActive?: boolean;
  metadata?: {
    weight?: number;
    weightUnit?: 'g' | 'kg';
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      unit?: 'mm' | 'cm' | 'm';
    };
    barcode?: string;
    manufacturerSku?: string;
    [key: string]: any;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductReview {
  reviewId: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  content: string;
  date: Date;
  verifiedPurchase?: boolean;
  helpfulCount?: number;
  images?: string[];
  attributes?: Record<string, any>;
}

export interface Product {
  productId: string;
  productCode: string;
  name: {[key: string]: string};
  description: {[key: string]: string};
  shortDescription?: {[key: string]: string};
  tagline?: {[key: string]: string};
  category: string;
  brand: string;
  basePrice: number;
  compareAtPrice?: number;
  priceDisplay: {[key: string]: string};
  mainImage?: string;
  defaultImages?: string[];
  videos?: string[];
  attributes: AttributeSet[];
  skus: ProductSKU[];
  defaultSkuId?: string;
  variants?: Variant[];
  features?: ProductFeature[];
  specs?: ProductSpecs;
  reviews?: ProductReview[];
  averageRating?: number;
  reviewCount?: number;
  tags?: string[];
  badges?: {
    text: string;
    type: 'new' | 'sale' | 'hot' | 'limited';
    color?: string;
  }[];
  promotions?: {
    type: 'discount' | 'gift' | 'coupon';
    value: string;
    description: {[key: string]: string};
  }[];
  status: 'active' | 'draft' | 'archived';
  isFeatured?: boolean;
  isInStock?: boolean;
  createdAt: Date;
  updatedAt: Date;
  salesCount?: number;
  viewCount?: number;
}

// 导航相关类型
export interface NavigationItem {
  label: string;
  href: string;
}

// 媒体播放相关类型
export interface MediaElement extends Omit<HTMLVideoElement, 'loop'> {
  loop?: boolean;
}

// 事件处理器类型
export type PointerEventHandler = (x: number) => void;
export type MediaEventHandler = () => void;


