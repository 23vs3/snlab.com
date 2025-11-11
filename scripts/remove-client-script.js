/**
 * 构建后脚本：删除生产环境中的客户端脚本文件
 * 这些文件是 Vite 开发环境专用的，不应该出现在生产构建中
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const assetsDir = path.join(distDir, 'assets');

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  let removedCount = 0;
  
  files.forEach(file => {
    if (file.startsWith('client-') && file.endsWith('.js')) {
      const filePath = path.join(assetsDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`✅ 删除客户端脚本文件: ${file}`);
        removedCount++;
      } catch (e) {
        console.warn(`⚠️  无法删除客户端脚本文件: ${file}`, e);
      }
    }
  });
  
  if (removedCount > 0) {
    console.log(`✅ 已删除 ${removedCount} 个客户端脚本文件`);
  }
} else {
  console.log('⚠️  assets 目录不存在，跳过客户端脚本清理');
}

