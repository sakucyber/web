#!/usr/bin/env node
/**
 * 图片体积优化脚本
 * -------------------------------------------------------------
 * 仓库里 23 张 JPG 合计约 93MB，单张最大 8.9MB，是本站最大的性能瓶颈。
 * 这个脚本会：
 *   1. 把超过 MAX_WIDTH 的图缩到 MAX_WIDTH（不放大）；
 *   2. 用 mozjpeg 重新编码，去掉元数据（EXIF 里有手机型号/GPS，顺手清掉）；
 *   3. 就地覆盖 images/ 下的原文件 —— 所以 HTML / CSS 里的路径完全不用改；
 *   4. 额外输出 images/webp/*.webp（体积通常再小 30%~50%，供以后切换用）；
 *   5. 原始文件先备份到 images/_original/（已被 .gitignore 忽略，git 历史里也还在）。
 *
 * 用法：
 *   npm i sharp          # 只装一次
 *   node scripts/optimize-images.mjs            # 默认就地优化
 *   node scripts/optimize-images.mjs --dry-run  # 只看会怎么处理，不落盘
 *   node scripts/optimize-images.mjs --force    # 连已经很小的小图也重编码
 *   node scripts/optimize-images.mjs --thumbs   # 额外生成 images/thumb/*.webp（600px 方图用）
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG_DIR = path.join(ROOT, 'images');
const BACKUP_DIR = path.join(IMG_DIR, '_original');
const WEBP_DIR = path.join(IMG_DIR, 'webp');
const THUMB_DIR = path.join(IMG_DIR, 'thumb');

const MAX_WIDTH = 1920;   // 再宽的屏幕也用不到更宽的图
const JPEG_QUALITY = 78;  // 肉眼几乎无损，体积能掉一大半
const WEBP_WIDTH = 1600;
const WEBP_QUALITY = 72;
const THUMB_WIDTH = 600;
const THUMB_HEIGHT = 600;
const SKIP_BELOW = 200 * 1024; // 小于 200KB 的图默认放过

const argv = new Set(process.argv.slice(2));
const DRY = argv.has('--dry-run');
const FORCE = argv.has('--force');
const THUMBS = argv.has('--thumbs');

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('\n缺少依赖 sharp。先执行：\n\n  npm i sharp\n\n然后再跑这个脚本。\n');
  process.exit(1);
}

const kb = (n) => (n / 1024).toFixed(0) + ' KB';
const mb = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';
const fmt = (n) => (n >= 1024 * 1024 ? mb(n) : kb(n));

async function ensureDir(dir) {
  if (DRY) return;
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  let entries;
  try {
    entries = await fs.readdir(IMG_DIR, { withFileTypes: true });
  } catch {
    console.error(`找不到目录：${IMG_DIR}`);
    process.exit(1);
  }

  const files = entries
    .filter((e) => e.isFile() && /\.(jpe?g|png)$/i.test(e.name))
    .map((e) => path.join(IMG_DIR, e.name));

  if (!files.length) {
    console.log('images/ 下没有可处理的图片。');
    return;
  }

  await ensureDir(BACKUP_DIR);
  await ensureDir(WEBP_DIR);
  if (THUMBS) await ensureDir(THUMB_DIR);

  let beforeTotal = 0;
  let afterTotal = 0;
  const rows = [];

  for (const file of files) {
    const name = path.basename(file);
    const stat = await fs.stat(file);
    beforeTotal += stat.size;

    if (!FORCE && stat.size < SKIP_BELOW) {
      afterTotal += stat.size;
      rows.push([name, stat.size, stat.size, '跳过（本来就小）']);
      continue;
    }

    try {
      const buf = await fs.readFile(file);
      const meta = await sharp(buf, { failOn: 'none' }).metadata();
      const isPng = /\.png$/i.test(name);
      const width = meta.width || MAX_WIDTH;
      const resized = () =>
        sharp(buf, { failOn: 'none' })
          .rotate()
          .resize({ width: Math.min(width, MAX_WIDTH), withoutEnlargement: true });

      const finalBuf = isPng
        ? await resized().png({ compressionLevel: 9, palette: true, quality: 82 }).toBuffer()
        : await resized()
            .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true, chromaSubsampling: '4:2:0' })
            .toBuffer();

      // WebP 副本（体积通常再小 30%~50%，供以后切换 <picture> 使用）
      const webpBuf = await sharp(buf, { failOn: 'none' })
        .rotate()
        .resize({ width: Math.min(width, WEBP_WIDTH), withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY, effort: 5 })
        .toBuffer();

      if (!DRY) {
        // 备份原始文件（只备一次）
        const backupPath = path.join(BACKUP_DIR, name);
        try {
          await fs.access(backupPath);
        } catch {
          await fs.copyFile(file, backupPath);
        }

        await fs.writeFile(file, finalBuf);
        await fs.writeFile(
          path.join(WEBP_DIR, name.replace(/\.(jpe?g|png)$/i, '.webp')),
          webpBuf
        );

        if (THUMBS) {
          await sharp(buf, { failOn: 'none' })
            .rotate()
            .resize({ width: THUMB_WIDTH, height: THUMB_HEIGHT, fit: 'cover', position: 'centre' })
            .webp({ quality: 70, effort: 5 })
            .toFile(path.join(THUMB_DIR, name.replace(/\.(jpe?g|png)$/i, '.webp')));
        }
      }

      afterTotal += finalBuf.length;
      const saved = Math.max(0, stat.size - finalBuf.length);
      rows.push([name, stat.size, finalBuf.length, saved > 0 ? `-${Math.round((saved / stat.size) * 100)}%` : '未减少']);
    } catch (err) {
      afterTotal += stat.size;
      rows.push([name, stat.size, stat.size, '失败：' + err.message]);
    }
  }

  const pad = (s, n) => String(s).padEnd(n);
  console.log('\n  ' + pad('文件', 42) + pad('原始', 12) + pad('处理后', 12) + '变化');
  console.log('  ' + '─'.repeat(78));
  for (const [name, b, a, note] of rows) {
    console.log('  ' + pad(name.length > 40 ? name.slice(0, 37) + '...' : name, 42) + pad(fmt(b), 12) + pad(fmt(a), 12) + note);
  }
  console.log('  ' + '─'.repeat(78));
  console.log(
    '  合计：' + fmt(beforeTotal) + ' → ' + fmt(afterTotal) +
    '（省下 ' + Math.round((1 - afterTotal / beforeTotal) * 100) + '%）\n'
  );
  if (DRY) console.log('  --dry-run 模式，没有写入任何文件。\n');
  else console.log('  原图已备份到 images/_original/，WebP 副本在 images/webp/\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
