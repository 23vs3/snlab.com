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

