/**
 * 构建脚本：为每个产品生成独立的目录和 index.html
 * 这样可以保持干净的 URL 格式：/products/{productId}/
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// 由于这是构建后脚本，我们需要读取编译后的 JS 文件或直接读取 TS 文件
// 使用动态导入来处理

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const productsDistDir = path.join(distDir, 'products');
const productTemplatePath = path.join(distDir, 'products', 'index.html'); // 使用构建后的模板

// 读取产品数据（从构建后的 JS 文件或从源代码读取）
// 由于这是 postbuild 脚本，我们直接从 dist 中读取构建后的数据
// 或者从源代码读取产品 ID 列表
const productsDataPath = path.join(rootDir, 'src', 'config', 'products-data.ts');
let products = [];

try {
  // 尝试从 TypeScript 源代码读取产品列表
  const productsDataContent = fs.readFileSync(productsDataPath, 'utf-8');
  // 简单解析 productId
  const productIdMatches = productsDataContent.match(/productId:\s*['"]([^'"]+)['"]/g);
  if (productIdMatches) {
    products = productIdMatches.map(match => ({
      productId: match.match(/['"]([^'"]+)['"]/)[1]
    }));
  } else {
    // 如果解析失败，使用硬编码的产品列表
    products = [
      { productId: 'a1' },
      { productId: 'h100' },
      { productId: 'a5' }
    ];
  }
} catch (e) {
  // 如果读取失败，使用硬编码的产品列表
  console.warn('无法读取产品数据，使用默认产品列表');
  products = [
    { productId: 'a1' },
    { productId: 'h100' },
    { productId: 'a5' }
  ];
}

// 读取产品详情页模板（从构建后的文件）
const template = fs.readFileSync(productTemplatePath, 'utf-8');

// 为每个产品创建目录和 index.html
products.forEach(product => {
  const productDir = path.join(productsDistDir, product.productId);
  
  // 创建产品目录
  if (!fs.existsSync(productDir)) {
    fs.mkdirSync(productDir, { recursive: true });
  }
  
  // 创建 index.html 文件
  const productIndexPath = path.join(productDir, 'index.html');
  
  // 修改模板，添加默认的 productId 到 URL 查询参数
  // 这样当访问 /products/{productId}/ 时，JavaScript 可以正确识别
  // 查找并替换构建后的产品脚本标签（可能在 head 或 body 中）
  let modifiedTemplate = template;
  
  // 添加一个立即执行的脚本，确保产品详情页初始化代码能够执行
  // 由于 ES 模块可能有加载时机问题，添加内联脚本作为备用
  const inlineScript = `
  <script>
    // 备用初始化脚本：确保产品详情页能够加载
    console.log('[Product Page] Script loaded for product: ${product.productId}');
    console.log('[Product Page] Current pathname:', window.location.pathname);
    
    // 尝试从 URL 路径提取 productId
    function getProductIdFromPath() {
      const pathname = window.location.pathname;
      const match = pathname.match(/\\/products\\/([^\\/]+)\\/?$/);
      if (match && match[1] && match[1] !== 'index.html' && !match[1].includes('.')) {
        return match[1];
      }
      return '${product.productId}'; // 回退到已知的 productId
    }
    
    // 强制初始化函数（备用方案）
    function forceInitProductDetail() {
      const productId = getProductIdFromPath();
      console.log('[Product Page] Force init called for productId:', productId);
      
      // 首先检查脚本是否已加载
      const scripts = document.querySelectorAll('script[type="module"]');
      console.log('[Product Page] Found', scripts.length, 'ES module scripts');
      scripts.forEach(function(script, index) {
        console.log('[Product Page] Script', index + ':', script.src || 'inline');
      });
      
      // 检查是否可以通过 window 访问产品数据和渲染函数
      if (typeof window !== 'undefined') {
        let attempts = 0;
        const maxAttempts = 50; // 最多尝试 10 秒（200ms * 50）
        
        // 等待一段时间让模块加载
        const checkInterval = setInterval(function() {
          attempts++;
          
          // 检查产品是否已渲染
          const productTitle = document.getElementById('product-title');
          if (productTitle && productTitle.textContent !== '加载中...') {
            console.log('[Product Page] Product detail already rendered');
            clearInterval(checkInterval);
            return;
          }
          
          // 尝试通过全局变量访问初始化函数
          if (typeof window.initProductDetail === 'function') {
            console.log('[Product Page] Calling window.initProductDetail()');
            try {
              window.initProductDetail();
              clearInterval(checkInterval);
              return;
            } catch (e) {
              console.error('[Product Page] Error calling initProductDetail:', e);
            }
          }
          
          // 检查模块是否已加载（通过检查 window.i18n 或产品数据）
          if (typeof window.i18n !== 'undefined' && typeof window.products !== 'undefined') {
            console.log('[Product Page] Module loaded, attempting direct render...');
            // 如果模块加载了但初始化函数不可用，尝试直接调用
            if (window.products && Array.isArray(window.products)) {
              const product = window.products.find(function(p) {
                return p.productId === productId;
              });
              if (product && typeof window.renderProductDetail === 'function') {
                console.log('[Product Page] Found product, calling renderProductDetail');
                try {
                  window.renderProductDetail(productId);
                  clearInterval(checkInterval);
                  return;
                } catch (e) {
                  console.error('[Product Page] Error calling renderProductDetail:', e);
                }
              }
            }
          }
          
          // 如果模块未加载，尝试手动加载脚本
          if (attempts === 5 && typeof window.i18n === 'undefined') {
            console.warn('[Product Page] Module not loaded after 1 second, checking script loading...');
            // 检查脚本标签是否存在于 DOM
            const moduleScript = document.querySelector('script[type="module"][src*="product"]');
            if (moduleScript) {
              console.log('[Product Page] Found module script tag:', moduleScript.src);
              // 检查是否有加载错误
              moduleScript.addEventListener('error', function(e) {
                console.error('[Product Page] Module script loading error:', e);
              });
              moduleScript.addEventListener('load', function() {
                console.log('[Product Page] Module script loaded');
              });
            } else {
              console.error('[Product Page] Module script tag not found in DOM!');
            }
          }
          
          // 达到最大尝试次数
          if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            const productTitle = document.getElementById('product-title');
            if (productTitle && productTitle.textContent === '加载中...') {
              console.error('[Product Page] Failed to initialize product detail after', maxAttempts * 200, 'ms');
              console.error('[Product Page] Module check - window.i18n:', typeof window.i18n);
              console.error('[Product Page] Module check - window.products:', typeof window.products);
              console.error('[Product Page] Module check - window.initProductDetail:', typeof window.initProductDetail);
              console.error('[Product Page] Module check - window.renderProductDetail:', typeof window.renderProductDetail);
              
              // 最后尝试：如果模块未加载，使用硬编码的备用产品数据
              console.warn('[Product Page] Module failed to load, using fallback product data...');
              
              // 硬编码产品数据（仅 A1 产品的基本信息）
              const fallbackProducts = {
                'a1': {
                  name: { 'zh-CN': '便携式音箱 A1', 'en': 'Portable Speaker A1' },
                  tagline: { 'zh-CN': '聆听强劲且悦耳的音效。灵活便携设计。', 'en': 'Experience powerful and pleasant sound. Flexible portable design.' },
                  price: { 'zh-CN': '来自 ¥2,980', 'en': 'From ¥2,980' },
                  image: 'https://picsum.photos/seed/a1-detail/800/600',
                  description: { 'zh-CN': '轻巧随行，持久续航，全天候陪伴你的灵感。', 'en': 'Lightweight and portable, long-lasting battery, accompanies your inspiration all day long.' }
                },
                'h100': {
                  name: { 'zh-CN': '头戴耳机 H100', 'en': 'Headphones H100' },
                  tagline: { 'zh-CN': '卓越音质，舒适佩戴。', 'en': 'Excellent sound quality, comfortable to wear.' },
                  price: { 'zh-CN': '来自 ¥1,980', 'en': 'From ¥1,980' },
                  image: 'https://picsum.photos/seed/h100/800/600',
                  description: { 'zh-CN': '沉浸降噪，细腻还原，日常与通勤的惬意之选。', 'en': 'Immersive noise cancellation, delicate sound reproduction, perfect for daily use and commuting.' }
                },
                'a5': {
                  name: { 'zh-CN': '多房间音响 A5', 'en': 'Multi-Room Speaker A5' },
                  tagline: { 'zh-CN': '艺术与科技的融合，打造沉浸式家居音效。', 'en': 'The fusion of art and technology, creating immersive home audio.' },
                  price: { 'zh-CN': '来自 ¥5,980', 'en': 'From ¥5,980' },
                  image: 'https://picsum.photos/seed/a5/800/600',
                  description: { 'zh-CN': '温润木质与金属质感，设计与听感的平衡之作。', 'en': 'A balance of warm wood and metal texture, design and sound quality.' }
                }
              };
              
              const fallbackProduct = fallbackProducts[productId];
              if (fallbackProduct) {
                console.log('[Product Page] Rendering fallback product data for:', productId);
                try {
                  const lang = 'zh-CN'; // 默认中文
                  
                  // 更新 DOM 元素
                  const updates = [
                    { id: 'product-title', text: fallbackProduct.name[lang] },
                    { id: 'product-tagline', text: fallbackProduct.tagline[lang] },
                    { id: 'product-price', text: fallbackProduct.price[lang] },
                    { id: 'product-name', text: fallbackProduct.name[lang] }
                  ];
                  
                  updates.forEach(function(item) {
                    const el = document.getElementById(item.id);
                    if (el) {
                      el.textContent = item.text;
                      console.log('[Product Page] Updated', item.id, ':', item.text);
                    }
                  });
                  
                  // 更新图片
                  const imageEl = document.getElementById('product-image');
                  if (imageEl) {
                    imageEl.src = fallbackProduct.image;
                    imageEl.alt = fallbackProduct.name[lang];
                  }
                  
                  // 更新页面标题
                  document.title = fallbackProduct.name[lang] + ' - SINIAN LAB';
                  
                  console.log('[Product Page] Fallback render completed successfully');
                } catch (e) {
                  console.error('[Product Page] Error in fallback render:', e);
                }
              } else {
                console.error('[Product Page] No fallback data for productId:', productId);
              }
            }
          }
        }, 200);
      }
    }
    
    // 监听模块加载完成
    window.addEventListener('load', function() {
      console.log('[Product Page] Window loaded, checking if product detail initialized...');
      setTimeout(function() {
        // 检查是否已经有内容渲染
        const productTitle = document.getElementById('product-title');
        if (productTitle && productTitle.textContent === '加载中...') {
          console.warn('[Product Page] Product detail not initialized after load, pathname:', window.location.pathname);
          console.warn('[Product Page] Available window.i18n:', typeof window.i18n !== 'undefined');
          // 尝试强制初始化
          forceInitProductDetail();
        } else {
          console.log('[Product Page] Product detail already initialized');
        }
      }, 1500);
    });
    
    // 也尝试立即检查（不等待 load 事件）
    setTimeout(function() {
      const productTitle = document.getElementById('product-title');
      if (productTitle && productTitle.textContent === '加载中...') {
        console.log('[Product Page] Product still loading after 500ms, attempting force init...');
        forceInitProductDetail();
      }
    }, 500);
  </script>`;
  
  // 在 </body> 之前插入脚本
  if (modifiedTemplate.includes('</body>')) {
    modifiedTemplate = modifiedTemplate.replace('</body>', `${inlineScript}</body>`);
  } else {
    // 如果没有 </body>，在最后添加
    modifiedTemplate += inlineScript;
  }
  
  fs.writeFileSync(productIndexPath, modifiedTemplate);
  console.log(`✅ 生成产品页面: /products/${product.productId}/index.html`);
});

console.log(`✅ 已为 ${products.length} 个产品生成页面`);

