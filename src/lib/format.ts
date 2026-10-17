/** 统一的日期格式化：站点语言为中文，输出如 2026年10月17日 */
export function formatDate(date: Date, style: 'long' | 'short' = 'long'): string {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: style === 'long' ? 'long' : '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  });
  return formatter.format(date);
}

/** 供 <time datetime=""> 使用的 ISO 日期 */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** 文件名 / slug 里不能用空格和特殊符号 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}
