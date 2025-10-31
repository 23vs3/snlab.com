import { defineConfig } from 'vite'
import { htmlHmrPlugin } from './plugins/vite-html-hmr.js'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        product: 'products/index.html',
        qr: 'qr-display.html',
        warranty: 'warranty/index.html'
      }
    },
    // 确保静态资源被正确复制
    copyPublicDir: true
  },
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 3001,
    open: 'index.html', // 打开主页面
    hmr: {
      host: '192.168.3.150' // HMR 主机地址
    }
  },
  plugins: [
    htmlHmrPlugin(), // 自动检测 HTML 文件热重载支持
    // 自定义插件：支持 /products/{productId} 路径重写（不带尾部斜杠）
    {
      name: 'product-routes',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // 处理 /products/{productId} 或 /products/{productId}/ 路径
          if (req.url && !req.url.includes('.') && !req.url.startsWith('/@')) {
            const productMatch = req.url.match(/^\/products\/([^\/\?]+)\/?(\?.*)?$/);
            if (productMatch && productMatch[1] && productMatch[1] !== 'index.html' && !productMatch[1].includes('.')) {
              // 如果 URL 带尾部斜杠，重定向到不带斜杠的版本
              if (req.url.endsWith('/') && !req.url.includes('?')) {
                res.writeHead(301, { 'Location': req.url.slice(0, -1) });
                res.end();
                return;
              }
              const productId = productMatch[1];
              const query = req.url.includes('?') ? req.url.split('?')[1] : '';
              req.url = `/products/index.html?productId=${productId}${query ? '&' + query : ''}`;
            }
          }
          next();
        });
      }
    },
    // 自定义插件：支持 /warranty 路径重写（不带尾部斜杠）
    {
      name: 'warranty-routes',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // 处理 /warranty 或 /warranty/ 路径
          if (req.url && !req.url.includes('.') && !req.url.startsWith('/@')) {
            if (req.url === '/warranty' || req.url === '/warranty/') {
              // 如果 URL 带尾部斜杠，重定向到不带斜杠的版本
              if (req.url === '/warranty/') {
                res.writeHead(301, { 'Location': '/warranty' });
                res.end();
                return;
              }
              req.url = '/warranty/index.html';
            }
          }
          next();
        });
      }
    }
  ]
})
