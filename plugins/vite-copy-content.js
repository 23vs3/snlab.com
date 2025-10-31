/**
 * Vite 插件：在构建时复制 src/content 到 dist/src/content
 * 这样生产环境也能访问 markdown 文件
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function viteCopyContentPlugin() {
  return {
    name: 'vite-copy-content',
    generateBundle() {
      // 在构建时复制 src/content 到 dist/src/content
      const rootDir = path.resolve(__dirname, '..');
      const srcContentDir = path.join(rootDir, 'src', 'content');
      const distContentDir = path.join(rootDir, 'dist', 'src', 'content');
      
      if (fs.existsSync(srcContentDir)) {
        // 确保目标目录存在
        if (!fs.existsSync(distContentDir)) {
          fs.mkdirSync(distContentDir, { recursive: true });
        }
        
        // 复制所有文件
        const files = fs.readdirSync(srcContentDir);
        files.forEach(file => {
          const srcPath = path.join(srcContentDir, file);
          const destPath = path.join(distContentDir, file);
          
          if (fs.statSync(srcPath).isFile()) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`✅ 复制内容文件到 dist: ${file}`);
          }
        });
      }
    },
    configureServer(server) {
      // 开发环境：确保 /src/content 路径可以访问
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/src/content/')) {
          // 让 Vite 正常处理，不做额外处理
          // Vite 会自动服务项目根目录下的文件
        }
        next();
      });
    }
  };
}

