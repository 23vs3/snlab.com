# 测试外部链接锚点处理

## 测试方法

### 方法 1：浏览器控制台测试（最简单）

1. 打开网站首页
2. 打开浏览器控制台（F12 或 Cmd+Option+I）
3. 在控制台执行以下代码：

```javascript
// 创建一个测试外部链接（包含锚点）
const testLink = document.createElement('a');
testLink.href = 'https://example.com#section1';
testLink.textContent = '测试外部链接（带锚点）';
testLink.style.cssText = 'display: block; padding: 10px; background: #f0f0f0; margin: 10px;';
document.body.appendChild(testLink);

// 添加点击监听，检查是否被拦截
testLink.addEventListener('click', (e) => {
  console.log('✅ 外部链接被点击，href:', testLink.href);
  console.log('✅ 如果看到这条日志，说明外部链接没有被我们的代码拦截');
});

// 点击测试
console.log('请点击页面上新出现的"测试外部链接（带锚点）"按钮');
```

4. 点击页面上新出现的测试链接
5. 观察控制台输出：
   - 如果看到 "✅ 外部链接被点击" 日志，说明外部链接正常工作
   - 如果看到 `[smoothScroll] 检测到链接点击` 日志，说明被拦截了（这是 bug）

### 方法 2：临时添加测试链接到页面

在 `index.html` 的 `<section id="support">` 部分临时添加：

```html
<!-- 临时测试链接 -->
<a href="https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView#syntax" 
   target="_blank" 
   style="display: block; padding: 10px; background: yellow; margin: 10px;">
   测试外部链接（MDN 文档，带锚点）
</a>
```

然后：
1. 刷新页面
2. 打开浏览器控制台
3. 点击这个测试链接
4. 检查：
   - 如果跳转到外部网站，说明正常 ✅
   - 如果页面滚动（而不是跳转），说明被拦截了 ❌

### 方法 3：检查代码逻辑

查看 `src/utils/smoothScroll.ts` 第 68-71 行：

```typescript
// 检查是否是外部链接（包含 http:// 或 https://）
if (href.startsWith('http://') || href.startsWith('https://')) {
  // 外部链接，不处理
  return;
}
```

这个逻辑应该：
- ✅ 匹配 `https://example.com#section` → 返回，不处理
- ✅ 匹配 `http://example.com#section` → 返回，不处理
- ✅ 匹配 `https://www.xiaohongshu.com` → 返回，不处理（即使没有锚点）

## 预期结果

✅ **正确行为**：
- 外部链接（`http://` 或 `https://` 开头）应该正常跳转
- 控制台不应该出现 `[smoothScroll] 点击了锚点链接` 日志
- 页面不应该滚动

❌ **错误行为**：
- 外部链接被拦截，页面滚动而不是跳转
- 控制台出现 `[smoothScroll]` 相关日志

## 测试用例

| 链接类型 | href 值 | 预期行为 |
|---------|---------|---------|
| 外部链接（带锚点） | `https://example.com#section` | 跳转到外部网站 ✅ |
| 外部链接（无锚点） | `https://example.com` | 跳转到外部网站 ✅ |
| 同页面锚点 | `#products` | 平滑滚动 ✅ |
| 跨页面锚点 | `/#products` | 跳转后滚动 ✅ |
| 相对路径锚点 | `index.html#products` | 根据当前页面决定 ✅ |

