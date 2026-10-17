import type { APIRoute } from 'astro';
import { SITE, STATIC_PAGES } from '@/config/site';
import {
  getCategories,
  getCategoryHref,
  getPosts,
  getTags,
  getTagHref,
  getWorkHref,
  getWorks,
} from '@/lib/content';
import { toISODate } from '@/lib/format';

/**
 * 手写 sitemap：/sitemap.xml
 * ----------------------------------------------------------------
 * 收录：一级静态页（排除 /search）+ 全部文章 + 标签页 + 分类页 + 可收录作品页。
 * 不收录：noindex 的小玩具（work.data.noindex）与站外链接；
 * /#about 这类锚点归一到首页，避免重复 URL。
 */
interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
}

const escapeXml = (value: string): string =>
  value.replace(/[&<>'"]/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return char;
    }
  });

const latestOf = (dates: Date[]): Date | undefined =>
  dates.reduce<Date | undefined>(
    (latest, date) => (!latest || date > latest ? date : latest),
    undefined,
  );

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL(SITE.url);
  const posts = await getPosts();
  const works = await getWorks();
  const tags = getTags(posts);
  const categories = getCategories(posts);

  const latestPostDate = posts.length > 0 ? posts[0].data.date : undefined;
  const latestWorkDate = latestOf(works.map((work) => work.data.date));
  const entries: SitemapEntry[] = [];
  const seen = new Set<string>();

  const add = (
    path: string,
    options: { lastmod?: Date; changefreq?: SitemapEntry['changefreq']; priority?: string } = {},
  ): void => {
    const loc = new URL(path, base).href;
    if (seen.has(loc)) return;
    seen.add(loc);
    entries.push({
      loc,
      ...(options.lastmod ? { lastmod: toISODate(options.lastmod) } : {}),
      changefreq: options.changefreq ?? 'weekly',
      priority: options.priority ?? '0.6',
    });
  };

  // 1. 一级静态页：/search 不收录，锚点 URL 归一到页面本体
  for (const page of STATIC_PAGES) {
    if (page.url === '/search') continue;
    const path = page.url.split('#')[0] || '/';
    const lastmod =
      path === '/posts' ? latestPostDate : path === '/works' ? latestWorkDate : undefined;
    add(path, { lastmod, changefreq: 'monthly', priority: path === '/' ? '1.0' : '0.8' });
  }

  // 2. 标签总览页（不在 STATIC_PAGES 里，单独补）
  add('/tags', { lastmod: latestPostDate, changefreq: 'weekly', priority: '0.5' });

  // 3. 文章详情页，lastmod 用发布日期（有 updated 则用 updated）
  for (const post of posts) {
    add(`/posts/${post.id}/`, {
      lastmod: post.data.updated ?? post.data.date,
      changefreq: 'monthly',
      priority: '0.7',
    });
  }

  // 4. 标签页：lastmod 取该标签下最新文章
  for (const { tag } of tags) {
    const tagPosts = posts.filter((post) => post.data.tags.includes(tag));
    add(getTagHref(tag), {
      lastmod: latestOf(tagPosts.map((post) => post.data.updated ?? post.data.date)),
      changefreq: 'weekly',
      priority: '0.5',
    });
  }

  // 5. 分类页：lastmod 取该分类下最新文章
  for (const { category } of categories) {
    const categoryPosts = posts.filter((post) => post.data.category === category);
    add(getCategoryHref(category), {
      lastmod: latestOf(categoryPosts.map((post) => post.data.updated ?? post.data.date)),
      changefreq: 'weekly',
      priority: '0.5',
    });
  }

  // 6. 作品详情页：排除 noindex 的小玩具与站外链接
  for (const work of works) {
    if (work.data.noindex) continue;
    const href = getWorkHref(work);
    if (!href.startsWith('/')) continue;
    add(href, { lastmod: work.data.date, changefreq: 'monthly', priority: '0.6' });
  }

  const urls = entries
    .map((entry) =>
      [
        '  <url>',
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : '',
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
