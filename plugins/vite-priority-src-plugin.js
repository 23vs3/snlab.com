/**
 * Vite 插件：复制 src/ 目录中的非模块文件到 dist/
 * 
 * 问题：Vite 不会自动复制 src/ 目录中的普通 JS/HTML 文件（非 ES 模块）到 dist/。
 * 这些文件（如 load-header.js、header.html）需要通过 <script src> 直接引用，
 * 需要手动复制到 dist/ 目录。
 * 
 * 解决方案：在构建完成后（writeBundle 钩子），将 src/ 中指定的文件复制到 dist/。
 * 
 * 最佳实践：
 * - public/ 目录应该只包含静态资源（图片、字体等）
 * - 源代码文件应该放在 src/ 目录
 * - 非模块文件需要通过此插件复制到 dist/
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function vitePrioritySrcPlugin() {
  return {
    name: 'vite-priority-src',
    writeBundle(options) {
      const rootDir = path.resolve(__dirname, '..');
      const srcDir = path.join(rootDir, 'src');
      const distDir = options.dir || path.join(rootDir, 'dist');
      
      // 需要复制到 dist/ 的文件列表（相对于 src/ 的路径）
      // 这些文件是普通的 JS/HTML 文件，不会被 Vite 自动处理，需要手动复制
      const filesToCopy = [
        'components/header.html',
        'components/load-header.js'
      ];
      
      console.log('🔧 复制 src/ 目录中的非模块文件到 dist/...');
      
      filesToCopy.forEach(relativePath => {
        const srcPath = path.join(srcDir, relativePath);
        const distPath = path.join(distDir, 'src', relativePath);
        
        if (fs.existsSync(srcPath)) {
          // 确保目标目录存在
          const distDirPath = path.dirname(distPath);
          if (!fs.existsSync(distDirPath)) {
            fs.mkdirSync(distDirPath, { recursive: true });
          }
          
          // 复制文件到 dist/
          fs.copyFileSync(srcPath, distPath);
          console.log(`✅ 复制 src/${relativePath} 到 dist/`);
        } else {
          console.warn(`⚠️  src/${relativePath} 不存在，跳过`);
        }
      });
      
      console.log('✅ src/ 目录文件复制完成');
    }
  };
}

