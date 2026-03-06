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
      { productId: 'snilab-s' },
    ];
  }
} catch (e) {
  // 如果读取失败，使用硬编码的产品列表
  console.warn('无法读取产品数据，使用默认产品列表');
  products = [
    { productId: 'snilab-s' },
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
  const assetsDir = path.join(distDir, 'assets');
  let productsDataFiles = [];
  
  if (fs.existsSync(assetsDir)) {
    productsDataFiles = fs.readdirSync(assetsDir).filter(f => f.startsWith('products-data-') && f.endsWith('.js'));
  }
  
  let productDataJson = null;
  if (productsDataFiles.length > 0) {
    const productsDataFile = path.join(assetsDir, productsDataFiles[0]);
    const productsDataJs = fs.readFileSync(productsDataFile, 'utf-8');
    // 尝试提取 products 数组（使用和 generate-index.js 相同的逻辑）
    try {
      // 使用手动括号匹配算法，处理压缩后的代码格式 const e=[...];
      const constMatch = productsDataJs.match(/const\s+\w+\s*=\s*(\[)/);
      if (constMatch && constMatch.index !== undefined) {
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
                  const arrayMatch = productsDataJs.substring(startIndex, i + 1);
                  const func = new Function('return ' + arrayMatch);
                  const allProducts = func();
                  productDataJson = allProducts.find(p => p.productId === product.productId);
                  break;
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn(`无法从构建文件提取产品数据:`, e);
    }
  }
  
  // 如果无法从构建文件获取，使用硬编码的基本数据（含 attributes/skus 以支持规格选择）
  if (!productDataJson) {
    const fallbackProducts = {
      'snilab-s': {
        productId: 'snilab-s',
        name: { 'zh-CN': '无线蓝牙音箱 SNILAB-S', 'en': 'Wireless Bluetooth Speaker SNILAB-S' },
        tagline: { 'zh-CN': '重新定义便携音乐体验', 'en': 'Redefine portable music experience' },
        priceDisplay: { 'zh-CN': '¥599', 'en': '¥599' },
        mainImage: '/images/product_mainImage.png',
        defaultImages: ['/images/product_defaultImage1.png', '/images/product_defaultImage2.png'],
        brand: 'SNILAB',
        defaultSkuId: 'SNILAB-S-ORANGE',
        attributes: [],
        skus: [
          { skuId: 'SNILAB-S-ORANGE', attributes: { color: 'orange' }, price: 599, images: ['/images/product_skuOrangeImage1.png'] }
        ]
      },
    };
    productDataJson = fallbackProducts[product.productId] || fallbackProducts['snilab-s'];
  }

  const defaultLang = 'zh-CN';
  const defaultSku = productDataJson.skus?.length && productDataJson.defaultSkuId
    ? productDataJson.skus.find(s => s.skuId === productDataJson.defaultSkuId)
    : productDataJson.skus?.[0];
  const firstImage = defaultSku?.images?.[0] || productDataJson.defaultImages?.[0] || productDataJson.mainImage || '';
  const firstPrice = defaultSku != null ? ('¥' + defaultSku.price) : (productDataJson.priceDisplay?.[defaultLang] || (productDataJson.basePrice != null ? '¥' + productDataJson.basePrice : ''));

  let modifiedTemplate = template;
  modifiedTemplate = modifiedTemplate.replace(
    /<span id="product-name">加载中\.\.\.<\/span>/,
    `<span id="product-name">${(productDataJson.name && productDataJson.name[defaultLang]) || ''}</span>`
  );
  modifiedTemplate = modifiedTemplate.replace(
    /<h1 id="product-title">加载中\.\.\.<\/h1>/,
    `<h1 id="product-title">${(productDataJson.name && productDataJson.name[defaultLang]) || ''}</h1>`
  );
  modifiedTemplate = modifiedTemplate.replace(
    /<p class="product-tagline" id="product-tagline">加载中\.\.\.<\/p>/,
    `<p class="product-tagline" id="product-tagline">${(productDataJson.tagline && productDataJson.tagline[defaultLang]) || ''}</p>`
  );
  modifiedTemplate = modifiedTemplate.replace(
    /<div class="product-price" id="product-price">加载中\.\.\.<\/div>/,
    `<div class="product-price" id="product-price">${firstPrice}</div>`
  );
  modifiedTemplate = modifiedTemplate.replace(
    /<img src="" alt="产品图" id="product-image" \/>/,
    `<img src="${firstImage}" alt="${(productDataJson.name && productDataJson.name[defaultLang]) || '产品图'}" id="product-image" />`
  );
  modifiedTemplate = modifiedTemplate.replace(
    /<title>.*?<\/title>/,
    `<title>${(productDataJson.name && productDataJson.name[defaultLang]) || 'Product'} - SNILAB</title>`
  );
  if (productDataJson.brand) {
    modifiedTemplate = modifiedTemplate.replace(
      /<a href="\/#products" class="shop-brand" id="product-shop-brand">SNILAB<\/a>/,
      '<a href="/#products" class="shop-brand" id="product-shop-brand">' + productDataJson.brand + '</a>'
    );
  }

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
  
  // 内联产品规格（specs）- 支持多规格组
  if (productDataJson.specs) {
    const specGroups = ['audio', 'physical', 'technical', 'specifications'];
    let specsHtml = '';
    for (const groupKey of specGroups) {
      const group = productDataJson.specs[groupKey];
      if (!group?.label?.[defaultLang] || !Array.isArray(group.items) || group.items.length === 0) continue;
      const label = group.label[defaultLang] || group.label['zh-CN'] || groupKey;
      const items = group.items.map(item => {
        const name = item.name?.[defaultLang] || item.name?.['zh-CN'] || '';
        const value = item.value?.[defaultLang] || item.value?.['zh-CN'] || '';
        return '<li><span class="spec-label">' + name + '</span><span class="spec-value">' + value + '</span></li>';
      }).join('');
      specsHtml += '<div class="spec-group ' + groupKey + '-specs"><h3>' + label + '</h3><ul class="spec-list">' + items + '</ul></div>';
    }
    if (specsHtml) {
      modifiedTemplate = modifiedTemplate.replace(
        /<div class="specs-grid" id="specs-grid">[\s\S]*?<\/div>/,
        '<div class="specs-grid" id="specs-grid">' + specsHtml + '</div>'
      );
    }
  }
  
  const productDataStr = JSON.stringify(productDataJson).replace(/<\/script>/gi, '<\\/script>');
  const inlineScript = `
  <script>
    var PRODUCT_DATA = ${productDataStr};
    var selectedOptions = {};
    if (PRODUCT_DATA.defaultSkuId && PRODUCT_DATA.skus && PRODUCT_DATA.skus.length) {
      var defaultSku = PRODUCT_DATA.skus.find(function(s) { return s.skuId === PRODUCT_DATA.defaultSkuId; });
      if (defaultSku && defaultSku.attributes) selectedOptions = Object.assign({}, defaultSku.attributes);
    }
    function getSelectedSku(data, attrMap) {
      if (!data.skus || !data.skus.length) return null;
      var map = attrMap || selectedOptions;
      if (Object.keys(map).length === 0 && data.defaultSkuId) {
        var ds = data.skus.find(function(s) { return s.skuId === data.defaultSkuId; });
        if (ds) return ds;
      }
      return data.skus.find(function(sku) {
        var attrs = sku.attributes || {};
        for (var k in map) if (attrs[k] !== map[k]) return false;
        return true;
      }) || null;
    }
    function renderSpecSelector(lang) {
      var el = document.getElementById('product-specs-selector');
      if (!el || !PRODUCT_DATA.attributes || !PRODUCT_DATA.attributes.length) return;
      var html = '';
      PRODUCT_DATA.attributes.forEach(function(attrSet) {
        var attr = attrSet.attribute;
        var attrId = attr.attributeId;
        var label = (attr.attributeName && attr.attributeName[lang]) || attrId;
        var help = attr.helpText && attr.helpText[lang];
        var selectedId = selectedOptions[attrId] || attrSet.selectedOptionId || (attrSet.options && attrSet.options[0] && attrSet.options[0].optionId);
        html += '<div class="spec-attr-label">' + label + (help ? ' · ' + help : '') + '</div><div class="spec-options">';
        (attrSet.options || []).forEach(function(opt) {
          var active = opt.optionId === selectedId;
          var name = (opt.optionName && opt.optionName[lang]) || opt.optionId;
          if (attr.type === 'color') {
            var thumb = opt.previewImage ? '<span class="spec-option-thumb"><img src="' + opt.previewImage + '" alt="" /></span>' : '<span class="spec-option-thumb is-color" style="background:' + (opt.value || '#ccc') + '"></span>';
            html += '<button type="button" class="spec-option spec-option--color' + (active ? ' active' : '') + '" data-attr-id="' + attrId + '" data-option-id="' + opt.optionId + '">' + thumb + '<span class="spec-option-label">' + name + '</span></button>';
          } else {
            html += '<button type="button" class="spec-option' + (active ? ' active' : '') + '" data-attr-id="' + attrId + '" data-option-id="' + opt.optionId + '"><span class="spec-option-label">' + name + '</span></button>';
          }
        });
        html += '</div>';
      });
      el.innerHTML = html;
      el.querySelectorAll('.spec-option').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var attrId = btn.getAttribute('data-attr-id');
          var optionId = btn.getAttribute('data-option-id');
          if (!attrId || !optionId) return;
          selectedOptions[attrId] = optionId;
          var sku = getSelectedSku(PRODUCT_DATA);
          var imgs = (sku && sku.images && sku.images.length) ? sku.images : (PRODUCT_DATA.defaultImages || (PRODUCT_DATA.mainImage ? [PRODUCT_DATA.mainImage] : []));
          var mainImg = document.getElementById('product-image');
          if (mainImg && imgs[0]) mainImg.src = imgs[0];
          var priceEl = document.getElementById('product-price');
          if (priceEl) priceEl.textContent = sku ? '¥' + sku.price : (PRODUCT_DATA.priceDisplay && PRODUCT_DATA.priceDisplay[document.documentElement.lang === 'en' ? 'en' : 'zh-CN']) || '';
          var thumbs = document.getElementById('product-gallery-thumbs');
          if (thumbs && imgs.length > 1) {
            thumbs.innerHTML = imgs.map(function(src, i) {
              return '<button type="button" class="' + (i === 0 ? 'active' : '') + '" data-index="' + i + '"><img src="' + src + '" alt="" /></button>';
            }).join('');
            thumbs.querySelectorAll('button').forEach(function(b, i) {
              b.addEventListener('click', function() {
                if (mainImg && imgs[i]) mainImg.src = imgs[i];
                thumbs.querySelectorAll('button').forEach(function(x, j) { x.classList.toggle('active', j === i); });
              });
            });
          }
          el.querySelectorAll('.spec-option').forEach(function(b) {
            b.classList.toggle('active', b.getAttribute('data-attr-id') === attrId && b.getAttribute('data-option-id') === optionId);
          });
        });
      });
    }
    function initGalleryTabs() {
      var imgEl = document.getElementById('product-image');
      var videoEl = document.getElementById('product-video');
      var thumbsEl = document.getElementById('product-gallery-thumbs');
      var tabsEl = document.getElementById('product-gallery-tabs');
      if (!tabsEl) return;
      var hasVideo = Array.isArray(PRODUCT_DATA.videos) && PRODUCT_DATA.videos.length > 0;
      if (videoEl) {
        if (hasVideo) {
          videoEl.src = PRODUCT_DATA.videos[0];
          videoEl.style.display = 'none';
        } else {
          videoEl.removeAttribute('src');
          videoEl.style.display = 'none';
        }
      }
      tabsEl.innerHTML = ''
        + '<button type="button" class="gallery-tab" data-mode="video"' + (hasVideo ? '' : ' disabled') + '>视频</button>'
        + '<button type="button" class="gallery-tab active" data-mode="images">图集</button>'
        + '<button type="button" class="gallery-tab" data-mode="specs">参数</button>';
      function setMode(mode) {
        if (mode === 'video') {
          if (!hasVideo || !videoEl) return;
          if (imgEl) imgEl.style.display = 'block'; // 保证布局稳定，视频覆盖在上
          if (thumbsEl) thumbsEl.style.display = 'none';
          videoEl.style.display = 'block';
        } else {
          if (videoEl) {
            videoEl.pause && videoEl.pause();
            videoEl.style.display = 'none';
          }
          if (imgEl) imgEl.style.display = 'block';
          if (thumbsEl) thumbsEl.style.display = 'flex';
          if (mode === 'specs') {
            var specsSection = document.querySelector('.specs');
            if (specsSection && specsSection.scrollIntoView) {
              specsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }
        tabsEl.querySelectorAll('.gallery-tab').forEach(function(btn) {
          var m = btn.getAttribute('data-mode');
          btn.classList.toggle('active', m === mode);
        });
      }
      tabsEl.querySelectorAll('.gallery-tab').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var mode = btn.getAttribute('data-mode');
          if (!mode || btn.disabled) return;
          setMode(mode);
        });
      });
    }
    function updateLanguage(lang) {
      if (!PRODUCT_DATA) return;
      var name = (PRODUCT_DATA.name && PRODUCT_DATA.name[lang]) || (PRODUCT_DATA.name && PRODUCT_DATA.name['zh-CN']) || '';
      var tagline = (PRODUCT_DATA.tagline && PRODUCT_DATA.tagline[lang]) || (PRODUCT_DATA.tagline && PRODUCT_DATA.tagline['zh-CN']) || '';
      var elTitle = document.getElementById('product-title');
      var elTagline = document.getElementById('product-tagline');
      var elName = document.getElementById('product-name');
      var elPrice = document.getElementById('product-price');
      if (elTitle) elTitle.textContent = name;
      if (elTagline) elTagline.textContent = tagline;
      if (elName) elName.textContent = name;
      var sku = getSelectedSku(PRODUCT_DATA);
      if (elPrice) elPrice.textContent = sku ? '¥' + sku.price : (PRODUCT_DATA.priceDisplay && PRODUCT_DATA.priceDisplay[lang]) || '';
      if (name) document.title = name + ' - SNILAB';
      if (PRODUCT_DATA.features && Array.isArray(PRODUCT_DATA.features)) {
        var fg = document.getElementById('features-grid');
        if (fg) fg.innerHTML = PRODUCT_DATA.features.map(function(f) {
          var icon = f.icon || '✨';
          var t = (f.title && f.title[lang]) || (f.title && f.title['zh-CN']) || '';
          var d = (f.description && f.description[lang]) || (f.description && f.description['zh-CN']) || '';
          return '<div class="feature-card"><div class="feature-icon">' + icon + '</div><h3>' + t + '</h3><p>' + d + '</p></div>';
        }).join('');
      }
      if (PRODUCT_DATA.specs) {
        var sg = document.getElementById('specs-grid');
        if (sg) {
          var groups = ['audio','physical','technical','specifications'];
          var out = '';
          groups.forEach(function(gk) {
            var g = PRODUCT_DATA.specs[gk];
            if (!g || !g.label || !g.items || !g.items.length) return;
            var lbl = (g.label[lang] || g.label['zh-CN']) || gk;
            out += '<div class="spec-group ' + gk + '-specs"><h3>' + lbl + '</h3><ul class="spec-list">' + g.items.map(function(it) {
              var n = (it.name && it.name[lang]) || (it.name && it.name['zh-CN']) || '';
              var v = (it.value && it.value[lang]) || (it.value && it.value['zh-CN']) || '';
              return '<li><span class="spec-label">' + n + '</span><span class="spec-value">' + v + '</span></li>';
            }).join('') + '</ul></div>';
          });
          if (out) sg.innerHTML = out;
        }
      }
      var brandEl = document.getElementById('product-shop-brand');
      if (brandEl && PRODUCT_DATA.brand) brandEl.textContent = PRODUCT_DATA.brand;
      renderSpecSelector(lang);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        renderSpecSelector('zh-CN');
        initGalleryTabs();
        var thumbs = document.getElementById('product-gallery-thumbs');
        var mainImg = document.getElementById('product-image');
        var imgs = (PRODUCT_DATA.defaultSkuId && PRODUCT_DATA.skus) ? (function() {
          var s = PRODUCT_DATA.skus.find(function(x) { return x.skuId === PRODUCT_DATA.defaultSkuId; });
          return (s && s.images) ? s.images : (PRODUCT_DATA.defaultImages || []);
        })() : (PRODUCT_DATA.defaultImages || []);
        if (thumbs && mainImg && imgs.length > 1) {
          thumbs.innerHTML = imgs.map(function(src, i) {
            return '<button type="button" class="' + (i === 0 ? 'active' : '') + '" data-index="' + i + '"><img src="' + src + '" alt="" /></button>';
          }).join('');
          thumbs.querySelectorAll('button').forEach(function(b, i) {
            b.addEventListener('click', function() {
              if (mainImg && imgs[i]) mainImg.src = imgs[i];
              thumbs.querySelectorAll('button').forEach(function(x, j) { x.classList.toggle('active', j === i); });
            });
          });
        }
      });
    } else {
      renderSpecSelector('zh-CN');
    }
    window.addEventListener('languageChanged', function(e) {
      var lang = (e.detail && e.detail.lang) || (localStorage.getItem('language') || 'zh-CN');
      updateLanguage(lang);
    });
  <\/script>`;
  
  // 移除生产环境的 Vite 客户端脚本（开发环境专用）
  modifiedTemplate = modifiedTemplate.replace(/<script\s+type\s*=\s*["']module["'][^>]*src\s*=\s*["']\/@vite\/client["'][^>]*><\/script>\s*/gi, '');
  
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

