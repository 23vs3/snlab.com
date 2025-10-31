import { initI18n } from './i18n/init-i18n.js';
import { initWarrantyPage } from './components/render-warranty.js';

// 初始化国际化
initI18n();

// 等待 i18n 和 DOM 都准备好后再初始化保修页面
// 因为 initI18n() 会调用 i18n.init()，需要一些时间
// 同时 header 是动态加载的，也需要等待
setTimeout(() => {
  initWarrantyPage();
}, 200);

