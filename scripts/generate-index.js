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
  
  // 生成四图拼接的产品列表 HTML
  const productsHtml = products
    .filter(product => product.status === 'active')
    .map(product => generateProductImagesHTML(product, defaultLang))
    .join('');
  
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
  const inlineCss = getProductImagesCSS();
  if (inlineCss) {
    const styleTag = `<style>${inlineCss}</style>`;
    if (template.includes('</head>')) {
      template = template.replace('</head>', `${styleTag}\n</head>`);
    } else {
      template = styleTag + template;
    }
    console.log('✅ 已添加四图拼接CSS样式');
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
    
    // 更新产品图片链接的语言参数
    function updateProductImageLinks(lang) {
      const productsGrid = document.getElementById('products-grid');
      if (!productsGrid) return;
      
      const imageLinks = productsGrid.querySelectorAll('.collage-image-link');
      imageLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          // 更新URL中的lang参数
          const url = new URL(href, window.location.origin);
          url.searchParams.set('lang', lang);
          link.setAttribute('href', url.pathname + url.search);
        }
        
        // 更新图片的alt属性（如果需要）
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
      updateProductImageLinks(lang);
    });
  </script>`;
  
  // 移除生产环境的 Vite 客户端脚本（开发环境专用）
  template = template.replace(/<script\s+type\s*=\s*["']module["'][^>]*src\s*=\s*["']\/@vite\/client["'][^>]*><\/script>\s*/gi, '');
  
  // 检查是否已经存在内联脚本（避免重复插入）
  const hasInlineScript = template.includes('window.PRODUCTS_DATA') || template.includes('updateProductImageLinks');
  
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
  console.log(`✅ 首页四图拼接产品列表已内联: /index.html`);

} catch (e) {
  console.error('❌ 生成首页产品列表时出错:', e);
  process.exit(1);
}

// ========== 四图拼接相关工具函数 ==========

/**
 * 生成四图拼接的产品卡片HTML
 * 主图在左侧，右侧三张小图垂直排列
 */
function generateProductImagesHTML(product, lang = 'zh-CN') {
  const displayImages = getProductDisplayImages(product);
  const productName = product.name[lang] || product.name['zh-CN'] || '产品';
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
    // 将主图移到第一个位置
    const [mainImage] = images.splice(mainImageIndex, 1);
    images.unshift(mainImage);
  } else if (mainImageIndex === -1) {
    // 如果没有标记为isMain的图片，确保第一个是主图
    images[0].isMain = true;
  }
  
  return `
  <article class="product-image-card" data-product-id="${product.productId}">
    <div class="four-image-collage">
      ${images.map((image, index) => {
        const isMain = index === 0; // 第一个图片是主图
        const colorName = image.colorName || '';
        
        // 修复：避免模板字符串嵌套，使用字符串连接
        const titleText = colorName ? productName + ' - ' + colorName : productName;
        const altText = colorName ? productName + ' - ' + colorName : productName;
        
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
              alt="${altText}"
              loading="lazy"
              class="collage-image"
            />
          </a>
        `;
      }).join('')}
    </div>
  </article>
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
 * 获取四图拼接的CSS样式
 */
function getProductImagesCSS() {
  return `/* 四图拼接布局样式 - 每行一个卡片 */

/* 1. 产品网格容器 - 移除左右padding，保持上下padding */
.products-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0; /* 上下20px，左右0 */
  box-sizing: border-box;
}

/* 2. 图片卡片容器 - 增加圆角统一性 */
.product-image-card {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 20px; /* 增加圆角半径，使视觉更柔和 */
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;
  position: relative;
}

.product-image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

/* 3. 四图拼接网格 - 显著增加间距，统一圆角 */
.four-image-collage {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 6px; /* 从3px增加到6px，显著增加间距 */
  background: white;
  position: relative;
  border-radius: 20px; /* 与外部卡片圆角一致 */
  overflow: hidden; /* 关键：确保内部元素遵守圆角 */
  padding: 3px; /* 增加内部padding，为圆角留出空间 */
  box-sizing: border-box;
}

/* 4. 图片链接容器 - 统一圆角，确保放大时也保持圆角 */
.collage-image-link {
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: block;
  text-decoration: none;
  background: #f8f9fa;
  border-radius: 12px; /* 增加圆角半径 */
  transform-origin: center;
  border: 3px solid white; /* 使用边框创建间距，避免放大时重叠 */
  box-sizing: border-box; /* 确保边框包含在尺寸内 */
}

/* 5. 主图样式 - 统一圆角处理 */
.collage-image-link.main { 
  grid-column: 1 / 2;
  grid-row: 1 / 4;
  z-index: 2;
  border-radius: 12px 8px 8px 12px; /* 左圆右直，与边框结合 */
  border-right: 6px solid white; /* 增加主图与右侧间距 */
}

/* 6. 右侧小图 - 统一圆角处理 */
.collage-image-link:nth-child(2) {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  border-radius: 8px 12px 0 0;
  border-bottom: 6px solid white; /* 增加间距 */
}

.collage-image-link:nth-child(3) {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  border-radius: 0;
  border-top: 3px solid white; /* 上下边框减半 */
  border-bottom: 3px solid white;
}

.collage-image-link:nth-child(4) {
  grid-column: 2 / 3;
  grid-row: 3 / 4;
  border-radius: 0 0 12px 8px;
  border-top: 6px solid white; /* 增加间距 */
}

/* 7. 图片样式 - 确保图片本身也有圆角，且放大时保持 */
.collage-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: 8px; /* 图片圆角小于容器圆角 */
  display: block;
  transform-origin: center; /* 确保从中心放大 */
}

/* 8. 优化悬停效果 - 确保放大时圆角统一 */
.collage-image-link.main:hover {
  transform: scale(1.02);
  z-index: 20; /* 提高层级，避免被遮挡 */
  box-shadow: 0 0 0 2px #3b82f6, 0 0 0 1px white;
  border-radius: 14px 10px 10px 14px; /* 悬停时圆角微调 */
}

.collage-image-link:not(.main):hover {
  z-index: 20;
  transform: scale(1.05);
  box-shadow: 0 0 0 2px #3b82f6;
  border-radius: 10px; /* 悬停时统一为圆角 */
}

/* 9. 图片放大效果 - 关键：确保放大时图片圆角也相应调整 */
.collage-image-link:hover .collage-image {
  transform: scale(1.15);
  border-radius: 10px; /* 放大时增加圆角 */
}

/* 10. 针对直角放大问题的强制修复 */
.collage-image-link,
.collage-image-link *,
.collage-image-link:hover,
.collage-image-link:hover * {
  border-radius: inherit !important; /* 强制继承圆角 */
  overflow: hidden !important; /* 强制隐藏溢出 */
}

/* 确保图片放大时不会突破圆角边界 */
.collage-image-link {
  isolation: isolate; /* 创建新的层叠上下文 */
  contain: layout; /* 优化性能，避免布局溢出 */
}

.collage-image-link .collage-image {
  will-change: transform; /* 提示浏览器优化transform */
  backface-visibility: hidden; /* 修复某些浏览器渲染问题 */
  -webkit-backface-visibility: hidden; /* Safari支持 */
}

/* 11. 移动端适配 */
@media (max-width: 768px) {
  .products-grid {
    padding: 10px 0; /* 移动端也移除左右padding */
    gap: 20px;
  }
  
  .product-image-card {
    aspect-ratio: 9/16;
    border-radius: 16px;
  }
  
  .four-image-collage {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 2.5fr 1fr;
    gap: 4px; /* 移动端间距稍小 */
    border-radius: 16px;
    padding: 2px;
  }
  
  .collage-image-link.main {
    grid-column: 1 / 4;
    grid-row: 1 / 2;
    border-radius: 12px 12px 0 0;
    border-right: none;
    border-bottom: 4px solid white;
  }
  
  .collage-image-link:nth-child(2) {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
    border-radius: 0 0 0 12px;
    border-bottom: none;
    border-top: 4px solid white;
    border-right: 2px solid white;
  }
  
  .collage-image-link:nth-child(3) {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
    border-radius: 0;
    border: 2px solid white;
    border-left: none;
    border-right: none;
  }
  
  .collage-image-link:nth-child(4) {
    grid-column: 3 / 4;
    grid-row: 2 / 3;
    border-radius: 0 0 12px 0;
    border-top: 4px solid white;
    border-left: 2px solid white;
  }
  
  /* 移动端悬停效果更克制 */
  .collage-image-link:hover {
    transform: scale(1.02);
  }
  
  .collage-image-link:hover .collage-image {
    transform: scale(1.1);
  }
}

/* 12. 终极解决方案：使用clip-path确保圆角（备用） */
/* 如果上述方案仍有直角问题，可以取消注释这部分 */
/*
.collage-image-link {
  clip-path: inset(0 round 12px);
}

.collage-image-link.main {
  clip-path: inset(0 round 12px 8px 8px 12px);
}

.collage-image-link:hover {
  clip-path: inset(0 round 14px);
}
*/`;
}