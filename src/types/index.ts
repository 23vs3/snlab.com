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
export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  features: string[];
  specs: ProductSpec[];
}

export interface ProductSpec {
  label: string;
  value: string;
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


