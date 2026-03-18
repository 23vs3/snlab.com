# SNILAB 官网

SNILAB 品牌官网（TypeScript + Vite + 原生 HTML/CSS，无框架依赖）。核心能力包括：
- 首页：轮播 + 产品列表
- 产品详情页：规格选择、图集/视频切换、长图分批加载
- 保修条款页：中英双语条款（支持语言切换）
- 站内锚点：考虑 sticky header 的平滑滚动与跨页锚点导航
- 媒体优化：构建期生成 AVIF/WebP 变体 + 运行时响应式加载与回退策略

---

## 快速开始

```bash
npm install
npm run dev
npm run build
npm run preview
```

- `dev`：启动 Vite 开发服务器（端口 `3001`），并自动打开 `qr-display.html`
- `build`：`tsc` + `vite build`，随后执行一系列 `postbuild` 脚本
- `preview`：使用 `vite preview` 验证构建产物

---

## 页面入口与路由（Vite build + dev middleware）

`vite.config.ts` 的 `build.rollupOptions.input` 定义多入口页面：
- `index.html`：首页
- `products/index.html`：产品列表页模板（postbuild 会生成各产品详情页目录）
- `qr-display.html`：二维码展示页
- `warranty/index.html`：保修条款页模板（postbuild 会内联条款内容）

开发模式下，`vite.config.ts` 通过 `configureServer` middleware 做了路由重写：
- `/products/{productId}` 与 `/products/{productId}/` -> `products/index.html?productId=...`
- `/warranty` 与 `/warranty/` -> `warranty/index.html`

---

## 项目结构（按现有代码对齐）

```text
SNLab/
├── src/
│   ├── components/
│   │   ├── Carousel.ts                # 轮播：触摸拖拽/键盘/自动播放
│   │   ├── Navigation.ts              # 移动端菜单展开/收起
│   │   ├── render-products.ts        # 首页产品列表（JS 动态兜底）
│   │   ├── render-product-detail.ts # 产品详情页渲染：规格/图集/视频/长图
│   │   └── render-warranty.ts        # 保修条款：运行时加载 markdown 并渲染
│   ├── utils/
│   │   ├── smoothScroll.ts          # 平滑滚动与锚点导航（外链保护/历史维护）
│   │   ├── media.ts                 # 响应式图片 <picture> + AVIF/WebP 变体映射与回退
│   │   └── product-card-template.ts# 产品卡片 HTML 模板（供列表渲染复用）
│   ├── config/
│   │   ├── products-data.ts         # 产品、SKU、规格、视频、长图等数据源
│   │   └── carousel-data.ts         # 轮播数据源
│   ├── i18n/
│   │   ├── init-i18n.ts             # 初始化 i18n + 绑定语言切换 UI
│   │   ├── i18n.ts                 # i18n 实例：URL/localStorage/浏览器语言优先级
│   │   └── locales.ts             # 翻译表（包含产品翻译动态生成）
│   ├── types/
│   │   └── index.ts                # TS 类型定义
│   └── main.ts                      # 前端入口：初始化 i18n/轮播/导航/滚动/首页产品
│
├── scripts/
│   ├── remove-client-script.js        # postbuild：删除生产环境 Vite client 相关产物
│   ├── generate-images.js             # postbuild：生成 AVIF/WebP 变体（dist/images-gen）
│   ├── generate-index.js              # postbuild：内联首页产品列表到 dist/index.html
│   ├── generate-product-pages.js     # postbuild：为每个产品生成 /products/{id}/index.html
│   └── generate-warranty-page.js     # postbuild：内联保修条款到 dist/warranty/index.html
│
├── plugins/
│   ├── vite-html-hmr.js
│   ├── vite-copy-content.js
│   ├── vite-warranty-hmr.js
│   ├── vite-remove-client.js
│   └── vite-priority-src-plugin.js
│
├── templates/
│   └── html-template.html           # 页面模板（create-page 使用）
│
└── docs/                              # 性能基线/验收清单/构建与目录策略说明
```

---

## 重要逻辑与功能

### 1. 前端入口初始化：`src/main.ts`

`main.ts` 的 `App` 会按顺序初始化：
- `initI18n()`：语言切换 UI 与文本渲染准备
- `Carousel`：轮播组件初始化
- `Navigation`：移动端菜单初始化
- `SmoothScroll`：锚点与平滑滚动（sticky header 偏移）
- `renderProductsList()`：首页产品列表渲染

并且包含生产环境“内联内容已存在”的检测逻辑，避免重复渲染。

---

### 2. 国际化：`src/i18n/*`

- `i18n.ts` 的语言优先级：`URL 参数 (?lang=...)` > `localStorage` > 浏览器语言 > 默认 `zh-CN`
- `setLang()` 会更新 `document.documentElement.lang`、更新 URL（可选）并派发 `languageChanged` 事件
- `init-i18n.ts` 绑定语言切换下拉/按钮，并在语言切换后触发动态文本更新

---

### 3. 锚点与平滑滚动：`src/utils/smoothScroll.ts`

主要能力：
- 根据 sticky header 计算偏移，并为 `section[id]` 设置 `scrollMarginTop`
- 处理初次加载带 hash 的回滚定位（等待 header 加载完成）
- 点击内部锚点：
  - `history.pushState` 更新 hash（保留前进/后退）
  - `window.scrollTo({ behavior: 'smooth' })` 平滑滚动（不支持则降级即时滚动）
- 点击外部链接（`http://` / `https://`）直接放行，避免被滚动逻辑拦截

---

### 4. 媒体优化（响应式图片 + AVIF/WebP 变体）

构建期：
- `scripts/generate-images.js` 使用 `sharp` 扫描 `public/images/**`
- 生成 `dist/images-gen/**/<name>-w<width>.{avif,webp}`
- 宽度集合在多个地方必须保持一致（项目当前约定：`[160, 240, 320, 640, 960, 1280, 1600]`）

运行时：
- `src/utils/media.ts` 将 `/images/...` 映射到 `images-gen/...-w{width}.{avif|webp}`
- 回退策略：
  - 非 `/images/**` 路径直接渲染 `<img>`
  - dev/test 环境不依赖 `images-gen/` 存在，避免 `<source srcset>` 404
  - `<picture>` 的 `<source>` 不可用时浏览器会回退到 `<img src="原图">`

---

### 5. 首页产品列表：`render-products.ts` + `postbuild/generate-index.js`

- 生产构建：`scripts/generate-index.js` 把产品卡片 HTML 与 `window.PRODUCTS_DATA` 内联到 `dist/index.html`
- 运行时兜底：`src/components/render-products.ts` 检测到容器无内联卡片时再动态渲染
- 语言切换会更新产品卡片内部文案与链接参数（如 `?lang=...`）

---

### 6. 产品详情页：`render-product-detail.ts` + `postbuild/generate-product-pages.js`

运行时核心能力（`src/components/render-product-detail.ts`）：
- 从 URL 获取 `productId`（兼容 `/products/{id}` 和 `?productId=...`）
- 根据规格/默认 SKU 计算当前 SKU
- 图集/视频切换：
  - 视频默认不挂载真实 `src`
  - 切到“视频”tab 后才挂载并播放（避免首屏偷跑下载）
- 缩略图联动主图
- 长图分批加载：
  - 用 `IntersectionObserver` 结合并发泵（默认并发 <= 3）把 `data-src -> src`

`postbuild` 生成：
- `scripts/generate-product-pages.js` 为每个产品生成独立目录与 `index.html`
- 在生成内容中内联 `PRODUCT_DATA` 与默认页面内容，降低对 JS 时序的依赖

---

### 7. 保修条款：`render-warranty.ts` + `postbuild/generate-warranty-page.js`

运行时（`src/components/render-warranty.ts`）：
- 根据当前语言 fetch `/src/content/warranty-zh-CN.md` 或 `/src/content/warranty-en.md`
- 简单 markdown -> HTML 转换并注入 `#warranty-content`
- `languageChanged` 时重新渲染

`postbuild`（`scripts/generate-warranty-page.js`）：
- 将两份 markdown 转成 HTML 并内联到 `dist/warranty/index.html`
- 同时内联语言数据 `WARRANTY_DATA`，让语言切换更快且初次展示更稳定

---

## 构建与 postbuild 流水线（关键稳定性保障）

`package.json`：
- `build`: `tsc && vite build && npm run postbuild`
- `postbuild` 顺序执行：
  1. `node scripts/remove-client-script.js`
  2. `node scripts/generate-images.js`
  3. `node scripts/generate-index.js`
  4. `node scripts/generate-product-pages.js`
  5. `node scripts/generate-warranty-page.js`

这些步骤共同保证：
- 生产包不携带 Vite client 相关产物
- 媒体变体按约定目录生成并部署
- 首页/产品页/保修页在生产环境尽量“内联首屏关键内容”，减少对 JS 时序依赖

---

## 仓库内 `.md` 文件的说明（已整合）

- `README.md`
  - 项目概览与构建/开发入口说明
- `TEST_EXTERNAL_LINKS.md`
  - 用于回归测试“平滑滚动是否拦截外部链接（带 hash 的外链也要正常跳转）”
  - 提供控制台测试、临时页面插入测试、以及对应 `smoothScroll` 逻辑检查点
- `PRODUCTION_CHECK.md`
  - 生产环境检查报告：验证开发环境脚本/客户端注入相关内容是否已清理、构建输出是否干净
- `PRODUCTION_IMPACT_CHECK.md`
  - 生产环境影响分析与建议：兼容性（如 Safari smooth 行为）、性能点、以及内存/监听器风险与测试建议
- `docs/build-file-priority.md`
  - 解释 Vite 构建中 `public/` 与 `src/` 同名文件覆盖问题，并说明通过优先级插件让 `src` 覆盖 `public`
- `docs/public-vs-src-analysis.md`
  - 分析为何 `public/src/components/` 与 `src/components/` 并存会引发混淆/构建问题，并给出推荐策略
- `docs/html-hmr-guide.md`
  - HTML 热重载（HMR）全局配置指南：模板需要哪些脚本、如何创建新页面、如何排查不生效
- `docs/media-performance-baseline.md`
  - 媒体性能基线记录模板：固定测试口径（throttling/设备/页面）并记录优化前后指标与线上资源头信息
- `docs/media-qa-checklist.md`
  - 媒体优化验收清单：回退策略（AVIF/WebP、变体缺失、视频不偷跑）、布局回归（CLS）、性能阈值、线上缓存验证与归档输出建议
- `src/content/warranty-zh-CN.md`
  - 中文售后政策/保修条款正文（作为保修页内容源）
- `src/content/warranty-en.md`
  - 英文售后政策/保修条款正文（作为保修页内容源）

---

## 维护要点（建议阅读对应文档用于回归）

- 修改滚动/锚点逻辑时：优先跑 `TEST_EXTERNAL_LINKS.md` 提供的用例
- 修改媒体管线（变体生成、`images-gen` 目录结构、宽度列表）时：同步检查
  - `scripts/generate-images.js`
  - `src/utils/media.ts`
  - `docs/media-qa-checklist.md` 与 `docs/media-performance-baseline.md`
- 修改 `public/` 与 `src/` 的归属/命名策略时：优先阅读
  - `docs/build-file-priority.md`
  - `docs/public-vs-src-analysis.md`


