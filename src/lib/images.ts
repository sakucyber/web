/**
 * 图片注册表
 * ----------------------------------------------------------------
 * 把 `src/assets/images/` 里的原图集中导出，内容（Markdown / 数据文件）只引用
 * 语义化 key，不直接写文件名。这样：
 *  - 内容与资源解耦，改图只需改这里；
 *  - 构建期 Astro 拿到 ImageMetadata，可以生成 srcset / AVIF / WebP；
 *  - TypeScript 能检查错误的 key。
 */

import type { ImageMetadata } from 'astro';

import avatar from '@/assets/images/avatar.jpg';
import blondeGreen from '@/assets/images/blonde-green.jpg';
import blueDress from '@/assets/images/blue-dress.jpg';
import blueFlowerDress from '@/assets/images/blue-flower-dress.jpg';
import butterflyWhite from '@/assets/images/butterfly-white.jpg';
import cardGirl from '@/assets/images/card-girl.jpg';
import catMaid from '@/assets/images/cat-maid.jpg';
import cathedralDuo from '@/assets/images/cathedral-duo.jpg';
import dollGirl from '@/assets/images/doll-girl.jpg';
import goldenField from '@/assets/images/golden-field.jpg';
import gothicDress from '@/assets/images/gothic-dress.jpg';
import horseRider from '@/assets/images/horse-rider.jpg';
import moonSilhouette from '@/assets/images/moon-silhouette.jpg';
import moonlitLake from '@/assets/images/moonlit-lake.jpg';
import neonPurple from '@/assets/images/neon-purple.jpg';
import pinkDuo from '@/assets/images/pink-duo.jpg';
import pinkPrayer from '@/assets/images/pink-prayer.jpg';
import purpleDuo from '@/assets/images/purple-duo.jpg';
import rooftopGirl from '@/assets/images/rooftop-girl.jpg';
import sakuraGathering from '@/assets/images/sakura-gathering.jpg';
import starrySkyGirl from '@/assets/images/starry-sky-girl.jpg';
import underwaterBlue from '@/assets/images/underwater-blue.jpg';
import whiteHairCompanion from '@/assets/images/white-hair-companion.jpg';

export const images = {
  avatar: avatar,
  'blonde-green': blondeGreen,
  'blue-dress': blueDress,
  'blue-flower-dress': blueFlowerDress,
  'butterfly-white': butterflyWhite,
  'card-girl': cardGirl,
  'cat-maid': catMaid,
  'cathedral-duo': cathedralDuo,
  'doll-girl': dollGirl,
  'golden-field': goldenField,
  'gothic-dress': gothicDress,
  'horse-rider': horseRider,
  'moon-silhouette': moonSilhouette,
  'moonlit-lake': moonlitLake,
  'neon-purple': neonPurple,
  'pink-duo': pinkDuo,
  'pink-prayer': pinkPrayer,
  'purple-duo': purpleDuo,
  'rooftop-girl': rooftopGirl,
  'sakura-gathering': sakuraGathering,
  'starry-sky-girl': starrySkyGirl,
  'underwater-blue': underwaterBlue,
  'white-hair-companion': whiteHairCompanion,
} as const satisfies Record<string, ImageMetadata>;

export type ImageKey = keyof typeof images;

/** 按 key 取图片；找不到时回退到头像，避免构建期 undefined 崩溃 */
export function imageByKey(key: string | undefined | null): ImageMetadata {
  if (key && key in images) return images[key as ImageKey];
  return images.avatar;
}

export function hasImage(key: string | undefined | null): key is ImageKey {
  return Boolean(key && key in images);
}

/** 首页 Hero / 各页面头图使用的固定图 */
export const HERO_IMAGES = {
  home: images['starry-sky-girl'],
  about: images['moon-silhouette'],
  works: images['cathedral-duo'],
  project: images['pink-duo'],
  gallery: images['golden-field'],
  social: images['moonlit-lake'],
  posts: images['blue-dress'],
} as const;
