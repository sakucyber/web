/**
 * 全站搜索页（/search）
 * ----------------------------------------------------------------
 * 数据源是构建期生成的 /search-index.json（见 src/pages/search-index.json.ts），
 * 前端只做「匹配 + 排序 + 渲染」：
 *  - 支持 ?q= 深链、输入去抖、Enter 打开第一条、Esc 清空；
 *  - 所有用户可见文本都用 textContent / <mark> 节点写入，绝不拼接 innerHTML；
 *  - 无结果给出提示；索引加载失败时降级为错误文案。
 */
interface SearchDoc {
  type: 'page' | 'post' | 'work';
  title: string;
  description: string;
  url: string;
  tags: string[];
  category?: string;
  date?: string;
  emoji?: string;
}

const TYPE_LABEL: Record<SearchDoc['type'], string> = {
  post: '文章',
  work: '作品',
  page: '页面',
};

const MAX_RESULTS = 20;
const DEBOUNCE_MS = 160;

const form = document.querySelector<HTMLFormElement>('[data-search-form]');
const input = document.querySelector<HTMLInputElement>('#searchInput');
const statusEl = document.querySelector<HTMLElement>('[data-search-status]');
const resultsEl = document.querySelector<HTMLElement>('[data-search-results]');
const hintsEl = document.querySelector<HTMLElement>('[data-search-hints]');

const normalize = (value: string): string => value.toLowerCase().replace(/\s+/g, ' ').trim();
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function setStatus(text: string): void {
  if (statusEl) statusEl.textContent = text;
}

function getTerms(query: string): string[] {
  return normalize(query).split(' ').filter(Boolean);
}

function getHaystack(doc: SearchDoc): string {
  return normalize([doc.title, doc.description, doc.category ?? '', ...doc.tags].join(' '));
}

/** 把命中的关键词包进 <mark>：按正则切片后逐段创建节点，不经过 innerHTML */
function renderHighlighted(target: HTMLElement, text: string, terms: string[]): void {
  if (terms.length === 0) {
    target.textContent = text;
    return;
  }

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(pattern);

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    if (!part) continue;
    if (index % 2 === 1) {
      const mark = document.createElement('mark');
      mark.textContent = part;
      target.append(mark);
    } else {
      target.append(document.createTextNode(part));
    }
  }
}

/* ------------------------------------------------------------ 索引加载 */

let indexPromise: Promise<SearchDoc[]> | null = null;

async function loadIndex(): Promise<SearchDoc[]> {
  if (!indexPromise) {
    indexPromise = fetch('/search-index.json', { headers: { accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<SearchDoc[]>;
      })
      .then((data) => (Array.isArray(data) ? data : []))
      .catch((error: unknown) => {
        // 允许下次输入时重试
        indexPromise = null;
        throw error;
      });
  }

  return indexPromise;
}

/* ------------------------------------------------------------ 匹配与渲染 */

interface Match {
  doc: SearchDoc;
  score: number;
}

function findMatches(docs: SearchDoc[], terms: string[]): Match[] {
  const matches: Match[] = [];

  for (const doc of docs) {
    const haystack = getHaystack(doc);
    if (!terms.every((term) => haystack.includes(term))) continue;

    const title = normalize(doc.title);
    const description = normalize(doc.description);
    const tags = doc.tags.map((tag) => normalize(tag));
    let score = 0;

    for (const term of terms) {
      if (title.includes(term)) score += 6;
      if (tags.some((tag) => tag.includes(term))) score += 3;
      if (description.includes(term)) score += 1;
    }

    matches.push({ doc, score });
  }

  return matches.sort(
    (a, b) => b.score - a.score || (b.doc.date ?? '').localeCompare(a.doc.date ?? ''),
  );
}

function createResult(doc: SearchDoc, terms: string[]): HTMLAnchorElement {
  const link = document.createElement('a');
  link.className = 'search-result';
  link.href = doc.url;

  const top = document.createElement('div');
  top.className = 'search-result__top';

  const type = document.createElement('span');
  type.className = 'search-result__type';
  type.textContent = TYPE_LABEL[doc.type] ?? '内容';
  top.append(type);

  const title = document.createElement('span');
  title.className = 'search-result__title';
  renderHighlighted(title, doc.title, terms);
  top.append(title);

  if (doc.category) {
    const category = document.createElement('span');
    category.className = 'search-result__type';
    category.textContent = doc.category;
    top.append(category);
  }

  const description = document.createElement('p');
  description.className = 'search-result__desc';
  renderHighlighted(description, doc.description, terms);

  link.append(top, description);
  return link;
}

function renderEmpty(query: string): void {
  if (!resultsEl) return;

  const box = document.createElement('div');
  box.className = 'search-empty';

  const strong = document.createElement('strong');
  strong.textContent = '没有找到匹配的内容';

  const tip = document.createElement('p');
  tip.textContent = `没有找到与「${query}」相关的内容，换个关键词试试～`;

  box.append(strong, tip);
  resultsEl.replaceChildren(box);
}

/* ------------------------------------------------------------ 搜索主流程 */

const syncUrl = (query: string): void => {
  // 保留当前路径形态（带不带尾斜杠都不改写），只同步 ?q=
  const basePath = window.location.pathname;
  const next = query ? `${basePath}?q=${encodeURIComponent(query)}` : basePath;
  window.history.replaceState(null, '', next);
};

let activeQuery = '';
let requestId = 0;

async function runSearch(query: string, updateUrl = true): Promise<void> {
  if (!resultsEl) return;

  activeQuery = query;
  const trimmed = query.trim();
  const terms = getTerms(query);

  if (updateUrl) syncUrl(trimmed);
  hintsEl?.toggleAttribute('hidden', terms.length > 0);

  if (terms.length === 0) {
    resultsEl.replaceChildren();
    setStatus('输入关键词开始搜索');
    return;
  }

  setStatus('正在搜索…');
  const current = ++requestId;

  let docs: SearchDoc[];
  try {
    docs = await loadIndex();
  } catch {
    if (current !== requestId) return;
    resultsEl.replaceChildren();
    setStatus('搜索索引加载失败，请刷新页面重试。');
    return;
  }

  // 输入可能在等待索引期间变化，丢弃过期结果
  if (current !== requestId || activeQuery !== query) return;

  const all = findMatches(docs, terms);
  const shown = all.slice(0, MAX_RESULTS);

  resultsEl.replaceChildren(...shown.map(({ doc }) => createResult(doc, terms)));

  if (shown.length === 0) {
    renderEmpty(trimmed);
    setStatus(`没有找到与「${trimmed}」相关的内容`);
    return;
  }

  setStatus(
    all.length > shown.length
      ? `找到 ${all.length} 条结果，显示前 ${shown.length} 条`
      : `找到 ${all.length} 条与「${trimmed}」相关的内容`,
  );
}

/* ------------------------------------------------------------ 事件绑定 */

if (form && input && resultsEl) {
  let timer: number | undefined;

  const scheduleSearch = (): void => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => void runSearch(input.value), DEBOUNCE_MS);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const first = resultsEl.querySelector<HTMLAnchorElement>('.search-result');
    if (first) {
      window.location.assign(first.href);
      return;
    }

    // 结果还没渲染完：先搜索，再打开第一条
    window.clearTimeout(timer);
    void runSearch(input.value).then(() => {
      const next = resultsEl.querySelector<HTMLAnchorElement>('.search-result');
      if (next) window.location.assign(next.href);
    });
  });

  input.addEventListener('input', scheduleSearch);

  // type=search 的原生清空按钮
  input.addEventListener('search', () => {
    window.clearTimeout(timer);
    void runSearch(input.value);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    input.value = '';
    window.clearTimeout(timer);
    void runSearch('');
    input.focus();
  });

  // 首次进入：优先读 ?q=
  const initial = new URLSearchParams(window.location.search).get('q')?.trim() ?? '';
  if (initial) {
    input.value = initial;
    void runSearch(initial, false);
  } else {
    setStatus('输入关键词开始搜索');
  }
}

// 标记为模块：避免和其他页面脚本的顶层变量在全局作用域里重名
export {};
