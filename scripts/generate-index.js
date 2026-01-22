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
  const assetsDir = path.join(distDir, 'assets');
  let productsDataFiles = [];
  
  if (fs.existsSync(assetsDir)) {
    productsDataFiles = fs.readdirSync(assetsDir).filter(f => f.startsWith('products-data-') && f.endsWith('.js'));
  }
  
  if (productsDataFiles.length > 0) {
    const productsDataFile = path.join(assetsDir, productsDataFiles[0]);
    const productsDataJs = fs.readFileSync(productsDataFile, 'utf-8');
    
    // 尝试提取 products 数组
    // 构建后的代码格式可能是: const e=[...];export{e as products}
    // 或者: const products=[...];export{products}
    // Vite 构建后通常会压缩成单行，数组可能是 const e=[...];
    try {
      // 方法1: 查找包含 productId 的数组（这是产品数组的特征）
      // 匹配从 const 到分号或 export 之间的数组
      // 使用非贪婪匹配，但需要找到正确的结束位置
      let arrayMatch = null;
      
      // 尝试匹配 const variableName = [...] 格式
      // 由于数组可能很大，需要找到正确的结束位置
      const constMatch = productsDataJs.match(/const\s+\w+\s*=\s*(\[)/);
      if (constMatch && constMatch.index !== undefined) {
        // 从数组开始位置开始查找，手动匹配括号
        let startIndex = constMatch.index + constMatch[0].length - 1; // -1 因为 [ 已经在匹配中
        let depth = 0;
        let inString = false;
        let stringChar = null;
        let i = startIndex;
        
        for (; i < productsDataJs.length; i++) {
          const char = productsDataJs[i];
          const prevChar = i > 0 ? productsDataJs[i - 1] : null;
          const isEscaped = prevChar === '\\';
          
          if (!isEscaped) {
            if ((char === '"' || char === "'") && !inString) {
              inString = true;
              stringChar = char;
            } else if (char === stringChar && inString) {
              inString = false;
              stringChar = null;
            } else if (!inString) {
              if (char === '[') depth++;
              if (char === ']') {
                depth--;
                if (depth === 0) {
                  // 找到数组结束
                  arrayMatch = productsDataJs.substring(startIndex, i + 1);
                  break;
                }
              }
            }
          }
        }
      }
      
      if (arrayMatch) {
        try {
          // 尝试使用 Function 构造函数解析（比 eval 更安全）
          const func = new Function('return ' + arrayMatch);
          products = func();
          if (Array.isArray(products) && products.length > 0) {
            console.log(`✅ 从构建文件读取到 ${products.length} 个产品`);
          } else {
            products = [];
          }
        } catch (parseError) {
          console.warn('解析产品数据时出错:', parseError.message);
          products = [];
        }
      } else {
        console.warn('⚠️  无法找到产品数组');
      }
    } catch (e) {
      console.warn('无法从构建文件提取产品数据:', e.message);
      products = [];
    }
  }
} catch (e) {
  console.warn('无法读取产品数据:', e.message);
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
    const image = product.mainImage || '';
    const productId = product.productId || '';
    
    // 产品链接包含默认语言参数，确保跳转时语言状态正确传递
    const productUrl = `/products/${productId}?lang=${defaultLang}`;
    
    return `
        <article class="card">
          <div class="card-media">
            <img src="${image}" alt="${name}" />
          </div>
          <div class="card-body">
            <h3>${name}</h3>
            <p>${description}</p>
            <a class="btn" href="${productUrl}" data-i18n="sections.products.learnMore" data-product-link="${productId}">了解更多</a>
          </div>
        </article>
      `;
  }).join('');
  
  // 替换产品列表占位符
  // 使用更精确的方法：找到 products-grid 的开始位置，然后找到对应的结束标签
  const productsGridIdRegex = /<div[^>]*id\s*=\s*["']products-grid["'][^>]*>/i;
  const match = template.match(productsGridIdRegex);
  
  if (match && match.index !== undefined) {
    const startIndex = match.index;
    const startTagEnd = startIndex + match[0].length;
    
    // 从开始标签后开始查找，计算 div 的嵌套深度
    let depth = 1;
    let i = startTagEnd;
    let inString = false;
    let stringChar = null;
    
    while (i < template.length && depth > 0) {
      const char = template[i];
      const prevChar = i > 0 ? template[i - 1] : null;
      const isEscaped = prevChar === '\\';
      
      if (!isEscaped) {
        if ((char === '"' || char === "'") && !inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar && inString) {
          inString = false;
          stringChar = null;
        } else if (!inString) {
          // 检查是否是 div 标签的开始或结束
          const remaining = template.substring(i);
          if (remaining.startsWith('<div')) {
            depth++;
            i += 4;
            continue;
          } else if (remaining.startsWith('</div>')) {
            depth--;
            if (depth === 0) {
              // 找到对应的结束标签
              const endIndex = i + 6; // </div> 的长度
              const before = template.substring(0, startIndex);
              const after = template.substring(endIndex);
              template = before + `<div class="grid" id="products-grid">${productsHtml}</div>` + after;
              break;
            }
            i += 6;
            continue;
          }
        }
      }
      i++;
    }
  } else {
    console.warn('⚠️  无法找到 products-grid 容器，跳过替换');
  }
  
  // 添加内联脚本，用于语言切换
  const inlineScript = `
  <script>
    // 内联产品列表数据（用于语言切换）
    // 使用 IIFE 避免全局变量污染，并检查是否已存在
    (function() {
      if (typeof window !== 'undefined' && window.PRODUCTS_DATA) {
        console.warn('PRODUCTS_DATA already exists, skipping inline data');
        return;
      }
      window.PRODUCTS_DATA = ${JSON.stringify(products)};
    })();
    
    function updateProductsLanguage(lang) {
      const PRODUCTS_DATA = window.PRODUCTS_DATA;
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
        
        // 更新产品链接，包含当前语言参数
        const productLink = card.querySelector('a.btn[data-product-link]');
        if (productLink && product.productId) {
          productLink.href = '/products/' + product.productId + '?lang=' + lang;
        }
      });
    }
    
    // 监听语言变化事件
    window.addEventListener('languageChanged', function(e) {
      const lang = (e.detail && e.detail.lang) || (localStorage.getItem('language') || 'zh-CN');
      updateProductsLanguage(lang);
    });
  </script>`;
  
  // 移除生产环境的 Vite 客户端脚本（开发环境专用）
  template = template.replace(/<script\s+type\s*=\s*["']module["'][^>]*src\s*=\s*["']\/@vite\/client["'][^>]*><\/script>\s*/gi, '');
  
  // 检查是否已经存在内联脚本（避免重复插入）
  const hasInlineScript = template.includes('window.PRODUCTS_DATA') || template.includes('updateProductsLanguage');
  
  // 在 </body> 之前插入脚本（如果还没有）
  if (!hasInlineScript) {
    if (template.includes('</body>')) {
      template = template.replace('</body>', `${inlineScript}</body>`);
    } else {
      template += inlineScript;
    }
  } else {
    console.log('⚠️  检测到已存在内联脚本，跳过插入');
  }
  
  fs.writeFileSync(indexTemplatePath, template);
  console.log(`✅ 首页产品列表已内联: /index.html`);

} catch (e) {
  console.error('❌ 生成首页产品列表时出错:', e);
  process.exit(1);
}

