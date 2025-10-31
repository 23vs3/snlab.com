/**
 * 构建脚本：将 src/content/ 中的内容文件复制到 public/src/content/
 * 确保源文件唯一，避免维护困难
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const srcContentDir = path.join(rootDir, 'src/content');
const publicContentDir = path.join(rootDir, 'public/src/content');

// 确保目标目录存在
if (!fs.existsSync(publicContentDir)) {
  fs.mkdirSync(publicContentDir, { recursive: true });
  console.log('✅ 创建目录:', publicContentDir);
}

// 读取源目录中的所有文件
const files = fs.readdirSync(srcContentDir);

// 复制每个文件
files.forEach(file => {
  const srcPath = path.join(srcContentDir, file);
  const destPath = path.join(publicContentDir, file);
  
  // 只复制文件（忽略目录）
  if (fs.statSync(srcPath).isFile()) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ 复制文件: ${file}`);
  }
});

console.log('✅ 内容文件同步完成');

