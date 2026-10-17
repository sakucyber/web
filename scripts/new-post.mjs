#!/usr/bin/env node
/**
 * 新建文章脚手架
 * ----------------------------------------------------------------
 * 按 `src/content.config.ts` 里 posts 集合的 schema 生成一篇文章，
 * 避免手写 frontmatter 时漏字段 / 日期格式写错导致 `npm run build` 失败。
 *
 * 用法：
 *   node scripts/new-post.mjs "把博客搬进 Astro" --category 技术 --tags Astro,建站
 *   node scripts/new-post.mjs "标题" --desc "一句话摘要" --cover starry-sky-girl
 *   node scripts/new-post.mjs                      # 交互式，逐项提问
 *   node scripts/new-post.mjs "标题" --dry-run     # 只预览，不写文件
 *
 * 可选参数：
 *   --desc <文本>         description（必填字段，不传则交互询问 / 用占位文案）
 *   --category <分类>     category，默认「随笔」
 *   --tags <a,b>          tags，逗号分隔，默认空
 *   --cover <图片key>     cover，见 src/lib/images.ts，默认 avatar
 *   --date <YYYY-MM-DD>   date，默认今天（Asia/Shanghai）
 *   --featured            featured: true（默认 false）
 *   --draft               draft: true（默认 false，草稿不会出现在列表 / RSS）
 *   --slug <英文短名>     文件名里的短名，默认由标题 slugify 得到
 *   --dry-run             只打印将要写入的路径和内容，不落盘
 *   --out-dir <目录>      输出目录（默认 src/content/posts，主要给测试用）
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = path.join(ROOT, 'src/content/posts');
const IMAGES_TS = path.join(ROOT, 'src/lib/images.ts');
const DEFAULT_COVER = 'avatar';
const FALLBACK_DESCRIPTION = '这篇还缺一句简介，先占个位。';
const MAX_TITLE = 120;
const MAX_DESC = 300;

/* ---------------------------------------------------------------- 参数解析 */

/** 解析 `--key value` / `--key=value` / `--flag` 形式的参数 */
function parseArgs(argv) {
  const options = { positional: [] };
  const valueFlags = new Set(['desc', 'category', 'tags', 'cover', 'date', 'slug', 'out-dir']);
  const booleanFlags = new Set(['featured', 'draft', 'dry-run', 'help']);

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      options.positional.push(arg);
      continue;
    }
    const body = arg.slice(2);
    const eq = body.indexOf('=');
    const key = eq === -1 ? body : body.slice(0, eq);
    if (booleanFlags.has(key)) {
      options[key] = true;
      continue;
    }
    if (valueFlags.has(key)) {
      if (eq !== -1) {
        options[key] = body.slice(eq + 1);
      } else {
        const next = argv[i + 1];
        if (next === undefined || next.startsWith('--')) {
          throw new Error(`参数 --${key} 缺少取值`);
        }
        options[key] = next;
        i += 1;
      }
      continue;
    }
    throw new Error(`未知参数：--${key}`);
  }
  return options;
}

/* ------------------------------------------------------------------ 工具 */

const USAGE = `用法：node scripts/new-post.mjs "标题" [选项]
                   node scripts/new-post.mjs            # 交互式

选项：
  --desc <文本>        description（默认用占位文案）
  --category <分类>    category，默认「随笔」
  --tags <a,b>         tags，逗号分隔
  --cover <图片key>    cover，默认 avatar（可选值见 src/lib/images.ts）
  --date <YYYY-MM-DD>  date，默认今天（Asia/Shanghai）
  --featured           featured: true
  --draft              draft: true
  --slug <短名>        文件名里的短名（默认由标题生成）
  --dry-run            只预览，不写文件
  -h, --help           显示本帮助`;

function fail(message, code = 1) {
  console.error(`\n✖ ${message}\n`);
  process.exit(code);
}

/** 去掉首尾空白后截断，保证不超过 schema 的 max() */
function clamp(text, max) {
  const value = String(text ?? '').trim();
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/** 与 src/lib/format.ts 的 slugify 保持一致的规则 */
function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

/** Asia/Shanghai 时区的今天，避免服务器时区不同写出昨天的日期 */
function todayInShanghai() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function isValidDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  // 用 UTC 字段回读，避免本地时区把日期前后挪一天
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** 读取 src/lib/images.ts，拿到合法的图片 key，用来校验 cover */
async function readImageKeys() {
  try {
    const source = await fs.readFile(IMAGES_TS, 'utf8');
    const match = source.match(/export const images = \{([\s\S]*?)\}\s*as const/);
    if (!match) return [];
    return [...match[1].matchAll(/^\s*'([a-z0-9-]+)':\s*\w+,/gm)].map((item) => item[1]);
  } catch {
    return [];
  }
}

/** YAML 双引号字符串；JSON 字符串在 YAML 里同样合法 */
function yamlString(value) {
  return JSON.stringify(String(value));
}

/** 生成 frontmatter + 正文模板 */
function buildMarkdown(data) {
  const tags = data.tags.length ? `[${data.tags.map(yamlString).join(', ')}]` : '[]';
  const lines = [
    '---',
    `title: ${yamlString(data.title)}`,
    `description: ${yamlString(data.description)}`,
    `date: ${data.date}`,
    `category: ${yamlString(data.category)}`,
    `tags: ${tags}`,
    `cover: ${yamlString(data.cover)}`,
    `featured: ${data.featured}`,
    `draft: ${data.draft}`,
    '---',
    '',
    '在这里写一段开场白，说明这篇文章要聊什么。',
    '',
    '## 小标题',
    '',
    '正文段落。可以自由使用列表、引用、表格和代码块：',
    '',
    '```ts',
    'const hello = (name: string) => `你好，${name}`;',
    '```',
    '',
    '## 小结',
    '',
    '收个尾，写写这篇留下的收获或下一步计划。',
    '',
  ];
  return lines.join('\n');
}

/* ------------------------------------------------------------------ 交互 */

async function askInteractive(defaults, imageKeys) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = async (question, fallback = '') => {
    const suffix = fallback ? `（默认 ${fallback}）` : '';
    const answer = (await rl.question(`${question}${suffix}：`)).trim();
    return answer || fallback;
  };

  try {
    const title = await ask('文章标题');
    if (!title) throw new Error('标题不能为空');

    const description = await ask('一句话简介', `${title} 的简短介绍，待补充。`);
    const category = await ask('分类（技术 / 项目 / 生活 / 随笔）', defaults.category);
    const rawTags = await ask('标签（逗号分隔，可留空）', defaults.tags.join(','));
    const cover = await ask(
      `封面图片 key（${imageKeys.slice(0, 5).join(' / ')} …）`,
      defaults.cover,
    );

    return {
      ...defaults,
      title,
      description,
      category,
      tags: rawTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      cover,
    };
  } finally {
    rl.close();
  }
}

/* ------------------------------------------------------------------ 主流程 */

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    fail(error.message);
  }

  if (options.help) {
    console.log(USAGE);
    return;
  }

  const imageKeys = await readImageKeys();
  const defaults = {
    title: '',
    description: FALLBACK_DESCRIPTION,
    category: '随笔',
    tags: [],
    cover: DEFAULT_COVER,
    date: todayInShanghai(),
    featured: Boolean(options.featured),
    draft: Boolean(options.draft),
  };

  let input;

  // 交互式：没有标题且没有传任何值参数时，逐项提问
  const hasValueArgs = ['desc', 'category', 'tags', 'cover', 'date', 'slug'].some(
    (key) => options[key] !== undefined,
  );

  if (!options.positional.length) {
    if (!process.stdin.isTTY) {
      console.error(USAGE);
      fail('非交互环境下必须提供标题，例如：node scripts/new-post.mjs "标题"');
    }
    if (hasValueArgs) {
      fail('提供了参数但缺少标题');
    }
    input = await askInteractive(defaults, imageKeys);
  } else {
    input = {
      ...defaults,
      title: options.positional.join(' ').trim(),
      description: options.desc ?? defaults.description,
      category: options.category ?? defaults.category,
      tags:
        options.tags === undefined
          ? defaults.tags
          : options.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
      cover: options.cover ?? defaults.cover,
      featured: Boolean(options.featured),
      draft: Boolean(options.draft),
    };
  }

  /* -------- 校验 -------- */
  input.title = clamp(input.title, MAX_TITLE);
  if (!input.title) fail('标题不能为空');

  input.description = clamp(input.description, MAX_DESC) || FALLBACK_DESCRIPTION;
  if (!input.description) fail('description 不能为空');

  input.category = input.category.trim() || '随笔';
  input.tags = [...new Set(input.tags.map((tag) => tag.trim()).filter(Boolean))];

  if (options.date !== undefined) {
    if (!isValidDate(options.date)) fail(`日期格式不对：${options.date}，应为 YYYY-MM-DD`);
    input.date = options.date;
  }

  if (imageKeys.length && !imageKeys.includes(input.cover)) {
    const hint = `可用的 cover 见 src/lib/images.ts（例如 ${imageKeys.slice(0, 3).join(' / ')}）`;
    // 默认值异常时回退，用户显式传错则直接报错，避免带着坏 key 进构建
    if (options.cover !== undefined || !imageKeys.includes(DEFAULT_COVER)) {
      fail(`未知的 cover key：${input.cover}。${hint}`);
    }
    console.warn(`! cover「${input.cover}」不在图片注册表里，已回退为 ${DEFAULT_COVER}`);
    input.cover = DEFAULT_COVER;
  }

  const slug = (options.slug ?? slugify(input.title)).replace(/^\/+|\/+$/g, '');
  if (!slug) fail('无法从标题生成文件名，请用 --slug 指定一个短名');
  if (!/^[\p{L}\p{N}-]+$/u.test(slug)) {
    fail(`--slug 只能包含字母、数字、连字符：${slug}`);
  }

  const outDir = options['out-dir'] ? path.resolve(ROOT, options['out-dir']) : POSTS_DIR;
  const fileName = `${input.date}-${slug}.md`;
  const filePath = path.join(outDir, fileName);
  const markdown = buildMarkdown(input);
  const dryRun = Boolean(options['dry-run']);

  /* -------- 写入（wx 保证绝不覆盖已有文件） -------- */
  if (dryRun) {
    console.log('\n[dry-run] 不会写入任何文件。');
    console.log(`目标文件：${path.relative(ROOT, filePath)}`);
    console.log(`\n${markdown}`);
    return;
  }

  try {
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(filePath, markdown, { encoding: 'utf8', flag: 'wx' });
  } catch (error) {
    if (error.code === 'EEXIST') {
      fail(`文件已存在，拒绝覆盖：${path.relative(ROOT, filePath)}`);
    }
    fail(`写入失败：${error.message}`);
  }

  const relative = path.relative(ROOT, filePath).replaceAll('\\', '/');
  console.log(`\n✔ 已创建 ${relative}\n`);
  console.log('接下来可以：');
  console.log('  1. npm run dev                          # 本地预览，改到满意为止');
  console.log('  2. 编辑 frontmatter 的 cover / tags     # cover 取值见 src/lib/images.ts');
  console.log('  3. npm run check                        # 类型与内容校验');
  console.log('  4. git add . && git commit -m "post: 新文章标题"');
  console.log('  5. 推送到 main，Cloudflare Pages 自动发布（RSS 与 sitemap 会自动更新）\n');
}

main().catch((error) => {
  console.error(`\n✖ ${error.stack ?? error.message}\n`);
  process.exit(1);
});
