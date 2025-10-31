import { initProductDetail } from './components/render-product-detail.js';
import { initI18n } from './i18n/init-i18n.js';
import { i18n } from './i18n/i18n.js';

// 初始化国际化（确保先初始化）
initI18n();

// 确保 i18n 实例已暴露到 window
if (typeof window !== 'undefined' && !(window as any).i18n) {
  (window as any).i18n = i18n;
}

// 等待 i18n 和 DOM 都准备好后再初始化产品详情页
// 因为 initI18n() 会调用 i18n.init()，需要一些时间
// 同时 header 是动态加载的，也需要等待
function init() {
  // 确保 i18n 已初始化
  try {
    const lang = i18n.getLang();
    if (!lang) {
      setTimeout(init, 50);
      return;
    }
  } catch (e) {
    setTimeout(init, 50);
    return;
  }
  
  // 调用产品详情页初始化
  initProductDetail();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(init, 200);
  });
} else {
  setTimeout(init, 300);
}

