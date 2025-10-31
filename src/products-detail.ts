import { initProductDetail } from './components/render-product-detail.js';
import { initI18n } from './i18n/init-i18n.js';
import { i18n } from './i18n/i18n.js';

console.log('[products-detail.ts] Module loaded');

// 初始化国际化（确保先初始化）
try {
  initI18n();
  console.log('[products-detail.ts] initI18n() called');
} catch (e) {
  console.error('[products-detail.ts] Error calling initI18n():', e);
}

// 确保 i18n 实例已暴露到 window
if (typeof window !== 'undefined') {
  if (!(window as any).i18n) {
    (window as any).i18n = i18n;
    console.log('[products-detail.ts] i18n exposed to window');
  } else {
    console.log('[products-detail.ts] window.i18n already exists');
  }
}

// 等待 i18n 和 DOM 都准备好后再初始化产品详情页
// 因为 initI18n() 会调用 i18n.init()，需要一些时间
// 同时 header 是动态加载的，也需要等待
function init() {
  console.log('[products-detail.ts] init() called, readyState:', document.readyState);
  
  // 确保 i18n 已初始化
  try {
    const lang = i18n.getLang();
    if (!lang) {
      console.log('[products-detail.ts] i18n not ready, retrying...');
      setTimeout(init, 50);
      return;
    }
    console.log('[products-detail.ts] i18n ready, language:', lang);
  } catch (e) {
    console.warn('[products-detail.ts] Error checking i18n, retrying...', e);
    setTimeout(init, 50);
    return;
  }
  
  // 调用产品详情页初始化
  console.log('[products-detail.ts] Calling initProductDetail()');
  try {
    initProductDetail();
  } catch (e) {
    console.error('[products-detail.ts] Error calling initProductDetail():', e);
  }
}

console.log('[products-detail.ts] Setting up initialization');

if (document.readyState === 'loading') {
  console.log('[products-detail.ts] DOM loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[products-detail.ts] DOMContentLoaded fired');
    setTimeout(init, 200);
  });
} else {
  console.log('[products-detail.ts] DOM already ready');
  setTimeout(init, 300);
}

