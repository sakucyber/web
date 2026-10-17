---
title: "把博客搬进 Astro：从纯静态 HTML 到内容集合"
description: "旧站是手写 HTML，加一篇文章要复制一整页；这次用 Astro 5 重做，把内容收回 Markdown，把图片和 SEO 交给构建。"
date: 2026-10-17
category: 技术
tags: ["Astro", "建站", "前端"]
cover: starry-sky-girl
featured: true
---

之前这个小窝是纯静态 HTML：根目录放着 `index.html`、`works.html`、`gallery.html`，项目页在 `project/` 下面，样式和脚本共用 `assets/theme.css` 与 `assets/theme.js`。没有构建步骤，推到 `main` 分支，Cloudflare Pages 就自动发布——省心是真的省心。

但写内容越来越别扭。加一篇文章要复制一整个 HTML 文件，导航、字体、meta 标签也要跟着改；想统一换个页脚，得把好几个文件翻一遍。于是这次干脆重构：用 Astro 5 重写，让页面回到模板，让内容回到 Markdown。✨

## 为什么是 Astro

选择它主要看中三点：

- **默认零运行时**：最终输出还是静态 HTML，和以前一样能直接丢到 Cloudflare Pages；
- **内容集合**：Markdown 文件放进 `src/content/posts/`，构建时自动校验 frontmatter；
- **Markdown 优先**：文章和作品共用同一套内容层，写起来和记笔记差不多；
- **图片管线**：`src/assets/images/` 里的图交给 sharp，构建期生成多尺寸、AVIF/WebP 的 `srcset`，不用再手动跑压缩脚本。

> 一句话总结：以前是「手写网页」，现在是「写内容，剩下的交给构建」。

## 新的目录结构

重构后的源码大致是这样分工的：

| 目录 | 作用 |
| --- | --- |
| `src/content/posts/` | 文章 Markdown，一篇一个文件 |
| `src/content/works/` | 作品卡片数据 |
| `src/pages/` | 路由，比如 `/posts`、`/works`、`/gallery` |
| `src/layouts/` | 全站布局与 SEO 模板 |
| `src/components/` | 导航、卡片、灯箱等组件 |
| `src/config/site.ts` | 站点信息、导航、社交链接 |

内容集合的 schema 大概是这个意思（实际以仓库里的 `content.config.ts` 为准）：

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.enum(['技术', '项目', '生活']),
    tags: z.array(z.string()),
    cover: z.string(),
    featured: z.boolean().default(false),
  }),
});
```

字段定死之后，漏写 `description` 或者把日期写成 `2026/10/17` 都会在构建时报错，比上线后才发现好太多。

## 图片与旧链接

### 图片管线

旧站 23 张 JPG 合计约 93MB，首屏慢得明显，之前靠 `scripts/optimize-images.mjs` 压到 1920px、质量 78。新站保留图片 key（比如 `starry-sky-girl`、`card-girl`），构建时自动生成响应式图片，HTML 里再也不用贴一长串路径。

### 旧地址怎么办

新站的路由尽量和旧地址对应：`gallery.html` 对应 `/gallery`，`works.html` 对应 `/works`，`project/*.html` 对应 `/project/*`。改链接是小事，让收藏夹里的页面 404 才是大事——所以后面还得把旧链接挨个检查一遍。🔗

## 还没做完的

- 站内搜索还没接上索引；
- RSS 还没接上；
- 老文章还没全部迁进新集合。

不过没关系，重构本来就是个持续的过程。最花时间的其实不是写新页面，而是把旧内容的细节一条条对齐：一张图的 alt、一个链接的 rel、一段 meta 描述，都得重新检查。先把骨架立住，再一篇篇把内容搬进来——这大概就是「慢慢来，比较快」吧。🐢

（源码在 [GitHub](https://github.com/sakucyber/)，欢迎围观～）
