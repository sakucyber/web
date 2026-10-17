/**
 * 画廊分类筛选：纯 DOM 过滤，不依赖框架
 */
const grid = document.querySelector<HTMLElement>('[data-gallery]');
const filterBar = document.querySelector<HTMLElement>('[data-gallery-filter]');
const countEl = document.querySelector<HTMLElement>('[data-gallery-count]');

if (grid && filterBar) {
  const buttons = Array.from(filterBar.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  const items = Array.from(grid.querySelectorAll<HTMLElement>('[data-category]'));

  const apply = (category: string) => {
    let visible = 0;
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === category));
    }
    for (const item of items) {
      const show = category === '全部' || item.dataset.category === category;
      item.classList.toggle('is-hidden', !show);
      if (show) visible += 1;
    }
    if (countEl) {
      countEl.textContent =
        category === '全部' ? `共 ${visible} 张图片` : `「${category}」分类共 ${visible} 张图片`;
    }
  };

  for (const button of buttons) {
    button.addEventListener('click', () => apply(button.dataset.filter ?? '全部'));
  }

  apply(
    buttons.find((button) => button.getAttribute('aria-pressed') === 'true')?.dataset.filter ??
      '全部',
  );
}
