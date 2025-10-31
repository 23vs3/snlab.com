/**
 * 构建脚本：为首页内联产品列表
 * 确保生产环境中产品列表可以立即显示，无需等待 JavaScript 加载
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const indexTemplatePath = path.join(distDir, 'index.html');

// 读取产品数据（从构建后的 JS 文件或从源代码读取）
let products = [];

try {
  // 尝试从构建后的 products-data JS 文件中读取产品数据
  const productsDataFiles = fs.readdirSync(path.join(distDir, 'assets')).filter(f => f.startsWith('products-data-') && f.endsWith('.js'));
  
  if (productsDataFiles.length > 0) {
    const productsDataFile = path.join(distDir, 'assets', productsDataFiles[0]);
    const productsDataJs = fs.readFileSync(productsDataFile, 'utf-8');
    // 尝试提取 products 数组
    try {
      // 使用正则提取数组内容
      const arrayMatch = productsDataJs.match(/export\s+const\s+products\s*=\s*(\[[\s\S]*?\]);/);
      if (arrayMatch) {
        // 安全地评估（仅在构建时执行）
        const moduleCode = productsDataJs.replace(/export\s+const\s+products/, 'const products');
        const func = new Function('return ' + moduleCode.split('=')[1].split(';')[0] + ';');
        products = func();
      }
    } catch (e) {
      console.warn('无法从构建文件提取产品数据:', e);
    }
  }
  
  // 如果无法从构建文件获取，尝试从源代码读取
  if (products.length === 0) {
    const productsDataPath = path.join(rootDir, 'src', 'config', 'products-data.ts');
    const productsDataContent = fs.readFileSync(productsDataPath, 'utf-8');
    // 简单解析 productId（这里只是获取产品数量，实际数据从构建文件获取）
    const productIdMatches = productsDataContent.match(/productId:\s*['"]([^'"]+)['"]/g);
    if (productIdMatches) {
      console.warn('无法从构建文件获取完整产品数据，将跳过内联（使用 JavaScript 动态加载）');
      products = [];
    }
  }
} catch (e) {
  console.warn('无法读取产品数据:', e);
  products = [];
}

// 如果无法获取产品数据，跳过内联（使用 JavaScript 动态加载）
if (products.length === 0) {
  console.log('⚠️  无法获取产品数据，跳过产品列表内联（将使用 JavaScript 动态加载）');
  process.exit(0);
}

try {
  // 读取模板
  let template = fs.readFileSync(indexTemplatePath, 'utf-8');
  
  // 获取默认语言
  const defaultLang = 'zh-CN';
  
  // 生成产品列表 HTML
  const productsHtml = products.map(product => {
    const name = product.name[defaultLang] || product.name || '';
    const description = product.description[defaultLang] || product.description || '';
    const image = product.image || '';
    const productId = product.productId || '';
    
    return `
        <article class="card">
          <div class="card-media">
            <img src="${image}" alt="${name}" />
          </div>
          <div class="card-body">
            <h3>${name}</h3>
            <p>${description}</p>
            <a class="btn" href="/products/${productId}" data-i18n="sections.products.learnMore">了解更多</a>
          </div>
        </article>
      `;
  }).join('');
  
  // 替换产品列表占位符
  template = template.replace(
    /<div class="grid" id="products-grid">[\s\S]*?<\/div>/,
    `<div class="grid" id="products-grid">${productsHtml}</div>`
  );
  
  // 添加内联脚本，用于语言切换
  const inlineScript = `
  <script>
    // 内联产品列表数据（用于语言切换）
    const PRODUCTS_DATA = ${JSON.stringify(products)};
    
    function updateProductsLanguage(lang) {
      if (!PRODUCTS_DATA || !Array.isArray(PRODUCTS_DATA)) return;
      
      const productsGrid = document.getElementById('products-grid');
      if (!productsGrid) return;
      
      const cards = productsGrid.querySelectorAll('.card');
      cards.forEach(function(card, index) {
        const product = PRODUCTS_DATA[index];
        if (!product) return;
        
        // 更新标题
        const title = card.querySelector('h3');
        if (title && product.name && product.name[lang]) {
          title.textContent = product.name[lang];
        }
        
        // 更新描述
        const desc = card.querySelector('.card-body p');
        if (desc && product.description && product.description[lang]) {
          desc.textContent = product.description[lang];
        }
        
        // 更新图片 alt
        const img = card.querySelector('img');
        if (img && product.name && product.name[lang]) {
          img.alt = product.name[lang];
        }
      });
    }
    
    // 监听语言变化事件
    window.addEventListener('languageChanged', function(e) {
      const lang = (e.detail && e.detail.lang) || (localStorage.getItem('language') || 'zh-CN');
      updateProductsLanguage(lang);
    });
  </script>`;
  
  // 在 </body> 之前插入脚本
  if (template.includes('</body>')) {
    template = template.replace('</body>', `${inlineScript}</body>`);
  } else {
    template += inlineScript;
  }
  
  fs.writeFileSync(indexTemplatePath, template);
  console.log(`✅ 首页产品列表已内联: /index.html`);

} catch (e) {
  console.error('❌ 生成首页产品列表时出错:', e);
  process.exit(1);
}

