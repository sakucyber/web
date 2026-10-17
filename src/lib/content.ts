import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export type Work = CollectionEntry<'works'>;

/** 按日期倒序的已发布文章 */
export async function getPosts(includeDrafts = false): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => includeDrafts || !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** 按 order、再按日期倒序的已发布作品 */
export async function getWorks(): Promise<Work[]> {
  const works = await getCollection('works');
  return works.sort(
    (a, b) => a.data.order - b.data.order || b.data.date.getTime() - a.data.date.getTime(),
  );
}

export function getPostHref(post: Post): string {
  return `/posts/${post.id}/`;
}

export function getWorkHref(work: Work): string {
  const href = work.data.href;
  return href.startsWith('/') && !href.endsWith('/') ? `${href}/` : href;
}

export function getFeaturedPosts(posts: Post[], limit = 3): Post[] {
  const featured = posts.filter((post) => post.data.featured);
  const rest = posts.filter((post) => !post.data.featured);
  return [...featured, ...rest].slice(0, limit);
}

export function getFeaturedWorks(works: Work[], limit = 2): Work[] {
  const featured = works.filter((work) => work.data.featured);
  const rest = works.filter((work) => !work.data.featured);
  return [...featured, ...rest].slice(0, limit);
}

export interface TagSummary {
  tag: string;
  count: number;
}

export function getTags(posts: Post[]): TagSummary[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
}

export interface CategorySummary {
  category: string;
  count: number;
}

export function getCategories(posts: Post[]): CategorySummary[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    counts.set(post.data.category, (counts.get(post.data.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category, 'zh-CN'));
}

export function getTagHref(tag: string): string {
  return `/tags/${encodeURIComponent(tag)}/`;
}

export function getCategoryHref(category: string): string {
  return `/categories/${encodeURIComponent(category)}/`;
}

export interface ReadingTime {
  minutes: number;
  label: string;
}

/**
 * 粗略阅读时长：中文按 350 字/分钟，英文按 220 词/分钟。
 * 构建期算好，避免运行时统计。
 */
export function getReadingTime(body: string | undefined): ReadingTime {
  const text = body ?? '';
  const cjk = (text.match(/[\u3400-\u9fff\uf900-\ufaff]/g) ?? []).length;
  const words = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[\u3400-\u9fff\uf900-\ufaff]/g, ' ')
    .split(/\s+/)
    .filter((word) => /[a-z0-9]/i.test(word)).length;
  const minutes = Math.max(1, Math.round(cjk / 350 + words / 220));
  return { minutes, label: `约 ${minutes} 分钟` };
}

export interface AdjacentPosts {
  newer?: Post;
  older?: Post;
}

/** posts 已按日期倒序：index-1 更新，index+1 更旧 */
export function getAdjacentPosts(posts: Post[], id: string): AdjacentPosts {
  const index = posts.findIndex((post) => post.id === id);
  if (index === -1) return {};
  return {
    newer: posts[index - 1],
    older: posts[index + 1],
  };
}

/** 站内项目页的元数据（通过 works 集合的 href 反查；忽略尾部斜杠差异） */
export async function getWorkByHref(href: string): Promise<Work | undefined> {
  const normalize = (value: string) => value.replace(/\/+$/, '');
  const works = await getWorks();
  return works.find((work) => normalize(work.data.href) === normalize(href));
}
