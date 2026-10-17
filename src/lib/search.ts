import { STATIC_PAGES } from '@/config/site';
import { getPostHref, getWorkHref, type Post, type Work } from '@/lib/content';
import { toISODate } from '@/lib/format';

export type SearchDocType = 'page' | 'post' | 'work';

export interface SearchDoc {
  type: SearchDocType;
  title: string;
  description: string;
  url: string;
  tags: string[];
  category?: string;
  date?: string;
  emoji?: string;
}

/**
 * 构建期生成搜索索引（/search-index.json）。
 * 只包含标题、摘要、标签等短文本，体积很小；正文不塞进去，
 * 避免搜索页首屏下载整站文章。
 */
export function buildSearchIndex(posts: Post[], works: Work[]): SearchDoc[] {
  const postDocs: SearchDoc[] = posts.map((post) => ({
    type: 'post',
    title: post.data.title,
    description: post.data.description,
    url: getPostHref(post),
    tags: post.data.tags,
    category: post.data.category,
    date: toISODate(post.data.date),
  }));

  const workDocs: SearchDoc[] = works.map((work) => ({
    type: 'work',
    title: work.data.title,
    description: work.data.description,
    url: getWorkHref(work),
    tags: [...work.data.tags, ...work.data.stack],
    emoji: work.data.emoji,
    date: toISODate(work.data.date),
  }));

  const pageDocs: SearchDoc[] = STATIC_PAGES.filter((page) => page.url !== '/search').map(
    (page) => ({
      type: 'page',
      title: page.title,
      description: page.description,
      url: page.url,
      tags: [],
    }),
  );

  return [...postDocs, ...workDocs, ...pageDocs];
}
