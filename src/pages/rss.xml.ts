import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE } from '@/config/site';
import { getPostHref, getPosts } from '@/lib/content';

/**
 * RSS 订阅端点：/rss.xml
 * ----------------------------------------------------------------
 * 只收录文章（作品是站内小玩具，不进 feed）。
 * 每条带摘要、作者与分类 / 标签，站点地址优先使用 astro.config 的 site。
 */
export const GET: APIRoute = async (context) => {
  const posts = await getPosts();

  return rss({
    title: `${SITE.title} · 文章`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: getPostHref(post),
      author: `${SITE.email} (${SITE.author})`,
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: `<language>${SITE.lang}</language>`,
  });
};
