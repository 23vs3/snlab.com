/**
 * Vite 插件：监听 src/content 下的 markdown 文件变化，触发保修页面更新
 */
export function viteWarrantyHmrPlugin() {
  return {
    name: 'vite-warranty-hmr',
    configureServer(server) {
      // 监听 src/content 目录下的文件变化
      server.ws.on('file-change', (file) => {
        if (file.includes('src/content/warranty-') && file.endsWith('.md')) {
          // 当 markdown 文件变化时，通知客户端重新加载内容
          server.ws.send({
            type: 'custom',
            event: 'warranty-content-update',
            data: { file }
          });
        }
      });
    },
    handleHotUpdate({ file, server }) {
      // 如果修改的是 markdown 文件，触发自定义更新事件
      if (file.includes('src/content/warranty-') && file.endsWith('.md')) {
        server.ws.send({
          type: 'custom',
          event: 'warranty-content-update',
          data: { file }
        });
      }
    }
  };
}

