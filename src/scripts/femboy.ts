/**
 * 年度男娘程度总结器 · 测试与配色交互
 * ----------------------------------------------------------------
 * - 算法与旧站 project/femboy.html 一致：
 *   DJB2 哈希（初始 5381，每轮 (h << 5) + h + code，等价于 h * 33 + code 的位运算写法）
 *   → Math.sin 种子伪随机 → 1–100 分档文案
 * - 相同昵称永远得到相同结果，昵称不会离开浏览器
 * - 六套主题色只作用于工具卡（CSS 变量），并把选择存进 localStorage 的 blog-color
 */

const COLOR_STORAGE_KEY = 'blog-color';
const COLORS = ['sakura', 'azur', 'wisteria', 'matcha', 'yuzu', 'sumi'] as const;
type ColorName = (typeof COLORS)[number];

const isColorName = (value: string | null): value is ColorName =>
  COLORS.includes(value as ColorName);

/** DJB2：初始 5381，每轮 (h << 5) + h + code；保留旧站写法，保证同昵称同分数 */
function stringToHash(value: string): number {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) + hash + value.charCodeAt(index);
  }
  return Math.abs(hash);
}

/** 种子伪随机：Math.sin(seed) * 10000 取小数部分，得到 [0, 1) */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function scoreFor(nickname: string): number {
  return Math.floor(seededRandom(stringToHash(nickname)) * 100) + 1;
}

/** 1–100 分档评语，文案与旧站一致 */
function commentFor(score: number): string {
  if (score >= 90) {
    return '天呐！你是顶级天赋型男娘！骨子里的温柔可爱藏都藏不住，一举一动都戳中萌点，是圈子里公认的天花板级别的存在，男娘程度直接拉满！';
  }
  if (score >= 70) {
    return '恭喜你！是资深男娘一枚~ 已经完全掌握了可爱的精髓，不管是穿搭还是言行都超有心得，妥妥的男娘界熟练工，可爱值持续在线！';
  }
  if (score >= 50) {
    return '哇！你是潜力股男娘！已经有了不错的男娘天赋，稍微打磨一下就能解锁超多可爱属性，未来可期，赶紧把可爱技能点满吧！';
  }
  if (score >= 30) {
    return '入门级男娘选手~ 已经有了可爱的苗头，只是还没完全放开自己，多尝试多探索，很快就能解锁属于你的可爱风格啦！';
  }
  return '哈哈，你是直男本男没错了！可爱属性几乎为0，浑身散发着钢铁直男的气息，和男娘完全不沾边，主打一个阳刚正气！';
}

const card = document.querySelector<HTMLElement>('[data-femboy-card]');
const form = document.querySelector<HTMLFormElement>('[data-meter-form]');
const input = document.querySelector<HTMLInputElement>('[data-meter-nickname]');
const result = document.querySelector<HTMLElement>('[data-meter-result]');
const nicknameOut = document.querySelector<HTMLElement>('[data-meter-nickname-out]');
const scoreOut = document.querySelector<HTMLElement>('[data-meter-score]');
const commentOut = document.querySelector<HTMLElement>('[data-meter-comment]');
const errorEl = document.querySelector<HTMLElement>('[data-meter-error]');
const swatches = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-color-option]'));

/* ---------------------------------------------------------------- 配色 */
const setColor = (color: ColorName, persist: boolean): void => {
  if (card) card.dataset.color = color;
  for (const swatch of swatches) {
    swatch.setAttribute('aria-pressed', String(swatch.dataset.colorOption === color));
  }
  if (!persist) return;
  try {
    localStorage.setItem(COLOR_STORAGE_KEY, color);
  } catch {
    /* 无痕模式下 localStorage 不可用，忽略即可 */
  }
};

let initialColor: ColorName = 'sakura';
try {
  const stored = localStorage.getItem(COLOR_STORAGE_KEY);
  if (isColorName(stored)) initialColor = stored;
} catch {
  /* 忽略读取失败，使用默认樱花粉 */
}
setColor(initialColor, false);

for (const swatch of swatches) {
  swatch.addEventListener('click', () => {
    const color = swatch.dataset.colorOption ?? null;
    if (isColorName(color)) setColor(color, true);
  });
}

/* ---------------------------------------------------------------- 测试 */
if (form && input && result && nicknameOut && scoreOut && commentOut) {
  const meterForm = form;
  const nicknameInput = input;
  const resultEl = result;
  const nicknameTarget = nicknameOut;
  const scoreTarget = scoreOut;
  const commentTarget = commentOut;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const clearError = (): void => {
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.hidden = true;
    }
    nicknameInput.removeAttribute('aria-invalid');
  };

  const showError = (message: string): void => {
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
    nicknameInput.setAttribute('aria-invalid', 'true');
    nicknameInput.focus();
  };

  const runTest = (): void => {
    const nickname = nicknameInput.value.trim();
    if (!nickname) {
      showError('请输入你的昵称哦~');
      return;
    }

    clearError();
    const score = scoreFor(nickname);

    nicknameTarget.textContent = nickname;
    scoreTarget.textContent = String(score);
    commentTarget.textContent = commentFor(score);

    resultEl.hidden = false;
    // 重新触发一次进场动画
    resultEl.classList.remove('is-new');
    void resultEl.offsetWidth;
    resultEl.classList.add('is-new');

    resultEl.scrollIntoView({
      behavior: reduceMotion.matches ? 'auto' : 'smooth',
      block: 'nearest',
    });
  };

  meterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    runTest();
  });

  nicknameInput.addEventListener('input', () => {
    if (nicknameInput.getAttribute('aria-invalid') === 'true') clearError();
  });
}

export {};
