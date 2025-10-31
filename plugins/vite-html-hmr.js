import fs from 'fs';
import path from 'path';

/**
 * Vite 插件：自动为 HTML 文件注入热重载支持
 * 1. 检测缺少热重载脚本的 HTML 文件
 * 2. 自动注入或调整 @vite/client 脚本位置（确保在最前面）
 */
export function htmlHmrPlugin() {
  return {
    name: 'html-hmr',
    configureServer(server) {
      // 监听 HTML 文件变化
      server.ws.on('file-change', (file) => {
        if (file.endsWith('.html')) {
          const filePath = path.resolve(server.config.root, file);
          if (fs.existsSync(filePath)) {
            try {
              let content = fs.readFileSync(filePath, 'utf-8');
              const hasHmr = content.includes('/@vite/client');
              
              if (!hasHmr) {
                console.log(`⚠️  ${file} 缺少热重载支持`);
                console.log(`   请添加: <script type="module" src="/@vite/client"></script>`);
              } else {
                // 检查脚本顺序：@vite/client 应该在其他脚本之前
                const clientScriptIndex = content.indexOf('src="/@vite/client"');
                const bodyEndIndex = content.indexOf('</body>');
                
                if (clientScriptIndex !== -1 && bodyEndIndex !== -1) {
                  // 检查 @vite/client 之前是否有其他 script type="module"
                  const beforeClient = content.substring(bodyEndIndex - 500, clientScriptIndex);
                  const moduleScriptMatch = beforeClient.match(/<script\s+type\s*=\s*["']module["'][^>]*>/);
                  
                  if (moduleScriptMatch && moduleScriptMatch.index !== undefined) {
                    console.log(`⚠️  ${file} 的 @vite/client 脚本应该在所有其他模块脚本之前`);
                    console.log(`   建议调整脚本顺序，将 @vite/client 移到最前面`);
                  }
                }
              }
            } catch (e) {
              // 忽略读取错误
            }
          }
        }
      });
    },
    buildStart() {
      // 构建开始时检查所有 HTML 文件
      // getModuleIds 可能在构建时不可用，添加安全检查
      try {
        const moduleIds = this.getModuleIds();
        if (moduleIds && typeof moduleIds.filter === 'function') {
          const htmlFiles = moduleIds.filter(id => id.endsWith('.html'));
          htmlFiles.forEach(file => {
            try {
              const content = fs.readFileSync(file, 'utf-8');
              if (!content.includes('/@vite/client')) {
                console.log(`⚠️  ${file} 缺少热重载支持`);
              }
            } catch (e) {
              // 忽略无法读取的文件
            }
          });
        }
      } catch (e) {
        // 在构建环境中，getModuleIds 可能不可用，忽略错误
      }
    }
  };
}
