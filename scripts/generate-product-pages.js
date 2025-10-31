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
  const modifiedTemplate = template.replace(
    '<script type="module" src="/src/products-detail.ts"></script>',
    `<script>
      // 确保 URL 中包含 productId 参数（如果是从路径访问）
      (function() {
        const pathMatch = window.location.pathname.match(/\\/products\\/([^\\/]+)\\/?$/);
        if (pathMatch && !window.location.search.includes('productId=')) {
          const productId = pathMatch[1];
          if (productId && productId !== 'index.html') {
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('productId', productId);
            window.history.replaceState({}, '', newUrl);
          }
        }
      })();
    </script>
    <script type="module" src="/src/products-detail.ts"></script>`
  );
  
  fs.writeFileSync(productIndexPath, modifiedTemplate);
  console.log(`✅ 生成产品页面: /products/${product.productId}/index.html`);
});

console.log(`✅ 已为 ${products.length} 个产品生成页面`);

