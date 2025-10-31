#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取命令行参数
const args = process.argv.slice(2);
const pageName = args[0];

if (!pageName) {
  console.log('使用方法: node scripts/create-page.js <页面名称>');
  console.log('示例: node scripts/create-page.js about');
  process.exit(1);
}

// 模板文件路径
const templatePath = path.join(__dirname, '../templates/html-template.html');
const outputPath = path.join(__dirname, `../${pageName}.html`);

// 检查模板文件是否存在
if (!fs.existsSync(templatePath)) {
  console.error('❌ 模板文件不存在:', templatePath);
  process.exit(1);
}

// 检查输出文件是否已存在
if (fs.existsSync(outputPath)) {
  console.error(`❌ 文件已存在: ${pageName}.html`);
  process.exit(1);
}

try {
  // 读取模板
  let template = fs.readFileSync(templatePath, 'utf-8');
  
  // 替换占位符
  const title = pageName.charAt(0).toUpperCase() + pageName.slice(1);
  template = template.replace('{{TITLE}}', title);
  template = template.replace('{{CONTENT}}', `
    <section class="container">
      <div class="section-head">
        <h2>${title}</h2>
        <span class="muted">页面内容</span>
      </div>
      <div>
        <p>这是 ${title} 页面的内容。您可以在这里添加具体的内容。</p>
      </div>
    </section>
  `);
  
  // 写入文件
  fs.writeFileSync(outputPath, template);
  
  console.log(`✅ 页面创建成功: ${pageName}.html`);
  console.log(`📝 标题: ${title} - SINIAN LAB`);
  console.log(`🔧 已自动包含热重载支持`);
  console.log(`🌐 访问地址: http://localhost:3001/${pageName}.html`);
  
} catch (error) {
  console.error('❌ 创建页面时出错:', error.message);
  process.exit(1);
}
