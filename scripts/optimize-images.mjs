#!/usr/bin/env node
/**
 * 图片优化 + LQIP 占位图生成脚本
 * ----------------------------------------------------------------
 * 面向存放原图的 `src/assets/images/`（默认 23 张 jpg，语义化文件名）：
 *
 *   1. 统计每张图的尺寸与体积，输出表格式报告（原始 / 处理后 / 节省）；
 *   2. 默认把「大于 200KB 且尚未备份」的原图压一遍：宽度上限 1920px、mozjpeg
 *      质量 78、清掉 EXIF；PNG 用 palette 压缩；webp 重新编码；
 *   3. 第一次压缩前把原图备份到 `src/assets/images/_original/`（已 gitignore），
 *      已有备份绝不覆盖，保证原图永远找得回来；
 *   4. 为每张图生成 24px 宽的 WebP，转成 base64 data URI 写进
 *      `src/data/image-placeholders.json`（key 为含扩展名的文件名），
 *      供页面做 LQIP 模糊占位，避免图片加载时布局跳动；
 *   5. 输出汇总，说明省了多少体积。
 *
 * 用法：
 *   npm run optimize:images                 # 备份 + 压缩 + 生成占位图
 *   npm run optimize:images -- --dry-run    # 只算不写：预计体积、占位图数量
 *   npm run optimize:images -- --report     # 只读报告：不压缩、不写任何文件
 *   npm run optimize:images -- --force      # 连小图 / 已优化过的图也重新压
 *
 * 注意：`--dry-run` 与 `--report` 完全不落盘（不备份、不覆盖、不写 JSON）。
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG_DIR = path.join(ROOT, 'src/assets/images');
const BACKUP_DIR = path.join(IMG_DIR, '_original');
const DATA_DIR = path.join(ROOT, 'src/data');
const PLACEHOLDER_FILE = path.join(DATA_DIR, 'image-placeholders.json');

/** 支持的输入格式（不区分大小写） */
const SUPPORTED = /\.(jpe?g|png|webp)$/i;

/** 压缩参数：再宽的屏幕也用不到 1920px 以上的图 */
const MAX_WIDTH = 1920;
const JPEG_QUALITY = 78;
const PNG_QUALITY = 82;
const WEBP_QUALITY = 78;
/** 小于这个体积的图默认放过，压了也省不了多少 */
const SKIP_BELOW = 200 * 1024;
/** LQIP 缩略图宽度（够糊就行，base64 越小越好） */
const LQIP_WIDTH = 24;
const LQIP_QUALITY = 30;

/* ---------------------------------------------------------------- 参数解析 */

const argv = new Set(process.argv.slice(2));
const DRY_RUN = argv.has('--dry-run');
const REPORT = argv.has('--report');
const FORCE = argv.has('--force');
const HELP = argv.has('--help') || argv.has('-h');

const UNKNOWN = [...argv].filter(
  (arg) => !['--dry-run', '--report', '--force', '--help', '-h'].includes(arg),
);

const USAGE = `图片优化 + LQIP 占位图生成

用法：
  node scripts/optimize-images.mjs [--dry-run | --report] [--force]

选项：
  --dry-run   只计算并打印预计结果，不写任何文件（含不写 JSON）
  --report    只读报告：列出当前体积、尺寸与占位图覆盖情况，不做压缩
  --force     忽略「已经很小 / 已有备份」的判断，全部重新压一遍
  -h, --help  显示本帮助

输入：src/assets/images/*.{jpg,jpeg,png,webp}
备份：src/assets/images/_original/（已 gitignore，只备份一次、不覆盖）
输出：src/data/image-placeholders.json（24px WebP 的 base64 data URI）`;

/* ------------------------------------------------------------------ 工具 */

const formatSize = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
};

/** 中文按 2 个字符宽度计算，让表格列对齐 */
function displayWidth(text) {
  let width = 0;
  for (const char of String(text)) {
    width +=
      /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/.test(
        char,
      )
        ? 2
        : 1;
  }
  return width;
}

function pad(text, width) {
  const value = String(text);
  return value + ' '.repeat(Math.max(0, width - displayWidth(value)));
}

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

/** 动态 import sharp：没装依赖时给出可操作的提示，而不是一坨堆栈 */
async function loadSharp() {
  try {
    return (await import('sharp')).default;
  } catch {
    console.error(`
✖ 缺少依赖 sharp。

  在仓库根目录执行一次即可：

    npm install

  然后再运行本脚本。
`);
    process.exit(1);
  }
}

/**
 * 打印表格：columns 决定列标题、宽度与对齐；
 * 中文按双宽计算，避免控制台里列错位。
 */
function printTable(rows, columns) {
  const render = (row) =>
    '  ' +
    columns
      .map((column) => {
        const value = row[column.key] ?? '';
        if (column.alignRight) return pad(value, column.width);
        return column.width ? pad(value, column.width) : String(value);
      })
      .join('');

  console.log(render(Object.fromEntries(columns.map((column) => [column.key, column.title]))));
  console.log('  ' + '─'.repeat(86));
  for (const row of rows) console.log(render(row));
  console.log('  ' + '─'.repeat(86));
}

/* ------------------------------------------------------------------ 主流程 */

async function main() {
  if (HELP) {
    console.log(USAGE);
    return;
  }
  if (UNKNOWN.length) {
    console.error(`\n✖ 未知参数：${UNKNOWN.join(' ')}\n\n${USAGE}\n`);
    process.exit(1);
  }
  if (DRY_RUN && REPORT) {
    console.warn('\n! 同时指定了 --dry-run 与 --report，按只读报告处理。');
  }

  const sharp = await loadSharp();
  const readOnly = DRY_RUN || REPORT;

  let entries;
  try {
    entries = await fs.readdir(IMG_DIR, { withFileTypes: true });
  } catch {
    console.error(`
✖ 找不到图片目录：

    ${IMG_DIR}

  请在仓库根目录运行：node scripts/optimize-images.mjs
`);
    process.exit(1);
  }

  const files = entries
    .filter((entry) => entry.isFile() && SUPPORTED.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'en'));

  if (!files.length) {
    console.error(`\n✖ ${path.relative(ROOT, IMG_DIR)} 下没有可处理的图片（jpg / png / webp）。\n`);
    process.exit(1);
  }

  const backupNames = new Set();
  if (await pathExists(BACKUP_DIR)) {
    for (const entry of await fs.readdir(BACKUP_DIR, { withFileTypes: true })) {
      if (entry.isFile()) backupNames.add(entry.name);
    }
  }

  const existingPlaceholders = REPORT ? await readPlaceholders() : [];

  /* -------- 只读报告：不编码、不写盘 -------- */
  if (REPORT) {
    const rows = [];
    let total = 0;
    let placeholderCount = 0;
    for (const name of files) {
      const file = path.join(IMG_DIR, name);
      const stat = await fs.stat(file);
      total += stat.size;
      const meta = await sharp(file, { failOn: 'none' })
        .metadata()
        .catch(() => ({}));
      const dimensions = meta.width && meta.height ? `${meta.width}×${meta.height}` : '读取失败';
      const hasPlaceholder = existingPlaceholders.includes(name);
      if (hasPlaceholder) placeholderCount += 1;
      rows.push({
        name,
        size: formatSize(stat.size),
        dimensions,
        backup: backupNames.has(name) ? '已备份' : '—',
        placeholder: hasPlaceholder ? '有' : '缺',
      });
    }
    printTable(rows, [
      { key: 'name', title: '文件', width: 32 },
      { key: 'size', title: '当前体积', width: 11, alignRight: true },
      { key: 'dimensions', title: '尺寸', width: 14 },
      { key: 'backup', title: '备份', width: 8 },
      { key: 'placeholder', title: '占位图', width: 0 },
    ]);
    console.log(
      `  共 ${files.length} 张，合计 ${formatSize(total)}；已备份 ${backupNames.size} 张。`,
    );
    console.log(
      `  占位图：${placeholderCount}/${files.length} 张有记录（${path.relative(ROOT, PLACEHOLDER_FILE)}）。`,
    );
    console.log('  --report 为只读模式，没有修改任何文件。\n');
    return;
  }

  /* -------- 压缩 + LQIP -------- */
  const rows = [];
  const placeholders = {};
  let beforeTotal = 0;
  let afterTotal = 0;
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const name of files) {
    const file = path.join(IMG_DIR, name);
    const backupFile = path.join(BACKUP_DIR, name);

    try {
      const stat = await fs.stat(file);
      beforeTotal += stat.size;

      const buffer = await fs.readFile(file);
      const meta = await sharp(buffer, { failOn: 'none' }).metadata();
      const dimensions = meta.width && meta.height ? `${meta.width}×${meta.height}` : '?';

      // LQIP：24px 宽 WebP 转 base64，体积通常不到 1KB
      const lqip = await sharp(buffer, { failOn: 'none' })
        .rotate()
        .resize({ width: LQIP_WIDTH, withoutEnlargement: true })
        .webp({ quality: LQIP_QUALITY, effort: 4 })
        .toBuffer();
      placeholders[name] = `data:image/webp;base64,${lqip.toString('base64')}`;

      // 决定这张图要不要重新编码
      const alreadyBackedUp = backupNames.has(name);
      if (!FORCE && alreadyBackedUp) {
        afterTotal += stat.size;
        skipped += 1;
        rows.push({
          name,
          size: formatSize(stat.size),
          after: formatSize(stat.size),
          saved: '—',
          status: `已优化（跳过，${dimensions}）`,
        });
        continue;
      }
      if (!FORCE && stat.size < SKIP_BELOW) {
        afterTotal += stat.size;
        skipped += 1;
        rows.push({
          name,
          size: formatSize(stat.size),
          after: formatSize(stat.size),
          saved: '—',
          status: `跳过（本来就小，${dimensions}）`,
        });
        continue;
      }

      // 在内存里完成压缩；dry-run 时不落盘
      const encoded = await encode(sharp, buffer, name, meta);
      const savedBytes = Math.max(0, stat.size - encoded.length);
      const percent = stat.size > 0 ? Math.round((savedBytes / stat.size) * 100) : 0;

      if (!readOnly) {
        await fs.mkdir(BACKUP_DIR, { recursive: true });
        if (!alreadyBackedUp) {
          await fs.copyFile(file, backupFile);
        }
        await fs.writeFile(file, encoded);
      }

      processed += 1;
      afterTotal += encoded.length;
      rows.push({
        name,
        size: formatSize(stat.size),
        after: formatSize(encoded.length),
        saved: savedBytes > 0 ? `-${percent}%` : '未减少',
        status: DRY_RUN ? '预计压缩' : '已压缩',
      });
    } catch (error) {
      failed += 1;
      const stat = await fs.stat(file).catch(() => ({ size: 0 }));
      afterTotal += stat.size;
      rows.push({
        name,
        size: formatSize(stat.size),
        after: formatSize(stat.size),
        saved: '—',
        status: `失败：${error.message.slice(0, 40)}`,
      });
    }
  }

  printTable(rows, [
    { key: 'name', title: '文件', width: 32 },
    { key: 'size', title: '原始', width: 11, alignRight: true },
    { key: 'after', title: '处理后', width: 11, alignRight: true },
    { key: 'saved', title: '节省', width: 9, alignRight: true },
    { key: 'status', title: '状态', width: 0 },
  ]);

  const percent = beforeTotal > 0 ? Math.round((1 - afterTotal / beforeTotal) * 100) : 0;
  console.log(
    `  合计：${formatSize(beforeTotal)} → ${formatSize(afterTotal)}（省下 ${Math.max(0, percent)}%）`,
  );
  console.log(
    `  处理 ${processed} 张，跳过 ${skipped} 张，失败 ${failed} 张；LQIP 占位图 ${Object.keys(placeholders).length} 张。`,
  );

  if (DRY_RUN) {
    console.log('  --dry-run 模式：没有写入图片、备份或 JSON，以上均为预计结果。\n');
    return;
  }

  /* -------- 写占位图 JSON（原子写入，避免半截文件） -------- */
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const sorted = Object.fromEntries(
      Object.entries(placeholders).sort(([a], [b]) => a.localeCompare(b, 'en')),
    );
    const json = `${JSON.stringify(sorted, null, 2)}\n`;
    const tempFile = `${PLACEHOLDER_FILE}.tmp`;
    await fs.writeFile(tempFile, json, 'utf8');
    await fs.rename(tempFile, PLACEHOLDER_FILE);
    console.log(
      `  占位图已写入 ${path.relative(ROOT, PLACEHOLDER_FILE)}（${formatSize(json.length)}）`,
    );
  } catch (error) {
    console.error(`\n✖ 占位图写入失败：${error.message}\n`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `  原图备份在 ${path.relative(ROOT, BACKUP_DIR)}/（已 gitignore，只备份一次、不覆盖）。`,
  );
  console.log('  提示：构建期 Astro 仍会基于这里的原图生成多尺寸 AVIF/WebP，');
  console.log('        build 时若发现占位图 key 缺失，重新运行本脚本即可。\n');
}

/** 按扩展名选择编码参数，返回压缩后的 Buffer */
async function encode(sharp, buffer, name, meta) {
  const pipeline = () => sharp(buffer, { failOn: 'none' }).rotate();
  const resized = (width) =>
    pipeline().resize({ width: Math.min(width, MAX_WIDTH), withoutEnlargement: true });
  const width = meta.width || MAX_WIDTH;

  if (/\.png$/i.test(name)) {
    return resized(width)
      .png({ compressionLevel: 9, palette: true, quality: PNG_QUALITY })
      .toBuffer();
  }
  if (/\.webp$/i.test(name)) {
    return resized(width).webp({ quality: WEBP_QUALITY, effort: 5 }).toBuffer();
  }
  return resized(width)
    .jpeg({
      quality: JPEG_QUALITY,
      mozjpeg: true,
      progressive: true,
      chromaSubsampling: '4:2:0',
    })
    .toBuffer();
}

/** 读取已有占位图 JSON 的 key 列表；文件不存在或格式坏了都按空处理 */
async function readPlaceholders() {
  try {
    const raw = await fs.readFile(PLACEHOLDER_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Object.keys(parsed);
  } catch {
    return [];
  }
}

main().catch((error) => {
  console.error(`\n✖ 脚本执行失败：${error.stack ?? error.message}\n`);
  process.exit(1);
});
