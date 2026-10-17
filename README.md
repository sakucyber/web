# buling 的个人小窝

线上地址：**<https://buling.qzz.io/>**

一个用 **Astro 5** 重做的个人博客：Markdown 写内容、构建期生成静态 HTML，
输出 `dist/` 后部署在 **Cloudflare Pages**。没有服务端、没有数据库、没有第三方运行时依赖，
推送到 `main` 就自动发布。

- 内容：5 篇文章 / 3 个作品 / 22 张画廊图片（截至重构完成时）
- 能力：文章系统、标签与分类、站内搜索、RSS、Sitemap、画廊筛选与灯箱、构建期图片优化、严格 CSP
- 小游戏：小丑牌（React + Vite）作为独立构建产物放在 `public/games/balatro/`

> 从旧的多 HTML 站点迁移过来？先看 [MIGRATION.md](./MIGRATION.md)，
> 部署细节看 [docs/cloudflare-pages.md](./docs/cloudflare-pages.md)。

---

## 5 分钟跑起来

环境要求：**Node.js ≥ 20.11**（`package.json` 的 `engines` 字段）、npm。

```bash
git clone <本仓库地址>
cd <仓库目录>

npm install          # 安装依赖（含 sharp 的预编译二进制）
npm run dev          # 本地开发，默认 http://localhost:4321
```

打开 <http://localhost:4321> 就能看到首页。改 `src/` 下的文件会热更新。

常用命令：

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器（默认 4321 端口） |
| `npm run build` | 构建生产站点到 `dist/` |
| `npm run preview` | 预览 `dist/` 的构建结果（部署前自查） |
| `npm run check` | Astro + TypeScript 类型检查（含内容集合校验） |
| `npm run lint` / `npm run lint:fix` | ESLint 检查 / 自动修复 |
| `npm run format` / `npm run format:check` | Prettier 格式化 / 校验 |
| `npm run optimize:images` | 压缩 `src/assets/images/` 并生成 LQIP 占位图 |
| `npm run new:post -- "标题"` | 新建一篇文章（脚手架） |

> `npm run new:post` 后面的参数要带 `--`，否则会被 npm 吞掉：
> `npm run new:post -- "我的新文章" --category 技术 --tags Astro,建站`

---

## 技术栈

| 层 | 选择 |
| --- | --- |
| 框架 | [Astro 5](https://astro.build/)（`output: 'static'`，默认零运行时 JS） |
| 内容 | Astro Content Collections + glob loader + Zod schema（`src/content.config.ts`） |
| 样式 | 原生 CSS（`src/styles/global.css` 设计变量 + 组件 scoped `<style>`） |
| 字体 | `@fontsource-variable/nunito`、`@fontsource/zcool-kuaile` 自托管 |
| 图片 | `astro:assets` + `sharp`：构建期输出 AVIF/WebP + 多尺寸 `srcset` |
| 图标 | 内联 SVG 组件（`src/components/Icon.astro`），不依赖图标库 CDN |
| 代码高亮 | Shiki（构建期，github-light / github-dark 双主题，随站点主题切换） |
| Markdown 安全 | 本地 rehype 插件 `src/lib/rehype-safe-markdown.mjs`（构建期清洗 HTML） |
| 搜索 | 构建期生成 `/search-index.json`，前端纯 DOM 匹配 |
| 部署 | Cloudflare Pages（静态托管 + `_headers` / `_redirects`） |

运行时没有任何第三方请求：无 Google Fonts、无 Font Awesome CDN、无统计脚本。
安全策略（CSP）写在 `public/_headers`，`script-src 'self'` 没有 `unsafe-inline` / `unsafe-eval`。
小丑牌是旧版打包的单文件 React 构建，发布前已把内联脚本拆成 `assets/app.js`、移除 Google Fonts
`@import`，因此它也运行在同一套严格 CSP 之下。

---

## 目录结构

```
.
├── astro.config.mjs            # Astro 配置：site、静态输出、图片服务、Shiki、rehype 安全插件
├── package.json                # 依赖与 npm scripts
├── tsconfig.json               # TS strict + @/* 路径别名
├── eslint.config.js            # ESLint 扁平配置（TS + Astro）
├── .prettierrc.mjs             # Prettier（含 prettier-plugin-astro）
├── wrangler.jsonc              # 可选：wrangler 命令行部署配置
├── README.md / MIGRATION.md
├── docs/
│   ├── cloudflare-pages.md     # Pages 构建设置、_headers/_redirects、回滚、wrangler
│   └── design-system.md        # 设计变量、断点、组件与脚本速查
├── public/                     # 原样复制到 dist/ 根目录
│   ├── _headers                # 缓存 / 安全头 / CSP / noindex
│   ├── _redirects              # 旧 URL → 新 URL 的 301
│   ├── robots.txt
│   ├── ads.txt
│   ├── 5cc8f185d7ad8b9a7c47c469fae6488f.txt   # 站点验证文件
│   ├── scripts/theme-init.js   # 首屏主题初始化（外部文件，满足严格 CSP）
│   └── games/balatro/index.html# 小丑牌构建产物（单文件 React 游戏）
├── scripts/
│   ├── optimize-images.mjs     # 图片压缩 + LQIP 占位图生成
│   └── new-post.mjs            # 新建文章脚手架
├── projects/
│   └── balatro/                # 小丑牌源码（React + Vite，独立构建，不参与主站）
└── src/
    ├── assets/images/          # 23 张语义化命名的原图（jpg）
    ├── components/             # Header / Footer / SEO / Icon / PostCard / WorkCard / GalleryGrid / Lightbox
    ├── config/site.ts          # 站点信息、导航、社交链接、Hero 文案
    ├── content/
    │   ├── posts/              # 文章 Markdown（文件名即 slug：YYYY-MM-DD-slug.md）
    │   └── works/              # 作品元数据 Markdown（ai-tieba / femboy-meter / balatro）
    ├── data/
    │   ├── gallery.ts          # 画廊图片清单（分类 / alt / 文案 / 方向）
    │   └── image-placeholders.json  # 可选：运行 optimize-images 后生成的 LQIP（默认未创建）
    ├── layouts/                # BaseLayout / PageLayout / PostLayout / ProjectLayout
    ├── lib/
    │   ├── content.ts          # 内容查询：getPosts/getWorks/标签/分类/阅读时长/上下篇
    │   ├── images.ts           # 图片注册表：key → ImageMetadata，HERO_IMAGES
    │   ├── format.ts           # 日期格式化、slugify
    │   ├── search.ts           # 构建搜索索引
    │   └── rehype-safe-markdown.mjs  # Markdown HTML 清洗
    ├── pages/                  # 路由（见下表）
    ├── scripts/                # 客户端 TS：app/gallery/post-filter/search/ai-chat/femboy/balatro-embed
    └── styles/global.css       # 全站样式与设计变量
```

生成物（均已 gitignore）：`node_modules/`、`dist/`、`.astro/`、`src/assets/images/_original/`。

### 路由一览

| 路由 | 文件 | 说明 |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | 首页：Hero / 关于 / 作品精选 / 画廊预览 / 最新文章 / 社交 |
| `/posts` | `src/pages/posts/index.astro` | 文章列表 + 搜索框 + 标签云 |
| `/posts/<id>` | `src/pages/posts/[...slug].astro` | 文章详情（id = Markdown 文件名去掉 `.md`） |
| `/tags`、`/tags/<tag>` | `src/pages/tags/` | 全部标签 / 单标签文章 |
| `/categories/<category>` | `src/pages/categories/[category].astro` | 单分类文章 |
| `/works` | `src/pages/works.astro` | 作品列表 |
| `/project` | `src/pages/project/index.astro` | 项目中心 |
| `/project/ai`、`/project/femboy`、`/project/balatro` | `src/pages/project/*.astro` | 三个小项目详情页 |
| `/gallery` | `src/pages/gallery.astro` | 图片画廊（分类筛选 + 灯箱） |
| `/search` | `src/pages/search.astro` | 站内搜索（工具页，`noindex` + robots 不收录） |
| `/rss.xml` | `src/pages/rss.xml.ts` | RSS 订阅（文章） |
| `/sitemap.xml` | `src/pages/sitemap.xml.ts` | Sitemap（构建期生成） |
| `/search-index.json` | `src/pages/search-index.json.ts` | 搜索索引端点 |
| `404.html` | `src/pages/404.astro` | 自定义 404（Pages 自动识别） |

---

## 内容创作

内容与页面是分开的：写文章只需要新增一个 Markdown 文件，路由、列表、RSS、Sitemap、
搜索索引都会在构建时自动更新。

### 新增文章

推荐用脚手架（自动生成正确 frontmatter、不覆盖已有文件）：

```bash
npm run new:post -- "把博客搬进 Astro" --category 技术 --tags Astro,建站 --cover starry-sky-girl
```

等价于：

```bash
node scripts/new-post.mjs "把博客搬进 Astro" --category 技术 --tags Astro,建站
```

- 没有参数时会进入交互式提问；
- 文件名格式：`src/content/posts/YYYY-MM-DD-slug.md`（slug 默认由标题生成，可用 `--slug` 指定）；
- 可选参数：`--desc`、`--cover`、`--date`、`--featured`、`--draft`、`--dry-run`（只预览不写盘）。

也可以手动创建 `src/content/posts/2026-10-20-my-post.md`：

```markdown
---
title: "我的新文章"
description: "一句话摘要，会出现在列表、搜索结果和 SEO 描述里。"
date: 2026-10-20
category: 技术
tags: ["Astro", "前端"]
cover: starry-sky-girl
featured: false
draft: false
---

正文从这里开始，支持 Markdown 标题、列表、引用、表格、代码块。
```

**posts 集合 frontmatter 字段**（以 `src/content.config.ts` 为准，构建期由 Zod 校验）：

| 字段 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | string（1–120 字） | ✅ | — | 标题 |
| `description` | string（1–300 字） | ✅ | — | 摘要，用于列表 / SEO / 搜索 |
| `date` | 日期（`YYYY-MM-DD`） | ✅ | — | 发布于，决定排序 |
| `updated` | 日期 | — | — | 更新于，可选 |
| `category` | string | — | `随笔` | 分类，生成 `/categories/<分类>` |
| `tags` | string[] | — | `[]` | 标签，生成 `/tags/<标签>` |
| `cover` | string | — | — | 图片 key（见 `src/lib/images.ts`），不填则卡片无封面 |
| `featured` | boolean | — | `false` | 首页「最新文章」优先展示 |
| `draft` | boolean | — | `false` | 草稿：不出现在列表 / RSS / Sitemap / 搜索索引 |

> 日期写错、字段漏填都会在 `npm run build` / `npm run check` 阶段直接报错，不会带着坏数据上线。

### 新增作品 / 项目

作品不是文章，而是「作品卡片 + 站内项目页」的元数据，放在 `src/content/works/*.md`：

```markdown
---
title: "我的新玩具"
description: "一句话说明这个项目是做什么的。"
date: 2026-10-20
tags: ["JavaScript", "小玩具"]
cover: neon-purple
emoji: "🎮"
href: "/project/my-toy"
linkLabel: "去玩玩"
featured: true
order: 4
status: "在线可玩"
stack: ["HTML", "CSS", "JavaScript"]
noindex: true
---

这里写项目介绍（Markdown），会渲染在 `/project/my-toy` 页面顶部。
```

**works 集合 frontmatter 字段**：

| 字段 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | string（1–80 字） | ✅ | — | 作品名 |
| `description` | string（1–300 字） | ✅ | — | 卡片描述 |
| `date` | 日期 | ✅ | — | 发布日期 |
| `tags` | string[] | — | `[]` | 技术 / 类型标签 |
| `cover` | string | ✅ | — | 图片 key |
| `emoji` | string | — | `✨` | 卡片上的 emoji |
| `href` | string | ✅ | — | 站内项目页地址，如 `/project/ai` |
| `linkLabel` | string | — | `去看看` | 卡片按钮文案 |
| `featured` | boolean | — | `false` | 是否在首页作品区优先展示 |
| `order` | number | — | `99` | 排序，越小越靠前 |
| `status` | string | — | `在线` | 卡片状态角标 |
| `stack` | string[] | — | `[]` | 技术栈（项目页展示） |
| `noindex` | boolean | — | `false` | 小玩具页不收录（同时写 `X-Robots-Tag`） |
| `repo` | URL | — | — | 可选源码地址 |

新增项目页的步骤：

1. `src/content/works/` 加一个 `.md`（上面模板）；
2. `src/pages/project/my-toy.astro` 用 `getWorkByHref('/project/my-toy')` 取元数据，
   套 `ProjectLayout`，在默认插槽放介绍 / 交互；
3. 如果有交互逻辑，写 `src/scripts/my-toy.ts`，页面里用 `<script>import '@/scripts/my-toy';</script>` 引入；
4. 需要保留旧地址时，在 `public/_redirects` 加一条 301。

### 新增画廊图片

1. 把图片放进 `src/assets/images/`，建议用语义化文件名（如 `night-train.jpg`）；
2. 在 `src/lib/images.ts` 的 `images` 对象里注册 key：

   ```ts
   import nightTrain from '@/assets/images/night-train.jpg';
   export const images = {
     // ...
     'night-train': nightTrain,
   } as const;
   ```

3. 在 `src/data/gallery.ts` 的 `GALLERY_ITEMS` 里加一项（分类只能是 `夜景` / `少女` / `幻想`）：

   ```ts
   {
     id: 'night-train',
     image: 'night-train',
     alt: '夜晚列车窗边的少女',
     caption: '夜行列车',
     category: '夜景',
     orientation: 'landscape',
   },
   ```

4. 运行 `npm run optimize:images` 生成占位图（可选但推荐）；
5. `npm run dev` 检查灯箱、筛选与 alt 文案。

---

## 主题修改

### 站点信息 / 导航 / 社交

改 `src/config/site.ts`，全站共用：

- `SITE.title` / `shortTitle` / `description` / `author` / `email` / `keywords`：SEO 与页脚；
- `SITE.url`：线上域名（`astro.config.mjs` 的 `site` 也要保持一致）；
- `SITE.nav`：顶部导航（`{ label, href, match }`）；
- `SITE.socials`：社交卡片（Bilibili / GitHub / 邮箱）；
- `SITE.hero`：首页 Hero 的 badge / 标题 / 副标题 / 标签；
- `STATIC_PAGES`：搜索索引与 Sitemap 的静态页面列表。

### 颜色 / 字体 / 圆角

改 `src/styles/global.css` 顶部的 `:root` 与 `[data-theme='light']` 变量（见
[docs/design-system.md](./docs/design-system.md)）。比如换主色只改 `--primary` / `--primary-light` /
`--gradient` / `--glow` 四个变量即可。

页面专属样式写在对应 `.astro` 的 `<style>` 里（Astro 自动 scoped）；组件通用样式才放进
`global.css`。

### 深浅色主题

- 默认深色，`<html data-theme="dark">`；
- 首屏由 `public/scripts/theme-init.js` 读取 `localStorage.blog-theme` 应用，避免闪白；
- 切换按钮逻辑在 `src/scripts/app.ts`；
- 想把默认主题改成浅色，改 `SITE.defaultTheme` 与 `BaseLayout.astro` 里的初始 `data-theme`。

---

## 图片工作流

图片放在 `src/assets/images/`（23 张，语义化文件名），**不要**再把图放进 `public/` 或旧
`images/` 目录。构建时 Astro 会基于原图生成 AVIF/WebP + 多尺寸 `srcset`，由浏览器按屏宽选择。

三个环节：

1. **注册 key**：`src/lib/images.ts`（内容里只写 key，不写路径）；
2. **压缩 + LQIP（可选）**：`npm run optimize:images`；
3. **使用**：组件里用 `<Picture>` / `getImage`，内容 frontmatter 里写 `cover: <key>`。

`scripts/optimize-images.mjs` 用法：

```bash
npm run optimize:images -- --report    # 只读报告：体积、尺寸、备份、占位图覆盖情况
npm run optimize:images -- --dry-run   # 只算不写：预计压缩结果，不产生任何文件
npm run optimize:images                # 压缩原图 + 备份 + 生成 image-placeholders.json
npm run optimize:images -- --force     # 忽略「已压缩 / 本来就小」判断，全部重新压
```

脚本行为：

- 宽度上限 **1920px**、JPEG **mozjpeg q78**、清 EXIF（PNG 用 palette 压缩）；
- 第一次压缩前把原图备份到 `src/assets/images/_original/`（已 gitignore，**只备份不覆盖**）；
- 小于 200KB 的图默认跳过，`--force` 才处理；
- 为每张图生成 **24px WebP** 的 base64，写入 `src/data/image-placeholders.json`（key 为含扩展名的文件名）。
  这是给 LQIP 模糊占位准备的数据（当前组件尚未接入，属于预留能力；接入时把对应 key 的 data URI
  作为 `background-image` 即可）；
- `--dry-run` / `--report` 完全不写盘。

> 构建体积与构建时间主要来自原图尺寸。新图先跑 `--dry-run` 看预计节省，再决定是否执行。

---

## 小游戏：小丑牌

小丑牌是一个独立的 React + Vite 项目，**不参与主站 Astro 构建**：

- 源码：`projects/balatro/`（`npm install && npm run build` 独立构建）；
- 产物：`public/games/balatro/index.html`（单文件 HTML，构建时原样复制到 `dist/games/balatro/`）；
- 介绍页：`/project/balatro`（统一布局，提供「开始游戏 / 全屏游玩」新窗口入口，
  以及点击后才加载的 iframe 预览，避免首屏请求 200KB 的 JS）。

修改小游戏后：在 `projects/balatro/` 里重新构建，把产物复制到 `public/games/balatro/index.html`，
再提交主仓库。

---

## 部署到 Cloudflare Pages

关键配置（首次迁移**必须先改**，再合并代码，否则旧设置会把源码目录当网站发布）：

| 配置 | 值 |
| --- | --- |
| Framework preset | `Astro` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Production branch | `main` |
| Node.js version | 20+ |

推送 `main` 自动构建发布；其他分支 / PR 会生成预览地址。_headers 缓存与安全头、
_redirects 301、回滚、wrangler 命令行部署等详见 **[docs/cloudflare-pages.md](./docs/cloudflare-pages.md)**。

---

## SEO 与订阅

- `<SEO>` 组件统一输出 title / description / canonical / Open Graph / Twitter / JSON-LD；
- `src/pages/sitemap.xml.ts` 构建期生成 Sitemap（含首页、列表页、文章、标签、分类、作品）；
- `src/pages/rss.xml.ts` 用 `@astrojs/rss` 生成 `/rss.xml`；
- 搜索索引 `/search-index.json` 只包含标题、摘要、标签等短文本，不塞正文；
- 小玩具页（`/project/ai`、`/project/femboy`）在 frontmatter 标 `noindex`，同时有
  `_headers` 的 `X-Robots-Tag` 与 `robots.txt` 双保险；搜索页 `/search` 也是 `noindex`，
  并在 `robots.txt` 里 Disallow，Sitemap 不收录；
- 线上验证：<https://buling.qzz.io/sitemap.xml>、<https://buling.qzz.io/rss.xml>。

---

## 语义化提交建议

提交信息用 `<type>(<scope>): <摘要>`，一个提交只做一件事：

| type | 用途 | 示例 |
| --- | --- | --- |
| `feat` | 新功能 / 新页面 | `feat(posts): 新增文章列表与标签筛选` |
| `fix` | 修复问题 | `fix(gallery): 修复灯箱触屏滑动方向` |
| `docs` | 文档 | `docs(readme): 补充 Cloudflare Pages 迁移步骤` |
| `style` | 样式 / 格式（不改逻辑） | `style(global): 统一卡片圆角变量` |
| `perf` | 性能优化 | `perf(images): 画廊图片改用 AVIF srcset` |
| `refactor` | 重构（不改行为） | `refactor(layout): 抽离 SEO 组件` |
| `content` | 新增 / 修改文章内容 | `content: 发布 Astro 重构复盘` |
| `chore` | 依赖 / 配置 / 脚本 | `chore(deps): 升级 astro 到 5.18` |

提交前建议跑一遍：

```bash
npm run check && npm run lint && npm run format:check
```

---

## 常见问题

**`npm run dev` 报 Node 版本不支持？**
项目要求 Node ≥ 20.11（见 `package.json` 的 `engines`）。用 `node -v` 确认，推荐 20 LTS 或 22。

**`sharp` 安装失败 / 图片构建报错？**
先 `rm -rf node_modules package-lock.json && npm install`（Windows 用 `Remove-Item`）。
Cloudflare Pages 构建环境会自动装 Linux 版二进制，本地不要提交 `node_modules/`。

**本地打开旧链接 `/gallery.html` 404？**
`_redirects` 只在 Cloudflare Pages 上生效，本地开发请直接访问新地址 `/gallery`。

**改了内容但列表 / RSS 没变？**
内容集合在构建期读取：dev 下会自动刷新；如果看的是 `npm run preview`，需要重新
`npm run build` 再 preview。

**新增图片后页面没有它 / 灯箱打不开？**
检查三处：图片是否在 `src/assets/images/`、`src/lib/images.ts` 是否注册 key、
`src/data/gallery.ts` 是否加了条目；然后重新 `npm run build`。

**`image-placeholders.json` 要提交吗？**
建议在运行过一次脚本后提交（它是稳定产物）。脚本是幂等的，重复跑只会更新变化的部分。
注意：目前页面组件还没有读取它，属于预留的 LQIP 数据，接入前不影响构建。

**为什么不用 SPA 的 `/* /index.html 200` 回退？**
本站每页都是真实静态 HTML，未知路径应由 `404.html` 返回真正的 404。SPA 回退会把不存在的
URL 变成 200，伤害 SEO。详见 [docs/cloudflare-pages.md](./docs/cloudflare-pages.md#7-为什么不需要-spa-rewrite)。

**构建成功但线上还是旧版？**
确认 Dashboard 的 Output directory 是 `dist`；检查 `_astro/*` 之外的未哈希资源缓存
（HTML 是 `must-revalidate`，通常刷新即最新）。

---

## 相关文档

- [MIGRATION.md](./MIGRATION.md) —— 旧站 → Astro 的逐文件迁移对照、URL 表、行为变化
- [docs/cloudflare-pages.md](./docs/cloudflare-pages.md) —— Pages 配置、缓存 / 安全头、回滚、wrangler
- [docs/design-system.md](./docs/design-system.md) —— 设计变量、断点、组件与脚本速查
