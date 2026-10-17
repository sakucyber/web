/**
 * 文章列表客户端过滤（/posts）
 * ----------------------------------------------------------------
 * - 卡片由构建期渲染，这里只根据 #postFilter 的输入切换 .is-hidden；
 * - 输入去抖并同步到 ?q=，刷新 / 分享后能保留筛选条件；
 * - 无结果时展示空状态，并同步更新数量提示。
 */
const input = document.querySelector<HTMLInputElement>('#postFilter');
const grid = document.querySelector<HTMLElement>('[data-post-grid]');
const countEl = document.querySelector<HTMLElement>('[data-post-count]');
const emptyEl = document.querySelector<HTMLElement>('[data-post-empty]');

if (input && grid) {
  const cards = Array.from(grid.querySelectorAll<HTMLElement>('.post-card'));
  const total = cards.length;
  const baseCountText = countEl?.textContent?.trim() || `共 ${total} 篇文章`;
  const haystacks = cards.map((card) =>
    (card.dataset.search ?? card.textContent ?? '').toLowerCase().replace(/\s+/g, ' ').trim(),
  );

  const normalize = (value: string): string => value.toLowerCase().replace(/\s+/g, ' ').trim();

  const syncUrl = (query: string): void => {
    // 保留当前路径形态（带不带尾斜杠都不改写），只同步 ?q=
    const basePath = window.location.pathname;
    const next = query ? `${basePath}?q=${encodeURIComponent(query)}` : basePath;
    window.history.replaceState(null, '', next);
  };

  const apply = (raw: string): void => {
    const terms = normalize(raw).split(' ').filter(Boolean);
    let visible = 0;

    for (let index = 0; index < cards.length; index += 1) {
      const matched = terms.every((term) => haystacks[index].includes(term));
      cards[index].classList.toggle('is-hidden', !matched);
      if (matched) visible += 1;
    }

    if (countEl) {
      countEl.textContent =
        terms.length > 0 ? `匹配到 ${visible} / ${total} 篇文章` : baseCountText;
    }

    // 只在「有关键词且没有结果」时展示空状态
    emptyEl?.toggleAttribute('hidden', terms.length === 0 || visible > 0);
  };

  const commit = (): void => {
    apply(input.value);
    syncUrl(input.value.trim());
  };

  let timer: number | undefined;

  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(commit, 140);
  });

  // type=search 的原生清空按钮
  input.addEventListener('search', () => {
    window.clearTimeout(timer);
    commit();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      input.value = '';
      window.clearTimeout(timer);
      commit();
      return;
    }

    if (event.key === 'Enter') {
      const first = grid.querySelector<HTMLAnchorElement>('.post-card:not(.is-hidden)');
      if (first) {
        event.preventDefault();
        window.location.assign(first.href);
      }
    }
  });

  // 首次进入：支持 /posts?q=xxx 深链
  const initial = new URLSearchParams(window.location.search).get('q')?.trim() ?? '';
  if (initial) {
    input.value = initial;
    apply(initial);
  } else {
    apply('');
  }
}

// 标记为模块：避免和其他页面脚本的顶层变量在全局作用域里重名
export {};
