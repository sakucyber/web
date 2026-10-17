/**
 * 全站交互（一个 rAF 调度器 + 存在性判断，所有页面共用一份）
 * ----------------------------------------------------------------
 * 主题 / 移动端抽屉 / 粒子 / 滚动进场 / 自定义光标 / 滚动进度 /
 * 视差 / 导航高亮 / 目录高亮 / 灯箱 / 快捷键
 */
import { SITE } from '@/config/site';

const doc = document;
const root = doc.documentElement;
const $ = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = doc): T | null =>
  scope.querySelector<T>(selector);
const $$ = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = doc): T[] =>
  Array.from(scope.querySelectorAll<T>(selector));

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointer = window.matchMedia('(pointer: coarse)');
const isReduced = () => reduceMotion.matches;

/* ---------------------------------------------------------------- 加载遮罩 */
function initLoading(): void {
  const el = $('#loading');
  if (!el) return;
  const hide = () => el.classList.add('done');
  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', () => window.setTimeout(hide, 260), { once: true });
  } else {
    window.setTimeout(hide, 260);
  }
  window.addEventListener('load', hide, { once: true });
  // 兜底：网络再差也不会一直卡在加载页
  window.setTimeout(hide, 3000);
}

/* ------------------------------------------------------------------ 主题 */
function initTheme(): void {
  const btn = $('#themeToggle');
  if (!btn) return;
  const meta = $('meta[name="theme-color"]');
  const paint = (theme: string) => {
    root.setAttribute('data-theme', theme);
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? SITE.themeColor.dark : SITE.themeColor.light);
    }
  };

  paint(root.getAttribute('data-theme') ?? SITE.defaultTheme);
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    paint(next);
    try {
      localStorage.setItem(SITE.themeStorageKey, next);
    } catch {
      /* 隐私模式下忽略 */
    }
  });
}

/* ------------------------------------------------------------------ 导航 */
function initNav(): void {
  const burger = $('#hamburger');
  const links = $('#navLinks');
  const backdrop = $('#navBackdrop');
  if (!burger || !links) return;

  const setOpen = (open: boolean) => {
    links.classList.toggle('open', open);
    backdrop?.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? '收起菜单' : '展开菜单');
    doc.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      links.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
    } else if (doc.activeElement && links.contains(doc.activeElement)) {
      burger.focus({ preventScroll: true });
    }
  };

  burger.addEventListener('click', () => setOpen(!links.classList.contains('open')));
  backdrop?.addEventListener('click', () => setOpen(false));
  $$('a', links).forEach((link) => link.addEventListener('click', () => setOpen(false)));
  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && links.classList.contains('open')) setOpen(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860 && links.classList.contains('open')) setOpen(false);
  });
}

/* ------------------------------------------------------------------ 粒子 */
function initParticles(): void {
  const host = $('#particles');
  if (!host || isReduced()) return;
  const count = Number.parseInt(host.dataset.particles ?? '12', 10);
  const colors = ['#e879b0', '#c084fc', '#f5a8d0', '#60a5fa', '#fbbf24', '#6ee7b7'];
  const fragment = doc.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const particle = doc.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 4 + 2;
    particle.style.cssText =
      `width:${size}px;height:${size}px;` +
      `left:${(Math.random() * 100).toFixed(2)}vw;` +
      `background:${colors[Math.floor(Math.random() * colors.length)]};` +
      `animation-duration:${(Math.random() * 14 + 10).toFixed(2)}s;` +
      `animation-delay:${(Math.random() * 12).toFixed(2)}s`;
    fragment.appendChild(particle);
  }
  host.appendChild(fragment);
}

/* ------------------------------------------------------- 滚动进场（IO） */
function initReveal(): void {
  const items = $$<HTMLElement>('[data-anim]');
  if (!items.length) return;
  if (!('IntersectionObserver' in window) || isReduced()) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );
  items.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------- 自定义光标 */
function initCursor(): void {
  const dot = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring || coarsePointer.matches || isReduced()) return;

  let targetX = 0;
  let targetY = 0;
  let ringX = 0;
  let ringY = 0;
  let running = false;
  let raf = 0;

  const frame = () => {
    ringX += (targetX - ringX) * 0.12;
    ringY += (targetY - ringY) * 0.12;
    ring.style.transform = `translate3d(${ringX}px,${ringY}px,0) translate(-50%,-50%)`;
    if (Math.abs(targetX - ringX) < 0.4 && Math.abs(targetY - ringY) < 0.4) {
      running = false;
      return;
    }
    raf = requestAnimationFrame(frame);
  };

  doc.addEventListener(
    'mousemove',
    (event) => {
      const { clientX, clientY } = event as MouseEvent;
      targetX = clientX;
      targetY = clientY;
      dot.style.transform = `translate3d(${targetX}px,${targetY}px,0) translate(-50%,-50%)`;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    },
    { passive: true },
  );

  $$('a,button,.work-card,.gallery-item,.post-card,.tag-cloud a').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });

  window.addEventListener('pagehide', () => cancelAnimationFrame(raf));
}

/* ------------------------------------------------------- 滚动主循环 */
function initScrollEngine(): void {
  const bar = $('#scrollProgress');
  const navbar = $('#navbar');
  const btt = $('#btt');
  const parallaxEls = $$<HTMLElement>('[data-parallax]');
  const sections = $$<HTMLElement>('main section[id]');
  const navAnchors = $$<HTMLAnchorElement>('#navLinks a');
  const tocLinks = $$<HTMLAnchorElement>('.toc-list a');
  const headings = $$<HTMLElement>('.prose h2[id], .prose h3[id]');

  let lastY = window.scrollY || 0;
  let ticking = false;

  const updateParallax = () => {
    if (isReduced()) return;
    const viewportHeight = window.innerHeight;
    for (const el of parallaxEls) {
      const host = el.parentElement ?? el;
      const rect = host.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > viewportHeight + 120) continue;
      if (el.dataset.parallax === 'hero') {
        const y = -rect.top;
        el.style.transform = `scale(1.15) translate3d(0,${(y * 0.25).toFixed(1)}px,0)`;
        el.style.opacity = String(Math.max(0, 1 - y / (viewportHeight * 0.8)).toFixed(3));
      } else {
        el.style.transform = `scale(1.1) translate3d(0,${((rect.top / viewportHeight) * 40).toFixed(1)}px,0)`;
      }
    }
  };

  const updateToc = () => {
    if (!tocLinks.length || !headings.length) return;
    const offset = 120;
    let currentId = '';
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= offset) currentId = heading.id;
    }
    for (const link of tocLinks) {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    }
  };

  const update = () => {
    ticking = false;
    const y = window.scrollY;

    if (bar) {
      const max = root.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    }
    if (navbar && !$('#navLinks')?.classList.contains('open')) {
      navbar.classList.toggle('hide', y > lastY && y > 80);
    }
    if (btt) btt.classList.toggle('show', y > 500);

    updateParallax();
    updateToc();

    if (sections.length && navAnchors.length) {
      let current = '';
      for (const section of sections) {
        if (section.offsetTop - 200 <= y) current = section.id;
      }
      for (const anchor of navAnchors) {
        const href = anchor.getAttribute('href') ?? '';
        const hash = href.includes('#') ? href.slice(href.indexOf('#')) : '';
        anchor.classList.toggle('active', Boolean(current) && hash === `#${current}`);
      }
    }
    lastY = y;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();

  btt?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: isReduced() ? 'auto' : 'smooth' });
  });
}

/* ------------------------------------------------------------ 灯箱 */
function initLightbox(): void {
  const box = $('#lightbox');
  if (!box) return;
  const image = $('#lbImg') as HTMLImageElement | null;
  const counter = $('#lbCount');
  const caption = $('#lbCaption');
  const prev = $('#lbPrev');
  const next = $('#lbNext');
  const closeBtn = $('#lbClose');
  const triggers = $$<HTMLElement>('[data-lightbox-src]');
  if (!image || !triggers.length) return;

  const items = triggers.map((trigger) => ({
    src: trigger.dataset.lightboxSrc ?? '',
    alt: trigger.dataset.lightboxAlt ?? '',
    caption: trigger.dataset.lightboxCaption ?? '',
  }));

  let index = 0;
  let lastFocus: HTMLElement | null = null;

  const render = () => {
    const item = items[index];
    image.src = item.src;
    image.alt = item.alt || `第 ${index + 1} 张图片，共 ${items.length} 张`;
    if (caption) caption.textContent = item.caption;
    if (counter) counter.textContent = `${index + 1} / ${items.length}`;
  };

  const open = (i: number) => {
    index = i;
    lastFocus = doc.activeElement as HTMLElement | null;
    render();
    box.classList.add('open');
    box.setAttribute('aria-hidden', 'false');
    doc.body.style.overflow = 'hidden';
    closeBtn?.focus();
  };

  const close = () => {
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    doc.body.style.overflow = '';
    lastFocus?.focus();
  };

  const step = (delta: number) => {
    index = (index + delta + items.length) % items.length;
    render();
  };

  triggers.forEach((trigger, i) => {
    trigger.addEventListener('click', () => open(i));
  });

  closeBtn?.addEventListener('click', close);
  prev?.addEventListener('click', (event) => {
    event.stopPropagation();
    step(-1);
  });
  next?.addEventListener('click', (event) => {
    event.stopPropagation();
    step(1);
  });
  box.addEventListener('click', (event) => {
    if (event.target === box) close();
  });

  doc.addEventListener('keydown', (event) => {
    if (!box.classList.contains('open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'Tab') {
      const focusable = [closeBtn, prev, next].filter(Boolean) as HTMLElement[];
      const current = focusable.indexOf(doc.activeElement as HTMLElement);
      if (current === -1) return;
      event.preventDefault();
      const delta = event.shiftKey ? -1 : 1;
      focusable[(current + delta + focusable.length) % focusable.length]?.focus();
    }
  });

  let startX = 0;
  box.addEventListener(
    'touchstart',
    (event) => {
      startX = (event as TouchEvent).touches[0]?.clientX ?? 0;
    },
    { passive: true },
  );
  box.addEventListener(
    'touchend',
    (event) => {
      const dx = ((event as TouchEvent).changedTouches[0]?.clientX ?? 0) - startX;
      if (Math.abs(dx) > 50) step(dx > 0 ? -1 : 1);
    },
    { passive: true },
  );
}

/* ------------------------------------------------------- 搜索快捷键 */
function initShortcuts(): void {
  doc.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement | null;
    const isTyping =
      target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
    if (event.key !== '/' || isTyping || event.metaKey || event.ctrlKey || event.altKey) return;
    event.preventDefault();
    const searchInput = $('#searchInput') as HTMLInputElement | null;
    if (searchInput) searchInput.focus();
    else window.location.assign('/search');
  });
}

initLoading();
initTheme();
initNav();
initParticles();
initReveal();
initCursor();
initScrollEngine();
initLightbox();
initShortcuts();

// 画廊分类筛选（仅在有筛选器的页面生效，体积很小）
import '@/scripts/gallery';
