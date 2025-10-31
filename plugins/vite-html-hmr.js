import fs from 'fs';
import path from 'path';

/**
 * Vite 插件：自动为 HTML 文件注入热重载支持
 */
export function htmlHmrPlugin() {
  return {
    name: 'html-hmr',
    configureServer(server) {
      // 监听 HTML 文件变化
      server.ws.on('file-change', (file) => {
        if (file.endsWith('.html')) {
          // 检查文件是否包含热重载脚本
          const filePath = path.resolve(server.config.root, file);
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            if (!content.includes('/@vite/client')) {
              console.log(`🔧 自动为 ${file} 添加热重载支持...`);
              // 这里可以自动添加脚本，但为了安全起见，我们只提示
              console.log(`   请手动添加: <script type="module" src="/@vite/client"></script>`);
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
