// /**
//  * 构建脚本：为首页内联产品列表
//  * 确保生产环境中产品列表可以立即显示，无需等待 JavaScript 加载
//  */
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const rootDir = path.resolve(__dirname, '..');
// const distDir = path.join(rootDir, 'dist');
// const indexTemplatePath = path.join(distDir, 'index.html');

// // 读取产品数据（从构建后的 JS 文件或从源代码读取）
// let products = [];

// try {
//   // 尝试从构建后的 products-data JS 文件中读取产品数据
//   const assetsDir = path.join(distDir, 'assets');
//   let productsDataFiles = [];
  
//   if (fs.existsSync(assetsDir)) {
//     productsDataFiles = fs.readdirSync(assetsDir).filter(f => f.startsWith('products-data-') && f.endsWith('.js'));
//   }
  
//   if (productsDataFiles.length > 0) {
//     const productsDataFile = path.join(assetsDir, productsDataFiles[0]);
//     const productsDataJs = fs.readFileSync(productsDataFile, 'utf-8');
    
//     // 尝试提取 products 数组
//     // 构建后的代码格式可能是: const e=[...];export{e as products}
//     // 或者: const products=[...];export{products}
//     // Vite 构建后通常会压缩成单行，数组可能是 const e=[...];
//     try {
//       // 方法1: 查找包含 productId 的数组（这是产品数组的特征）
//       // 匹配从 const 到分号或 export 之间的数组
//       // 使用非贪婪匹配，但需要找到正确的结束位置
//       let arrayMatch = null;
      
//       // 尝试匹配 const variableName = [...] 格式
//       // 由于数组可能很大，需要找到正确的结束位置
//       const constMatch = productsDataJs.match(/const\s+\w+\s*=\s*(\[)/);
//       if (constMatch && constMatch.index !== undefined) {
//         // 从数组开始位置开始查找，手动匹配括号
//         let startIndex = constMatch.index + constMatch[0].length - 1; // -1 因为 [ 已经在匹配中
//         let depth = 0;
//         let inString = false;
//         let stringChar = null;
//         let i = startIndex;
        
//         for (; i < productsDataJs.length; i++) {
//           const char = productsDataJs[i];
//           const prevChar = i > 0 ? productsDataJs[i - 1] : null;
//           const isEscaped = prevChar === '\\';
          
//           if (!isEscaped) {
//             if ((char === '"' || char === "'") && !inString) {
//               inString = true;
//               stringChar = char;
//             } else if (char === stringChar && inString) {
//               inString = false;
//               stringChar = null;
//             } else if (!inString) {
//               if (char === '[') depth++;
//               if (char === ']') {
//                 depth--;
//                 if (depth === 0) {
//                   // 找到数组结束
//                   arrayMatch = productsDataJs.substring(startIndex, i + 1);
//                   break;
//                 }
//               }
//             }
//           }
//         }
//       }
      
//       if (arrayMatch) {
//         try {
//           // 尝试使用 Function 构造函数解析（比 eval 更安全）
//           const func = new Function('return ' + arrayMatch);
//           products = func();
//           if (Array.isArray(products) && products.length > 0) {
//             console.log(`✅ 从构建文件读取到 ${products.length} 个产品`);
//           } else {
//             products = [];
//           }
//         } catch (parseError) {
//           console.warn('解析产品数据时出错:', parseError.message);
//           products = [];
//         }
//       } else {
//         console.warn('⚠️  无法找到产品数组');
//       }
//     } catch (e) {
//       console.warn('无法从构建文件提取产品数据:', e.message);
//       products = [];
//     }
//   }
// } catch (e) {
//   console.warn('无法读取产品数据:', e.message);
//   products = [];
// }

// // 如果无法获取产品数据，跳过内联（使用 JavaScript 动态加载）
// if (products.length === 0) {
//   console.log('⚠️  无法获取产品数据，跳过产品列表内联（将使用 JavaScript 动态加载）');
//   process.exit(0);
// }

// try {
//   // 读取模板
//   let template = fs.readFileSync(indexTemplatePath, 'utf-8');
  
//   // 获取默认语言
//   const defaultLang = 'zh-CN';
  
//   // 生成产品列表 HTML
//   const productsHtml = products.map(product => {
//     const name = product.name[defaultLang] || product.name || '';
//     const description = product.description[defaultLang] || product.description || '';
//     const image = product.mainImage || '';
//     const productId = product.productId || '';
    
//     // 产品链接包含默认语言参数，确保跳转时语言状态正确传递
//     const productUrl = `/products/${productId}?lang=${defaultLang}`;
    
//     return `
//         <article class="card">
//           <div class="card-media">
//             <img src="${image}" alt="${name}" />
//           </div>
//           <div class="card-body">
//             <h3>${name}</h3>
//             <p>${description}</p>
//             <a class="btn" href="${productUrl}" data-i18n="sections.products.learnMore" data-product-link="${productId}">了解更多</a>
//           </div>
//         </article>
//       `;
//   }).join('');
  
//   // 替换产品列表占位符
//   // 使用更精确的方法：找到 products-grid 的开始位置，然后找到对应的结束标签
//   const productsGridIdRegex = /<div[^>]*id\s*=\s*["']products-grid["'][^>]*>/i;
//   const match = template.match(productsGridIdRegex);
  
//   if (match && match.index !== undefined) {
//     const startIndex = match.index;
//     const startTagEnd = startIndex + match[0].length;
    
//     // 从开始标签后开始查找，计算 div 的嵌套深度
//     let depth = 1;
//     let i = startTagEnd;
//     let inString = false;
//     let stringChar = null;
    
//     while (i < template.length && depth > 0) {
//       const char = template[i];
//       const prevChar = i > 0 ? template[i - 1] : null;
//       const isEscaped = prevChar === '\\';
      
//       if (!isEscaped) {
//         if ((char === '"' || char === "'") && !inString) {
//           inString = true;
//           stringChar = char;
//         } else if (char === stringChar && inString) {
//           inString = false;
//           stringChar = null;
//         } else if (!inString) {
//           // 检查是否是 div 标签的开始或结束
//           const remaining = template.substring(i);
//           if (remaining.startsWith('<div')) {
//             depth++;
//             i += 4;
//             continue;
//           } else if (remaining.startsWith('</div>')) {
//             depth--;
//             if (depth === 0) {
//               // 找到对应的结束标签
//               const endIndex = i + 6; // </div> 的长度
//               const before = template.substring(0, startIndex);
//               const after = template.substring(endIndex);
//               template = before + `<div class="grid" id="products-grid">${productsHtml}</div>` + after;
//               break;
//             }
//             i += 6;
//             continue;
//           }
//         }
//       }
//       i++;
//     }
//   } else {
//     console.warn('⚠️  无法找到 products-grid 容器，跳过替换');
//   }
  
//   // 添加内联脚本，用于语言切换
//   const inlineScript = `
//   <script>
//     // 内联产品列表数据（用于语言切换）
//     // 使用 IIFE 避免全局变量污染，并检查是否已存在
//     (function() {
//       if (typeof window !== 'undefined' && window.PRODUCTS_DATA) {
//         console.warn('PRODUCTS_DATA already exists, skipping inline data');
//         return;
//       }
//       window.PRODUCTS_DATA = ${JSON.stringify(products)};
//     })();
    
//     function updateProductsLanguage(lang) {
//       const PRODUCTS_DATA = window.PRODUCTS_DATA;
//       if (!PRODUCTS_DATA || !Array.isArray(PRODUCTS_DATA)) return;
      
//       const productsGrid = document.getElementById('products-grid');
//       if (!productsGrid) return;
      
//       const cards = productsGrid.querySelectorAll('.card');
//       cards.forEach(function(card, index) {
//         const product = PRODUCTS_DATA[index];
//         if (!product) return;
        
//         // 更新标题
//         const title = card.querySelector('h3');
//         if (title && product.name && product.name[lang]) {
//           title.textContent = product.name[lang];
//         }
        
//         // 更新描述
//         const desc = card.querySelector('.card-body p');
//         if (desc && product.description && product.description[lang]) {
//           desc.textContent = product.description[lang];
//         }
        
//         // 更新图片 alt
//         const img = card.querySelector('img');
//         if (img && product.name && product.name[lang]) {
//           img.alt = product.name[lang];
//         }
        
//         // 更新产品链接，包含当前语言参数
//         const productLink = card.querySelector('a.btn[data-product-link]');
//         if (productLink && product.productId) {
//           productLink.href = '/products/' + product.productId + '?lang=' + lang;
//         }
//       });
//     }
    
//     // 监听语言变化事件
//     window.addEventListener('languageChanged', function(e) {
//       const lang = (e.detail && e.detail.lang) || (localStorage.getItem('language') || 'zh-CN');
//       updateProductsLanguage(lang);
//     });
//   </script>`;
  
//   // 移除生产环境的 Vite 客户端脚本（开发环境专用）
//   template = template.replace(/<script\s+type\s*=\s*["']module["'][^>]*src\s*=\s*["']\/@vite\/client["'][^>]*><\/script>\s*/gi, '');
  
//   // 检查是否已经存在内联脚本（避免重复插入）
//   const hasInlineScript = template.includes('window.PRODUCTS_DATA') || template.includes('updateProductsLanguage');
  
//   // 在 </body> 之前插入脚本（如果还没有）
//   if (!hasInlineScript) {
//     if (template.includes('</body>')) {
//       template = template.replace('</body>', `${inlineScript}</body>`);
//     } else {
//       template += inlineScript;
//     }
//   } else {
//     console.log('⚠️  检测到已存在内联脚本，跳过插入');
//   }
  
//   fs.writeFileSync(indexTemplatePath, template);
//   console.log(`✅ 首页产品列表已内联: /index.html`);

// } catch (e) {
//   console.error('❌ 生成首页产品列表时出错:', e);
//   process.exit(1);
// }

// new plan！！！！！！！！！！！

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
  
  // 生成完整的产品卡片HTML
  const productsHtml = products
    .filter(product => product.status === 'active')
    .map(product => generateProductItemHTML(product, defaultLang))
    .join('');
  
  // 替换产品列表占位符
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
              template = before + `<div id="products-grid" class="products-grid">${productsHtml}</div>` + after;
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
  
  // 添加内联CSS样式
  const inlineCss = getProductItemCSS();
  if (inlineCss) {
    const styleTag = `<style>${inlineCss}</style>`;
    if (template.includes('</head>')) {
      template = template.replace('</head>', `${styleTag}\n</head>`);
    } else {
      template = styleTag + template;
    }
    console.log('✅ 已添加产品卡片CSS样式');
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
    
    // 更新产品卡片语言参数
    function updateProductCardsLanguage(lang) {
      const productsGrid = document.getElementById('products-grid');
      if (!productsGrid) return;
      
      // 更新产品信息
      const productInfos = productsGrid.querySelectorAll('.product-info');
      productInfos.forEach(info => {
        const productName = info.querySelector('.product-name');
        const productDescription = info.querySelector('.product-description');
        const moreButton = info.querySelector('.product-more-button');
        
        const productId = info.closest('.product-item-card')?.dataset.productId;
        const product = window.PRODUCTS_DATA?.find(p => p.productId === productId);
        
        if (product) {
          // 更新产品名称
          if (productName && product.name && product.name[lang]) {
            productName.textContent = product.name[lang];
          }
          
          // 更新产品描述
          if (productDescription && product.description && product.description[lang]) {
            productDescription.textContent = product.description[lang];
          } else if (productDescription && product.description) {
            productDescription.textContent = product.description['zh-CN'] || '';
          }
          
          // 更新了解更多按钮文本
          if (moreButton) {
            moreButton.textContent = lang === 'zh-CN' ? '了解更多' : 'Learn More';
          }
          
          // 更新了解更多链接
          if (moreButton) {
            const currentHref = moreButton.getAttribute('href');
            const url = new URL(currentHref, window.location.origin);
            url.searchParams.set('lang', lang);
            moreButton.setAttribute('href', url.pathname + url.search);
          }
        }
      });
      
      // 更新图片链接的语言参数
      const imageLinks = productsGrid.querySelectorAll('.collage-image-link');
      imageLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          const url = new URL(href, window.location.origin);
          url.searchParams.set('lang', lang);
          link.setAttribute('href', url.pathname + url.search);
        }
        
        // 更新图片的alt和title属性
        const productId = link.dataset.productId;
        const colorName = link.dataset.colorName;
        const product = window.PRODUCTS_DATA?.find(p => p.productId === productId);
        
        if (product && product.name && product.name[lang]) {
          const productName = product.name[lang];
          const img = link.querySelector('img');
          if (img) {
            const altText = colorName ? productName + ' - ' + colorName : productName;
            img.setAttribute('alt', altText);
            link.setAttribute('title', altText);
          }
        }
      });
    }
    
    // 监听语言变化事件
    window.addEventListener('languageChanged', function(e) {
      const lang = (e.detail && e.detail.lang) || (localStorage.getItem('language') || 'zh-CN');
      updateProductCardsLanguage(lang);
    });
  </script>`;
  
  // 移除生产环境的 Vite 客户端脚本（开发环境专用）
  template = template.replace(/<script\s+type\s*=\s*["']module["'][^>]*src\s*=\s*["']\/@vite\/client["'][^>]*><\/script>\s*/gi, '');
  
  // 检查是否已经存在内联脚本（避免重复插入）
  const hasInlineScript = template.includes('window.PRODUCTS_DATA') || template.includes('updateProductCardsLanguage');
  
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
  console.log(`✅ 首页产品卡片列表已内联: /index.html`);

} catch (e) {
  console.error('❌ 生成首页产品列表时出错:', e);
  process.exit(1);
}

// ========== 产品卡片相关工具函数 ==========

/**
 * 生成完整的产品卡片HTML
 * 包含产品信息区域和四图拼接区域
 */
function generateProductItemHTML(product, lang = 'zh-CN') {
  const displayImages = getProductDisplayImages(product);
  const productName = product.name[lang] || product.name['zh-CN'] || '产品';
  const productDescription = product.description?.[lang] || product.description?.['zh-CN'] || '';
  const images = displayImages.slice(0, 4);
  
  // 补全4张图片
  while (images.length < 4) {
    images.push({
      imageUrl: '/images/placeholder.jpg',
      skuId: `${product.productId}-placeholder-${images.length}`,
      isMain: false
    });
  }
  
  // 确保第一个图片是主图
  const mainImageIndex = images.findIndex(img => img.isMain);
  if (mainImageIndex > 0) {
    const [mainImage] = images.splice(mainImageIndex, 1);
    images.unshift(mainImage);
  } else if (mainImageIndex === -1) {
    images[0].isMain = true;
  }
  
  // 生成四图拼接的HTML
  const fourImagesHTML = generateFourImagesHTML(product, images, productName, lang);
  
  // 生成"了解更多"按钮的国际化文本
  const moreText = lang === 'zh-CN' ? '了解更多' : 'Learn More';
  
  return `
  <article class="product-item-card" data-product-id="${product.productId}">
    <div class="product-info">
      <h3 class="product-name">${escapeHtml(productName)}</h3>
      ${productDescription ? `<p class="product-description">${escapeHtml(productDescription)}</p>` : ''}
      <a href="/products/${product.productId}?lang=${lang}" class="product-more-button">${escapeHtml(moreText)}</a>
    </div>
    <div class="product-images">
      ${fourImagesHTML}
    </div>
  </article>
  `;
}

/**
 * 生成四图拼接的HTML
 */
function generateFourImagesHTML(product, images, productName, lang) {
  return `
    <div class="four-image-collage">
      ${images.map((image, index) => {
        const isMain = index === 0;
        const colorName = image.colorName || '';
        const titleText = colorName ? productName + ' - ' + colorName : productName;
        
        return `
          <a 
            href="/products/${product.productId}?sku=${encodeURIComponent(image.skuId)}&lang=${lang}"
            class="collage-image-link ${isMain ? 'main' : ''}"
            title="${titleText}"
            data-product-id="${product.productId}"
            data-sku-id="${image.skuId}"
            data-color-name="${colorName}"
          >
            <img 
              src="${image.imageUrl}" 
              alt="${titleText}"
              loading="lazy"
              class="collage-image"
            />
          </a>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * 获取产品展示图片
 */
function getProductDisplayImages(product) {
  // 如果没有SKU，返回默认图片
  if (!product.skus || product.skus.length === 0) {
    return [{
      imageUrl: product.mainImage || (product.defaultImages && product.defaultImages[0]) || '/images/placeholder.jpg',
      skuId: product.productId,
      isMain: true
    }];
  }
  
  // 获取默认SKU
  const defaultSku = getDefaultSku(product) || product.skus[0];
  
  // 获取主图
  const mainImage = product.mainImage || 
                   (defaultSku.images && defaultSku.images[0]) || 
                   (product.defaultImages && product.defaultImages[0]) || 
                   '/images/placeholder.jpg';
  
  // 构建主图数据
  const result = [{
    imageUrl: mainImage,
    skuId: defaultSku.skuId,
    colorName: getColorName(product, defaultSku.attributes?.color),
    isMain: true
  }];
  
  // 获取其他SKU的图片（排除默认SKU）
  const otherSkus = product.skus
    .filter(sku => sku.skuId !== defaultSku.skuId)
    .slice(0, 3); // 最多取3个其他SKU
  
  otherSkus.forEach(sku => {
    const skuImage = (sku.images && sku.images[0]) || 
                    getSkuColorPreview(product, sku) || 
                    '/images/placeholder.jpg';
    
    result.push({
      imageUrl: skuImage,
      skuId: sku.skuId,
      colorName: getColorName(product, sku.attributes?.color),
      isMain: false
    });
  });
  
  return result;
}

/**
 * 获取默认SKU
 */
function getDefaultSku(product) {
  if (!product.skus || product.skus.length === 0) return undefined;
  
  if (product.defaultSkuId) {
    return product.skus.find(sku => sku.skuId === product.defaultSkuId);
  }
  
  const defaultSku = product.skus.find(sku => sku.isDefault);
  if (defaultSku) return defaultSku;
  
  return product.skus.find(sku => 
    sku.isActive !== false && sku.stockCount > 0
  ) || product.skus[0];
}

/**
 * 获取颜色名称
 */
function getColorName(product, colorId) {
  if (!colorId) return undefined;
  
  const colorAttribute = product.attributes?.find(attr => 
    attr.attribute?.attributeId === 'color'
  );
  
  if (!colorAttribute) return undefined;
  
  const colorOption = colorAttribute.options?.find(opt => opt.optionId === colorId);
  return colorOption?.optionName?.['zh-CN'];
}

/**
 * 获取SKU颜色预览图
 */
function getSkuColorPreview(product, sku) {
  const colorId = sku.attributes?.color;
  if (!colorId) return undefined;
  
  const colorAttribute = product.attributes?.find(attr => 
    attr.attribute?.attributeId === 'color'
  );
  
  if (!colorAttribute) return undefined;
  
  const colorOption = colorAttribute.options?.find(opt => opt.optionId === colorId);
  return colorOption?.previewImage;
}

/**
 * HTML转义函数
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 获取产品卡片的CSS样式
 */
function getProductItemCSS() {
  return `/* 产品卡片布局样式 - 全量描述优化版 */

/* 1. 产品网格容器 */
.products-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
  box-sizing: border-box;
}

/* 2. 产品卡片容器 - 桌面端16:9比例，flex布局 */
.product-item-card {
  width: 100%;
  aspect-ratio: 16/9;
  display: flex;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;
  position: relative;
}

.product-item-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* 3. 产品信息区域 - 占1/4宽度 */
.product-info {
  flex: 4;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* 4. 产品标题 - 修复兼容性，使用max-height替代-webkit-line-clamp */
.product-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 12px 0;
  line-height: 1.3;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  max-height: 3.6em;
  word-break: break-word;
}

/* 5. 产品描述 - 全量显示 */
.product-description {
  font-size: 1rem;
  color: #4a5568;
  line-height: 1.6;
  margin: 0 0 24px 0;
  text-align: center;
  max-width: 100%;
  overflow: visible;
  white-space: normal;
  display: block;
  opacity: 0.9;
  max-height: none;
  word-break: break-word;
}

/* 6. 了解更多按钮 - 黑色简约设计 */
.product-more-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  background: transparent;
  color: #1a1a1a;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: 2px solid #1a1a1a;
  text-align: center;
  min-width: 140px;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

/* 按钮悬停效果 - 黑色设计 */
.product-more-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1a1a1a;
  z-index: -1;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.product-more-button:hover {
  color: white;
  border-color: #1a1a1a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-more-button:hover::before {
  transform: scaleX(1);
  transform-origin: left;
}

.product-more-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 7. 图片区域 - 占3/4宽度 */
.product-images {
  flex: 12;
  position: relative;
  overflow: hidden;
  background: white;
}

/* 8. 四图拼接网格 - 移除圆角，桌面端布局 */
.four-image-collage {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 4px;
  background: white;
  position: relative;
  overflow: hidden;
}

/* 9. 图片链接容器 - 移除圆角 */
.collage-image-link {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;
  text-decoration: none;
  background: #f8f9fa;
  border-radius: 0;
  transform-origin: center;
  cursor: pointer;
}

/* 10. 主图 */
.collage-image-link.main { 
  grid-column: 1 / 2;
  grid-row: 1 / 4;
  z-index: 2;
  border-radius: 0;
}

.collage-image-link:nth-child(2) {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  border-radius: 0;
}

.collage-image-link:nth-child(3) {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  border-radius: 0;
}

.collage-image-link:nth-child(4) {
  grid-column: 2 / 3;
  grid-row: 3 / 4;
  border-radius: 0;
}

/* 11. 图片样式 - 移除圆角，确保图片居中完整显示 */
.collage-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0;
  display: block;
  transform-origin: center;
  background-color: #f8f9fa;
}

/* 12. 优化悬停效果 - 移除高亮效果，减小放大比例 */
.collage-image-link:hover {
  transform: scale(1.02);
  z-index: 20;
}

.collage-image-link:hover .collage-image {
  transform: scale(1.05);
  border-radius: 0;
}

/* 13. 完全移除悬停覆盖层 */
.collage-image-link::after {
  content: none;
}

/* 14. 移动端优化 - 重新设计布局：四图在上，信息在下 */
@media (max-width: 768px) {
  .products-grid {
    padding: 10px 0;
    gap: 20px;
  }
  
  .product-item-card {
    aspect-ratio: auto;
    min-height: 500px;
    flex-direction: column;
  }
  
  .product-item-card:hover {
    transform: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
  
  .product-images {
    flex: none;
    height: 280px;
    order: 1;
  }
  
  .product-info {
    flex: none;
    height: auto;
    min-height: 220px;
    order: 2;
    padding: 20px 16px;
    justify-content: flex-start;
    align-items: center;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  }
  
  .product-name {
    font-size: 1.4rem;
    margin-bottom: 8px;
    line-height: 1.3;
    text-align: center;
    overflow: hidden;
    display: block;
    max-height: 3.64em;
    word-break: break-word;
    -webkit-line-clamp: unset;
    -webkit-box-orient: unset;
    line-clamp: unset;
  }
  
  .product-description {
    font-size: 0.85rem;
    margin-bottom: 16px;
    line-height: 1.4;
    overflow: visible;
    white-space: normal;
    max-height: 4.2em;
    overflow-y: hidden;
    word-break: break-word;
  }
  
  .product-more-button {
    padding: 8px 20px;
    font-size: 0.9rem;
    min-width: 120px;
  }
  
  .four-image-collage {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 2fr 1fr;
    gap: 2px;
    width: 100%;
    height: 100%;
  }
  
  .collage-image-link.main {
    grid-column: 1 / 4;
    grid-row: 1 / 2;
    border-radius: 0;
  }
  
  .collage-image-link:nth-child(2) {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
    border-radius: 0;
  }
  
  .collage-image-link:nth-child(3) {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
    border-radius: 0;
  }
  
  .collage-image-link:nth-child(4) {
    grid-column: 3 / 4;
    grid-row: 2 / 3;
    border-radius: 0;
  }
  
  .collage-image-link {
    width: 100%;
    height: 100%;
  }
  
  .collage-image-link:nth-child(2),
  .collage-image-link:nth-child(3),
  .collage-image-link:nth-child(4) {
    height: 100%;
    min-height: 60px;
  }
  
  .collage-image {
    object-fit: contain;
    background-color: #f8f9fa;
  }
  
  .collage-image-link:not(.main) .collage-image {
    object-fit: cover;
  }
  
  .collage-image-link:hover {
    transform: none;
  }
  
  .collage-image-link:hover .collage-image {
    transform: none;
  }
  
  .collage-image-link:active {
    transform: none;
  }
}`;
}