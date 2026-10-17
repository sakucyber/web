# 设计系统速查

> 全站视觉与交互的单一事实来源：`src/styles/global.css`（设计变量 + 通用类）、
> `src/config/site.ts`（文案与导航）、`src/components/`（可复用 UI）。
> 新增页面时优先复用这里的变量与类，不要在页面里硬编码颜色 / 圆角 / 断点。

---

## 1. 设计变量

定义在 `src/styles/global.css` 的 `:root`（深色为默认主题），浅色在 `[data-theme='light']` 覆盖。

### 1.1 品牌色与渐变

| 变量 | 值 | 用途 |
| --- | --- | --- |
| `--primary` | `#e879b0` | 主色（链接、强调、按钮） |
| `--primary-light` | `#f5a8d0` | 主色亮版（hover） |
| `--primary-bg` | `rgba(232,121,176,.1)` | 主色淡背景（选中态、pill） |
| `--gradient` | `linear-gradient(135deg,#e879b0,#c084fc)` | 品牌渐变（accent 文字、头像描边） |
| `--glow` | `rgba(232,121,176,.3)` | 光晕阴影 |

### 1.2 背景与文字

| 变量 | 深色（默认） | 浅色 |
| --- | --- | --- |
| `--bg` | `#0a0a0f` | `#fef6ff` |
| `--bg-card` | `rgba(255,255,255,.04)` | `rgba(255,255,255,.72)` |
| `--bg-nav` | `rgba(10,10,15,.7)` | `rgba(254,246,255,.78)` |
| `--bg-elevated` | `rgba(255,255,255,.06)` | `rgba(255,255,255,.55)` |
| `--text` | `#f0eef5` | `#2d2b3e` |
| `--text-secondary` | `#a8a0b8` | `#8b7fa8` |
| `--text-tertiary` | `#6b6380` | `#b8aed0` |
| `--border` | `rgba(255,255,255,.06)` | `rgba(180,130,200,.12)` |
| `--border-strong` | `rgba(255,255,255,.14)` | `rgba(180,130,200,.24)` |
| `--shadow` / `--shadow-hover` | 深色阴影 | 淡紫阴影 |

`--hero-text` / `--hero-text-secondary` 用于头图上的文字：深色主题固定白色，浅色主题回到正文色。

### 1.3 字体

| 变量 | 字体栈 | 用途 |
| --- | --- | --- |
| `--font-body` | `Nunito Variable` + 系统中文字体 | 正文 / UI |
| `--font-display` | `ZCOOL KuaiLe` + 中文兜底 | 标题、Logo、404 大字 |
| `--font-mono` | 系统等宽字体 | 代码 |

字体通过 `@fontsource-variable/nunito`、`@fontsource/zcool-kuaile` **自托管**，
`global.css` 顶部 `@import` 引入，构建后落在 `/_astro/*`，运行时不请求任何第三方域名。

### 1.4 圆角、间距、容器

| 变量 | 值 | 用途 |
| --- | --- | --- |
| `--radius-sm` | `10px` | 小控件、输入框 |
| `--radius-md` | `16px` | 卡片、图片格 |
| `--radius-lg` | `24px` | 大卡片、面板 |
| `--nav-h` | `64px`（≤640px 时 `56px`） | 导航高度，用于 `scroll-padding-top` 与抽屉定位 |
| `--container` | `1200px` | 常规内容宽度 |
| `--container-narrow` | `760px` | 文章正文 / 搜索页宽度 |

### 1.5 动效曲线

| 变量 | 值 | 用途 |
| --- | --- | --- |
| `--ease-out-expo` | `cubic-bezier(.16,1,.3,1)` | 大位移、视差 |
| `--ease-out-quart` | `cubic-bezier(.25,1,.5,1)` | 颜色 / 透明度过渡 |
| `--ease-spring` | `cubic-bezier(.175,.885,.32,1.275)` | 卡片 hover、图标弹跳 |

---

## 2. 主题与配色

- 主题存放在 `document.documentElement.dataset.theme`（`dark` / `light`），默认 `dark`。
- 首屏由 `public/scripts/theme-init.js` 在 `<head>` 阻塞执行，读取 `localStorage` 的
  `blog-theme` 后再渲染，避免深色站闪白；该文件是外部脚本，满足 CSP `script-src 'self'`。
- 切换按钮在 `Header.astro`（`#themeToggle`），逻辑在 `src/scripts/app.ts`，写入同一个 storage key。
- 项目页的配色选择器（femboy）额外使用 `data-color` 与 `localStorage` 的 `blog-color`，
  只作用于该工具卡的 CSS 变量，不影响全站主题。

---

## 3. 断点

`global.css` 全站断点：

| 断点 | 变化 |
| --- | --- |
| `max-width: 1024px` | 文章目录隐藏；画廊网格 3 列 |
| `max-width: 860px` | 导航切换为移动端抽屉（`.hamburger` 出现）；卡片改纵向；自定义光标隐藏；`work-card` 高 340px |
| `max-width: 640px` | `--nav-h` 变 56px；画廊 2 列；返回顶部/灯箱按钮缩小；文章导航单列 |

页面级 `.astro <style>` 里还有少量局部断点（如首页 `900px` / `768px`），改动时以该页面为准。
另外全站尊重 `prefers-reduced-motion: reduce`：关闭粒子、光标、入场动画与平滑滚动。

---

## 4. 布局与通用类

| 类名 | 说明 |
| --- | --- |
| `.container` / `.container--narrow` | 1200px / 760px 居中容器 |
| `.page-main` / `.page-main--narrow` | 页面主内容区上下留白 + 窄版 |
| `.section` / `.section--tight` / `.section-head` | 通用区块与标题区 |
| `.hero` / `.hero--tall` / `.hero--full` / `.hero-bg` / `.hero-content` / `.accent` | 头图区 |
| `.sec-tag` / `.sec-title` / `.sec-desc` | 区块小标签 / 标题 / 描述 |
| `.btn` / `.btn-static` / `.btn--ghost` / `.back-link` | 按钮与返回链接 |
| `.pill` / `.tag` | 圆角小标签（标签云、技术栈） |
| `.card` | 通用卡片 |
| `.post-grid` / `.post-list` / `.post-card` | 文章网格 / 列表 / 卡片 |
| `.work-card` / `.work-card__*` | 作品大图卡 |
| `.gallery-grid` / `.gallery-masonry` / `.gallery-filter` / `.gallery-item__*` | 画廊网格 / 瀑布流 / 筛选 |
| `.lightbox` / `.lb-*` | 灯箱外壳 |
| `.prose` | Markdown 正文排版（标题 / 列表 / 引用 / 表格 / 代码） |
| `.post-head` / `.post-title` / `.post-desc` / `.post-layout` / `.post-aside` / `.toc-*` / `.post-nav` | 文章详情页 |
| `.tag-cloud` / `.pagination` / `.chip-row` | 标签云 / 分页 / 横向 chip 行 |
| `.search-form` / `.search-input` / `.search-status` / `.search-result*` / `.search-empty` | 搜索页 |
| `.project-hero` / `.project-meta` / `.project-embed` | 项目详情页 |
| `.empty-state` | 空状态 |
| `.skip-link` / `.visually-hidden` / `:focus-visible` | 无障碍 |

---

## 5. 组件清单

| 组件 | 文件 | 关键 props / 说明 |
| --- | --- | --- |
| `BaseLayout` | `src/layouts/BaseLayout.astro` | 全站 `<head>`/SEO/加载遮罩/光标/粒子/返回顶部/灯箱；`bare` 用于全屏小游戏 |
| `PageLayout` | `src/layouts/PageLayout.astro` | 普通内容页头图 + 标题；`eyebrow/heading/accent/subtitle/image/heroSize/narrow` |
| `PostLayout` | `src/layouts/PostLayout.astro` | 文章详情：封面、正文、目录、上一篇/下一篇、JSON-LD；入参 `post/newer/older` |
| `ProjectLayout` | `src/layouts/ProjectLayout.astro` | 项目详情：统一头图 + Markdown 介绍 + `actions` 插槽；入参 `work` |
| `SEO` | `src/components/SEO.astro` | title/description/OG/Twitter/canonical/JSON-LD/RSS/preload；自动清理尾斜杠 |
| `Header` | `src/components/Header.astro` | 导航（`SITE.nav`）、主题切换、搜索入口、移动端抽屉 |
| `Footer` | `src/components/Footer.astro` | 页脚导航、RSS、年份版权 |
| `Icon` | `src/components/Icon.astro` | 内联 SVG，零第三方图标库；名称见下 |
| `PostCard` | `src/components/PostCard.astro` | 文章卡片；`variant: 'grid' \| 'list'`，`data-search` 供前端过滤 |
| `WorkCard` | `src/components/WorkCard.astro` | 作品大图卡；`compact` 用于项目中心 |
| `GalleryGrid` | `src/components/GalleryGrid.astro` | 图片网格 / 瀑布流 / 分类筛选 / 灯箱；`items/filterable/masonry/compact/lightbox` |
| `Lightbox` | `src/components/Lightbox.astro` | 灯箱外壳，交互由 `app.ts` 统一接管 |

**Icon 可用名称**（`Icon.astro` 的 `IconName`）：

```
menu  close  sun  moon  search  arrow-up  arrow-left  arrow-right
chevron-down  chevron-left  chevron-right  expand  home  palette
mail  clock  calendar  tag  rss  external  github  bilibili
```

---

## 6. 脚本模块

| 文件 | 作用 | 加载方式 |
| --- | --- | --- |
| `public/scripts/theme-init.js` | 首屏应用主题 / 配色，防闪白 | `BaseLayout` 的 `<head>` 内同步 `<script src>` |
| `src/scripts/app.ts` | 全站交互：主题切换、移动端抽屉、粒子、滚动进场、光标、滚动进度、视差、目录高亮、灯箱、快捷键（`/`） | `BaseLayout` 底部 `<script>import '@/scripts/app'</script>` |
| `src/scripts/gallery.ts` | 画廊分类筛选 + 数量统计 | `GalleryGrid.astro` 内引入 |
| `src/scripts/post-filter.ts` | 文章列表按搜索框过滤卡片 | 文章列表页引入 |
| `src/scripts/search.ts` | 搜索页：拉取 `/search-index.json`、去抖、匹配、渲染 | 搜索页引入 |
| `src/scripts/ai-chat.ts` | AI贴吧老哥聊天规则 | `/project/ai` 引入 |
| `src/scripts/femboy.ts` | 男娘指数计算 + 配色选择 | `/project/femboy` 引入 |
| `src/scripts/balatro-embed.ts` | 点击后按需加载小丑牌 iframe | `/project/balatro` 引入 |

约定：页面里不写内联事件处理器（`onclick=...`），需要交互就在页面 `<script>` 里
`import '@/scripts/xxx'`，模块内用 `addEventListener` 绑定，保持 CSP 干净。

---

## 7. 动效约定

- 滚动进场：给元素加 `data-anim`（`fade-up` / `scale` 等），可选 `data-delay` +
  `style="--d:N"` 控制顺序；`app.ts` 用 IntersectionObserver 添加 `.in`。
- 视差：给容器加 `data-parallax`（头图用 `data-parallax="hero"`）。
- 无 JS 时内容必须可见：初始隐藏态只对 `html.js` 生效（`theme-init.js` 会加 `.js` class）。
- 所有动画都要在 `prefers-reduced-motion: reduce` 下退化为静态。

---

## 8. 页面结构套路

新增一个普通内容页：

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import { HERO_IMAGES } from '@/lib/images';
---
<PageLayout
  title="页面标题"
  eyebrow="EYEBROW"
  heading="页面"
  accent="标题"
  subtitle="一句话描述"
  image={HERO_IMAGES.works}
>
  <div class="container">
    <!-- 内容 -->
  </div>
</PageLayout>

<style>
  /* 只属于这一页的样式；先复用 global.css 的类和变量 */
</style>
```

新增一个项目详情页：用 `getWorkByHref('/project/xxx')` 取作品元数据，再套
`ProjectLayout`，在默认插槽放交互区、在 `actions` 具名插槽放按钮。

---

## 9. 无障碍与性能基线

- 页面有 `lang="zh-CN"`、`<main id="main">`、跳过链接 `.skip-link`、可见的 `:focus-visible` 轮廓；
- 灯箱是 `role="dialog" aria-modal="true"`，支持 Esc 关闭、方向键翻页、触屏滑动、焦点循环；
- 图标默认 `aria-hidden`，需要语义时传 `label`；
- 图片一律走 `astro:assets`（`<Picture>` / `getImage`），输出 AVIF/WebP + 多尺寸 `srcset`，
  首屏图 `loading="eager"` + `fetchpriority="high"`，其余 `loading="lazy"`；
- 交互脚本都是独立模块（无内联 `onclick`），兼容严格 CSP，并在无 JS 时保留可读内容。
