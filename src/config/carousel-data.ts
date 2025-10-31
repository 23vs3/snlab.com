import type { SlideItem } from '../types/index.js';

export const carouselSlides: SlideItem[] = [
  {
    type: 'image',
    src: '/images/carousel_1.png',//'https://picsum.photos/seed/bo-hero1/1600/900',
    alt: '沉浸音乐的瞬间'
  },
//   {
//     type: 'image',
//     src: 'https://picsum.photos/seed/bo-hero2/1600/900',
//     alt: '优雅客厅中的音响'
//   },
  {
    type: 'image',
    src: '/images/carousel_2.png',//'https://picsum.photos/seed/bo-hero3/1600/900',
    alt: '都市出行与耳机'
  },
  {
    type: 'video',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://picsum.photos/seed/bo-hero-video/1600/900',
    controls: true
  }
];

