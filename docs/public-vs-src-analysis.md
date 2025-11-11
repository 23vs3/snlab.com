# public/src/components 与 src/components 目录分析

## 问题

项目中同时存在两个目录：
- `public/src/components/` - 包含 `header.html` 和 `load-header.js`
- `src/components/` - 包含相同的文件以及其他组件

这造成了混淆和构建问题。

## 历史原因

从 Git 历史来看：
- `513d2e0` - 最初添加了 `public/src/components/` 中的文件
- 可能是早期开发时对 Vite `publicDir` 的误解

## Vite publicDir 的正确用途

根据 Vite 官方文档，`publicDir` 应该用于：

✅ **应该放在 public/ 的文件：**
- 静态资源（图片、字体、图标）
- 不需要处理的文件（如 `robots.txt`、`favicon.ico`）
- 需要保持原样复制的文件

❌ **不应该放在 public/ 的文件：**
- 源代码文件（`.ts`、`.js`、`.html` 等需要处理的文件）
- 会被构建工具处理的文件
- 需要版本控制和持续更新的文件

## 当前问题

1. **重复维护**：需要同时更新两个目录中的文件
2. **容易出错**：忘记更新 `public/` 中的文件会导致构建问题
3. **混淆**：不清楚哪个是"真实"的源文件
4. **需要额外插件**：需要 `vite-priority-src-plugin` 来确保优先级

## 解决方案

### 推荐方案：删除 public/src/components/

**理由：**
1. `src/components/` 是源代码目录，应该作为唯一来源
2. `load-header.js` 和 `header.html` 是源代码文件，不应该在 `public/` 中
3. Vite 会自动处理 `src/` 目录中的文件
4. 简化项目结构，减少混淆

**步骤：**
1. 确认 `src/components/` 中的文件是最新的
2. 删除 `public/src/components/` 目录
3. 移除 `vite-priority-src-plugin`（不再需要）
4. 更新文档

### 替代方案：保留但明确用途

如果必须保留 `public/src/components/`（例如为了兼容性），应该：
1. 明确文档说明 `src/components/` 是唯一来源
2. 在构建脚本中自动同步
3. 添加 Git hooks 防止直接修改 `public/src/components/`

## 建议

**强烈建议删除 `public/src/components/`**，因为：
- 它不符合 Vite 的最佳实践
- 造成不必要的复杂性
- 没有实际用途（`src/components/` 已经足够）

