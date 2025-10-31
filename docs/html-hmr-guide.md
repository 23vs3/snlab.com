# HTML 热重载全局配置指南

## 概述

本项目已配置全局热重载支持，所有新增的 HTML 文件都会自动支持热重载功能，无需手动配置。

## 功能特性

- ✅ 自动热重载支持
- ✅ 统一的页面模板
- ✅ 自动脚本注入
- ✅ 开发时实时检测

## 使用方法

### 1. 创建新页面

使用命令行工具快速创建新页面：

```bash
npm run create-page <页面名称>
```

示例：
```bash
npm run create-page about
npm run create-page contact
npm run create-page products
```

### 2. 手动创建页面

如果您想手动创建页面，请确保包含以下脚本：

```html
<!-- 在 </body> 标签前添加 -->
<script type="module" src="/src/main.ts"></script>
<script type="module" src="/@vite/client"></script>
```

### 3. 使用模板

项目提供了标准模板文件：`templates/html-template.html`

模板包含：
- 基础样式和布局
- 导航栏和页脚
- 热重载支持
- 响应式设计

## 文件结构

```
SNLab/
├── templates/
│   └── html-template.html    # HTML 页面模板
├── plugins/
│   └── vite-html-hmr.js     # Vite 热重载插件
├── scripts/
│   └── create-page.js       # 页面创建脚本
└── docs/
    └── html-hmr-guide.md    # 本指南
```

## 自动检测

Vite 插件会自动检测：
- 缺少热重载支持的 HTML 文件
- 新创建的 HTML 文件
- 文件变化时的热重载状态

## 开发流程

1. 运行 `npm run dev` 启动开发服务器
2. 使用 `npm run create-page <名称>` 创建新页面
3. 编辑页面内容，保存后自动热重载
4. 在浏览器中查看效果

## 注意事项

- 新创建的页面会自动添加到 Vite 构建配置中
- 所有页面都使用统一的样式系统
- 热重载在开发模式下自动启用
- 生产构建时会自动优化和压缩

## 故障排除

如果热重载不工作：

1. 检查是否包含 `<script type="module" src="/@vite/client"></script>`
2. 确认开发服务器正在运行
3. 检查浏览器控制台是否有错误
4. 尝试手动刷新页面

## 示例

创建一个关于页面：

```bash
npm run create-page about
```

这将创建 `about.html` 文件，包含：
- 完整的页面结构
- 热重载支持
- 响应式布局
- 统一的导航和页脚
