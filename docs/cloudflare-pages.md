# 部署到 Cloudflare Pages

> 本站是 **Astro 纯静态站点**：`npm run build` 产出 `dist/`，没有服务端运行时、没有数据库、没有环境变量。
> 日常发布只需要把代码推到 `main`，Cloudflare Pages 会自动构建并上线。

---

## 0. 迁移前必读：先改 Dashboard，再合并代码

旧站是「无构建、根目录直接发布」的模式，Pages 项目里很可能还是：

| 配置项 | 旧值（旧站） | 新值（Astro） |
| --- | --- | --- |
| Framework preset | None | **Astro** |
| Build command | 空 | `npm run build` |
| Build output directory | `/` | `dist` |
| Node 版本 | 默认 | 20 或更高（建议 20 LTS / 22） |

> ⚠️ **顺序很重要**：一定要先在 Cloudflare Dashboard 把 Build command 改成 `npm run build`、
> Output directory 改成 `dist`，并确认构建成功，**再**把重构代码合并进 `main`。
> 如果反过来，旧设置（空构建命令 + 根目录）会直接把仓库源码当成网站发布，访问会得到 404 或
> 一堆 `.astro` / `.ts` 源码文件。

---

## 1. 项目设置（Dashboard）

进入 **Cloudflare Dashboard → Workers & Pages → 你的 Pages 项目 → Settings → Build & deployments**：

| 配置 | 值 | 说明 |
| --- | --- | --- |
| Production branch | `main` | 推送到该分支触发生产构建 |
| Framework preset | `Astro` | 选上后会自动填好构建设置，仍建议逐项核对 |
| Build command | `npm run build` | 等价于 `astro build` |
| Build output directory | `dist` | Astro 默认输出目录 |
| Root directory | 仓库根目录（留空） | 本项目没有 monorepo 子目录 |
| Node.js version | 20 或更高 | `package.json` 的 `engines.node` 要求 `>=20.11.0` |
| Environment variables | **不需要** | 站点域名、文案都写在代码里 |

Node 版本有两种设置方式，任选其一：

1. Dashboard → Settings → Environment variables 增加 `NODE_VERSION = 20`；
2. 或在仓库根目录放一个 `.node-version`（内容写 `20`）。

> 本项目使用 `sharp` 做构建期图片处理，Cloudflare Pages 的 Linux 构建环境会安装对应的
> 预编译二进制，**不需要**在仓库里提交 `node_modules/`，也不要提交 `dist/`（均已 gitignore）。

---

## 2. 构建产物长什么样

`npm run build` 之后：

```
dist/
├── index.html                # 首页
├── posts/                    # 文章列表 + 每篇文章（directory 格式）
├── tags/  categories/        # 标签页、分类页
├── works/  project/          # 作品列表、项目中心、项目详情页
├── gallery/                  # 画廊
├── search/                   # 搜索页
├── search-index.json         # 构建期生成的搜索索引
├── rss.xml                   # RSS 订阅
├── sitemap.xml               # 构建期生成
├── 404.html                  # Cloudflare Pages 自动识别为 404 页
├── _headers                  # Cloudflare Pages 响应头
├── _redirects                # Cloudflare Pages 重定向
├── _astro/                   # 带哈希的 CSS / JS / 图片（可长期缓存）
├── scripts/theme-init.js     # 首屏主题初始化（外部脚本，满足严格 CSP）
└── games/balatro/index.html  # 小丑牌单文件游戏
```

> 站点图片经 `astro:assets` 处理后都带哈希，落在 `_astro/`，因此 `dist/images/` 通常不存在；
> `_headers` 里的 `/images/*` 规则是给以后手动放进 `public/images/` 的普通图片预留的。

`_headers`、`_redirects`、`robots.txt` 等放在 `public/` 下的文件会被原样复制到 `dist/` 根目录，
由 Pages 按同名规则读取。

---

## 3. `_headers`：缓存与安全头逐条说明

文件位置：`public/_headers`（构建后为 `dist/_headers`）。规则**按顺序叠加**，后面的规则覆盖前面同名的头。

### 3.1 全局安全头

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
    img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'self'; media-src 'self';
    object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';
    upgrade-insecure-requests
  Cache-Control: public, max-age=0, must-revalidate
```

| 头 | 作用 |
| --- | --- |
| `X-Content-Type-Options: nosniff` | 禁止浏览器猜 MIME，避免把非脚本当脚本执行 |
| `X-Frame-Options: SAMEORIGIN` | 只允许本站页面用 iframe 嵌本站（`/project/balatro` 的预览 iframe 需要） |
| `Referrer-Policy: strict-origin-when-cross-origin` | 跨站只发送来源域名，不泄露完整路径 |
| `Permissions-Policy` | 关闭地理位置、麦克风、摄像头、支付、USB、FLoC 等用不到的权限 |
| `Cross-Origin-Opener-Policy: same-origin` | 隔离打开的跨窗口引用，降低 XSS 横向影响 |
| `Content-Security-Policy` | 见下 |
| `Cache-Control: ...must-revalidate` | 默认 HTML 每次回源校验，保证更新立刻生效 |

CSP 的几个关键点：

- `script-src 'self'`：**没有** `unsafe-inline` / `unsafe-eval`。所以站点没有任何内联 `<script>` 逻辑，
  首屏主题初始化是独立文件 `/scripts/theme-init.js`，其余交互都由 Astro 打包成 `_astro/*.js` 模块；
  JSON-LD 是 `<script type="application/ld+json">` 数据块，不执行脚本。

> **`/games/*` 说明**：小丑牌是旧版打包好的单文件 React 构建。为了让它也能运行在严格 CSP 下，
> 发布前已把内联 `<script type="module">` 拆成外链 `assets/app.js`，并移除了内联样式里的 Google Fonts
> `@import`（字体回退到系统字体）。因此 `/games/*` 不需要 CSP 例外，页面里也没有外部字体请求。
- `style-src 'self' 'unsafe-inline'`：Astro 会把组件样式编译成外链 CSS，但模板里仍会用到
  `style="--d:0"` 这类内联 CSS 变量，所以样式属性需要 `unsafe-inline`。
- `img-src 'self' data:`：图片全部自托管；`data:` 用于内联 favicon（SVG data URI）与 LQIP 占位图。
- `font-src 'self'`：字体经 `@fontsource` 自托管，不再请求 Google Fonts / cdnjs。
- `frame-src 'self'`：`/project/balatro` 的 `iframe` 只加载本站 `/games/balatro/`。
- `object-src 'none'`、`base-uri 'self'`、`form-action 'self'`、`frame-ancestors 'self'`：
  收紧插件、`<base>` 注入、表单外发、点击劫持等攻击面。
- `upgrade-insecure-requests`：把误写的 `http://` 子资源升级到 HTTPS。

> 修改 CSP 时注意：任何新引入的第三方脚本 / 字体 / iframe 域名都要同步加进对应指令，
> 否则会被浏览器拦截。本站目标是**保持零第三方请求**，通常不需要改。

### 3.2 缓存规则

| 匹配路径 | 缓存策略 | 说明 |
| --- | --- | --- |
| `/_astro/*` | `max-age=31536000, immutable` | 带内容哈希的构建产物，可放心一年缓存 |
| `/images/*` | `max-age=604800` | 预留：`public/images/` 下未指纹化的普通图片（当前站内图片都走 `_astro/`） |
| `/games/*` | `max-age=0, must-revalidate` | 小游戏 HTML 会更新，每次都回源 |
| `/404.html` | `no-cache` | 避免 404 页被缓存 |
| 其他（HTML、`_redirects` 等） | `max-age=0, must-revalidate` | 每次回源，改完立刻生效 |

**发版后老访客看到旧文件怎么办？** `_astro/*` 有哈希自动失效；未哈希的资源（如
`/scripts/theme-init.js`、`/games/balatro/index.html`）最多缓存 1 天 / 立即回源。若要立刻生效，
可以改文件名或加查询串（如 `/scripts/theme-init.js?v=2`）。

### 3.3 不收录页的响应头

`/project/ai`、`/project/femboy` 及其子路径额外返回：

```
X-Robots-Tag: noindex, follow
```

页面自身的 `<meta name="robots">` 也会输出 `noindex`（`works` 集合里 `noindex: true` 驱动），
`robots.txt` 里也 Disallow 了这两条路径——三层保险。

---

## 4. `_redirects`：保留旧链接

文件位置：`public/_redirects`（构建后为 `dist/_redirects`）。

```
/index.html            /                       301
/gallery.html          /gallery                301
/works.html            /works                  301
/project/index.html    /project                301
/project/ai.html       /project/ai             301
/project/femboy.html   /project/femboy         301
/project/balatro.html  /project/balatro        301
```

- 301 是永久重定向，搜索引擎会把旧地址的权重转移到新地址，收藏夹里的旧链接也不会 404。
- 旧 `sitemap.xml` 不再手写，改由构建期端点生成 `dist/sitemap.xml`，同一个地址直接接管，无需重定向。
- `/404.html` 不跳转：Pages 会自动用它处理未知路径。
- 新增页面时如果要改 URL，记得在这里补一条「旧 → 新」的 301。

---

## 5. 自动部署（Git 集成）

1. 在 Dashboard 连接 GitHub 仓库（若旧项目已连接，保持即可）；
2. 确认 Production branch 为 `main`、构建命令 / 输出目录为新值；
3. 本地开发完 `git push origin main`；
4. Pages 收到推送 → 安装依赖 → `npm run build` → 发布 `dist/`；
5. Dashboard → Deployments 里能看到每次构建的状态、日志与预览地址。

**分支预览（Preview deployments）**：推送到非 `main` 分支（或开 PR）会自动生成一个
`<branch>.<project>.pages.dev` 预览地址，适合重构 / 改版时先看效果，不影响正式站。
建议用 `refactor/*` 之类的分支做迁移验证，确认无误再合并 `main`。

**构建失败排查**：

- 日志里 `astro: command not found` → 构建命令没填 `npm run build`；
- 日志里 Node 版本过低 → 设置 `NODE_VERSION=20`；
- 图片处理报错 / OOM → 检查 `src/assets/images/` 是否放入了过大的原图，先本地跑
  `npm run optimize:images` 压缩；
- 页面 404 但构建成功 → Output directory 没填 `dist`。

---

## 6. 回滚

Cloudflare Pages 每次部署都是一个不可变版本，回滚不需要改代码：

1. Dashboard → Workers & Pages → 项目 → **Deployments**；
2. 找到上一个正常的部署，右侧菜单选择 **Rollback to this deployment**；
3. 生产环境立即切回该版本（后续推送新代码会再次走正常构建流程）。

也可以在 Git 侧回滚后重新推送：`git revert <bad-commit>` → push，等自动部署。
单纯回滚 Dashboard 不会改变 Git 历史，适合临时救火；长期修复仍应提交一次 revert。

---

## 7. 为什么不需要 SPA rewrite

常见的 SPA 部署会写：

```
/*  /index.html  200
```

让所有路径都回落到 `index.html`。**本站不要这么做**，原因：

- Astro 输出的是**真实静态 HTML**：`/posts/xxx/` 对应 `dist/posts/xxx/index.html`，
  每个 URL 都有独立页面，不需要前端路由兜底；
- 一旦把未知路径 200 回落到首页，搜索引擎会把大量不存在的 URL 当成有效页收录（软 404），
  排名和站点质量都会受影响；
- 纯静态站点的 404 应该由 Pages 自动使用 `dist/404.html` 返回 **404 状态码**，这也是
  `src/pages/404.astro` 存在的意义；
- 项目没有客户端路由（`/search` 等页面都是独立静态页），不存在「刷新 404」问题。

---

## 8. 用 Wrangler 命令行部署（可选）

不依赖 Git 集成、想手动发布时：

```bash
# 1) 本地构建（需要 Node 20+）
npm install
npm run build

# 2) 部署 dist/ 到名为 web 的 Pages 项目
npx wrangler pages deploy dist --project-name web

# 首次使用需要登录（或设置 CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID 环境变量）
npx wrangler login
```

仓库根目录的 `wrangler.jsonc` 已声明：

```jsonc
{
  "name": "web",
  "compatibility_date": "2026-10-01",
  "pages_build_output_dir": "./dist"
}
```

- `name` 必须与 Cloudflare 上的 Pages 项目名一致，不是 `web` 就改掉；
- 命令行部署会直接覆盖生产环境（或按参数创建预览），不会触发 Git 构建；
- 常用命令：`npx wrangler pages deployment list` 查看部署、`npx wrangler pages project list` 查看项目。

> 推荐仍以 Git 自动部署为主：来源可追溯、有构建日志、可回滚。Wrangler 部署适合紧急修复或
> 没有仓库权限的场景。

---

## 9. 上线检查清单

- [ ] Dashboard：Build command = `npm run build`，Output directory = `dist`，Node 20+；
- [ ] 本地 `npm run build` 通过，`npm run preview` 抽查首页 / 文章 / 画廊 / 项目页 / 404；
- [ ] 旧链接能 301：`/gallery.html`、`/works.html`、`/project/ai.html` 等；
- [ ] `/sitemap.xml`、`/rss.xml`、`/search-index.json` 返回 200；
- [ ] `robots.txt` 中 noindex 页与 `X-Robots-Tag` 生效；
- [ ] 响应头含 CSP（浏览器 DevTools → Network → 任意 HTML → Response Headers）；
- [ ] 自定义域名 `https://buling.qzz.io/` 的 HTTPS 证书状态正常；
- [ ] 手机端（窄屏）导航抽屉、灯箱、搜索结果可正常使用。

---

相关文件：

- `public/_headers` —— 缓存、安全头、CSP、noindex 响应头
- `public/_redirects` —— 旧 URL 301
- `public/robots.txt` —— 抓取规则
- `wrangler.jsonc` —— 命令行部署配置
- `astro.config.mjs` —— `site`、`output: 'static'`、构建格式
