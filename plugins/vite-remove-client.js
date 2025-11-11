/**
 * Vite 插件：在生产构建时移除客户端脚本引用
 * 移除所有对 client-*.js 的导入和引用
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function viteRemoveClientPlugin() {
  return {
    name: 'vite-remove-client',
    generateBundle(options, bundle) {
      const clientFiles = [];
      
      // 收集所有客户端脚本文件名
      for (const fileName in bundle) {
        if (fileName.startsWith('client-') && fileName.endsWith('.js')) {
          clientFiles.push(fileName);
        }
      }
      
      // 删除客户端脚本文件
      clientFiles.forEach(fileName => {
        delete bundle[fileName];
        console.log(`✅ 移除客户端脚本: ${fileName}`);
      });
      
      // 从所有 JS 文件中移除对客户端脚本的导入
      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk' && chunk.code) {
          const originalCode = chunk.code;
          
          // 移除各种格式的导入语句（包括压缩后的格式）
          // import"./client-*.js" (压缩后无空格)
          chunk.code = chunk.code.replace(/import\s*["']\.\/client-[^"']+\.js["']\s*;?/g, '');
          // import "./client-*.js" (带空格)
          chunk.code = chunk.code.replace(/import\s+["']\.\/client-[^"']+\.js["']\s*;?/g, '');
          
          if (chunk.code !== originalCode) {
            console.log(`✅ 从 ${fileName} 移除客户端脚本导入`);
          }
        }
      }
    },
    writeBundle(options) {
      // 在写入文件后，删除客户端脚本文件
      const outDir = options.dir || 'dist';
      const assetsDir = path.join(outDir, 'assets');
      
      if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        files.forEach(file => {
          if (file.startsWith('client-') && file.endsWith('.js')) {
            const filePath = path.join(assetsDir, file);
            try {
              fs.unlinkSync(filePath);
              console.log(`✅ 删除客户端脚本文件: ${filePath}`);
            } catch (e) {
              console.warn(`⚠️  无法删除客户端脚本文件: ${filePath}`, e);
            }
          }
        });
      }
    },
    transformIndexHtml: {
      enforce: 'post',
      transform(html, context) {
        // 移除 modulepreload 链接
        html = html.replace(/<link[^>]*rel\s*=\s*["']modulepreload["'][^>]*href\s*=\s*["'][^"']*client-[^"']+\.js["'][^>]*>/gi, '');
        // 移除 script 标签引用
        html = html.replace(/<script[^>]*src\s*=\s*["'][^"']*client-[^"']+\.js["'][^>]*><\/script>/gi, '');
        return html;
      }
    }
  };
}

