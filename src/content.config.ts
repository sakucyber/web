import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 内容集合定义
 * ----------------------------------------------------------------
 * 使用 Astro Content Layer（glob loader）+ Zod schema：
 *  - 构建期校验 frontmatter，字段写错直接 build 失败，不会带着坏数据上线；
 *  - 文章 / 作品全部是 Markdown，内容与表现分离；
 *  - cover 存的是 `src/lib/images.ts` 里的图片 key，而不是裸路径。
 */

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(300),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.string().min(1).default('随笔'),
    tags: z.array(z.string()).default([]),
    /** 图片 key，见 src/lib/images.ts */
    cover: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    title: z.string().min(1).max(80),
    description: z.string().min(1).max(300),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    cover: z.string(),
    emoji: z.string().default('✨'),
    /** 站内项目页地址，如 /project/ai */
    href: z.string(),
    linkLabel: z.string().default('去看看'),
    featured: z.boolean().default(false),
    /** 排序，越小越靠前 */
    order: z.number().default(99),
    status: z.string().default('在线'),
    stack: z.array(z.string()).default([]),
    /** 小玩具页面不收录 */
    noindex: z.boolean().default(false),
    /** 可选：仓库源码地址 */
    repo: z.string().url().optional(),
  }),
});

export const collections = { posts, works };
