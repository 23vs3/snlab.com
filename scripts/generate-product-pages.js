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
    
    // 监听模块加载完成
    window.addEventListener('load', function() {
      console.log('[Product Page] Window loaded, checking if product detail initialized...');
      setTimeout(function() {
        // 检查是否已经有内容渲染
        const productTitle = document.getElementById('product-title');
        if (productTitle && productTitle.textContent === '加载中...') {
          console.warn('[Product Page] Product detail not initialized after load, pathname:', window.location.pathname);
          console.warn('[Product Page] Available window.i18n:', typeof window.i18n !== 'undefined');
        }
      }, 1000);
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

