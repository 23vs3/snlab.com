import { i18n } from '../i18n/i18n.js';
import type { Language } from '../i18n/locales.js';

/**
 * 渲染保修条款内容
 */
export async function renderWarrantyContent(): Promise<void> {
  const container = document.getElementById('warranty-content');
  if (!container) {
    console.warn('Warranty content container not found');
    return;
  }

  const currentLang = i18n.getLang() as Language;
  
  try {
    // 根据当前语言加载对应的 markdown 文件
    // 开发环境和生产环境都直接从 /src/content/ 读取（Vite 会自动处理）
    const filePath = `/src/content/warranty-${currentLang === 'zh-CN' ? 'zh-CN' : 'en'}.md`;
    
    // 直接获取文件内容
    // 开发环境添加时间戳防止缓存，生产环境使用固定路径
    const cacheBuster = import.meta.env.DEV ? `?t=${Date.now()}` : '';
    const response = await fetch(filePath + cacheBuster, {
      cache: 'no-store' // 禁用缓存，确保获取最新内容
    });
    if (!response.ok) {
      throw new Error(`无法加载保修条款文件: ${filePath} (${response.status})`);
    }
    const markdown = await response.text();
    
    // 简单的 markdown 转 HTML 转换
    const html = convertMarkdownToHTML(markdown);
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading warranty content:', error);
    container.innerHTML = '<p>无法加载保修条款内容，请稍后重试。</p>';
  }
}

/**
 * 简单的 Markdown 转 HTML 转换器
 */
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown;
  
  // 转换标题
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  
  // 转换列表
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');
  
  // 包裹列表项
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
  // 转换段落（空行分隔）
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(p => {
    p = p.trim();
    if (!p || p.startsWith('<')) return p;
    return `<p>${p}</p>`;
  }).join('\n\n');
  
  // 转换加粗
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 转换强调
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // 转换水平线
  html = html.replace(/^---$/gm, '<hr>');
  
  // 清理多余的空行
  html = html.replace(/\n{3,}/g, '\n\n');
  
  return html;
}

/**
 * 初始化保修页面
 */
export function initWarrantyPage(): void {
  // 等待 i18n 初始化
  const init = () => {
    try {
      const currentLang = i18n.getLang();
      if (!currentLang) {
        setTimeout(init, 50);
        return;
      }
      
      // 渲染内容
      renderWarrantyContent();
      
      // 监听语言变化
      const handleLanguageChange = () => {
        renderWarrantyContent();
      };
      window.addEventListener('languageChanged', handleLanguageChange);
      
      // 开发环境：监听文件变化（通过 Vite HMR）
      if (import.meta.env.DEV && import.meta.hot) {
        // 监听自定义的保修条款更新事件
        import.meta.hot.on('warranty-content-update', () => {
          console.log('[Warranty] 检测到保修条款文件更新，重新加载内容...');
          renderWarrantyContent();
        });
        
        // 也监听 Vite 的通用更新事件（备用）
        import.meta.hot.on('vite:beforeUpdate', () => {
          // 延迟一点确保文件已经写入磁盘
          setTimeout(() => {
            renderWarrantyContent();
          }, 100);
        });
      }
    } catch (e) {
      setTimeout(init, 50);
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(init, 100);
    });
  } else {
    setTimeout(init, 100);
  }
}

