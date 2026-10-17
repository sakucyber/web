# 迁移对照：旧多 HTML 站点 → Astro 5

本文记录 2026 年这次重构的「旧文件 → 新文件」对应关系、URL 变化、新增能力与行为差异。
旧站是零构建的多 HTML 页面（根目录 `index.html` / `gallery.html` / `works.html` / `404.html` /
`project/*.html` + `assets/theme.css` + `assets/theme.js` + `images/`），新站是
Astro 5 纯静态站点，内容收进 Markdown 内容集合，构建输出 `dist/`。

> 本文按**迁移完成后的最终状态**描述。迁移过程中旧文件会与新文件短暂共存，
> 最终统一删除；删除动作由仓库所有者执行，不属于本文档范围。

---

## 1. 架构对比

| 维度 | 旧站 | 新站 |
| --- | --- | --- |
| 构建 | 无构建，根目录直接发布 | `npm run build` → `dist/` |
| 页面 | 手写 HTML，导航 / 页脚 / meta 每页复制 | Astro 布局 + 组件，单处维护 |
| 内容 | 直接写在 HTML 里 | `src/content/posts/`、`src/content/works/`（Markdown + Zod 校验） |
| 样式 | `assets/theme.css` + 各页 `<style>` | `src/styles/global.css` + 组件 scoped `<style>` |
| 脚本 | `assets/theme.js` + 各页内联 `<script>` | `src/scripts/*.ts` 模块，按页面引入 |
| 图片 | `images/` 原图 + 手工 `images/webp/` 副本 | `src/assets/images/` 交给 `astro:assets` 构建期生成 AVIF/WebP + srcset |
| 图标 | Font Awesome CDN | 内联 SVG 组件（零第三方请求） |
| 字体 | Google Fonts CDN | `@fontsource` 自托管 |
| SEO | 每页手写 meta，根目录 `sitemap.xml` | `<SEO>` 组件 + 自动 canonical/OG/JSON-LD，Sitemap 构建期生成 |
| 订阅 | 无 | `/rss.xml` |
| 搜索 | 无 | `/search` + `/search-index.json` |
| 缓存 / 安全头 | 根目录 `_headers` | `public/_headers`（新增 CSP、哈希资源 immutable） |
| 旧链接 | —— | `public/_redirects` 301 保留 |

---

## 2. 逐文件对照

### 2.1 页面

| 旧文件 | 新位置 | 说明 |
| --- | --- | --- |
| `index.html` | `src/pages/index.astro` | 首页。Hero / 关于 / 作品精选 / 画廊预览 / 最新文章 / 社交六个区块保留，拆成组件：`BaseLayout`、`Header`、`Footer`、`SEO`、`WorkCard`、`PostCard`、`GalleryGrid`、`Icon`；文案集中到 `src/config/site.ts` 的 `SITE.hero` / `SITE.socials`；页面专属视觉（整屏区块、overlay、sparkles、社交卡）改为 `index.astro` 内的 scoped `<style>` |
| `gallery.html` | `src/pages/gallery.astro` | 画廊页。图片数据从写死 HTML 改为 `src/data/gallery.ts` 的 `GALLERY_ITEMS`；渲染交给 `GalleryGrid`（网格 / 瀑布流 / 分类筛选 / 灯箱）；交互在 `src/scripts/gallery.ts` 与 `src/scripts/app.ts` |
| `works.html` | `src/pages/works.astro` | 作品列表。卡片由 `content/works/*.md` + `WorkCard` 生成，不再手写 |
| `404.html` | `src/pages/404.astro` | 保留渐变 404 视觉，改为 `BaseLayout` 统一布局；`noindex`；Cloudflare Pages 自动把 `dist/404.html` 当 404 页 |
| `project/index.html` | `src/pages/project/index.astro` | 项目中心。`getWorks()` + `WorkCard compact` |
| `project/ai.html` | `src/pages/project/ai.astro` | AI贴吧老哥。`ProjectLayout` + `content/works/ai-tieba.md` 介绍；聊天逻辑移到 `src/scripts/ai-chat.ts`（关键词规则、延迟 typing 与旧版一致），DOM 安全创建 |
| `project/femboy.html` | `src/pages/project/femboy.astro` | 年度男娘程度总结器。`ProjectLayout` + `content/works/femboy-meter.md`；DJB2 哈希 + `Math.sin` 种子随机、1–100 分档、6 种配色（`blog-color`）、`noindex` 均保留；逻辑在 `src/scripts/femboy.ts` |
| `project/balatro.html`（旧构建产物，202KB 单文件） | `public/games/balatro/index.html` + `assets/app.js` | 玩法不变；为适配主站严格 CSP，内联 `<script>` 拆成外链、移除 Google Fonts `@import` 后作为独立游戏发布到 `/games/balatro/` |
| —— | `src/pages/project/balatro.astro` | 新的介绍页：玩法 / 技术栈 / 开始游戏与全屏按钮 / 点击后才加载的 iframe 预览（`src/scripts/balatro-embed.ts`）/ 源码说明 |
| `project/balatro/`（React + Vite 源码） | `projects/balatro/` | 独立小游戏工程，不参与主站 Astro 构建；`project/balatro/dist/` 与重复的 `project/balatro.html` 删除，构建产物只保留 `public/games/balatro/index.html` |
| 旧各页 `<head>` 内联的主题脚本 | `public/scripts/theme-init.js` | 从内联 `<script>` 改为外部文件：首屏读取 `localStorage` 主题后再渲染，既避免闪白，也满足 `script-src 'self'` 的严格 CSP |

### 2.2 样式与脚本

| 旧文件 | 新位置 | 说明 |
| --- | --- | --- |
| `assets/theme.css` | `src/styles/global.css` | 全站样式重写并扩充：设计变量、基础排版、导航、卡片、画廊、灯箱、Markdown `.prose`、搜索、项目页、动效与响应式；原各页 `<style>` 中可复用的部分并入，页面专属样式留在对应 `.astro` 的 scoped `<style>` |
| `assets/theme.js` | `src/scripts/app.ts` | 全站交互合并为**一个 rAF 调度器**：加载遮罩、主题切换、移动端抽屉、粒子、滚动进场、自定义光标、滚动进度、视差、导航 / 目录高亮、灯箱、快捷键（`/` 聚焦搜索）。旧版每页各挂一份监听，现由 `BaseLayout` 统一引入一份 |
| —— | `src/scripts/gallery.ts` | 画廊分类筛选与数量统计（旧版散在 gallery.html 内联脚本） |
| —— | `src/scripts/ai-chat.ts` | AI贴吧老哥聊天（旧版 `project/ai.html` 内联脚本） |
| —— | `src/scripts/femboy.ts` | 男娘指数计算与配色（旧版 `project/femboy.html` 内联脚本） |
| —— | `src/scripts/balatro-embed.ts` | 小丑牌 iframe 按需加载（新增） |
| —— | `src/scripts/post-filter.ts` | 文章列表页的客户端过滤（新增） |
| —— | `src/scripts/search.ts` | 搜索页交互（新增） |

> 旧版依赖 Font Awesome CDN（约 100KB CSS + 字体）与 Google Fonts；新版改为
> `src/components/Icon.astro` 内联 SVG + `@fontsource` 自托管字体，运行时不请求第三方域名。

### 2.3 图片资源

| 旧 | 新 | 说明 |
| --- | --- | --- |
| `images/*.jpg`（23 张，含 `avatar.jpg`、`3463.jpg` 与 21 个 `ec43126f...` 哈希名） | `src/assets/images/*.jpg`（23 张，语义化文件名） | 文件重命名并集中到 `src/assets/images/`；旧哈希文件名不再被引用 |
| `images/webp/*.webp`（手工生成的 WebP 副本） | 删除 | 构建期由 `astro:assets` 自动生成 AVIF/WebP + 多尺寸，无需手工副本 |
| 各页 `<img src="/images/...">` / CSS 背景图 | `<Picture>` / `getImage` + `src/lib/images.ts` | 内容里只写图片 key（如 `starry-sky-girl`），组件取 `ImageMetadata`，自动输出 `srcset` |
| 旧画廊 12 张写死图片 | `src/data/gallery.ts`（22 条） | 补齐分类、`alt`、文案、方向；`HOME_PREVIEW_IDS` 控制首页预览 8 张 |
| 图片 key 注册表 | `src/lib/images.ts` | 集中 `import` 23 张图，导出 `images` / `ImageKey` / `imageByKey` / `HERO_IMAGES` |

**23 个图片 key**（`src/lib/images.ts`）：

```
avatar  blonde-green  blue-dress  blue-flower-dress  butterfly-white
card-girl  cat-maid  cathedral-duo  doll-girl  golden-field
gothic-dress  horse-rider  moon-silhouette  moonlit-lake  neon-purple
pink-duo  pink-prayer  purple-duo  rooftop-girl  sakura-gathering
starry-sky-girl  underwater-blue  white-hair-companion
```

> 旧站曾以「单张 8.9MB 大图」著称；仓库里现存原图已压缩过（合计约 7MB）。
> 新站不再需要手动裁剪尺寸，构建期会按 `widths` 生成多档响应式图片。

### 2.4 配置 / 静态资源

| 旧文件 | 新位置 | 说明 |
| --- | --- | --- |
| 根目录 `_headers` | `public/_headers` | 重写：新增 CSP、COOP、Permissions-Policy；`/_astro/*` 一年 immutable；`/games/*` 每次回源；`/404.html` no-cache；小玩具页加 `X-Robots-Tag: noindex`。详见 `docs/cloudflare-pages.md` |
| 根目录 `robots.txt` | `public/robots.txt` | 更新 noindex 路径为无扩展名的 `/project/ai`、`/project/femboy`，并新增 `Disallow: /search`；Sitemap 指向不变 |
| 根目录 `sitemap.xml`（手写 5 条） | `src/pages/sitemap.xml.ts`（构建期生成） | 自动包含首页、静态页、文章、标签页、分类页、作品页；`noindex` 作品排除；不再需要手工维护 |
| 根目录 `ads.txt`、`5cc8f185...txt` | `public/ads.txt`、`public/5cc8...txt` | 站点验证 / 广告文件原样保留，构建时复制到 `dist/` 根目录 |
| `assets/` 目录 | 删除 | 样式与脚本分别迁到 `src/styles/`、`src/scripts/` |
| `images/` 目录 | 删除 | 图片迁到 `src/assets/images/` |
| `project/` 目录 | 删除 | 三个项目页改为 `src/pages/project/*.astro`；balatro 源码移到 `projects/balatro/` |
| `README.md` | `README.md`（重写） | 从「无构建静态站」说明改为 Astro 工程说明 |
| —— | `astro.config.mjs` | 新增：`site`、静态输出、图片 sharp 服务、Shiki、rehype 安全插件、`@` 别名 |
| —— | `package.json` / `tsconfig.json` / `eslint.config.js` / `.prettierrc.mjs` | 新增工程化配置 |
| —— | `wrangler.jsonc` | 可选：wrangler 命令行部署配置 |
| —— | `MIGRATION.md`、`docs/`、`scripts/new-post.mjs` | 新增迁移文档、专项文档与内容脚手架 |

---

## 3. URL 对照与 301

旧站页面都是 `.html` 结尾，新站使用无扩展名目录路由。所有旧地址都在
`public/_redirects` 里做了 **301 永久重定向**，收藏夹与搜索引擎结果不会 404：

| 旧 URL | 新 URL | 处理 |
| --- | --- | --- |
| `/` | `/` | 保持 |
| `/index.html` | `/` | 301 |
| `/gallery.html` | `/gallery` | 301 |
| `/works.html` | `/works` | 301 |
| `/project/` | `/project` | 保持（尾部斜杠由 `trailingSlash: 'ignore'` 兼容） |
| `/project/index.html` | `/project` | 301 |
| `/project/ai.html` | `/project/ai` | 301 |
| `/project/femboy.html` | `/project/femboy` | 301 |
| `/project/balatro.html` | `/project/balatro` | 301 |
| `/404.html` | `/404.html` | 不跳转，Pages 自动用作 404 页 |
| `/robots.txt` | `/robots.txt` | 保持 |
| `/sitemap.xml` | `/sitemap.xml` | 保持（内容改由构建期生成） |
| `/images/*.jpg` | 无对应旧地址 | ⚠️ 旧图片直链失效；站内图片改走 `/_astro/*` 哈希路径 |
| —— | `/posts`、`/posts/<id>` | 新增：文章列表 / 详情 |
| —— | `/tags`、`/tags/<tag>` | 新增：标签云 / 单标签 |
| —— | `/categories/<category>` | 新增：单分类 |
| —— | `/search` | 新增：站内搜索 |
| —— | `/rss.xml` | 新增：RSS 订阅 |
| —— | `/search-index.json` | 新增：搜索索引端点 |
| —— | `/games/balatro/` | 新增：小丑牌独立页面 |

> 如果旧图片被外部站点盗链 / 引用，需要单独保留一份 `public/images/` 副本；
> 站内已无任何路径依赖旧的 `/images/`。

---

## 4. 新增能力清单

相比旧站，新站新增或系统化实现了：

1. **文章系统**：Markdown 内容集合 + Zod 校验；列表、详情、上下篇、阅读时长、目录（TOC）、JSON-LD。
2. **标签与分类**：`/tags`、`/tags/<tag>`、`/categories/<category>`，标签云带计数。
3. **站内搜索**：构建期 `/search-index.json`，搜索页支持去抖、匹配高亮、键盘 Enter / Esc、URL `?q=` 同步；搜索页是工具页，`noindex` 且 robots 不收录。
4. **RSS 订阅**：`/rss.xml`（`@astrojs/rss`），页脚与文章页入口。
5. **Sitemap 自动化**：构建期端点生成，文章 / 标签 / 分类自动纳入，不再手写。
6. **画廊增强**：22 张结构化图片（分类 / alt / 文案），纯前端分类筛选、灯箱支持键盘方向键、Esc、触屏滑动与焦点管理。
7. **图片管线**：`astro:assets` + sharp，构建期生成 AVIF/WebP + 多尺寸 `srcset`，首屏图 preload、其余懒加载；`scripts/optimize-images.mjs` 负责原图压缩与 LQIP 占位图。
8. **LQIP 占位图数据**：`scripts/optimize-images.mjs` 生成 `src/data/image-placeholders.json`（24px WebP base64）。
   当前页面组件尚未接入（预留能力），接上后可用于减少图片加载时的布局抖动。
9. **统一 SEO**：`SEO.astro` 统一 title / description / canonical / OG / Twitter / JSON-LD；自动补尾斜杠；分享图默认用头像生成 1200×630。
10. **严格 CSP 与安全头**：`script-src 'self'`（无内联脚本）、`img-src 'self' data:`、`frame-src 'self'`；Markdown 构建期经 `rehype-safe-markdown.mjs` 清洗（去 script/iframe、on* 属性、危险协议）。
11. **自托管字体 + 内联图标**：移除 Google Fonts 与 Font Awesome CDN，运行时零第三方请求。
12. **统一项目页布局**：`ProjectLayout` 承载三个小玩具；小丑牌 iframe 点击后按需加载，避免首屏请求 200KB 游戏 bundle。
13. **内容脚手架**：`scripts/new-post.mjs` 自动生成合规 frontmatter；`scripts/optimize-images.mjs` 支持 `--dry-run` / `--report` / `--force`。
14. **工程化**：TypeScript strict、ESLint（TS + Astro）、Prettier、`@/*` 别名、`npm run check/lint/format`。

---

## 5. 行为变化与未保留内容

### 5.1 有意保留的行为

- 深色为默认主题，`localStorage` key 仍为 `blog-theme`；浅色主题、主题切换按钮位置不变。
- 加载遮罩、滚动进度、粒子、自定义光标、视差、滚动进场、导航抽屉、灯箱、`/` 搜索快捷键均保留。
- AI贴吧老哥的关键词规则与回复（孝 / 绷 / 急 / 麻 / 典）与节流延迟保持一致。
- 男娘程度总结器的 DJB2 哈希、`Math.sin` 种子随机、1–100 分档与 6 种配色（`blog-color`）保持一致。
- 小丑牌玩法不变，只是发布路径从 `project/balatro.html` 变为 `/games/balatro/`，并把内联脚本拆成 `assets/app.js` 以适配严格 CSP。
- 站点域名、作者信息、社交链接、版权文案、站点验证文件保持。
- 404 页的渐变视觉与「回到首页 / 逛逛画廊」入口保留（画廊链接改为 `/gallery`）。

### 5.2 有意的行为变化

| 变化 | 旧站 | 新站 | 原因 |
| --- | --- | --- | --- |
| 导航项 | 首页 / 关于 / 作品 / 项目中心 / 画廊 / 社交 | 首页 / 文章 / 作品 / 项目中心 / 画廊 / 关于（`/#about`） | 新增文章系统入口；社交卡片保留在首页「关注我」区块与页脚 |
| 首屏主题脚本 | `<head>` 内联 `<script>` | 外部 `/scripts/theme-init.js` | CSP 禁止内联脚本 |
| 图标 | Font Awesome CDN | 内联 SVG | 去第三方请求、减小 CSS |
| 字体 | Google Fonts CDN | `@fontsource` 自托管 | 去第三方请求、可控缓存 |
| 画廊数量 | 12 张 | 22 张（首页预览 8 张） | 补齐分类 / alt / 文案 |
| 画廊图片 alt | `画廊照片 N` | 真实中文描述 | 无障碍与 SEO |
| 作品卡片数据 | 写死 HTML | `content/works/*.md` | 单处维护、可校验 |
| Sitemap | 手写 5 条 | 构建期生成（文章 / 标签 / 分类 / 作品） | 不再漏页 |
| 缓存策略 | `/assets/*` 1 天、`/images/*` 7 天，改文件靠 `?v=` | `/_astro/*` 一年 immutable + HTML 回源 | 哈希指纹免手动刷新 |
| 分享图 | 旧 `images/avatar.jpg`（原图） | 构建期生成 1200×630 优化图 | 分享卡片加载更快 |
| 小丑牌入口 | 直接打开 `project/balatro.html` | `/project/balatro` 介绍页 + `/games/balatro/` 游戏页 | 统一布局、按需加载 |
| 项目页 meta | 每页手写 | `ProjectLayout` + `works` frontmatter | 统一 noindex / 描述 / 封面 |
| URL | `.html` 结尾 | 无扩展名（旧地址 301） | 目录路由 + 尾斜杠兼容 |

### 5.3 未保留 / 删除的内容

- `assets/theme.css`、`assets/theme.js`：内容已拆分重写，旧文件删除。
- `images/`、`images/webp/`：原图迁移并重命名；手工 WebP 副本删除（构建期生成）。
- `project/*.html`、`project/balatro/`：页面改 Astro；源码移到 `projects/balatro/`；
  `project/balatro/dist/` 与重复的 `project/balatro.html` 删除。
- 根目录 `_headers`、`robots.txt`、`sitemap.xml`：迁移到 `public/` 或改为构建期端点。
- 旧页面各自维护的 `<head>` meta / preconnect / Font Awesome / Google Fonts 引用：删除。
- 旧 `.html` 直链：不做 1:1 文件保留，由 `_redirects` 301 到新地址。
- 旧图片哈希文件名的直链：不再保留（站内已无引用）。

---

## 6. 迁移验收清单

- [ ] `npm run build` 成功，`dist/` 内含首页、文章、标签、分类、作品、项目、画廊、搜索、404、RSS、Sitemap、搜索索引。
- [ ] 旧 URL 301 生效：`/index.html`、`/gallery.html`、`/works.html`、`/project/*.html`。
- [ ] 首页六个区块、画廊筛选与灯箱、作品卡片、三个项目页交互与旧站一致。
- [ ] `/project/ai`、`/project/femboy` 返回 `noindex`（meta + `X-Robots-Tag`），`/search` 不被抓取。
- [ ] `/games/balatro/` 能独立打开并游玩；`/project/balatro` 的 iframe 点击后才发请求。
- [ ] 图片全部走 `/_astro/` 的 AVIF/WebP；运行过脚本后 `src/data/image-placeholders.json` 的 key 与图片一致。
- [ ] `/rss.xml`、`/sitemap.xml` 返回正确内容与 `Content-Type`。
- [ ] 响应头含 CSP、COOP、Permissions-Policy；`_astro/*` 为一年 immutable。
- [ ] 手机端导航抽屉、灯箱滑动、搜索结果可用；键盘可完成主要操作。
- [ ] 旧 `README.md` 中的「无构建 / 本地 serve」说明已被新 README 取代。

---

## 7. 迁移后仓库根目录对照

```
旧根目录                              新根目录
├── index.html                        ├── astro.config.mjs
├── gallery.html                      ├── package.json
├── works.html                        ├── tsconfig.json
├── 404.html                          ├── eslint.config.js
├── project/                          ├── .prettierrc.mjs
├── assets/                           ├── wrangler.jsonc
├── images/                           ├── README.md
├── _headers                          ├── MIGRATION.md
├── robots.txt                        ├── docs/
├── sitemap.xml                       ├── public/        (_headers/_redirects/robots/games/scripts)
├── ads.txt                           ├── scripts/       (optimize-images / new-post)
└── README.md                         ├── projects/      (balatro 源码)
                                      └── src/           (页面/组件/布局/内容/样式/脚本)
```

需要回滚到旧站时，从提交历史里检出旧版本的根目录文件即可；Cloudflare Pages 侧也可以在
Deployments 里回滚到上一个正常部署（见 `docs/cloudflare-pages.md` 第 6 节）。
