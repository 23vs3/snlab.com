# 媒体性能 Baseline 记录（填空模板）

用途：记录“优化前/优化后”的**同口径**数据，方便后续迭代避免回退。建议每次涉及图片/视频策略、CSS 布局、构建管线变更时更新一次。

## 测试口径（必须固定）
- **测试方式**：`npm run build && npm run preview`
- **浏览器**：Chrome（版本：____）
- **设备**：
  - 桌面：____（分辨率：____）
  - 移动：____（iOS/Android + 机型：____）
- **Network throttling**：____（例如 Fast 3G / Slow 4G）
- **CPU throttling**：____（例如 4x）
- **测试页面**：
  - 首页：`/`
  - 详情页：`/products/{productId}`（本次选用：____）
- **是否清缓存**：
  - 冷启动：是/否（____）
  - 回访：是/否（____）

## 变更摘要（本次）
- 代码变更：____
- 资源变更（新增图片/替换图片/视频）：____
- 构建配置/脚本变更：____

## 关键实现约定（本仓库媒体系统）
- 构建期生成变体脚本：`scripts/generate-images.js`
- 运行时 `<picture>` 工具：`src/utils/media.ts`
- 变体路径约定（必须匹配）：
  - 原图：`/images/a/b/foo.png`
  - 变体：`/images-gen/a/b/foo-w640.webp`、`/images-gen/a/b/foo-w640.avif`
- 回退策略：
  - 浏览器不支持 AVIF/WebP → 使用 `<img src="/images/...">`
  - 变体文件缺失 → `<picture>` 的 `<source>` 失败时同样回退到 `<img>`

## 指标记录（优化前）
### 首页（`/`）
- Lighthouse Mobile：
  - LCP：____ ms
  - CLS：____
  - TBT：____ ms
- Network（首屏/LCP 前后窗口）：
  - 图片请求数：____
  - 图片总传输字节（transfer size）：____ KB
  - 最大单张图片 transfer size：____ KB
- 备注（是否出现白屏/闪烁/抖动）：____

### 详情页（`/products/{productId}`）
- Lighthouse Mobile：
  - LCP：____ ms
  - CLS：____
  - TBT：____ ms
- Network：
  - 首次进入是否请求视频：是/否（应为 否）
  - 长图首屏阶段请求数量：____（期望较少，滚动再加载）
  - 图集缩略图 transfer size（合计）：____ KB
- 交互：
  - 点击缩略图切换主图延迟体感：____
  - 快速滚动长图区域是否卡顿：____

## 指标记录（优化后）
（同上口径复制一份填写）

### 首页（`/`）
- Lighthouse Mobile：
  - LCP：____ ms
  - CLS：____
  - TBT：____ ms
- Network（首屏/LCP 前后窗口）：
  - 图片请求数：____
  - 图片总传输字节（transfer size）：____ KB
  - 最大单张图片 transfer size：____ KB
- 备注：____

### 详情页（`/products/{productId}`）
- Lighthouse Mobile：
  - LCP：____ ms
  - CLS：____
  - TBT：____ ms
- Network：
  - 首次进入是否请求视频：是/否
  - 长图首屏阶段请求数量：____
  - 图集缩略图 transfer size（合计）：____ KB
- 交互：____

## 结论与下一步
- 是否达标（LCP/CLS/TBT + 行为约束）：是/否（原因：____）
- 下一步优化方向（如需）：____

---

## Baseline 记录：2026-03-18（线上 `sinianlab.com`，自动采集）

> 说明：本条记录为“线上自动采集”的 **资源头信息**（`Content-Type/Length/ETag/Last-Modified` 等），用于快速判断是否部署了响应式变体与缓存策略是否正常。\n> Lighthouse（LCP/CLS/TBT）仍建议用 Chrome DevTools 在同口径下手工补齐到上面的模板区块。

### 测试口径（自动采集）
- **站点**：`https://sinianlab.com/`
- **采集时间（UTC）**：2026-03-18 10:05 左右
- **采集方式**：`curl -I`/抓取 HTML 正则提取 assets

### 关键行为校验（已满足）
- **`/images-gen/*.avif` 可访问且返回 `image/avif`**（代表变体目录已部署）
- **详情页视频**：首次进入不请求 mp4；点击“视频”tab 后才请求（在线上已人工复验）

### 首页关键资源（HEAD 结果摘录）
- **HTML**：`GET /`
  - `Content-Type`: `text/html; charset=utf-8`
  - `Content-Length`: `27882`
  - `ETag`: `"69ba74d8-6cea"`
  - `Last-Modified`: `Wed, 18 Mar 2026 09:48:08 GMT`
  - `Cache-Control`: `max-age=600`

- **主 JS**：`/assets/main-BfZ4KR0k.js`
  - `Content-Type`: `application/javascript; charset=utf-8`
  - `Content-Length`: `17414`
  - `ETag`: `"69ba74d7-4406"`
  - `Last-Modified`: `Wed, 18 Mar 2026 09:48:07 GMT`

- **主 CSS**：`/assets/main-_CEpSIu_.css`
  - `Content-Type`: `text/css; charset=utf-8`
  - `Content-Length`: `4829`
  - `ETag`: `"69ba74d7-12dd"`
  - `Last-Modified`: `Wed, 18 Mar 2026 09:48:07 GMT`

### 图片变体（`images-gen`，用于确认“优化生效”）
- **轮播首图（AVIF）**：`/images-gen/carousel_1-w1600.avif`
  - `Content-Type`: `image/avif`
  - `Content-Length`: `56165`
  - `ETag`: `"69ba74d8-db65"`
  - `Last-Modified`: `Wed, 18 Mar 2026 09:48:08 GMT`

- **产品主图（AVIF）**：`/images-gen/product_mainImage-w1600.avif`
  - `Content-Type`: `image/avif`
  - `Content-Length`: `93391`
  - `ETag`: `"69ba74d8-16ccf"`
  - `Last-Modified`: `Wed, 18 Mar 2026 09:48:08 GMT`

- **颜色规格预览图（AVIF，小图）**：`/images-gen/product_colorOrangePreImage-w240.avif`
  - `Content-Type`: `image/avif`
  - `Content-Length`: `8040`
  - `ETag`: `"69ba74d7-1f68"`
  - `Last-Modified`: `Wed, 18 Mar 2026 09:48:07 GMT`

### 视频资源（用于验证“按需加载 + Range”）
- **视频文件**：`/images/product_video1.mp4`
  - `Content-Type`: `video/mp4`
  - `Content-Length`: `92849112`（约 88.5 MiB）
  - `Accept-Ranges`: `bytes`
  - `ETag`: `"69ba74d8-588c3d8"`
  - `Last-Modified`: `Wed, 18 Mar 2026 09:48:08 GMT`

---

## Baseline 记录：2026-03-18（China Slow Fix：WebP 优先 + sizes 收紧 + 长图 IO 收紧，线上自动采集）

### 测试口径（线上自动采集）
- **站点**：`https://sinianlab.com/`
- **采集时间（UTC）**：2026-03-18 16:22 左右

### 关键行为校验（已满足）
- **`/images-gen/*.avif` 返回 `image/avif`**（代表变体目录已部署且被引用）
- **视频按需加载**：首次进入不请求 mp4；点击“视频”tab 后才请求（与 QA Checklist 一致）

### 首页关键资源（HEAD 结果摘录）
- **HTML**：`GET /`
  - `Content-Type`: `text/html; charset=utf-8`
  - `Content-Length`: `27882`
  - `ETag`: `"69bad114-6cea"`
  - `Last-Modified`: `Wed, 18 Mar 2026 16:21:40 GMT`
  - `Cache-Control`: `max-age=600`

- **主 JS**：`/assets/main-CnCyz0Mz.js`
  - `Content-Type`: `application/javascript; charset=utf-8`
  - `Content-Length`: `17414`
  - `ETag`: `"69bad114-4406"`
  - `Last-Modified`: `Wed, 18 Mar 2026 16:21:40 GMT`

- **主 CSS**：`/assets/main-DCUusG2R.css`
  - `Content-Type`: `text/css; charset=utf-8`
  - `Content-Length`: `4826`
  - `ETag`: `"69bad114-12da"`
  - `Last-Modified`: `Wed, 18 Mar 2026 16:21:40 GMT`

### 图片变体（`images-gen`，用于确认“优化生效”）
- **轮播首图（AVIF）**：`/images-gen/carousel_1-w1600.avif`
  - `Content-Type`: `image/avif`
  - `Content-Length`: `56165`
  - `ETag`: `"69bad114-db65"`
  - `Last-Modified`: `Wed, 18 Mar 2026 16:21:40 GMT`

- **产品主图（AVIF）**：`/images-gen/product_mainImage-w1600.avif`
  - `Content-Type`: `image/avif`
  - `Content-Length`: `93391`
  - `ETag`: `"69bad114-16ccf"`
  - `Last-Modified`: `Wed, 18 Mar 2026 16:21:40 GMT`

- **颜色规格预览图（AVIF，小图）**：`/images-gen/product_colorOrangePreImage-w240.avif`
  - `Content-Type`: `image/avif`
  - `Content-Length`: `8040`
  - `ETag`: `"69bad114-1f68"`
  - `Last-Modified`: `Wed, 18 Mar 2026 16:21:40 GMT`

### 视频资源（用于验证“按需加载 + Range”）
- **视频文件**：`/images/product_video1.mp4`
  - `Content-Type`: `video/mp4`
  - `Content-Length`: `92849112`（约 88.5 MiB）
  - `Accept-Ranges`: `bytes`
  - `ETag`: `"69bad114-588c3d8"`
  - `Last-Modified`: `Wed, 18 Mar 2026 16:21:40 GMT`

