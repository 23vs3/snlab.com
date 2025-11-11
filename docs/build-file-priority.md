# 构建文件优先级说明

## 问题描述

Vite 在构建时会将 `public/` 目录中的文件复制到 `dist/` 目录。如果 `public/` 和 `src/` 目录中存在同名文件，`public/` 中的文件会覆盖 `src/` 中的文件，导致构建后的文件不是最新版本。

### 受影响的文件

以下文件在 `public/` 和 `src/` 中都存在，可能引起冲突：

- `src/components/header.html`
- `src/components/load-header.js`

## 解决方案

我们创建了 `vite-priority-src-plugin.js` 插件，在构建完成后（`writeBundle` 钩子）将 `src/` 中的文件复制到 `dist/`，覆盖 `public/` 中复制的文件。

### 工作原理

1. Vite 构建时，`public/` 目录中的文件被复制到 `dist/`
2. 构建完成后，`vite-priority-src-plugin` 插件执行
3. 插件检查 `src/` 目录中的指定文件
4. 如果 `src/` 中的文件存在，将其复制到 `dist/`，覆盖 `public/` 中的文件

### 添加新文件到优先级列表

如果需要确保某个 `src/` 中的文件优先于 `public/` 中的同名文件，请在 `plugins/vite-priority-src-plugin.js` 的 `priorityFiles` 数组中添加文件路径（相对于 `src/` 的路径）：

```javascript
const priorityFiles = [
  'components/header.html',
  'components/load-header.js',
  'your/new/file.js'  // 添加新文件
];
```

## 最佳实践

1. **避免在 `public/` 中放置源代码文件**：`public/` 目录应该只包含静态资源（图片、字体等），不应该包含源代码文件。

2. **如果必须在 `public/` 中放置文件**：
   - 确保该文件也在 `src/` 中存在
   - 在 `vite-priority-src-plugin.js` 中添加该文件到优先级列表
   - 或者考虑将文件移到其他位置

3. **定期检查冲突**：
   ```bash
   # 检查 public/ 和 src/ 中的同名文件
   for file in $(find public -type f); do 
     if [ -f "src/${file#public/}" ]; then 
       echo "冲突: $file 与 src/${file#public/}"; 
     fi; 
   done
   ```

## 相关文件

- `plugins/vite-priority-src-plugin.js` - 优先级插件
- `vite.config.ts` - Vite 配置文件
- `public/src/components/` - public 目录中的组件文件（可能过时）
- `src/components/` - 源代码目录（最新版本）

