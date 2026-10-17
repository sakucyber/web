# buling 的个人小窝

线上地址：**https://buling.qzz.io/**

纯静态个人站，无构建步骤，直接部署在 **Cloudflare Pages**。
推送到 `main` 分支即自动发布。

## 目录结构

```
.
├── index.html            首页（Hero / 关于 / 作品 / 画廊 / 社交）
├── gallery.html          图片画廊
├── works.html            作品列表
├── 404.html              自定义 404（Pages 自动识别根目录 404.html）
├── project/
│   ├── index.html        项目中心
│   ├── ai.html           AI贴吧老哥（聊天小玩具）
│   ├── femboy.html       年度男娘程度总结器（自带配色切换）
│   └── balatro*          小丑牌，独立小项目
├── assets/
│   ├── theme.css         全站共用样式（设计变量 / 导航 / 灯箱 / 动画）
│   └── theme.js          全站共用脚本（主题 / 滚动 / 灯箱 / 光标）
├── images/               图片资源
├── scripts/
│   └── optimize-images.mjs   图片体积优化脚本
├── _headers              Cloudflare Pages 响应头（缓存 / 安全头）
└── robots.txt
```

改样式优先改 `assets/theme.css`，改交互优先改 `assets/theme.js`——
这两份是全站共用的，改一次所有页面都生效。页面上确实只属于某一页的样式，
才写在那个 HTML 的 `<style>` 里。

## 本地预览

```bash
npx serve .          # 或者 python -m http.server 8080
```

直接用 `file://` 打开会因为绝对路径（`/assets/...`）失效，所以起个本地服务。

## 图片优化（重要）

仓库里 23 张 JPG 合计约 93MB，单张最大 8.9MB，是首屏慢的主要原因。
脚本会就地把它压到合理尺寸和体积，**HTML 不用改任何路径**：

```bash
npm i sharp                                  # 只装一次
node scripts/optimize-images.mjs --dry-run   # 先看会怎么处理
node scripts/optimize-images.mjs             # 真正执行
```

默认规则：宽度上限 1920px、JPEG 质量 78、mozjpeg 编码、清掉 EXIF。
原图会备份到 `images/_original/`（已 gitignore），另存一份 WebP 到 `images/webp/`。

加 `--thumbs` 还会生成 `images/thumb/*.webp`（600×600 方图），
可以用来给画廊格子做缩略图，进一步减少首屏流量。

## 新增一个项目页

1. 在 `project/` 下新建 HTML，套用任意一个现有页面的骨架；
2. `<head>` 里引 `/assets/theme.css`，`</body>` 前引 `/assets/theme.js defer`；
3. 在 `works.html` 和 `project/index.html` 各加一张卡片。

## 部署

Cloudflare Pages 已绑定仓库，推 `main` 自动构建。
构建命令留空、输出目录填 `/`（纯静态，没有构建步骤）。

`_headers` 里给 `/assets/*` 和 `/images/*` 设了缓存，修改这两处内容后
如果想让老访客立刻看到更新，把引用改成 `theme.css?v=2` 这种带版本号的形式。

## SEO

`sitemap.xml` 已按线上域名生成；新增页面记得往里加一条。
要在 Google 收录得更快，去 [Google Search Console](https://search.google.com/search-console)
提交 `https://buling.qzz.io/sitemap.xml` 即可。
`project/ai.html` 和 `project/femboy.html` 是小玩具，已在 robots.txt 和页面 meta 里都设了不收录。
