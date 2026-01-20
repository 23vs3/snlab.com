import type { SlideItem } from '../types/index.js';

// 获取基础路径，确保在生产环境中路径正确
const getImagePath = (path: string): string => {
  // 如果路径已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // 使用 BASE_URL 确保路径正确（开发环境通常是 '/'，生产环境可能是 '/repo-name/'）
  const baseUrl = import.meta.env.BASE_URL || '/';
  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  // 如果 baseUrl 是 '/'，直接返回路径；否则拼接 baseUrl 和路径
  if (baseUrl === '/') {
    return normalizedPath;
  }
  // 确保 baseUrl 以 / 结尾，路径以 / 开头，然后拼接（移除重复的 /）
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBase}${normalizedPath}`;
};

// #ds
export const carouselSlides: SlideItem[] = [
  {
    type: 'image',
    src: getImagePath('/images/carousel_1.png'),
    alt: '沉浸音乐的瞬间'
  },
//   {
//     type: 'image',
//     src: 'https://picsum.photos/seed/bo-hero2/1600/900',
//     alt: '优雅客厅中的音响'
//   },
  {
    type: 'image',
    src: getImagePath('/images/carousel_2.png'),
    alt: '都市出行与耳机'
  },
  // {
  //   type: 'video',
  //   src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  //   poster: 'https://picsum.photos/seed/bo-hero-video/1600/900',
  //   controls: true
  // }
];

