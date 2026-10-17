/**
 * 小丑牌 · iframe 懒加载
 * ----------------------------------------------------------------
 * 构建产物是约 200KB 的单文件 HTML（public/games/balatro/index.html）。
 * 页面初始只渲染静态占位卡，点击「加载试玩预览」后才创建 iframe 发起请求，
 * 避免每个访问项目页的人都白白下载整个游戏包。
 */

const shell = document.querySelector<HTMLElement>('[data-balatro-embed]');
const trigger = document.querySelector<HTMLButtonElement>('[data-balatro-load]');
const placeholder = document.querySelector<HTMLElement>('[data-balatro-placeholder]');
const status = document.querySelector<HTMLElement>('[data-balatro-status]');

if (shell && trigger) {
  const embedShell = shell;
  const loadButton = trigger;
  const loadingText = status;

  loadButton.addEventListener('click', () => {
    if (loadButton.disabled) return;
    loadButton.disabled = true;

    if (placeholder) placeholder.hidden = true;
    if (loadingText) {
      loadingText.hidden = false;
      loadingText.textContent = '🃏 正在加载游戏…';
    }

    const frame = document.createElement('iframe');
    frame.className = 'balatro-frame';
    frame.src = loadButton.dataset.src ?? '/games/balatro/index.html';
    frame.title = '小丑牌 · 可交互试玩预览';
    frame.loading = 'eager';
    frame.setAttribute('allow', 'fullscreen; autoplay; gamepad');
    frame.setAttribute('allowfullscreen', '');

    frame.addEventListener(
      'load',
      () => {
        if (loadingText) loadingText.hidden = true;
      },
      { once: true },
    );

    embedShell.append(frame);
  });
}

export {};
