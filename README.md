# SINIAN LAB 官网

基于 TypeScript 的现代音频品牌官网，参考 Bang & Olufsen 设计风格。

## 技术栈

- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速构建工具
- **原生 HTML/CSS** - 无框架依赖
- **模块化架构** - 组件化开发

## 项目结构

```
├── src/
│   ├── components/     # 组件
│   │   ├── Carousel.ts # 轮播组件
│   │   └── Navigation.ts # 导航组件
│   ├── types/         # 类型定义
│   ├── utils/         # 工具函数
│   └── main.ts        # 入口文件
├── index.html         # 首页
├── product-a1.html    # 产品详情页
├── package.json       # 项目配置
├── tsconfig.json      # TypeScript 配置
└── vite.config.ts     # Vite 配置
```

## 开发

### 安装依赖

```bash
npm install
```

### 开发服务器

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 类型检查

```bash
npm run type-check
```

## 特性

- ✅ 响应式设计
- ✅ 无缝轮播组件
- ✅ 视频播放支持
- ✅ 移动端适配
- ✅ 类型安全
- ✅ 模块化架构
- ✅ 现代构建工具

## 组件

### Carousel 轮播组件

- 无缝循环播放
- 触摸/拖拽支持
- 视频播放集成
- 键盘导航
- 自动播放控制

### Navigation 导航组件

- 移动端菜单
- 平滑滚动
- 响应式设计

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+


