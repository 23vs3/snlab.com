/**
 * Vite 插件：确保 src/ 目录中的文件优先于 public/ 目录中的文件
 * 
 * 问题：Vite 的 publicDir 会在构建时复制 public/ 目录到 dist/，如果 public/ 和 src/ 中有同名文件，
 * public/ 中的文件会覆盖 src/ 中的文件，导致构建后的文件不是最新版本。
 * 
 * 解决方案：在构建完成后（writeBundle 钩子），将 src/ 中的文件复制到 dist/，覆盖 public/ 中复制的文件。
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
      
      // 需要优先处理的文件列表（相对于 src/ 的路径）
      const priorityFiles = [
        'components/header.html',
        'components/load-header.js'
      ];
      
      console.log('🔧 检查 src/ 目录中的文件优先级...');
      
      priorityFiles.forEach(relativePath => {
        const srcPath = path.join(srcDir, relativePath);
        const distPath = path.join(distDir, 'src', relativePath);
        
        if (fs.existsSync(srcPath)) {
          // 确保目标目录存在
          const distDirPath = path.dirname(distPath);
          if (!fs.existsSync(distDirPath)) {
            fs.mkdirSync(distDirPath, { recursive: true });
          }
          
          // 复制 src/ 中的文件到 dist/，覆盖 public/ 中复制的文件
          fs.copyFileSync(srcPath, distPath);
          console.log(`✅ 优先使用 src/${relativePath}，覆盖 public/ 中的文件`);
        } else {
          console.warn(`⚠️  src/${relativePath} 不存在，跳过`);
        }
      });
      
      console.log('✅ src/ 目录文件优先级处理完成');
    }
  };
}

