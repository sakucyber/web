/*
 * 首屏主题初始化（经典脚本，阻塞渲染）
 * ----------------------------------------------------------------
 * 放在 <head> 里、样式之前执行，先根据 localStorage 设置 data-theme，
 * 避免深色站第一帧闪白。之所以用 public/ 下的独立文件而不是内联脚本：
 * 这样 CSP 可以保持 script-src 'self'，不需要 unsafe-inline。
 */
(function () {
  var root = document.documentElement;
  try {
    var theme = localStorage.getItem('blog-theme');
    if (theme === 'light' || theme === 'dark') {
      root.setAttribute('data-theme', theme);
    }
    var color = localStorage.getItem('blog-color');
    if (color) {
      root.setAttribute('data-color', color);
    }
  } catch {
    /* localStorage 被禁用时忽略，使用默认主题 */
  }
  // 标记 JS 可用：进场动画的初始隐藏态只对 html.js 生效，无 JS 时内容直接可见
  root.classList.add('js');
})();
