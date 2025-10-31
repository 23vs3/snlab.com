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
  
  // 从构建后的 products-data JS 文件中读取产品数据
  const productsDataFiles = fs.readdirSync(path.join(distDir, 'assets')).filter(f => f.startsWith('products-data-') && f.endsWith('.js'));
  
  let productDataJson = null;
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
        const allProducts = func();
        productDataJson = allProducts.find(p => p.productId === product.productId);
      }
    } catch (e) {
      console.warn(`无法从构建文件提取产品数据:`, e);
    }
  }
  
  // 如果无法从构建文件获取，使用硬编码的基本数据
  if (!productDataJson) {
    const fallbackProducts = {
      'a1': {
        productId: 'a1',
        name: { 'zh-CN': '便携式音箱 A1', 'en': 'Portable Speaker A1' },
        tagline: { 'zh-CN': '聆听强劲且悦耳的音效。灵活便携设计。', 'en': 'Experience powerful and pleasant sound. Flexible portable design.' },
        price: { 'zh-CN': '来自 ¥2,980', 'en': 'From ¥2,980' },
        image: 'https://picsum.photos/seed/a1-detail/800/600'
      },
      'h100': {
        productId: 'h100',
        name: { 'zh-CN': '头戴耳机 H100', 'en': 'Headphones H100' },
        tagline: { 'zh-CN': '卓越音质，舒适佩戴。', 'en': 'Excellent sound quality, comfortable to wear.' },
        price: { 'zh-CN': '来自 ¥1,980', 'en': 'From ¥1,980' },
        image: 'https://picsum.photos/seed/h100/800/600'
      },
      'a5': {
        productId: 'a5',
        name: { 'zh-CN': '多房间音响 A5', 'en': 'Multi-Room Speaker A5' },
        tagline: { 'zh-CN': '艺术与科技的融合，打造沉浸式家居音效。', 'en': 'The fusion of art and technology, creating immersive home audio.' },
        price: { 'zh-CN': '来自 ¥5,980', 'en': 'From ¥5,980' },
        image: 'https://picsum.photos/seed/a5/800/600'
      }
    };
    productDataJson = fallbackProducts[product.productId] || fallbackProducts['a1'];
  }
  
  // 修改模板，直接替换占位符文本为实际产品数据（服务端渲染）
  let modifiedTemplate = template;
  
  // 获取默认语言
  const defaultLang = 'zh-CN';
  
  // 直接替换 HTML 中的占位符
  modifiedTemplate = modifiedTemplate.replace(
    /<span id="product-name">加载中\.\.\.<\/span>/,
    `<span id="product-name">${productDataJson.name[defaultLang]}</span>`
  );
  modifiedTemplate = modifiedTemplate.replace(
    /<h1 id="product-title">加载中\.\.\.<\/h1>/,
    `<h1 id="product-title">${productDataJson.name[defaultLang]}</h1>`
  );
  modifiedTemplate = modifiedTemplate.replace(
    /<p class="product-tagline" id="product-tagline">加载中\.\.\.<\/p>/,
    `<p class="product-tagline" id="product-tagline">${productDataJson.tagline[defaultLang]}</p>`
  );
  modifiedTemplate = modifiedTemplate.replace(
    /<div class="product-price" id="product-price">加载中\.\.\.<\/div>/,
    `<div class="product-price" id="product-price">${productDataJson.price[defaultLang]}</div>`
  );
  modifiedTemplate = modifiedTemplate.replace(
    /<img src="" alt="产品图" id="product-image" \/>/,
    `<img src="${productDataJson.image}" alt="${productDataJson.name[defaultLang]}" id="product-image" />`
  );
  modifiedTemplate = modifiedTemplate.replace(
    /<title>.*?<\/title>/,
    `<title>${productDataJson.name[defaultLang]} - SINIAN LAB</title>`
  );
  
  // 内联产品特性（features）
  if (productDataJson.features && Array.isArray(productDataJson.features)) {
    const featuresHtml = productDataJson.features.map(feature => {
      const icon = feature.icon || '✨';
      const title = feature.title[defaultLang] || feature.title || '';
      const description = feature.description[defaultLang] || feature.description || '';
      return `
          <div class="feature-card">
            <div class="feature-icon">${icon}</div>
            <h3>${title}</h3>
            <p>${description}</p>
          </div>
        `;
    }).join('');
    
    modifiedTemplate = modifiedTemplate.replace(
      /<div class="features-grid" id="features-grid">[\s\S]*?<\/div>/,
      `<div class="features-grid" id="features-grid">${featuresHtml}</div>`
    );
  }
  
  // 内联产品规格（specs）
  if (productDataJson.specs) {
    let specsHtml = '';
    
    // 音频规格
    if (productDataJson.specs.audio && productDataJson.specs.audio.items) {
      const audioLabel = productDataJson.specs.audio.label[defaultLang] || productDataJson.specs.audio.label || '音频';
      const audioItems = productDataJson.specs.audio.items.map(item => {
        const name = item.name[defaultLang] || item.name || '';
        const value = item.value[defaultLang] || item.value || '';
        return `
            <li>
              <span class="spec-label">${name}</span>
              <span class="spec-value">${value}</span>
            </li>
          `;
      }).join('');
      
      specsHtml += `
        <div class="spec-group">
          <h3>${audioLabel}</h3>
          <ul class="spec-list">
            ${audioItems}
          </ul>
        </div>
      `;
    }
    
    // 物理规格
    if (productDataJson.specs.physical && productDataJson.specs.physical.items) {
      const physicalLabel = productDataJson.specs.physical.label[defaultLang] || productDataJson.specs.physical.label || '物理';
      const physicalItems = productDataJson.specs.physical.items.map(item => {
        const name = item.name[defaultLang] || item.name || '';
        const value = item.value[defaultLang] || item.value || '';
        return `
            <li>
              <span class="spec-label">${name}</span>
              <span class="spec-value">${value}</span>
            </li>
          `;
      }).join('');
      
      specsHtml += `
        <div class="spec-group">
          <h3>${physicalLabel}</h3>
          <ul class="spec-list">
            ${physicalItems}
          </ul>
        </div>
      `;
    }
    
    if (specsHtml) {
      modifiedTemplate = modifiedTemplate.replace(
        /<div class="specs-grid" id="specs-grid">[\s\S]*?<\/div>/,
        `<div class="specs-grid" id="specs-grid">${specsHtml}</div>`
      );
    }
  }
  
  // 添加一个简单的内联脚本，用于语言切换和完整数据加载（可选）
  const inlineScript = `
  <script>
    // 内联产品数据（用于语言切换和完整功能）
    const PRODUCT_DATA = ${JSON.stringify(productDataJson)};
    
    // 如果 ES 模块加载成功，使用完整功能；否则仅使用内联数据
    function updateLanguage(lang) {
      if (!PRODUCT_DATA) return;
      const elements = [
        { id: 'product-title', key: 'name' },
        { id: 'product-tagline', key: 'tagline' },
        { id: 'product-price', key: 'price' },
        { id: 'product-name', key: 'name' }
      ];
      elements.forEach(function(item) {
        const el = document.getElementById(item.id);
        if (el && PRODUCT_DATA[item.key] && PRODUCT_DATA[item.key][lang]) {
          el.textContent = PRODUCT_DATA[item.key][lang];
        }
      });
      if (PRODUCT_DATA.name && PRODUCT_DATA.name[lang]) {
        document.title = PRODUCT_DATA.name[lang] + ' - SINIAN LAB';
      }
      
      // 更新特性（features）
      if (PRODUCT_DATA.features && Array.isArray(PRODUCT_DATA.features)) {
        const featuresGrid = document.getElementById('features-grid');
        if (featuresGrid) {
          featuresGrid.innerHTML = PRODUCT_DATA.features.map(function(feature) {
            const icon = feature.icon || '✨';
            const title = feature.title[lang] || feature.title || '';
            const description = feature.description[lang] || feature.description || '';
            return '<div class="feature-card"><div class="feature-icon">' + icon + '</div><h3>' + title + '</h3><p>' + description + '</p></div>';
          }).join('');
        }
      }
      
      // 更新规格（specs）
      if (PRODUCT_DATA.specs) {
        const specsGrid = document.getElementById('specs-grid');
        if (specsGrid) {
          let specsHtml = '';
          
          // 音频规格
          if (PRODUCT_DATA.specs.audio && PRODUCT_DATA.specs.audio.items) {
            const audioLabel = PRODUCT_DATA.specs.audio.label[lang] || PRODUCT_DATA.specs.audio.label || '音频';
            const audioItems = PRODUCT_DATA.specs.audio.items.map(function(item) {
              const name = item.name[lang] || item.name || '';
              const value = item.value[lang] || item.value || '';
              return '<li><span class="spec-label">' + name + '</span><span class="spec-value">' + value + '</span></li>';
            }).join('');
            specsHtml += '<div class="spec-group"><h3>' + audioLabel + '</h3><ul class="spec-list">' + audioItems + '</ul></div>';
          }
          
          // 物理规格
          if (PRODUCT_DATA.specs.physical && PRODUCT_DATA.specs.physical.items) {
            const physicalLabel = PRODUCT_DATA.specs.physical.label[lang] || PRODUCT_DATA.specs.physical.label || '物理';
            const physicalItems = PRODUCT_DATA.specs.physical.items.map(function(item) {
              const name = item.name[lang] || item.name || '';
              const value = item.value[lang] || item.value || '';
              return '<li><span class="spec-label">' + name + '</span><span class="spec-value">' + value + '</span></li>';
            }).join('');
            specsHtml += '<div class="spec-group"><h3>' + physicalLabel + '</h3><ul class="spec-list">' + physicalItems + '</ul></div>';
          }
          
          if (specsHtml) {
            specsGrid.innerHTML = specsHtml;
          }
        }
      }
    }
    
    // 监听语言变化事件（如果 ES 模块加载成功，会被触发）
    window.addEventListener('languageChanged', function(e) {
      const lang = (e.detail && e.detail.lang) || (localStorage.getItem('language') || 'zh-CN');
      updateLanguage(lang);
    });
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

