import type { APIRoute } from 'astro';
import { getPosts, getWorks } from '@/lib/content';
import { buildSearchIndex } from '@/lib/search';

/**
 * 搜索索引静态端点：/search-index.json
 * ----------------------------------------------------------------
 * 构建期生成，只含标题 / 摘要 / 标签 / 分类等短文本，
 * 由 src/scripts/search.ts 在搜索页按需 fetch。
 */
export const GET: APIRoute = async () => {
  const [posts, works] = await Promise.all([getPosts(), getWorks()]);
  const index = buildSearchIndex(posts, works);

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
