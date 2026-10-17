/**
 * 画廊数据
 * ----------------------------------------------------------------
 * 旧版 gallery.html / index.html 里 12 张图写死在 HTML 中，且 alt 只有
 * “画廊照片 N”。这里把 22 张图整理成结构化数据：分类、说明、alt。
 * 首页画廊预览只取前 8 张（见 HOME_PREVIEW_IDS）。
 */

import type { ImageKey } from '@/lib/images';

export const GALLERY_CATEGORIES = ['全部', '夜景', '少女', '幻想'] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export interface GalleryItem {
  id: string;
  image: ImageKey;
  alt: string;
  caption: string;
  category: Exclude<GalleryCategory, '全部'>;
  /** 竖图在瀑布流里跨度更大，仅作展示提示 */
  orientation: 'portrait' | 'landscape' | 'square';
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'starry-sky',
    image: 'starry-sky-girl',
    alt: '蓝天下，白发少女身旁有飞鸟掠过',
    caption: '晴空之下',
    category: '幻想',
    orientation: 'landscape',
  },
  {
    id: 'moonlit-lake',
    image: 'moonlit-lake',
    alt: '星空倒映的湖面旁站着一位蓝发少女',
    caption: '星湖之夜',
    category: '夜景',
    orientation: 'landscape',
  },
  {
    id: 'gothic-dress',
    image: 'gothic-dress',
    alt: '银发少女穿着黑白洋装，背景是深色花纹',
    caption: '洋装与夜色',
    category: '少女',
    orientation: 'portrait',
  },
  {
    id: 'underwater-blue',
    image: 'underwater-blue',
    alt: '蓝色水光中的长发少女',
    caption: '深海之蓝',
    category: '幻想',
    orientation: 'landscape',
  },
  {
    id: 'doll-girl',
    image: 'doll-girl',
    alt: '紫发少女抱着一只小玩偶',
    caption: '人偶与少女',
    category: '少女',
    orientation: 'portrait',
  },
  {
    id: 'neon-purple',
    image: 'neon-purple',
    alt: '霓虹色调里，紫发少女侧身回望',
    caption: '霓虹紫',
    category: '夜景',
    orientation: 'portrait',
  },
  {
    id: 'cathedral-duo',
    image: 'cathedral-duo',
    alt: '教堂光影中并肩而立的两位少女',
    caption: '教堂光影',
    category: '夜景',
    orientation: 'landscape',
  },
  {
    id: 'butterfly-white',
    image: 'butterfly-white',
    alt: '白裙少女的指尖停着一只蓝色蝴蝶',
    caption: '蝶与白裙',
    category: '少女',
    orientation: 'landscape',
  },
  {
    id: 'moon-silhouette',
    image: 'moon-silhouette',
    alt: '巨大的月亮前，少女持剑的剪影',
    caption: '月下剪影',
    category: '夜景',
    orientation: 'landscape',
  },
  {
    id: 'purple-duo',
    image: 'purple-duo',
    alt: '紫色光晕里背靠背的两位少女',
    caption: '紫夜双影',
    category: '幻想',
    orientation: 'landscape',
  },
  {
    id: 'blonde-green',
    image: 'blonde-green',
    alt: '绿意环绕中，金发少女坐在光斑里',
    caption: '林间微光',
    category: '幻想',
    orientation: 'landscape',
  },
  {
    id: 'blue-flower-dress',
    image: 'blue-flower-dress',
    alt: '白色礼服的白发少女身旁点缀着蓝花',
    caption: '白礼服与蓝花',
    category: '少女',
    orientation: 'portrait',
  },
  {
    id: 'pink-prayer',
    image: 'pink-prayer',
    alt: '粉发少女双手合十，像是在许愿',
    caption: '祈愿',
    category: '少女',
    orientation: 'portrait',
  },
  {
    id: 'pink-duo',
    image: 'pink-duo',
    alt: '粉色调的双人少女插画',
    caption: '粉色日记',
    category: '幻想',
    orientation: 'landscape',
  },
  {
    id: 'horse-rider',
    image: 'horse-rider',
    alt: '花丛中，红衣少女骑在马背上',
    caption: '花与马',
    category: '幻想',
    orientation: 'landscape',
  },
  {
    id: 'rooftop-girl',
    image: 'rooftop-girl',
    alt: '屋顶上撑着黑伞、戴粉色发饰的少女',
    caption: '屋顶之上',
    category: '夜景',
    orientation: 'portrait',
  },
  {
    id: 'golden-field',
    image: 'golden-field',
    alt: '金色原野中戴帽子的少年回眸',
    caption: '金色原野',
    category: '夜景',
    orientation: 'landscape',
  },
  {
    id: 'sakura-gathering',
    image: 'sakura-gathering',
    alt: '樱花树下聚在一起的少女们',
    caption: '樱花树下',
    category: '幻想',
    orientation: 'landscape',
  },
  {
    id: 'blue-dress',
    image: 'blue-dress',
    alt: '深蓝色礼服的白发少女抬起手',
    caption: '深蓝礼服',
    category: '少女',
    orientation: 'portrait',
  },
  {
    id: 'cat-maid',
    image: 'cat-maid',
    alt: '猫耳女仆装的白发少女',
    caption: '猫耳女仆',
    category: '少女',
    orientation: 'portrait',
  },
  {
    id: 'white-companion',
    image: 'white-hair-companion',
    alt: '白发少女与身边的小白兽',
    caption: '雪与伙伴',
    category: '幻想',
    orientation: 'portrait',
  },
  {
    id: 'card-girl',
    image: 'card-girl',
    alt: '手持扑克牌、红白配色的少女',
    caption: '牌与少女',
    category: '幻想',
    orientation: 'portrait',
  },
];

/** 首页画廊预览 */
export const HOME_PREVIEW_IDS = [
  'starry-sky',
  'moonlit-lake',
  'gothic-dress',
  'underwater-blue',
  'neon-purple',
  'butterfly-white',
  'sakura-gathering',
  'golden-field',
] as const;

export const HOME_PREVIEW_ITEMS = GALLERY_ITEMS.filter((item) =>
  (HOME_PREVIEW_IDS as readonly string[]).includes(item.id),
);
