/**
 * Vite 插件：确保 src/ 目录中的文件优先于 public/ 目录中的文件
 * 
 * 注意：此插件主要用于处理历史遗留问题。如果 public/ 和 src/ 中有同名文件冲突，
 * 此插件会在构建完成后将 src/ 中的文件复制到 dist/，覆盖 public/ 中复制的文件。
 * 
 * 最佳实践：应该避免在 public/ 中放置源代码文件，public/ 应该只包含静态资源。
 * 
 * 如果 public/ 和 src/ 中不再有冲突文件，可以考虑移除此插件。
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

