/**
 * 构建脚本：为保修页面内联保修条款内容
 * 这样保修内容可以立即显示，无需等待 JavaScript 加载
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const warrantyTemplatePath = path.join(distDir, 'warranty', 'index.html');

// 读取保修条款内容（从 public 目录，因为已经复制过了）
const warrantyZhCNPath = path.join(distDir, 'src', 'content', 'warranty-zh-CN.md');
const warrantyEnPath = path.join(distDir, 'src', 'content', 'warranty-en.md');

// Markdown 转 HTML 转换器（与 render-warranty.ts 保持一致）
function convertMarkdownToHTML(markdown) {
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

try {
  // 读取模板
  let template = fs.readFileSync(warrantyTemplatePath, 'utf-8');
  
  // 读取保修条款内容
  let warrantyZhCN = '';
  let warrantyEn = '';
  
  if (fs.existsSync(warrantyZhCNPath)) {
    warrantyZhCN = fs.readFileSync(warrantyZhCNPath, 'utf-8');
  } else {
    console.warn('⚠️  未找到中文保修条款文件:', warrantyZhCNPath);
  }
  
  if (fs.existsSync(warrantyEnPath)) {
    warrantyEn = fs.readFileSync(warrantyEnPath, 'utf-8');
  } else {
    console.warn('⚠️  未找到英文保修条款文件:', warrantyEnPath);
  }
  
  // 转换为 HTML
  const warrantyZhCNHtml = warrantyZhCN ? convertMarkdownToHTML(warrantyZhCN) : '';
  const warrantyEnHtml = warrantyEn ? convertMarkdownToHTML(warrantyEn) : '';
  
  // 替换"加载中..."占位符为中文内容（默认语言）
  template = template.replace(
    /<div class="warranty-content" id="warranty-content">\s*<p>加载中\.\.\.<\/p>\s*<\/div>/,
    `<div class="warranty-content" id="warranty-content">${warrantyZhCNHtml || '<p>无法加载保修条款内容</p>'}</div>`
  );
  
  // 添加内联数据脚本，用于语言切换
  const inlineScript = `
  <script>
    // 内联保修条款数据（用于语言切换）
    const WARRANTY_DATA = {
      'zh-CN': ${JSON.stringify(warrantyZhCNHtml)},
      'en': ${JSON.stringify(warrantyEnHtml)}
    };
    
    // 语言切换函数
    function updateWarrantyLanguage(lang) {
      const container = document.getElementById('warranty-content');
      if (container && WARRANTY_DATA[lang]) {
        container.innerHTML = WARRANTY_DATA[lang];
      }
    }
    
    // 监听语言变化事件（如果 ES 模块加载成功，会被触发）
    window.addEventListener('languageChanged', function(e) {
      const lang = (e.detail && e.detail.lang) || (localStorage.getItem('language') || 'zh-CN');
      updateWarrantyLanguage(lang);
    });
  </script>`;
  
  // 在 </body> 之前插入脚本
  if (template.includes('</body>')) {
    template = template.replace('</body>', `${inlineScript}</body>`);
  } else {
    template += inlineScript;
  }
  
  // 写入修改后的文件
  fs.writeFileSync(warrantyTemplatePath, template);
  console.log('✅ 保修页面内容已内联: /warranty/index.html');
  
} catch (error) {
  console.error('❌ 处理保修页面时出错:', error);
  process.exit(1);
}

